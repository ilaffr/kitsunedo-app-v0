// NHK News fetcher — pulls News Web Easy + regular NHK RSS, caches per level
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
  source: SourceKind;
  title: string;
  summary: string | null;
  body_html: string | null;
  audio_url: string | null;
  source_url: string;
  published_at: string | null;
}

const CACHE_TTL_MS = 60 * 60 * 1000; // 1h
const EASY_LIST_URL = "https://www3.nhk.or.jp/news/easy/news-list.json";
const REGULAR_RSS_URL = "https://www.nhk.or.jp/rss/news/cat0.xml";

// NHK blocks generic UAs with 401. Use a realistic browser fingerprint.
const NHK_HEADERS: HeadersInit = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept":
    "text/html,application/xhtml+xml,application/xml;q=0.9,application/json;q=0.9,*/*;q=0.8",
  "Accept-Language": "ja,en;q=0.9",
  "Referer": "https://www3.nhk.or.jp/news/easy/",
};

function levelToSourceKind(level: Level): SourceKind {
  if (level === "N5" || level === "N4" || level === "N3") return "easy";
  return "regular";
}

// ---------- Easy news ----------

interface EasyItem {
  news_id: string;
  title: string;
  title_with_ruby?: string;
  news_prearranged_time: string; // "YYYY-MM-DD HH:mm:ss"
  has_news_easy_voice?: boolean;
  news_easy_voice_uri?: string;
}

async function fetchEasyList(): Promise<EasyItem[]> {
  const r = await fetch(EASY_LIST_URL, { headers: NHK_HEADERS });
  if (!r.ok) throw new Error(`easy list ${r.status}`);
  const json = await r.json();
  // shape: [ { "YYYY-MM-DD": [ {...item} ] } ]
  const out: EasyItem[] = [];
  if (Array.isArray(json) && json[0]) {
    for (const day of Object.values(json[0]) as EasyItem[][]) {
      for (const it of day) out.push(it);
    }
  }
  return out;
}

async function fetchEasyArticleHtml(newsId: string): Promise<string | null> {
  try {
    const url = `https://www3.nhk.or.jp/news/easy/${newsId}/${newsId}.html`;
    const r = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 KitsuneDo/1.0" },
    });
    if (!r.ok) return null;
    const html = await r.text();
    // Extract body div
    const bodyMatch = html.match(
      /<div[^>]*id="js-article-body"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/,
    );
    let body = bodyMatch?.[1] ?? "";
    if (!body) {
      const alt = html.match(/<div[^>]*class="article-main__body"[^>]*>([\s\S]*?)<\/div>/);
      body = alt?.[1] ?? "";
    }
    // Keep only <ruby>, <rt>, <rb>, <p>, <br>
    body = body.replace(/<a [^>]*>/g, "").replace(/<\/a>/g, "");
    body = body.replace(/<span[^>]*>/g, "").replace(/<\/span>/g, "");
    body = body.replace(/\sclass="[^"]*"/g, "");
    body = body.replace(/<img[^>]*>/g, "");
    return body.trim() || null;
  } catch {
    return null;
  }
}

function easyVoiceUrl(item: EasyItem): string | null {
  if (item.news_easy_voice_uri) {
    return `https://nhks-vh.akamaihd.net/i/news/easy/${item.news_easy_voice_uri}/master.m3u8`;
  }
  if (item.has_news_easy_voice) {
    return `https://www3.nhk.or.jp/news/easy/${item.news_id}/${item.news_id}.mp3`;
  }
  return null;
}

// ---------- Regular RSS ----------

interface RegularItem {
  news_id: string;
  title: string;
  description: string;
  link: string;
  pub_date: string;
}

async function fetchRegularRss(): Promise<RegularItem[]> {
  const r = await fetch(REGULAR_RSS_URL, {
    headers: { "User-Agent": "Mozilla/5.0 KitsuneDo/1.0" },
  });
  if (!r.ok) throw new Error(`rss ${r.status}`);
  const xml = await r.text();
  const items: RegularItem[] = [];
  const re = /<item>([\s\S]*?)<\/item>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml))) {
    const block = m[1];
    const title = block.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)?.[1]?.trim() ?? "";
    const description = block.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/)?.[1]?.trim() ?? "";
    const link = block.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() ?? "";
    const pubDate = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() ?? "";
    const idMatch = link.match(/\/news\/html\/(\d+)\//) || link.match(/(\w+)\.html$/);
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

// ---------- Build per-level ----------

async function buildEasyArticles(level: Level, limit: number): Promise<CachedArticle[]> {
  const list = await fetchEasyList();
  const top = list.slice(0, limit);
  const out: CachedArticle[] = [];
  for (const it of top) {
    const body = await fetchEasyArticleHtml(it.news_id);
    out.push({
      news_id: it.news_id,
      level,
      source: "easy",
      title: it.title_with_ruby || it.title,
      summary: null,
      body_html: body,
      audio_url: easyVoiceUrl(it),
      source_url: `https://www3.nhk.or.jp/news/easy/${it.news_id}/${it.news_id}.html`,
      published_at: it.news_prearranged_time
        ? new Date(it.news_prearranged_time.replace(" ", "T") + "+09:00").toISOString()
        : null,
    });
  }
  return out;
}

async function buildRegularArticles(level: Level, limit: number): Promise<CachedArticle[]> {
  const items = await fetchRegularRss();
  return items.slice(0, limit).map((it) => ({
    news_id: it.news_id,
    level,
    source: "regular" as const,
    title: it.title,
    summary: it.description,
    body_html: null,
    audio_url: null,
    source_url: it.link,
    published_at: it.pub_date,
  }));
}

// ---------- Handler ----------

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { level } = (await req.json()) as { level: Level };
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

    // Check cache freshness
    const { data: existing } = await supabase
      .from("nhk_news_cache")
      .select("*")
      .eq("level", level)
      .order("fetched_at", { ascending: false })
      .limit(10);

    const fresh =
      existing &&
      existing.length >= 5 &&
      existing[0].fetched_at &&
      Date.now() - new Date(existing[0].fetched_at).getTime() < CACHE_TTL_MS;

    if (fresh) {
      return new Response(JSON.stringify({ articles: existing, cached: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch fresh
    const kind = levelToSourceKind(level);
    const articles =
      kind === "easy"
        ? await buildEasyArticles(level, 8)
        : await buildRegularArticles(level, 12);

    if (articles.length > 0) {
      // Upsert
      await supabase.from("nhk_news_cache").upsert(
        articles.map((a) => ({ ...a, fetched_at: new Date().toISOString() })),
        { onConflict: "news_id,level" },
      );
    }

    // Return latest snapshot
    const { data: latest } = await supabase
      .from("nhk_news_cache")
      .select("*")
      .eq("level", level)
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(10);

    return new Response(JSON.stringify({ articles: latest ?? articles, cached: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("fetch-nhk-news error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
