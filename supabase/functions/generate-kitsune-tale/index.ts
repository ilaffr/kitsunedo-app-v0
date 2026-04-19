import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ───────────────── Theme rotation ─────────────────
// Each theme yields a different flavour of story so the daily tale never
// feels like the same template. Themes mix yokai folklore with REAL
// Japanese cultural facts, history, and mysteries.
const THEMES: { id: string; label: string; prompt: string }[] = [
  {
    id: "yokai_folklore",
    label: "Yokai folklore",
    prompt:
      "Tell a tiny folktale about a real Japanese yokai (kitsune, tanuki, kappa, tengu, yuki-onna, rokurokubi, zashiki-warashi, nurikabe…). Stay faithful to the yokai's traditional behaviour.",
  },
  {
    id: "festival",
    label: "Festival / matsuri",
    prompt:
      "Set the story during a real Japanese festival (Hanami, Tanabata, Obon, Setsubun, Gion Matsuri, Hina-matsuri, Shichi-go-san…). Include one authentic ritual or food.",
  },
  {
    id: "history",
    label: "Historical anecdote",
    prompt:
      "Anchor the story in a real historical period (Heian court, Sengoku samurai, Edo merchants, Meiji modernisation). Reference one true historical detail.",
  },
  {
    id: "mystery",
    label: "Mystery / urban legend",
    prompt:
      "Build the story around a famous Japanese mystery or urban legend (Kuchisake-onna, Hachishakusama, the Yamashita treasure, the Honjō Seven Wonders, Aokigahara, the Dragon's Triangle…). Keep it eerie but not gory.",
  },
  {
    id: "shrine_lore",
    label: "Shrine / temple lore",
    prompt:
      "Centre the story on a real shrine, temple, or sacred mountain (Fushimi Inari, Itsukushima, Mt. Kōya, Izumo Taisha, Nikkō Tōshōgū, Mt. Fuji). Include one true legend tied to it.",
  },
  {
    id: "everyday_culture",
    label: "Everyday culture",
    prompt:
      "Highlight a small, authentic everyday Japanese custom (the bath order, slipper etiquette, school cleaning, vending machines, the convenience-store onigiri, kotatsu winters).",
  },
  {
    id: "tea_arts",
    label: "Tea, sumi-e & traditional arts",
    prompt:
      "Tell a short story rooted in a traditional Japanese art (chadō tea ceremony, sumi-e painting, ikebana, kintsugi, calligraphy, noh theatre). Include the philosophy behind it.",
  },
  {
    id: "nature_seasons",
    label: "Nature & seasons",
    prompt:
      "Use a real Japanese seasonal phenomenon (sakura zensen, tsuyu rainy season, autumn maples, the first snow on Mt. Fuji, fireflies in summer). Mention the seasonal vocabulary.",
  },
];

function pickTheme(seed: string) {
  // Deterministic per (user_id + date) so retrying the same day is stable
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return THEMES[Math.abs(h) % THEMES.length];
}

// Difficulty scales with how much vocab the learner has built up
function pickDifficulty(vocabCount: number) {
  if (vocabCount < 15) return { level: "N5", sentences: 3, note: "Use the simplest possible grammar (です/ます, は, を, に). Avoid all kanji compounds beyond the supplied vocabulary." };
  if (vocabCount < 40) return { level: "N5+", sentences: 3, note: "Use simple grammar with one connector (て-form, から, けど). Slightly richer vocabulary is OK." };
  if (vocabCount < 80) return { level: "N4", sentences: 4, note: "Use N4 grammar (たら, ば, ながら, ようだ). One unfamiliar word is OK if context makes it guessable." };
  return { level: "N4+", sentences: 4, note: "Use varied N4 grammar and 1-2 evocative literary words. Aim for sumi-e atmosphere." };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing auth" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userRes, error: userErr } = await userClient.auth.getUser(token);
    if (userErr || !userRes.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const user_id = userRes.user.id;
    const admin = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Cached tale for today?
    const today = new Date().toISOString().slice(0, 10);
    const { data: existing } = await admin
      .from("kitsune_tales")
      .select("*")
      .eq("user_id", user_id)
      .eq("tale_date", today)
      .maybeSingle();
    if (existing) {
      return new Response(JSON.stringify({ tale: existing, cached: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Vocab pool from flashcards
    const { data: cards } = await admin
      .from("flashcards")
      .select("japanese, reading, meaning")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
      .limit(40);

    let vocabPool: { japanese: string; reading: string; meaning: string }[] = cards ?? [];
    const totalVocabCount = vocabPool.length;

    if (vocabPool.length < 4) {
      vocabPool = [
        { japanese: "狐", reading: "きつね", meaning: "fox" },
        { japanese: "森", reading: "もり", meaning: "forest" },
        { japanese: "月", reading: "つき", meaning: "moon" },
        { japanese: "夜", reading: "よる", meaning: "night" },
        { japanese: "道", reading: "みち", meaning: "path" },
        { japanese: "心", reading: "こころ", meaning: "heart" },
        { japanese: "歩く", reading: "あるく", meaning: "to walk" },
        { japanese: "見る", reading: "みる", meaning: "to see" },
      ];
    }

    const shuffled = [...vocabPool].sort(() => Math.random() - 0.5).slice(0, 8);
    const vocabList = shuffled
      .map((v) => `- ${v.japanese} (${v.reading}) — ${v.meaning}`)
      .join("\n");

    // Theme + difficulty
    const theme = pickTheme(`${user_id}-${today}`);
    const difficulty = pickDifficulty(totalVocabCount);

    // 3. Generate tale via Lovable AI with structured output
    const aiRes = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GEMINI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash-preview-04-17",
        messages: [
          {
            role: "system",
            content:
              "You are a Japanese language tutor AND a knowledgeable storyteller of Japanese culture, history and folklore. Your tales are short, evocative, and ALWAYS rooted in something REAL about Japan — a real yokai, a real festival, a real historical figure, a real shrine, a real custom. After the tale, you provide a 'cultural note' in English that teaches the learner the actual fact behind the story. Always respond using the provided tool.",
          },
          {
            role: "user",
            content: `Write a Japanese mini-story for today's lesson.

THEME: ${theme.label}
DIRECTION: ${theme.prompt}

DIFFICULTY: ${difficulty.level}
Length: exactly ${difficulty.sentences} sentences.
${difficulty.note}

Use AT LEAST 3 of the learner's known vocabulary words below (more is better):
${vocabList}

REQUIREMENTS:
- Story in natural Japanese, ${difficulty.sentences} sentences.
- Furigana version using THIS EXACT format: each kanji or kanji compound followed by its hiragana reading in curly braces. Example: 狐{きつね}は森{もり}を歩{ある}いた。 NEVER use parentheses. Hiragana, katakana and punctuation must NOT be wrapped in braces.
- An English translation of the full story.
- A short, evocative TITLE (max 6 words, English) for the tale.
- A "cultural_note" (2-3 sentences in English) explaining the REAL Japanese fact, lore, or history behind the story. This is the most important field — it must teach the learner something true about Japan.
- ONE comprehension question in English with 4 plausible options. Mark the correct one with its index (0-3).
- List which supplied vocabulary words you actually used.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "submit_tale",
              description: "Submit the generated culturally-rich kitsune tale.",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string", description: "Short evocative English title (max 6 words)." },
                  story_jp: { type: "string", description: "Japanese sentences." },
                  story_furigana: { type: "string", description: "Same story with furigana in curly braces." },
                  translation: { type: "string", description: "English translation." },
                  cultural_note: { type: "string", description: "2-3 sentences in English teaching the real Japanese cultural/historical fact behind the tale." },
                  question: { type: "string", description: "Comprehension question in English." },
                  options: {
                    type: "array",
                    items: { type: "string" },
                    minItems: 4,
                    maxItems: 4,
                  },
                  correct_index: { type: "integer", minimum: 0, maximum: 3 },
                  vocab_used: {
                    type: "array",
                    items: { type: "string" },
                    description: "Japanese words from the supplied list that appear in the story.",
                  },
                },
                required: ["title", "story_jp", "story_furigana", "translation", "cultural_note", "question", "options", "correct_index", "vocab_used"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "submit_tale" } },
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("AI gateway error:", aiRes.status, errText);
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      throw new Error(`AI error ${aiRes.status}`);
    }

    const aiData = await aiRes.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");
    const args = JSON.parse(toolCall.function.arguments);

    // 4. Insert
    const { data: inserted, error: insertErr } = await admin
      .from("kitsune_tales")
      .insert({
        user_id,
        tale_date: today,
        title: args.title,
        theme: theme.id,
        cultural_note: args.cultural_note,
        story_jp: args.story_jp,
        story_furigana: args.story_furigana,
        translation: args.translation,
        question: args.question,
        options: args.options,
        correct_index: args.correct_index,
        vocab_used: args.vocab_used,
      })
      .select("*")
      .single();

    if (insertErr) {
      const { data: again } = await admin
        .from("kitsune_tales")
        .select("*")
        .eq("user_id", user_id)
        .eq("tale_date", today)
        .maybeSingle();
      if (again) {
        return new Response(JSON.stringify({ tale: again, cached: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw insertErr;
    }

    return new Response(JSON.stringify({ tale: inserted, cached: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-kitsune-tale error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
