// NHK News fetcher — pulls regular NHK RSS, caches per level.
// Note: NHK News Web Easy (`news-list.json`) was retired in 2025 and now
// requires JWT auth. We fall back to the public news RSS for all levels and
// frame N5–N3 as "challenge reading" (short summaries with TTS).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type Level = "N5" | "N4" | "N3" | "N2" | "N1";
type SourceKind = "easy" | "regular";

interface CachedArticle {
  news_id: string;
  level: Level;
  category: string;
  source: SourceKind;
  title: string;
  summary: string | null;
  body_html: string | null;
  audio_url: string | null;
  source_url: string;
  published_at: string | null;
}

const CACHE_TTL_MS = 60 * 60 * 1000; // 1h

// Public NHK RSS feeds by category.
// cat0 = top stories, cat1 = society, cat2 = culture, cat3 = science,
// cat4 = politics, cat5 = business, cat6 = international (world), cat7 = sports.
type Category = "top" | "politics" | "sports" | "tech" | "world" | "business" | "society";

const RSS_FEEDS: Record<Category, string> = {
  top: "https://www.nhk.or.jp/rss/news/cat0.xml",
  society: "https://www.nhk.or.jp/rss/news/cat1.xml",
  tech: "https://www.nhk.or.jp/rss/news/cat3.xml",
  politics: "https://www.nhk.or.jp/rss/news/cat4.xml",
  business: "https://www.nhk.or.jp/rss/news/cat5.xml",
  world: "https://www.nhk.or.jp/rss/news/cat6.xml",
  sports: "https://www.nhk.or.jp/rss/news/cat7.xml",
};

const VALID_CATEGORIES: Category[] = [
  "top",
  "politics",
  "sports",
  "tech",
  "world",
  "business",
  "society",
];

const NHK_HEADERS: HeadersInit = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept": "application/rss+xml, application/xml, text/xml, */*;q=0.8",
  "Accept-Language": "ja,en;q=0.9",
};

function levelToSourceKind(level: Level): SourceKind {
  // N5–N3 are rendered inline (with TTS + sentence mining).
  // N2–N1 are rendered as link-out cards.
  if (level === "N5" || level === "N4" || level === "N3") return "easy";
  return "regular";
}

interface RegularItem {
  news_id: string;
  title: string;
  description: string;
  link: string;
  pub_date: string;
}

async function fetchRss(url: string): Promise<RegularItem[]> {
  const r = await fetch(url, { headers: NHK_HEADERS });
  if (!r.ok) throw new Error(`rss ${r.status} for ${url}`);
  const xml = await r.text();
  const items: RegularItem[] = [];
  const re = /<item>([\s\S]*?)<\/item>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml))) {
    const block = m[1];
    const title = block
      .match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)?.[1]
      ?.trim() ?? "";
    const description = block
      .match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/)?.[1]
      ?.trim() ?? "";
    const link = block.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() ?? "";
    const pubDate = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() ?? "";
    const idMatch =
      link.match(/\/([A-Za-z0-9_-]+)$/) ||
      link.match(/\/news\/html\/(\d+)\//);
    items.push({
      news_id: idMatch?.[1] ?? link,
      title,
      description,
      link,
      pub_date: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
    });
  }
  return items;
}

// Naive sentence splitter for Japanese: split on 。while keeping the period.
function splitJapaneseSentences(text: string): string[] {
  return text
    .split(/(?<=。)/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function buildArticles(
  level: Level,
  category: Category,
  items: RegularItem[],
): (CachedArticle & { category: Category })[] {
  const kind = levelToSourceKind(level);

  if (kind === "easy") {
    const sorted = [...items].sort(
      (a, b) => a.description.length - b.description.length,
    );
    const limit = level === "N3" ? 10 : 8;
    return sorted.slice(0, limit).map((it) => {
      const sentences = splitJapaneseSentences(it.description);
      const body_html = sentences.map((s) => `<p>${s}</p>`).join("");
      return {
        news_id: it.news_id,
        level,
        category,
        source: "easy" as const,
        title: it.title,
        summary: null,
        body_html,
        audio_url: null,
        source_url: it.link,
        published_at: it.pub_date,
      };
    });
  }

  return items.slice(0, 12).map((it) => ({
    news_id: it.news_id,
    level,
    category,
    source: "regular" as const,
    title: it.title,
    summary: it.description,
    body_html: null,
    audio_url: null,
    source_url: it.link,
    published_at: it.pub_date,
  }));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = (await req.json()) as { level: Level; category?: Category; force?: boolean };
    const level = body.level;
    const force = body.force === true;
    const category: Category = body.category && VALID_CATEGORIES.includes(body.category)
      ? body.category
      : "top";

    if (!["N5", "N4", "N3", "N2", "N1"].includes(level)) {
      return new Response(JSON.stringify({ error: "invalid level" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Check cache freshness for this (level, category)
    const { data: existing } = await supabase
      .from("nhk_news_cache")
      .select("*")
      .eq("level", level)
      .eq("category", category)
      .order("fetched_at", { ascending: false })
      .limit(12);

    const fresh =
      !force &&
      existing &&
      existing.length >= 5 &&
      existing[0].fetched_at &&
      Date.now() - new Date(existing[0].fetched_at).getTime() < CACHE_TTL_MS;

    if (fresh) {
      return new Response(
        JSON.stringify({ articles: existing, cached: true, category }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const items = await fetchRss(RSS_FEEDS[category]);
    const articles = buildArticles(level, category, items);

    if (articles.length > 0) {
      await supabase.from("nhk_news_cache").upsert(
        articles.map((a) => ({ ...a, fetched_at: new Date().toISOString() })),
        { onConflict: "news_id,level,category" },
      );
    }

    const { data: latest } = await supabase
      .from("nhk_news_cache")
      .select("*")
      .eq("level", level)
      .eq("category", category)
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(12);

    return new Response(
      JSON.stringify({ articles: latest ?? articles, cached: false, category }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("fetch-nhk-news error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
