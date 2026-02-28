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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, trigger_type, trigger_detail, word, meaning, mistake_count, tier } =
      await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if badge already exists
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
          {
            role: "user",
            content: `A student has made ${mistake_count} mistakes on the Japanese word/particle "${word}" (meaning: "${meaning}"). This is tier ${tier} of 3.

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

Keep it lighthearted and motivating, never mocking. Higher tiers should be progressively more absurd and legendary.`,
          },
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
    
    // Parse JSON from response (strip markdown fences if present)
    let badgeText: { title: string; title_jp: string; description: string; myth: string };
    try {
      const jsonStr = rawContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      badgeText = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse badge text:", rawContent);
      badgeText = {
        title: `${word} Spirit (Tier ${tier})`,
        title_jp: "霊",
        description: `Earned after ${mistake_count} encounters with ${word}.`,
        myth: "A mysterious spirit appeared from the ink, drawn by the student's persistence.",
      };
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
              content: `Create a minimalist Japanese sumi-e ink brush illustration on a clean white background. Subject: "${badgeText.title}" — a small yokai or spirit representing someone who struggles with the Japanese word "${word}". Style: black ink wash, simple brush strokes, slight humor, traditional Japanese art feel. No text in the image. The spirit should look ${tier === 1 ? "gentle and mischievous" : tier === 2 ? "dramatic and theatrical" : "legendary and absurdly powerful"}.`,
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
        rarity: tierConf.rarity,
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
