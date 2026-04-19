import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const VALID_LEVELS = ["N5", "N4", "N3", "N2", "N1"] as const;
const VALID_SECTIONS = ["vocab", "grammar", "reading"] as const;

type Level = (typeof VALID_LEVELS)[number];
type Section = (typeof VALID_SECTIONS)[number];

interface GeneratedQuestion {
  question_jp: string;
  passage_jp?: string | null;
  options: string[];
  correct_index: number;
  explanation: string;
}

const SECTION_GUIDES: Record<Section, string> = {
  vocab:
    "Vocabulary fill-in-the-blank. The question contains a Japanese sentence with a blank ___, and the 4 options are vocabulary words. Choose the most natural word for the blank.",
  grammar:
    "Grammar fill-in-the-blank. The question contains a Japanese sentence with a blank ___, and the 4 options are grammar particles, conjugations, or expressions. Choose the grammatically correct option.",
  reading:
    "Reading comprehension. The 'passage_jp' field contains a 2-4 sentence Japanese passage. The 'question_jp' field asks one comprehension question about it (in Japanese). The 4 options are short Japanese answers.",
};

const LEVEL_GUIDES: Record<Level, string> = {
  N5: "Absolute beginner. Use only basic Hiragana/Katakana + ~50 most common kanji (人, 日, 本, 月, 火, 水, 木, 金, 土, 山, 川, 田, 名, 大, 小, 中, 上, 下, 左, 右, 前, 後, 何, 私, 行, 来, 見, 言, 食, 飲, 書, 読, 買, 学, 校, 生, 先, 国, 語, 時, 分, 半, 今, 年, 男, 女, 子, 父, 母). Vocabulary from Minna no Nihongo Lessons 1-25. Simple grammar: です/ます, は/が/を/に/で, ～たい, ～てください.",
  N4: "Upper beginner. Adds ~250 more kanji and Minna no Nihongo Lessons 26-50 vocabulary. Grammar includes ～ばかり, ～ても, ～なら, plain form, casual speech, conditionals, intransitive vs transitive pairs.",
  N3: "Intermediate. ~600 kanji total. Vocabulary spans daily life, work, news. Grammar: ～らしい, ～みたい, ～のに, ～ながら, ～ように, passive/causative, keigo basics.",
  N2: "Upper intermediate. ~1000 kanji. Newspaper-level vocabulary. Grammar: ～ものの, ～にもかかわらず, ～ざるを得ない, ～かねる, advanced keigo, academic expressions.",
  N1: "Advanced. ~2000 kanji. Literary, business, academic vocabulary. Grammar: ～たりとも, ～かたがた, ～がてら, classical-derived expressions, nuanced register shifts.",
};

async function generateBatch(
  level: Level,
  section: Section,
  count: number,
): Promise<GeneratedQuestion[]> {
  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

  const systemPrompt = `You are a JLPT (Japanese-Language Proficiency Test) question writer. Generate authentic, exam-quality multiple-choice questions.

Level: ${level}
${LEVEL_GUIDES[level]}

Section: ${section}
${SECTION_GUIDES[section]}

Hard constraints:
- Each question MUST have exactly 4 options.
- Exactly ONE option is correct (correct_index 0-3).
- Distractors must be plausible — same word class / same particle category as the answer.
- Explanation: 1-2 short English sentences explaining WHY the correct answer is right (and optionally why others are wrong).
- Use natural, modern Japanese — never machine-literal.
- For 'reading' section, passage_jp is REQUIRED. For 'vocab'/'grammar', passage_jp must be null.
- Never repeat the same sentence pattern within the batch.`;

  const userPrompt = `Generate exactly ${count} fresh, varied JLPT ${level} ${section} questions.`;

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GEMINI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash-preview-04-17",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "submit_questions",
              description: "Submit the generated JLPT questions.",
              parameters: {
                type: "object",
                properties: {
                  questions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        question_jp: { type: "string" },
                        passage_jp: { type: ["string", "null"] },
                        options: {
                          type: "array",
                          items: { type: "string" },
                          minItems: 4,
                          maxItems: 4,
                        },
                        correct_index: {
                          type: "integer",
                          minimum: 0,
                          maximum: 3,
                        },
                        explanation: { type: "string" },
                      },
                      required: [
                        "question_jp",
                        "options",
                        "correct_index",
                        "explanation",
                      ],
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
        tool_choice: {
          type: "function",
          function: { name: "submit_questions" },
        },
      }),
    },
  );

  if (!response.ok) {
    if (response.status === 429) throw new Error("rate_limit");
    const t = await response.text();
    console.error("Gemini API error", response.status, t);
    throw new Error("ai_error");
  }

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall) throw new Error("no_tool_call");

  const args = JSON.parse(toolCall.function.arguments);
  const questions: GeneratedQuestion[] = args.questions ?? [];

  return questions.filter(
    (q) =>
      Array.isArray(q.options) &&
      q.options.length === 4 &&
      typeof q.correct_index === "number" &&
      q.correct_index >= 0 &&
      q.correct_index <= 3 &&
      typeof q.question_jp === "string" &&
      q.question_jp.trim().length > 0,
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(
      SUPABASE_URL,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const level = body.level as Level;
    const mode = (body.mode ?? "mixed") as "mixed" | Section;
    const totalRequested = Math.min(Math.max(Number(body.count ?? 15), 5), 20);

    if (!VALID_LEVELS.includes(level)) {
      return new Response(JSON.stringify({ error: "invalid_level" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Determine section split
    const sections: Section[] = mode === "mixed"
      ? (["vocab", "grammar", "reading"] as Section[])
      : [mode as Section];

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Try to fetch from cache first
    const perSection = mode === "mixed"
      ? Math.ceil(totalRequested / 3)
      : totalRequested;

    const collected: any[] = [];

    for (const section of sections) {
      // Try cache: pick random from existing pool
      const { data: cached, error: cacheErr } = await admin
        .from("jlpt_questions")
        .select("*")
        .eq("level", level)
        .eq("section", section)
        .limit(50);

      if (cacheErr) console.error("cache read error", cacheErr);

      const pool = cached ?? [];
      // Shuffle
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      const fromCache = shuffled.slice(0, perSection);
      collected.push(...fromCache);

      const need = perSection - fromCache.length;
      if (need > 0) {
        try {
          const generated = await generateBatch(level, section, need);
          if (generated.length > 0) {
            const rows = generated.map((g) => ({
              level,
              section,
              question_jp: g.question_jp,
              passage_jp: g.passage_jp ?? null,
              options: g.options,
              correct_index: g.correct_index,
              explanation: g.explanation,
            }));
            const { data: inserted, error: insErr } = await admin
              .from("jlpt_questions")
              .insert(rows)
              .select("*");
            if (insErr) {
              console.error("insert error", insErr);
            } else if (inserted) {
              collected.push(...inserted);
            }
          }
        } catch (e) {
          const msg = e instanceof Error ? e.message : "generation_failed";
          if (msg === "rate_limit") {
            return new Response(
              JSON.stringify({
                error: "Rate limit reached. Please try again in a moment.",
              }),
              {
                status: 429,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              },
            );
          }
          // If we have at least some cached, continue; otherwise fail
          if (collected.length === 0) {
            return new Response(
              JSON.stringify({ error: "Failed to generate questions." }),
              {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              },
            );
          }
        }
      }
    }

    // Final shuffle of mixed result
    const finalQuestions = collected
      .sort(() => Math.random() - 0.5)
      .slice(0, totalRequested);

    return new Response(JSON.stringify({ questions: finalQuestions }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("unhandled error", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
