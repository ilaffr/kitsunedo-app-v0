import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Newspaper, ChevronRight, Loader2, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

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

// Tier thresholds (consecutive days)
const STREAK_TIERS: { days: number; tier: number; label: string }[] = [
  { days: 7, tier: 1, label: "7-day" },
  { days: 30, tier: 2, label: "30-day" },
];

async function recordReadAndCheckStreak(userId: string, level: Level): Promise<number> {
  // 1. Insert today's read (idempotent via UNIQUE (user_id, read_date))
  await supabase
    .from("nhk_reading_log")
    .insert({ user_id: userId, level })
    .then(() => undefined, () => undefined); // ignore conflict on existing

  // 2. Pull last 35 days of reads to compute current streak
  const since = new Date();
  since.setDate(since.getDate() - 35);
  const { data: rows } = await supabase
    .from("nhk_reading_log")
    .select("read_date")
    .eq("user_id", userId)
    .gte("read_date", since.toISOString().slice(0, 10))
    .order("read_date", { ascending: false });

  if (!rows || rows.length === 0) return 0;

  // 3. Count consecutive distinct dates ending today (or yesterday — tolerate single-day gap)
  const dates = new Set(rows.map((r: { read_date: string }) => r.read_date));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;
  for (let i = 0; i < 60; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (dates.has(key)) streak += 1;
    else break;
  }
  return streak;
}

async function maybeAwardStreakBadge(userId: string, streak: number) {
  // Find the highest tier the user qualifies for that they haven't earned yet
  const eligible = STREAK_TIERS.filter((t) => streak >= t.days);
  if (eligible.length === 0) return;

  for (const t of eligible) {
    const triggerDetail = t.label;
    const { data: existing } = await supabase
      .from("personal_badges")
      .select("id")
      .eq("user_id", userId)
      .eq("trigger_type", "news_streak")
      .eq("trigger_detail", triggerDetail)
      .eq("tier", t.tier)
      .maybeSingle();

    if (existing) continue;

    try {
      const { data, error } = await supabase.functions.invoke("generate-badge", {
        body: {
          user_id: userId,
          trigger_type: "news_streak",
          trigger_detail: triggerDetail,
          tier: t.tier,
          streak_days: t.days,
        },
      });
      if (error) {
        console.error("News streak badge error", error);
        continue;
      }
      if (data?.badge) {
        toast.success(`🦊 ${data.badge.title}`, {
          description: `${t.days} days of NHK reading — ${data.badge.description ?? "a new spirit joins your bestiary."}`,
          duration: 6000,
        });
      }
    } catch (e) {
      console.error("News streak badge failed", e);
    }
  }
}

export function NhkHeadlineTeaser() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [level, setLevel] = useState<Level>("N5");
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);

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

  // When an article successfully loads, log today's read & possibly award the badge.
  useEffect(() => {
    if (!user || !article) return;
    let cancelled = false;
    (async () => {
      try {
        const newStreak = await recordReadAndCheckStreak(user.id, level);
        if (cancelled) return;
        setStreak(newStreak);
        if (newStreak >= STREAK_TIERS[0].days) {
          await maybeAwardStreakBadge(user.id, newStreak);
        }
      } catch (e) {
        console.error("nhk streak track error", e);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, article?.title]);

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
          {streak >= 2 && (
            <span
              className="inline-flex items-center gap-1 text-[10px] font-brush text-primary border border-primary/40 bg-primary/5 rounded-full px-1.5 py-0.5"
              title={`${streak}-day NHK reading streak`}
            >
              <Flame className="w-2.5 h-2.5" />
              {streak}d
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
