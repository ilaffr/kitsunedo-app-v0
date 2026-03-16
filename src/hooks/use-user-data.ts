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

// ── Weekly XP ──────────────────────────────────────────────────────────────

export function useWeeklyXP() {
  const { user } = useAuth();
  const [days, setDays] = useState<{ label: string; xp: number; isToday: boolean }[]>([]);
  const [weekTotal, setWeekTotal] = useState(0);

  const fetch = useCallback(async () => {
    // Build last 7 days
    const today = new Date();
    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    if (!user) {
      const empty = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(sevenDaysAgo);
        d.setDate(sevenDaysAgo.getDate() + i);
        return { label: dayLabels[d.getDay()], xp: 0, isToday: d.toDateString() === today.toDateString() };
      });
      setDays(empty);
      return;
    }

    const { data } = await supabase
      .from("practice_sessions")
      .select("xp_earned, created_at")
      .eq("user_id", user.id)
      .gte("created_at", sevenDaysAgo.toISOString());

    // Bucket by date
    const buckets: Record<string, number> = {};
    for (const row of data ?? []) {
      const key = new Date(row.created_at).toDateString();
      buckets[key] = (buckets[key] ?? 0) + (row.xp_earned ?? 0);
    }

    let total = 0;
    const result = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(sevenDaysAgo);
      d.setDate(sevenDaysAgo.getDate() + i);
      const key = d.toDateString();
      const xp = buckets[key] ?? 0;
      total += xp;
      return { label: dayLabels[d.getDay()], xp, isToday: key === today.toDateString() };
    });

    setDays(result);
    setWeekTotal(total);
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  return { days, weekTotal };
}

// ── All lessons progress ────────────────────────────────────────────────────

export interface LessonProgressSummary {
  lessonId: string;
  completed: boolean;
  bestScore: number | null;
}

export function useAllLessonProgress() {
  const { user } = useAuth();
  const [lessons, setLessons] = useState<LessonProgressSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    const { data } = await supabase
      .from("lesson_progress")
      .select("lesson_id, completed, best_score")
      .eq("user_id", user.id);
    setLessons(
      (data ?? []).map((d) => ({
        lessonId: d.lesson_id,
        completed: d.completed,
        bestScore: d.best_score,
      }))
    );
    setLoading(false);
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  return { lessons, loading, refresh: fetch };
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

// ── Overall stats ──────────────────────────────────────────────────────────

export function useOverallStats() {
  const { user } = useAuth();
  const [totalXP, setTotalXP] = useState(0);
  const [sessionsCount, setSessionsCount] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(0);

  const fetch = useCallback(async () => {
    if (!user) return;

    const [xpRes, lessonsRes] = await Promise.all([
      supabase
        .from("practice_sessions")
        .select("xp_earned, id")
        .eq("user_id", user.id),
      supabase
        .from("lesson_progress")
        .select("lesson_id")
        .eq("user_id", user.id)
        .eq("completed", true),
    ]);

    const sessions = xpRes.data ?? [];
    setTotalXP(sessions.reduce((sum, r) => sum + (r.xp_earned ?? 0), 0));
    setSessionsCount(sessions.length);
    setCompletedLessons((lessonsRes.data ?? []).length);
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  return { totalXP, sessionsCount, completedLessons };
}
