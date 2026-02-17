export interface Achievement {
  id: string;
  title: string;
  titleJP: string;
  description: string;
  myth: string;         // Short japanese myth excerpt
  mythSource: string;   // e.g. "古事記 — Kojiki"
  image: string;        // imported asset path
  rarity: "common" | "uncommon" | "rare" | "legendary";
  unlocked: boolean;
  unlockedAt?: string;
}

export type AchievementId =
  | "first_lesson"
  | "perfect_practice"
  | "vocabulary_master"
  | "streak_3"
  | "all_grammar";

// Keys persisted to localStorage
const STORAGE_KEY = "kitsune_achievements";

export function loadAchievements(): Set<AchievementId> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as AchievementId[]);
  } catch {
    return new Set();
  }
}

export function saveAchievement(id: AchievementId): void {
  const current = loadAchievements();
  current.add(id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...current]));
}

export function isUnlocked(id: AchievementId): boolean {
  return loadAchievements().has(id);
}
