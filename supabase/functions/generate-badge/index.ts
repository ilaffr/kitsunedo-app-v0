import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TIER_CONFIG: Record<number, { rarity: string; tone: string }> = {
  1: {
    rarity: "uncommon",
    tone: "Gentle, encouraging humor. Light teasing, like a playful tanuki nudging the student.",
  },
  2: {
    rarity: "rare",
    tone: "Openly comedic. The spirits and yokai are now involved, cheering or laughing. The word itself is becoming a character in the story.",
  },
  3: {
    rarity: "legendary",
    tone: "Absurdist, legend-level humor. Scholars write about this rivalry. The word has become sentient. Epic, mythological scale of comedy.",
  },
};

// JLPT level → yokai archetype + tier mapping
const JLPT_ARCHETYPE: Record<string, { archetype: string; jp: string; element: string; rarityOverride?: string }> = {
  N5: { archetype: "Foothill Spirit", jp: "麓の精", element: "moss, pebbles, low cedar mist — humble beginnings" },
  N4: { archetype: "Bamboo Grove Sprite", jp: "竹林の童", element: "young bamboo, fox tracks, dawn light" },
  N3: { archetype: "River Sage", jp: "川の賢者", element: "flowing river, wet ink, kappa wisdom" },
  N2: { archetype: "Cloud Tengu", jp: "雲の天狗", element: "cliff winds, long nose, scarlet robes, pine peaks", rarityOverride: "rare" },
  N1: { archetype: "Mountain Kami", jp: "山の神", element: "snow-capped summit, ancient torii, divine stillness, golden mist", rarityOverride: "legendary" },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { user_id, trigger_type, trigger_detail, tier } = body;
    // Word-struggle params (legacy)
    const word = body.word;
    const meaning = body.meaning;
    const mistake_count = body.mistake_count;
    // JLPT params
    const jlpt_level: string | undefined = body.jlpt_level;
    const jlpt_score_pct: number | undefined = body.jlpt_score_pct;
    const jlpt_mode: string | undefined = body.jlpt_mode;
    const jlpt_elapsed_ms: number | undefined = body.jlpt_elapsed_ms;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Idempotency check
    const { data: existingBadge } = await supabase
      .from("personal_badges")
      .select("*")
      .eq("user_id", user_id)
      .eq("trigger_type", trigger_type)
      .eq("trigger_detail", trigger_detail)
      .eq("tier", tier)
      .maybeSingle();

    if (existingBadge) {
      return new Response(JSON.stringify({ badge: existingBadge }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tierConf = TIER_CONFIG[tier] || TIER_CONFIG[1];

    // Build prompt by trigger type
    let userPrompt: string;
    let imagePrompt: string;
    let rarity = tierConf.rarity;

    if (trigger_type === "jlpt_pass" && jlpt_level) {
      const arch = JLPT_ARCHETYPE[jlpt_level] || JLPT_ARCHETYPE.N5;
      const isPerfect = tier === 2;

      if (isPerfect) {
        // Tier 2 — Perfect Score (100%) — overrides to "mythic" rarity always
        rarity = "mythic";
        userPrompt = `A student just achieved a PERFECT SCORE (100%) on a ${jlpt_level} JLPT-style mock exam (${jlpt_mode || "mixed"} section). This is the rarest possible accomplishment. Award them an ASCENDED form of the "${arch.archetype}" (${arch.jp}) — a mythic, divine variant. Setting: ${arch.element}, but elevated — celestial, aurora-touched, ancient.

Generate a JSON object (no markdown, pure JSON):
{
  "title": "evocative English name, must convey ascension or perfection — e.g. 'Ascended ${arch.archetype}', '${jlpt_level} Perfect — Celestial ${arch.archetype}', or a poetic mythic variant. Include the level.",
  "title_jp": "Japanese name 3-6 characters, poetic and elevated (e.g. 神, 真, 極, 究 prefix/suffix welcome)",
  "description": "one sentence honoring a flawless ${jlpt_level} performance — every question answered correctly. Reverent, awe-struck.",
  "myth": "a 3-4 sentence mythic legend about a scholar so disciplined that the ${arch.archetype} revealed its true divine form to them. Sumi-e poetic, ancient scroll tone."
}

Tone: deeply reverent, mythic, awe-struck. This is the highest honor in the bestiary.`;
        imagePrompt = `Create an elaborate, masterwork Japanese sumi-e ink brush illustration on aged washi paper background. Subject: an ASCENDED, mythic divine form of a ${arch.archetype} (${arch.jp}) — representing a PERFECT 100% score on JLPT ${jlpt_level}. Setting elements: ${arch.element}, elevated to celestial scale — aurora, drifting cherry petals, ancient torii gates, swirling spirit energy. Style: traditional sumi-e but more elaborate and detailed than usual — confident layered brush strokes, gold leaf accents throughout, vermillion hanko seal in corner, subtle indigo wash for divinity, sense of overwhelming sacred power. The figure should feel transcendent, more spirit than creature. No text in the image.`;
      } else {
        if (arch.rarityOverride) rarity = arch.rarityOverride;
        userPrompt = `A student just passed a ${jlpt_level} JLPT-style mock exam (${jlpt_mode || "mixed"} section) with ${jlpt_score_pct}% accuracy. Award them a Bestiary spirit themed as a "${arch.archetype}" (${arch.jp}). Element/setting: ${arch.element}.

Generate a JSON object (no markdown, pure JSON):
{
  "title": "evocative English spirit name, must include the level e.g. '${jlpt_level} — ${arch.archetype}' or a poetic variant",
  "title_jp": "Japanese name 2-6 characters, poetic",
  "description": "one sentence celebrating the JLPT ${jlpt_level} pass, references the archetype, dignified not silly",
  "myth": "a 2-3 sentence sumi-e style myth about this spirit honoring scholars who have crossed the ${jlpt_level} threshold"
}

Tone: reverent, mythic, sumi-e poetic. NOT comedic. This is an honor, not a joke.`;
        imagePrompt = `Create a minimalist Japanese sumi-e ink brush illustration on a clean white washi paper background. Subject: a ${arch.archetype} (${arch.jp}) — a dignified yokai/kami representing mastery of JLPT ${jlpt_level}. Setting elements: ${arch.element}. Style: traditional sumi-e, black ink wash with subtle vermillion seal accent, confident brush strokes, sense of ancient honor. ${jlpt_level === "N1" ? "Add gold leaf highlights and a divine aura." : jlpt_level === "N2" ? "Add a single vermillion accent." : ""} No text in the image.`;
      }
    } else if (trigger_type === "news_streak") {
      // News reader streak (consecutive days opening the NHK headline)
      const streakDays: number = body.streak_days ?? 7;
      // Tier 1 = 7 days (rare), Tier 2 = 30 days (legendary)
      rarity = tier >= 2 ? "legendary" : "rare";

      userPrompt = `A student has opened the daily NHK news headline ${streakDays} days in a row. They are building a real-world Japanese reading habit. Award them a Bestiary spirit themed as a "News Reader" — a sumi-e crow or sparrow perched on a folded newspaper, ink dripping from its beak. The bird is a messenger of current events.

Generate a JSON object (no markdown, pure JSON):
{
  "title": "evocative English spirit name, must reference reading/news/messenger e.g. 'News Reader', 'Ink-Tongued Sparrow', 'Headline Crow' — include the streak count if it fits",
  "title_jp": "Japanese name 2-6 characters, poetic (e.g. 報せ烏, 新聞雀, 朝の使者)",
  "description": "one sentence celebrating ${streakDays} consecutive days of reading NHK news, dignified and warm",
  "myth": "a 2-3 sentence sumi-e style myth about a small bird that delivers the morning news to scholars who keep faithful daily habits"
}

Tone: warm, dignified, mythic. NOT comedic. This is an honor for daily discipline.`;
      imagePrompt = `Create a minimalist Japanese sumi-e ink brush illustration on a clean white washi paper background. Subject: a small dignified bird (sparrow or crow) perched on a folded newspaper or scroll, with a single ink-stained character peeking out. Style: traditional sumi-e, confident black ink wash, single vermillion hanko seal in corner. ${tier >= 2 ? "Add gold leaf accents and a sense of ancient mastery." : "Subtle, humble, morning-light feel."} No text in the image.`;
    } else {
      // Legacy word_struggle path
      userPrompt = `A student has made ${mistake_count} mistakes on the Japanese word/particle "${word}" (meaning: "${meaning}"). This is tier ${tier} of 3.

Tone for this tier: ${tierConf.tone}

Generate a JSON object (no markdown, pure JSON):
{
  "title": "short English badge name, 2-4 words, witty and funny",
  "title_jp": "same concept in Japanese, 2-6 characters",
  "description": "one sentence about why they earned this, humorous, references the word",
  "myth": "a 2-3 sentence fictional Japanese myth connecting the word to a yokai or spirit, poetic sumi-e style"
}

Examples of good titles:
- For "遅い" (slow): Tier 1 "The Patient Snail", Tier 2 "Snail's Sworn Rival", Tier 3 "Eternal Slowness Sage"
- For "は" (topic particle): Tier 1 "The は Whisperer", Tier 2 "は's Sworn Rival", Tier 3 "Eternal Dance with は"

Keep it lighthearted and motivating, never mocking. Higher tiers should be progressively more absurd and legendary.`;
      imagePrompt = `Create a minimalist Japanese sumi-e ink brush illustration on a clean white background. Subject: a small yokai or spirit representing someone who struggles with the Japanese word "${word}". Style: black ink wash, simple brush strokes, slight humor, traditional Japanese art feel. No text in the image. The spirit should look ${tier === 1 ? "gentle and mischievous" : tier === 2 ? "dramatic and theatrical" : "legendary and absurdly powerful"}.`;
    }

    // 1. Generate badge text via AI
    const textRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a creative writer for a Japanese language learning app themed around sumi-e ink brush art and Japanese mythology. You generate personalized achievement badges.`,
          },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!textRes.ok) {
      const errText = await textRes.text();
      console.error("AI text generation error:", textRes.status, errText);
      if (textRes.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, try again later" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI text error: ${textRes.status}`);
    }

    const textData = await textRes.json();
    const rawContent = textData.choices?.[0]?.message?.content || "";

    let badgeText: { title: string; title_jp: string; description: string; myth: string };
    try {
      let jsonStr = rawContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      // Tolerate trailing commas before } or ] which Gemini sometimes emits
      jsonStr = jsonStr.replace(/,(\s*[}\]])/g, "$1");
      badgeText = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse badge text:", rawContent);
      if (trigger_type === "jlpt_pass" && jlpt_level) {
        const arch = JLPT_ARCHETYPE[jlpt_level] || JLPT_ARCHETYPE.N5;
        const isPerfect = tier === 2;
        badgeText = {
          title: isPerfect
            ? `${jlpt_level} Perfect — Ascended ${arch.archetype}`
            : `${jlpt_level} — ${arch.archetype}`,
          title_jp: isPerfect ? `真${arch.jp}` : arch.jp,
          description: isPerfect
            ? `A flawless 100% on the ${jlpt_level} trial — the spirit revealed its divine form.`
            : `Earned by passing a ${jlpt_level} mock exam with ${jlpt_score_pct}%.`,
          myth: isPerfect
            ? "Long ago, a scholar answered every question without hesitation. The mountain mist parted, and the kami showed itself in full radiance — a sight granted only to the perfect-hearted."
            : "A spirit emerged from the mountain mist to honor the scholar's perseverance.",
        };
      } else {
        badgeText = {
          title: `${word} Spirit (Tier ${tier})`,
          title_jp: "霊",
          description: `Earned after ${mistake_count} encounters with ${word}.`,
          myth: "A mysterious spirit appeared from the ink, drawn by the student's persistence.",
        };
      }
    }

    // 2. Generate sumi-e badge image via AI
    let imageUrl: string | null = null;
    try {
      const imageRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-pro-image-preview",
          messages: [
            {
              role: "user",
              content: imagePrompt,
            },
          ],
          modalities: ["image", "text"],
        }),
      });

      if (imageRes.ok) {
        const imageData = await imageRes.json();
        const base64Url = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

        if (base64Url) {
          // Extract base64 data and upload to storage
          const base64Data = base64Url.replace(/^data:image\/\w+;base64,/, "");
          const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
          const safeDetail = encodeURIComponent(trigger_detail).replace(/%/g, "_");
          const fileName = `${user_id}/${trigger_type}_${safeDetail}_tier${tier}_${Date.now()}.png`;

          const { error: uploadError } = await supabase.storage
            .from("badge-images")
            .upload(fileName, imageBytes, { contentType: "image/png", upsert: true });

          if (!uploadError) {
            const { data: publicUrlData } = supabase.storage
              .from("badge-images")
              .getPublicUrl(fileName);
            imageUrl = publicUrlData.publicUrl;
          } else {
            console.error("Storage upload error:", uploadError);
          }
        }
      } else {
        console.error("Image generation error:", imageRes.status);
      }
    } catch (imgErr) {
      console.error("Image generation failed:", imgErr);
    }

    // 3. Save badge to database (idempotent)
    const { data: badge, error: insertError } = await supabase
      .from("personal_badges")
      .insert({
        user_id,
        trigger_type,
        trigger_detail,
        tier,
        title: badgeText.title,
        title_jp: badgeText.title_jp,
        description: badgeText.description,
        myth: badgeText.myth,
        image_url: imageUrl,
        rarity,
      })
      .select()
      .single();

    if (insertError) {
      // Race condition safe: if another request inserted first, return the existing row
      if ((insertError as { code?: string }).code === "23505") {
        const { data: duplicateBadge, error: fetchDupError } = await supabase
          .from("personal_badges")
          .select("*")
          .eq("user_id", user_id)
          .eq("trigger_type", trigger_type)
          .eq("trigger_detail", trigger_detail)
          .eq("tier", tier)
          .maybeSingle();

        if (duplicateBadge && !fetchDupError) {
          return new Response(JSON.stringify({ badge: duplicateBadge }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      console.error("Insert error:", insertError);
      throw new Error(`Failed to save badge: ${insertError.message}`);
    }

    return new Response(JSON.stringify({ badge }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-badge error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
