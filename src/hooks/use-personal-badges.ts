import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface PersonalBadge {
  id: string;
  user_id: string;
  trigger_type: string;
  trigger_detail: string;
  tier: number;
  title: string;
  title_jp: string | null;
  description: string | null;
  myth: string | null;
  image_url: string | null;
  rarity: string;
  created_at: string;
}

const THRESHOLDS = [5, 10, 15];
const TIER_FOR_THRESHOLD: Record<number, number> = { 5: 1, 10: 2, 15: 3 };

export function usePersonalBadges() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [badges, setBadges] = useState<PersonalBadge[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Fetch existing personal badges
  const fetchBadges = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data } = await supabase
      .from("personal_badges")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setBadges((data as PersonalBadge[]) || []);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  // Track a mistake for a word, returns updated count
  const trackMistake = useCallback(
    async (lessonId: string, word: string): Promise<number> => {
      if (!user?.id) return 0;

      // Upsert: increment mistake_count
      const { data: existing } = await supabase
        .from("mistake_log")
        .select("id, mistake_count")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .eq("word", word)
        .maybeSingle();

      if (existing) {
        const newCount = (existing.mistake_count || 0) + 1;
        await supabase
          .from("mistake_log")
          .update({ mistake_count: newCount, updated_at: new Date().toISOString() })
          .eq("id", existing.id);
        return newCount;
      } else {
        await supabase.from("mistake_log").insert({
          user_id: user.id,
          lesson_id: lessonId,
          word,
          mistake_count: 1,
        });
        return 1;
      }
    },
    [user?.id]
  );

  // Check thresholds and generate badges if needed
  const checkAndGenerate = useCallback(
    async (lessonId: string, mistakesMap: Record<string, { count: number; meaning: string }>) => {
      if (!user?.id) return;

      for (const [word, { count, meaning }] of Object.entries(mistakesMap)) {
        for (const threshold of THRESHOLDS) {
          if (count < threshold) continue;
          const tier = TIER_FOR_THRESHOLD[threshold];

          // Check if badge already exists
          const existing = badges.find(
            (b) =>
              b.trigger_type === "word_struggle" &&
              b.trigger_detail === word &&
              b.tier === tier
          );
          if (existing) continue;

          // Generate badge
          setGenerating(true);
          try {
            const { data, error } = await supabase.functions.invoke("generate-badge", {
              body: {
                user_id: user.id,
                trigger_type: "word_struggle",
                trigger_detail: word,
                word,
                meaning,
                mistake_count: count,
                tier,
              },
            });

            if (error) {
              console.error("Badge generation error:", error);
              continue;
            }

            if (data?.badge) {
              const newBadge = data.badge as PersonalBadge;
              setBadges((prev) => [newBadge, ...prev]);

              const tierLabel = tier === 1 ? "Bronze" : tier === 2 ? "Silver" : "Golden";
              toast({
                title: `🎌 A new spirit has appeared!`,
                description: `${tierLabel}: "${newBadge.title}" — ${newBadge.description}`,
              });
            }
          } catch (err) {
            console.error("Badge generation failed:", err);
          } finally {
            setGenerating(false);
          }
        }
      }
    },
    [user?.id, badges, toast]
  );

  return { badges, loading, generating, fetchBadges, trackMistake, checkAndGenerate };
}
