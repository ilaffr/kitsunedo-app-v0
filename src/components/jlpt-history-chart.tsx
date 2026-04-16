import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

type Level = "N5" | "N4" | "N3" | "N2" | "N1";

const LEVELS: Array<{ id: Level; jp: string }> = [
  { id: "N5", jp: "五級" },
  { id: "N4", jp: "四級" },
  { id: "N3", jp: "三級" },
  { id: "N2", jp: "二級" },
  { id: "N1", jp: "一級" },
];

interface LevelStats {
  attempts: number;
  passes: number; // sessions with pct >= 80
  perfects: number; // pct === 100
  bestPct: number; // 0–100
}

const EMPTY: LevelStats = { attempts: 0, passes: 0, perfects: 0, bestPct: 0 };

export function JlptHistoryChart() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Record<Level, LevelStats>>({
    N5: EMPTY,
    N4: EMPTY,
    N3: EMPTY,
    N2: EMPTY,
    N1: EMPTY,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("jlpt_sessions")
        .select("level, correct_count, total_questions")
        .eq("user_id", user.id);

      if (cancelled) return;
      if (error || !data) {
        setLoading(false);
        return;
      }

      const next: Record<Level, LevelStats> = {
        N5: { ...EMPTY },
        N4: { ...EMPTY },
        N3: { ...EMPTY },
        N2: { ...EMPTY },
        N1: { ...EMPTY },
      };

      for (const s of data) {
        const lvl = s.level as Level;
        if (!next[lvl]) continue;
        const total = s.total_questions || 0;
        if (total === 0) continue;
        const pct = Math.round(((s.correct_count || 0) / total) * 100);
        next[lvl].attempts += 1;
        if (pct >= 80) next[lvl].passes += 1;
        if (pct === 100) next[lvl].perfects += 1;
        if (pct > next[lvl].bestPct) next[lvl].bestPct = pct;
      }

      setStats(next);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const totalAttempts = Object.values(stats).reduce((a, s) => a + s.attempts, 0);

  return (
    <section className="washi-card p-5 md:p-6">
      <div className="flex items-baseline justify-between mb-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground mb-1">
            JLPT History · 試験記録
          </p>
          <p className="text-xs text-muted-foreground italic">
            Best score and passes per level
          </p>
        </div>
        <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          {totalAttempts} attempt{totalAttempts === 1 ? "" : "s"}
        </p>
      </div>

      {loading ? (
        <div className="h-40 flex items-center justify-center text-xs text-muted-foreground italic">
          Loading…
        </div>
      ) : totalAttempts === 0 ? (
        <div className="h-40 flex flex-col items-center justify-center text-center px-4">
          <p className="serif-jp text-foreground/70 text-sm mb-1">未挑戦</p>
          <p className="text-xs text-muted-foreground italic">
            No JLPT sessions yet — take a mock test to start your record.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Bar chart */}
          <div className="flex items-end justify-between gap-3 h-44 px-1">
            {LEVELS.map((lv) => {
              const s = stats[lv.id];
              const heightPct = Math.max(s.bestPct, s.attempts > 0 ? 4 : 0);
              const passed = s.passes > 0;
              const perfected = s.perfects > 0;

              return (
                <div
                  key={lv.id}
                  className="flex-1 flex flex-col items-center gap-1.5"
                >
                  {/* Score label */}
                  <p
                    className={cn(
                      "text-[10px] serif-jp tabular-nums h-4",
                      perfected
                        ? "text-primary font-medium"
                        : passed
                          ? "text-foreground"
                          : s.attempts > 0
                            ? "text-foreground/60"
                            : "text-transparent",
                    )}
                  >
                    {s.attempts > 0 ? `${s.bestPct}%` : "·"}
                  </p>

                  {/* Bar track */}
                  <div className="relative w-full flex-1 bg-foreground/[0.04] rounded-sm overflow-hidden ring-1 ring-foreground/10">
                    {/* 80% pass-line */}
                    <div
                      className="absolute left-0 right-0 border-t border-dashed border-foreground/20"
                      style={{ bottom: "80%" }}
                      aria-hidden
                    />
                    {/* Fill */}
                    <div
                      className={cn(
                        "absolute bottom-0 left-0 right-0 transition-all duration-500",
                        perfected
                          ? "bg-gradient-to-t from-primary to-primary/60"
                          : passed
                            ? "bg-foreground/80"
                            : "bg-foreground/30",
                      )}
                      style={{ height: `${heightPct}%` }}
                    />
                    {/* Perfect mark */}
                    {perfected && (
                      <span
                        className="absolute top-1 left-1/2 -translate-x-1/2 text-[9px] serif-jp text-primary-foreground bg-primary px-1 rounded-sm shadow-sm"
                        title="Perfect score earned"
                      >
                        極
                      </span>
                    )}
                  </div>

                  {/* Level + jp */}
                  <div className="text-center mt-1">
                    <p
                      className={cn(
                        "text-[10px] uppercase tracking-[0.2em]",
                        s.attempts > 0 ? "text-foreground" : "text-muted-foreground/60",
                      )}
                    >
                      {lv.id}
                    </p>
                    <p className="serif-jp text-[10px] text-muted-foreground/70 hidden md:block">
                      {lv.jp}
                    </p>
                  </div>

                  {/* Passes count */}
                  <p
                    className={cn(
                      "text-[10px] tabular-nums",
                      passed ? "text-foreground" : "text-muted-foreground/50",
                    )}
                  >
                    {s.passes}/{s.attempts || 0}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 pt-3 border-t border-border text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-foreground/30 rounded-sm" />
              Attempt
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-foreground/80 rounded-sm" />
              Passed (≥80%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-primary rounded-sm" />
              Perfect (100%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 border-t border-dashed border-foreground/40" />
              Pass line
            </span>
          </div>
          <p className="text-[10px] text-center text-muted-foreground/70">
            Bar height = best score · number = passes / attempts
          </p>
        </div>
      )}
    </section>
  );
}
