import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
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
  image_url: string | null;
  title: string;
}

export function JlptSpiritStrip() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [unlocked, setUnlocked] = useState<Map<string, UnlockedBadge>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("personal_badges")
        .select("trigger_detail, image_url, title")
        .eq("user_id", user.id)
        .eq("trigger_type", "jlpt_pass");
      if (cancelled) return;
      const map = new Map<string, UnlockedBadge>();
      (data ?? []).forEach((b) => map.set(b.trigger_detail, b as UnlockedBadge));
      setUnlocked(map);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const earnedCount = unlocked.size;

  return (
    <section className="mb-10 md:mb-12">
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground mb-1">
            JLPT Spirits · 能試霊
          </p>
          <p className="serif-jp text-sm text-foreground/70">
            Earn one for each level passed at 80%+
          </p>
        </div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          {earnedCount} / 5
        </p>
      </div>

      <div className="washi-card p-4 md:p-6">
        <div className="grid grid-cols-5 gap-2 md:gap-4">
          {LEVEL_SPIRITS.map((s) => {
            const earned = unlocked.get(s.level);
            const isUnlocked = Boolean(earned);
            return (
              <button
                key={s.level}
                onClick={() => {
                  if (isUnlocked) {
                    // Scroll to bestiary list (badges section below)
                    document
                      .getElementById("personal-badges")
                      ?.scrollIntoView({ behavior: "smooth" });
                  } else {
                    navigate(`/jlpt-practice?level=${s.level}`);
                  }
                }}
                className={cn(
                  "group relative flex flex-col items-center gap-2 p-3 md:p-4 rounded-sm transition-all",
                  isUnlocked
                    ? "hover:bg-foreground/5"
                    : "hover:bg-foreground/5 cursor-pointer",
                )}
                aria-label={
                  isUnlocked
                    ? `${s.level} ${s.archetype} — earned`
                    : `${s.level} ${s.archetype} — locked, take the mock test to unlock`
                }
              >
                {/* Silhouette / portrait */}
                <div
                  className={cn(
                    "relative w-14 h-14 md:w-20 md:h-20 rounded-full flex items-center justify-center overflow-hidden transition-all",
                    isUnlocked
                      ? "bg-gradient-to-br from-background to-muted ring-1 ring-foreground/20"
                      : "bg-foreground/[0.04] ring-1 ring-dashed ring-foreground/15",
                  )}
                >
                  {isUnlocked && earned?.image_url ? (
                    <img
                      src={earned.image_url}
                      alt={earned.title}
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
                      isUnlocked ? "text-foreground/80" : "text-muted-foreground/50",
                    )}
                  >
                    {s.jp}
                  </p>
                </div>

                {/* Rarity dot */}
                {isUnlocked && (
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

        {!loading && earnedCount < 5 && (
          <p className="text-[10px] text-center text-muted-foreground mt-4 italic tracking-wide">
            Tap a locked spirit to attempt its JLPT trial.
          </p>
        )}
      </div>
    </section>
  );
}
