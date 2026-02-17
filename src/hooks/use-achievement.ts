import { useEffect, useRef } from "react";
import { saveAchievement, isUnlocked, type AchievementId } from "@/lib/achievements";
import { toast } from "sonner";

const TITLES: Record<AchievementId, { title: string; jp: string }> = {
  first_lesson:       { title: "First Scroll", jp: "最初の巻物" },
  perfect_practice:   { title: "Iron Discipline", jp: "鉄の修行" },
  vocabulary_master:  { title: "Word Weaver", jp: "言葉の織り手" },
  all_grammar:        { title: "Pattern Seeker", jp: "型の探求者" },
  streak_3:           { title: "Demon's Resolve", jp: "鬼の覚悟" },
};

export function useAchievement() {
  const fired = useRef<Set<AchievementId>>(new Set());

  function unlock(id: AchievementId) {
    if (fired.current.has(id)) return;
    if (isUnlocked(id)) return;
    fired.current.add(id);
    saveAchievement(id);
    const { title, jp } = TITLES[id];
    toast.success(`✦ Spirit Unlocked`, {
      description: `${title} — ${jp}`,
      duration: 4000,
      className: "serif-jp border-2 border-primary bg-card text-foreground",
    });
  }

  return { unlock };
}

/** Fires once when condition becomes true */
export function useAchievementEffect(id: AchievementId, condition: boolean) {
  const { unlock } = useAchievement();
  const triggered = useRef(false);

  useEffect(() => {
    if (condition && !triggered.current) {
      triggered.current = true;
      unlock(id);
    }
  }, [condition, id]);
}
