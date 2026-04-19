import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { flashcard_id, user_id, japanese, meaning } = await req.json();

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if already has image
    const { data: existing } = await supabase
      .from("flashcards")
      .select("image_url")
      .eq("id", flashcard_id)
      .single();

    if (existing?.image_url) {
      return new Response(JSON.stringify({ image_url: existing.image_url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate cartoon image via Gemini native image generation
    const imageRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [{ text: `Create a cute, simple cartoon illustration on a clean white background representing the Japanese word "${japanese}" which means "${meaning}". Style: kawaii, minimal, colorful flat illustration, no text, round friendly shapes, pastel colors. Think children's flashcard illustration. Single centered object or character.` }],
          }],
          generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
        }),
      }
    );

    if (!imageRes.ok) {
      const errText = await imageRes.text();
      console.error("Image generation error:", imageRes.status, errText);
      if (imageRes.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`Image error: ${imageRes.status}`);
    }

    const imageData = await imageRes.json();
    const parts = imageData.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find((p: { inlineData?: { data: string; mimeType: string } }) => p.inlineData?.data);

    if (!imagePart) {
      throw new Error("No image returned from Gemini");
    }

    // Upload to storage
    const base64Data = imagePart.inlineData.data;
    const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
    const fileName = `${user_id}/${flashcard_id}_${Date.now()}.png`;

    const { error: uploadError } = await supabase.storage
      .from("flashcard-images")
      .upload(fileName, imageBytes, { contentType: "image/png", upsert: true });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error("Failed to upload image");
    }

    const { data: publicUrlData } = supabase.storage
      .from("flashcard-images")
      .getPublicUrl(fileName);

    const imageUrl = publicUrlData.publicUrl;

    // Update flashcard with image URL
    await supabase
      .from("flashcards")
      .update({ image_url: imageUrl })
      .eq("id", flashcard_id);

    return new Response(JSON.stringify({ image_url: imageUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-flashcard-image error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
