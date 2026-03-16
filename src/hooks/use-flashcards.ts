import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface Flashcard {
  id: string;
  japanese: string;
  reading: string;
  meaning: string;
  lesson_id: string;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  next_review_at: string;
}

type SRSGrade = "again" | "hard" | "good" | "easy";

function calculateSRS(card: Flashcard, grade: SRSGrade) {
  let { ease_factor, interval_days, repetitions } = card;
  const gradeNum = grade === "again" ? 0 : grade === "hard" ? 1 : grade === "good" ? 2 : 3;

  if (gradeNum === 0) {
    // Reset
    repetitions = 0;
    interval_days = 0;
  } else {
    if (repetitions === 0) {
      interval_days = 1;
    } else if (repetitions === 1) {
      interval_days = 3;
    } else {
      interval_days = Math.round(interval_days * ease_factor);
    }
    repetitions += 1;
  }

  // Adjust ease factor
  ease_factor = Math.max(
    1.3,
    ease_factor + (0.1 - (2 - gradeNum) * (0.08 + (2 - gradeNum) * 0.02))
  );

  if (grade === "easy") interval_days = Math.round(interval_days * 1.3);

  const next = new Date();
  next.setDate(next.getDate() + Math.max(interval_days, 0));

  return {
    ease_factor,
    interval_days,
    repetitions,
    next_review_at: interval_days === 0 ? new Date(Date.now() + 10 * 60 * 1000).toISOString() : next.toISOString(),
  };
}

export function useFlashcards() {
  const { user } = useAuth();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [savedSet, setSavedSet] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const fetchCards = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("flashcards")
      .select("*")
      .eq("user_id", user.id)
      .order("next_review_at", { ascending: true });
    const result = (data ?? []) as Flashcard[];
    setCards(result);
    setSavedSet(new Set(result.map((c) => c.japanese)));
    setLoading(false);
  }, [user]);

  const addCard = useCallback(
    async (word: { japanese: string; reading: string; meaning: string; lessonId: string }) => {
      if (!user) return;
      await supabase.from("flashcards").upsert(
        {
          user_id: user.id,
          lesson_id: word.lessonId,
          japanese: word.japanese,
          reading: word.reading,
          meaning: word.meaning,
        },
        { onConflict: "user_id,japanese" }
      );
      setSavedSet((prev) => new Set(prev).add(word.japanese));
    },
    [user]
  );

  const removeCard = useCallback(
    async (japanese: string) => {
      if (!user) return;
      await supabase
        .from("flashcards")
        .delete()
        .eq("user_id", user.id)
        .eq("japanese", japanese);
      setSavedSet((prev) => {
        const next = new Set(prev);
        next.delete(japanese);
        return next;
      });
    },
    [user]
  );

  const reviewCard = useCallback(
    async (cardId: string, grade: SRSGrade) => {
      const card = cards.find((c) => c.id === cardId);
      if (!card || !user) return;
      const updates = calculateSRS(card, grade);
      await supabase
        .from("flashcards")
        .update({
          ...updates,
          last_reviewed_at: new Date().toISOString(),
        })
        .eq("id", cardId);
    },
    [cards, user]
  );

  const getDueCards = useCallback(() => {
    const now = new Date().toISOString();
    return cards.filter((c) => c.next_review_at <= now);
  }, [cards]);

  return { cards, savedSet, loading, fetchCards, addCard, removeCard, reviewCard, getDueCards };
}
