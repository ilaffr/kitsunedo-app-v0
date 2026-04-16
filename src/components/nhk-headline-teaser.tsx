import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Newspaper, ChevronRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

type Level = "N5" | "N4" | "N3" | "N2" | "N1";

interface Article {
  title: string;
  summary: string | null;
  body_html: string | null;
  published_at: string | null;
  level: Level;
}

function stripHtml(html: string): string {
  return html
    .replace(/<rp>[\s\S]*?<\/rp>/g, "")
    .replace(/<rt>[\s\S]*?<\/rt>/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function formatDate(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return (
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
    " · " +
    d.toLocaleDateString("ja-JP", { month: "short", day: "numeric" })
  );
}

export function NhkHeadlineTeaser() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [level, setLevel] = useState<Level>("N5");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    (async () => {
      // 1. Resolve user's level from placement_results (default N5)
      let userLevel: Level = "N5";
      const { data: placement } = await supabase
        .from("placement_results")
        .select("level")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (placement?.level && ["N5", "N4", "N3", "N2", "N1"].includes(placement.level)) {
        userLevel = placement.level as Level;
      }
      if (cancelled) return;
      setLevel(userLevel);

      // 2. Try cached article first (no fetch round-trip)
      const { data: cached } = await supabase
        .from("nhk_news_cache")
        .select("title, summary, body_html, published_at, level")
        .eq("level", userLevel)
        .order("published_at", { ascending: false, nullsFirst: false })
        .limit(1);

      if (!cancelled && cached && cached.length > 0) {
        setArticle(cached[0] as Article);
        setLoading(false);
        return;
      }

      // 3. Cache empty — invoke edge fn to populate, then re-read
      try {
        await supabase.functions.invoke("fetch-nhk-news", {
          body: { level: userLevel },
        });
        const { data: refreshed } = await supabase
          .from("nhk_news_cache")
          .select("title, summary, body_html, published_at, level")
          .eq("level", userLevel)
          .order("published_at", { ascending: false, nullsFirst: false })
          .limit(1);
        if (!cancelled && refreshed && refreshed.length > 0) {
          setArticle(refreshed[0] as Article);
        }
      } catch {
        /* silent — teaser is non-critical */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (loading) {
    return (
      <button
        disabled
        className="w-full washi-card p-4 md:p-5 flex items-center gap-4 opacity-70"
      >
        <Newspaper className="w-5 h-5 text-muted-foreground shrink-0" />
        <div className="flex-1 text-left">
          <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
            Today's NHK Headline
          </p>
          <p className="serif-jp text-sm text-muted-foreground mt-1 flex items-center gap-2">
            <Loader2 className="w-3 h-3 animate-spin" /> 読み込み中…
          </p>
        </div>
      </button>
    );
  }

  if (!article) return null;

  const snippet = (article.summary || (article.body_html ? stripHtml(article.body_html) : "")).trim();
  const truncated = snippet.length > 110 ? snippet.slice(0, 110) + "…" : snippet;
  const titleText = stripHtml(article.title);

  return (
    <button
      onClick={() => navigate(`/jlpt-practice?level=${level}&mode=news`)}
      className="w-full washi-card p-4 md:p-5 flex items-start gap-4 text-left hover:translate-y-[-1px] transition-all group"
      aria-label="Open today's NHK headline"
    >
      <Newspaper className="w-5 h-5 text-foreground shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
            Today's NHK · {level}
          </p>
          {article.published_at && (
            <span className="text-[10px] text-muted-foreground/70">
              {formatDate(article.published_at)}
            </span>
          )}
        </div>
        <p className="japanese-text text-foreground text-base leading-snug font-medium group-hover:text-primary transition-colors line-clamp-2">
          {titleText}
        </p>
        {truncated && (
          <p className="text-xs text-muted-foreground leading-relaxed mt-1.5 line-clamp-2">
            {truncated}
          </p>
        )}
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-0.5" />
    </button>
  );
}
