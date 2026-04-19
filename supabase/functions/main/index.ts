// Edge Function router — required by supabase/edge-runtime in Docker mode.
// Routes /functions/v1/<name> → the matching function directory.
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const FUNCTION_NAMES = [
  "generate-badge",
  "generate-kitsune-tale",
  "generate-jlpt-questions",
  "generate-nhk-quiz",
  "generate-flashcard-image",
  "fetch-nhk-news",
];

serve(async (req: Request) => {
  const url = new URL(req.url);
  const parts = url.pathname.split("/").filter(Boolean);
  const fnName = parts[0];

  if (!FUNCTION_NAMES.includes(fnName)) {
    return new Response(JSON.stringify({ error: "Function not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Forward to the individual function file
  const fnUrl = new URL(req.url);
  fnUrl.pathname = "/" + parts.slice(1).join("/");

  const mod = await import(`../${fnName}/index.ts`);
  return mod.default(new Request(fnUrl.toString(), req));
});
