import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Strip <ruby>kanji<rt>reading</rt></ruby> down to the base kanji + plain text.
function stripRuby(html: string): string {
  return html
    .replace(/<rp>[\s\S]*?<\/rp>/g, "")
    .replace(/<rt>[\s\S]*?<\/rt>/g, "")
    .replace(/<\/?ruby>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const body = await req.json().catch(() => ({}));
    const title = String(body?.title ?? "").trim();
    const articleHtml = String(body?.body_html ?? body?.bodyHtml ?? "").trim();
    const level = String(body?.level ?? "N5").trim();

    if (!title || !articleHtml) {
      return new Response(JSON.stringify({ error: "Missing title or body_html" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const plainTitle = stripRuby(title);
    const plainBody = stripRuby(articleHtml).slice(0, 4000);

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
              "You are a Japanese reading-comprehension tutor. You read a short NHK news article (in Japanese) and write a 3-question English comprehension quiz that tests whether the learner actually understood the content. Questions must be answerable from the article alone — no outside knowledge required. Distractors must be plausible but clearly wrong to anyone who read carefully. Always respond using the provided tool.",
          },
          {
            role: "user",
            content: `JLPT level: ${level}
Article title (Japanese): ${plainTitle}

Article body (Japanese):
${plainBody}

Write exactly 3 multiple-choice comprehension questions in ENGLISH with 4 options each. Mark the correct option index (0-3). Cover different parts of the article (who/what/when/where/why) — do NOT make all 3 questions about the same fact.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "submit_quiz",
              description: "Submit the 3-question NHK comprehension quiz.",
              parameters: {
                type: "object",
                properties: {
                  questions: {
                    type: "array",
                    minItems: 3,
                    maxItems: 3,
                    items: {
                      type: "object",
                      properties: {
                        question: { type: "string", description: "Comprehension question in English." },
                        options: {
                          type: "array",
                          items: { type: "string" },
                          minItems: 4,
                          maxItems: 4,
                        },
                        correct_index: { type: "integer", minimum: 0, maximum: 3 },
                        explanation: {
                          type: "string",
                          description: "1-sentence explanation in English citing the relevant fact from the article.",
                        },
                      },
                      required: ["question", "options", "correct_index", "explanation"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["questions"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "submit_quiz" } },
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("AI gateway error:", aiRes.status, errText);
      if (aiRes.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited, please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (aiRes.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Add funds in Settings → Workspace → Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      throw new Error(`AI error ${aiRes.status}`);
    }

    const aiData = await aiRes.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");
    const args = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ quiz: args }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-nhk-quiz error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
