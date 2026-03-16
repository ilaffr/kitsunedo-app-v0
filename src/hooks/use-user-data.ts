import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

// ── Streak ─────────────────────────────────────────────────────────────────

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string | null;
}

export function useStreak() {
  const { user } = useAuth();
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastStudyDate: null,
  });

  const fetchStreak = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_streaks")
      .select("current_streak, longest_streak, last_study_date")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setStreak({
        currentStreak: data.current_streak,
        longestStreak: data.longest_streak,
        lastStudyDate: data.last_study_date,
      });
    }
  }, [user]);

  const recordStudy = useCallback(async () => {
    if (!user) return;
    await supabase.rpc("record_study_session", { p_user_id: user.id });
    await fetchStreak();
  }, [user, fetchStreak]);

  useEffect(() => { fetchStreak(); }, [fetchStreak]);

  return { streak, recordStudy };
}

// ── Lesson progress ────────────────────────────────────────────────────────

interface LessonProgressData {
  completed: boolean;
  bestScore: number | null;
  section: string;
}

export function useLessonProgress(lessonId: string) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<LessonProgressData | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("lesson_progress")
      .select("completed, best_score, section")
      .eq("user_id", user.id)
      .eq("lesson_id", lessonId)
      .maybeSingle();

    if (data) {
      setProgress({
        completed: data.completed,
        bestScore: data.best_score,
        section: data.section,
      });
    }
  }, [user, lessonId]);

  const saveProgress = useCallback(
    async (patch: Partial<{ completed: boolean; bestScore: number; section: string }>) => {
      if (!user) return;
      await supabase
        .from("lesson_progress")
        .upsert(
          {
            user_id: user.id,
            lesson_id: lessonId,
            completed: patch.completed ?? progress?.completed ?? false,
            best_score: patch.bestScore ?? progress?.bestScore ?? null,
            section: patch.section ?? progress?.section ?? "vocabulary",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,lesson_id" }
        );
      await fetchProgress();
    },
    [user, lessonId, progress, fetchProgress]
  );

  useEffect(() => { fetchProgress(); }, [fetchProgress]);

  return { progress, saveProgress };
}

// ── Practice sessions ──────────────────────────────────────────────────────

interface SavePracticeParams {
  practiceType: string;
  perfect: number;
  close: number;
  missed: number;
  total: number;
}

export function usePracticeSession() {
  const { user } = useAuth();
  const { recordStudy } = useStreak();

  const savePractice = useCallback(
    async (params: SavePracticeParams) => {
      if (!user) return 0;
      // XP: 10 per perfect, 5 per close, 1 per missed
      const xp = params.perfect * 10 + params.close * 5 + params.missed * 1;
      await supabase.from("practice_sessions").insert({
        user_id: user.id,
        practice_type: params.practiceType,
        score_perfect: params.perfect,
        score_close: params.close,
        score_missed: params.missed,
        total_items: params.total,
        xp_earned: xp,
      });
      // Record study for streak
      await recordStudy();
      return xp;
    },
    [user, recordStudy]
  );

  const getTodayXP = useCallback(async () => {
    if (!user) return 0;
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("practice_sessions")
      .select("xp_earned")
      .eq("user_id", user.id)
      .gte("created_at", `${today}T00:00:00Z`);
    return (data ?? []).reduce((sum, r) => sum + (r.xp_earned ?? 0), 0);
  }, [user]);

  return { savePractice, getTodayXP };
}
