import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export type AchievementId =
  | "first_lesson"
  | "perfect_practice"
  | "vocabulary_master"
  | "streak_3"
  | "all_grammar";

const TITLES: Record<AchievementId, { title: string; jp: string }> = {
  first_lesson:       { title: "First Scroll",      jp: "最初の巻物" },
  perfect_practice:   { title: "Iron Discipline",   jp: "鉄の修行" },
  vocabulary_master:  { title: "Word Weaver",        jp: "言葉の織り手" },
  all_grammar:        { title: "Pattern Seeker",     jp: "型の探求者" },
  streak_3:           { title: "Demon's Resolve",    jp: "鬼の覚悟" },
};

// ── Persistence helpers ────────────────────────────────────────────────────
// Fallback to localStorage when not signed in so guests can still unlock.

const LS_KEY = "kitsune_achievements";

function loadLocalAchievements(): Set<AchievementId> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? new Set(JSON.parse(raw) as AchievementId[]) : new Set();
  } catch { return new Set(); }
}

function saveLocalAchievement(id: AchievementId): void {
  const s = loadLocalAchievements();
  s.add(id);
  localStorage.setItem(LS_KEY, JSON.stringify([...s]));
}

async function saveDbAchievement(userId: string, id: AchievementId) {
  await supabase
    .from("user_achievements")
    .upsert({ user_id: userId, achievement_id: id }, { onConflict: "user_id,achievement_id" });
}

async function loadDbAchievements(userId: string): Promise<Set<AchievementId>> {
  const { data } = await supabase
    .from("user_achievements")
    .select("achievement_id")
    .eq("user_id", userId);
  return new Set((data ?? []).map((r) => r.achievement_id as AchievementId));
}

// ── Public API ─────────────────────────────────────────────────────────────

export async function loadAchievements(userId?: string | null): Promise<Set<AchievementId>> {
  if (userId) return loadDbAchievements(userId);
  return loadLocalAchievements();
}

export function isUnlocked(id: AchievementId): boolean {
  return loadLocalAchievements().has(id);
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function useAchievement() {
  const { user } = useAuth();
  const fired = useRef<Set<AchievementId>>(new Set());

  async function unlock(id: AchievementId) {
    if (fired.current.has(id)) return;

    // Check already unlocked (local first, then DB if signed in)
    const current = user
      ? await loadDbAchievements(user.id)
      : loadLocalAchievements();

    if (current.has(id)) {
      fired.current.add(id);
      return;
    }

    fired.current.add(id);

    // Persist
    if (user) {
      await saveDbAchievement(user.id, id);
    } else {
      saveLocalAchievement(id);
    }

    const { title, jp } = TITLES[id];
    toast.success("✦ Spirit Unlocked", {
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
