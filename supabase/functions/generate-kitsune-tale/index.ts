import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Identify the user from the JWT
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

    // 1. Return cached tale if it exists for today
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

    // 2. Pull user vocabulary from flashcards (most recent 25)
    const { data: cards } = await admin
      .from("flashcards")
      .select("japanese, reading, meaning")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
      .limit(25);

    let vocabPool: { japanese: string; reading: string; meaning: string }[] = cards ?? [];

    // Fallback vocabulary for new users with no flashcards
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

    // Pick 4-6 random words for the story
    const shuffled = [...vocabPool].sort(() => Math.random() - 0.5).slice(0, 6);
    const vocabList = shuffled
      .map((v) => `- ${v.japanese} (${v.reading}) — ${v.meaning}`)
      .join("\n");

    // 3. Generate tale via Lovable AI with structured output (tool calling)
    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You are a Japanese language tutor and storyteller. Write tiny, beginner-friendly mini-stories in the style of a Japanese folktale (kitsune, yokai, mountain spirits, sumi-e mood). Use simple grammar (N5/N4). Always respond using the provided tool.",
          },
          {
            role: "user",
            content: `Write a 3-sentence Japanese mini-story incorporating AT LEAST 3 of these vocabulary words:

${vocabList}

Requirements:
- Exactly 3 sentences in natural Japanese.
- Use simple grammar suitable for beginners (N5/N4).
- Add a furigana version using this EXACT format: each kanji (or kanji compound) is immediately followed by its hiragana reading in curly braces. Example: 狐{きつね}は森{もり}を歩{ある}いた。 Do NOT use parentheses. Hiragana and punctuation must NOT be wrapped in braces.
- Provide an English translation.
- Write ONE comprehension question in English about the story.
- Provide 4 plausible English answer options. Mark the correct one with its index (0-3).
- List which of the supplied vocabulary words you actually used.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "submit_tale",
              description: "Submit the generated kitsune tale.",
              parameters: {
                type: "object",
                properties: {
                  story_jp: { type: "string", description: "3 Japanese sentences." },
                  story_furigana: { type: "string", description: "Same story with furigana in parentheses after each kanji word." },
                  translation: { type: "string", description: "English translation of all 3 sentences." },
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
                required: ["story_jp", "story_furigana", "translation", "question", "options", "correct_index", "vocab_used"],
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
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds in Settings → Workspace → Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI error ${aiRes.status}`);
    }

    const aiData = await aiRes.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");
    const args = JSON.parse(toolCall.function.arguments);

    // 4. Insert into DB
    const { data: inserted, error: insertErr } = await admin
      .from("kitsune_tales")
      .insert({
        user_id,
        tale_date: today,
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
      // Race condition: another request just inserted. Re-fetch.
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
