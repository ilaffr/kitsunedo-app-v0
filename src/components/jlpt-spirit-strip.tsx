import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Sparkles, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

type Level = "N5" | "N4" | "N3" | "N2" | "N1";

const LEVEL_SPIRITS: Array<{
  level: Level;
  archetype: string;
  jp: string;
  glyph: string; // single kanji used as silhouette
  rarity: "uncommon" | "rare" | "legendary";
}> = [
  { level: "N5", archetype: "Foothill Spirit", jp: "麓の精", glyph: "麓", rarity: "uncommon" },
  { level: "N4", archetype: "Bamboo Grove Sprite", jp: "竹林の童", glyph: "竹", rarity: "uncommon" },
  { level: "N3", archetype: "River Sage", jp: "川の賢者", glyph: "川", rarity: "uncommon" },
  { level: "N2", archetype: "Cloud Tengu", jp: "雲の天狗", glyph: "雲", rarity: "rare" },
  { level: "N1", archetype: "Mountain Kami", jp: "山の神", glyph: "山", rarity: "legendary" },
];

interface UnlockedBadge {
  trigger_detail: string;
  tier: number;
  image_url: string | null;
  title: string;
}

export function JlptSpiritStrip() {
  const navigate = useNavigate();
  const { user } = useAuth();
  // key = `${level}|${tier}`
  const [unlocked, setUnlocked] = useState<Map<string, UnlockedBadge>>(new Map());
  // key = level → best percentage (0–100)
  const [bestScores, setBestScores] = useState<Map<Level, number>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const [{ data: badges }, { data: sessions }] = await Promise.all([
        supabase
          .from("personal_badges")
          .select("trigger_detail, tier, image_url, title")
          .eq("user_id", user.id)
          .eq("trigger_type", "jlpt_pass"),
        supabase
          .from("jlpt_sessions")
          .select("level, correct_count, total_questions")
          .eq("user_id", user.id)
          .gt("total_questions", 0),
      ]);
      if (cancelled) return;

      const map = new Map<string, UnlockedBadge>();
      (badges ?? []).forEach((b) => {
        map.set(`${b.trigger_detail}|${b.tier}`, b as UnlockedBadge);
      });
      setUnlocked(map);

      const scores = new Map<Level, number>();
      (sessions ?? []).forEach((s) => {
        if (!s.total_questions) return;
        const pct = Math.round((s.correct_count / s.total_questions) * 100);
        const lvl = s.level as Level;
        const prev = scores.get(lvl) ?? 0;
        if (pct > prev) scores.set(lvl, pct);
      });
      setBestScores(scores);

      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const earnedTier1 = LEVEL_SPIRITS.filter((s) => unlocked.has(`${s.level}|1`)).length;
  const earnedMythic = LEVEL_SPIRITS.filter((s) => unlocked.has(`${s.level}|2`)).length;

  return (
    <section className="mb-10 md:mb-12">
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground mb-1">
            JLPT Spirits · 能試霊
          </p>
          <p className="serif-jp text-sm text-foreground/70">
            Pass at 80%+ to earn the spirit · Score 100% to unlock its mythic form
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            {earnedTier1} / 5
          </p>
          {earnedMythic > 0 && (
            <p className="text-[10px] uppercase tracking-[0.3em] text-primary mt-0.5">
              ✨ {earnedMythic} mythic
            </p>
          )}
        </div>
      </div>

      <div className="washi-card p-4 md:p-6">
        <div className="grid grid-cols-5 gap-2 md:gap-4">
          {LEVEL_SPIRITS.map((s) => {
            const earnedBase = unlocked.get(`${s.level}|1`);
            const earnedMyth = unlocked.get(`${s.level}|2`);
            const earnedSpeed = unlocked.get(`${s.level}|3`);
            const isUnlocked = Boolean(earnedBase);
            const isMythic = Boolean(earnedMyth);
            const isSpeedrun = Boolean(earnedSpeed);
            // Speedrun > Mythic > Base for portrait precedence
            const portrait = earnedSpeed ?? earnedMyth ?? earnedBase;
            return (
              <button
                key={s.level}
                onClick={() => {
                  if (isUnlocked) {
                    document
                      .getElementById("personal-badges")
                      ?.scrollIntoView({ behavior: "smooth" });
                  } else {
                    navigate(`/jlpt-practice?level=${s.level}`);
                  }
                }}
                className={cn(
                  "group relative flex flex-col items-center gap-2 p-3 md:p-4 rounded-sm transition-all hover:bg-foreground/5",
                )}
                aria-label={
                  isMythic
                    ? `${s.level} ${s.archetype} — mythic perfect-score form earned`
                    : isUnlocked
                      ? `${s.level} ${s.archetype} — earned, perfect-score form locked`
                      : `${s.level} ${s.archetype} — locked, take the mock test to unlock`
                }
              >
                {/* Silhouette / portrait */}
                <div
                  className={cn(
                    "relative w-14 h-14 md:w-20 md:h-20 rounded-full flex items-center justify-center overflow-hidden transition-all",
                    isMythic
                      ? "bg-gradient-to-br from-primary/10 to-background ring-2 ring-primary/70 shadow-[0_0_20px_-4px_hsl(var(--primary)/0.5)]"
                      : isUnlocked
                        ? "bg-gradient-to-br from-background to-muted ring-1 ring-foreground/20"
                        : "bg-foreground/[0.04] ring-1 ring-dashed ring-foreground/15",
                  )}
                >
                  {isUnlocked && portrait?.image_url ? (
                    <img
                      src={portrait.image_url}
                      alt={portrait.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : isUnlocked ? (
                    <span
                      className={cn(
                        "serif-jp text-2xl md:text-3xl font-medium",
                        s.rarity === "legendary"
                          ? "text-primary"
                          : s.rarity === "rare"
                            ? "text-primary/80"
                            : "text-foreground",
                      )}
                    >
                      {s.glyph}
                    </span>
                  ) : (
                    <>
                      <span className="serif-jp text-2xl md:text-3xl text-foreground/15 select-none">
                        {s.glyph}
                      </span>
                      <Lock className="absolute w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground/60" />
                    </>
                  )}
                  {isMythic && (
                    <span
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md"
                      title="Mythic — Perfect Score"
                      aria-label="Mythic perfect-score form"
                    >
                      <Sparkles className="w-3 h-3" />
                    </span>
                  )}
                </div>

                {/* Level label */}
                <div className="text-center">
                  <p
                    className={cn(
                      "text-[10px] uppercase tracking-[0.25em]",
                      isUnlocked ? "text-foreground" : "text-muted-foreground/60",
                    )}
                  >
                    {s.level}
                  </p>
                  <p
                    className={cn(
                      "serif-jp text-[11px] md:text-xs leading-tight mt-0.5 hidden md:block",
                      isMythic
                        ? "text-primary font-medium"
                        : isUnlocked
                          ? "text-foreground/80"
                          : "text-muted-foreground/50",
                    )}
                  >
                    {isMythic ? `真${s.jp}` : s.jp}
                  </p>
                  {isUnlocked && bestScores.has(s.level) && (
                    <p
                      className={cn(
                        "text-[9px] md:text-[10px] tracking-wide mt-0.5 font-medium",
                        (bestScores.get(s.level) ?? 0) === 100
                          ? "text-primary"
                          : "text-muted-foreground",
                      )}
                      title={`Best score on ${s.level} mock test`}
                    >
                      Best: {bestScores.get(s.level)}%
                    </p>
                  )}
                </div>

                {/* Rarity dot */}
                {isUnlocked && !isMythic && (
                  <span
                    className={cn(
                      "absolute top-2 right-2 w-1.5 h-1.5 rounded-full",
                      s.rarity === "legendary"
                        ? "bg-primary"
                        : s.rarity === "rare"
                          ? "bg-primary/60"
                          : "bg-foreground/40",
                    )}
                    aria-hidden
                  />
                )}
              </button>
            );
          })}
        </div>

        {!loading && (earnedTier1 < 5 || earnedMythic < 5) && (
          <p className="text-[10px] text-center text-muted-foreground mt-4 italic tracking-wide">
            {earnedTier1 < 5
              ? "Tap a locked spirit to attempt its JLPT trial."
              : "Score 100% on each level to ascend the spirits to their mythic form."}
          </p>
        )}
      </div>
    </section>
  );
}
