import { useEffect, useState } from "react";
import { Sparkles, Volume2, Loader2, Check, X, RefreshCw, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { speakJapanese } from "@/lib/japanese-tts";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface KitsuneTale {
  id: string;
  story_jp: string;
  story_furigana: string | null;
  translation: string;
  question: string;
  options: string[];
  correct_index: number;
  vocab_used: string[] | null;
  completed: boolean;
  xp_awarded: number;
}

const TALE_XP = 15;

export function DailyKitsuneTale() {
  const { user } = useAuth();
  const [tale, setTale] = useState<KitsuneTale | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showFurigana, setShowFurigana] = useState(true);
  const [showTranslation, setShowTranslation] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Load today's tale on mount
  useEffect(() => {
    if (!user) return;
    const today = new Date().toISOString().slice(0, 10);
    supabase
      .from("kitsune_tales")
      .select("*")
      .eq("user_id", user.id)
      .eq("tale_date", today)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setTale(data as KitsuneTale);
          if (data.completed) setSubmitted(true);
        }
        setLoading(false);
      });
  }, [user]);

  const generateTale = async () => {
    if (!user || generating) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-kitsune-tale");
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setTale(data.tale);
      setSubmitted(data.tale.completed);
      setSelectedIdx(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to summon a tale";
      toast.error(msg);
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async () => {
    if (selectedIdx === null || !tale || !user) return;
    const correct = selectedIdx === tale.correct_index;
    setSubmitted(true);

    if (correct) toast.success(`+${TALE_XP} XP — the kitsune nods approvingly`);
    else toast("The kitsune flicks its tail — try again tomorrow", { icon: "🦊" });

    // Persist completion + XP via practice_sessions for tracking
    const xp = correct ? TALE_XP : 0;
    await supabase.from("kitsune_tales").update({
      completed: true,
      xp_awarded: xp,
    }).eq("id", tale.id);

    if (xp > 0) {
      await supabase.from("practice_sessions").insert({
        user_id: user.id,
        practice_type: "kitsune_tale",
        score_perfect: correct ? 1 : 0,
        score_close: 0,
        score_missed: correct ? 0 : 1,
        total_items: 1,
        xp_earned: xp,
      });
      // Also record study session for streak
      await supabase.rpc("record_study_session", { p_user_id: user.id });
    }
  };

  // ─────────── Empty state ───────────
  if (loading) {
    return (
      <div className="card-paper border-2 p-5 md:p-6 flex items-center justify-center min-h-[160px]">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!tale) {
    return (
      <div className="card-paper border-2 p-5 md:p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-sm bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-brush font-bold text-foreground">Daily Kitsune Tale</h3>
            <p className="text-xs text-muted-foreground serif-jp italic">狐の昔話 — A new story each dawn</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          The kitsune has a fresh story woven from your own vocabulary. Read it, listen to it, and answer one question.
        </p>
        <button
          onClick={generateTale}
          disabled={generating}
          className="btn-vermillion px-4 py-2 text-sm font-brush flex items-center gap-2 disabled:opacity-60"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Summoning the fox…
            </>
          ) : (
            <>
              <BookOpen className="w-4 h-4" />
              Reveal today's tale
            </>
          )}
        </button>
      </div>
    );
  }

  // ─────────── Loaded tale ───────────
  return (
    <div className="card-paper border-2 p-5 md:p-6">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-sm bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-brush font-bold text-foreground">Daily Kitsune Tale</h3>
            <p className="text-xs text-muted-foreground serif-jp italic">狐の昔話</p>
          </div>
        </div>
        <button
          onClick={() => speakJapanese(tale.story_jp, 0.8)}
          className="p-2 rounded-sm border-2 border-border hover:border-primary hover:text-primary transition-colors"
          aria-label="Listen"
          title="Listen to the tale"
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </div>

      {/* Story */}
      <div className="bg-muted/30 border-l-2 border-primary/40 p-4 mb-3">
        <p className="serif-jp text-base md:text-lg text-foreground leading-relaxed japanese-text whitespace-pre-line">
          {showFurigana && tale.story_furigana ? tale.story_furigana : tale.story_jp}
        </p>
      </div>

      {/* Toggles */}
      <div className="flex flex-wrap gap-2 mb-4 text-xs">
        {tale.story_furigana && (
          <button
            onClick={() => setShowFurigana((v) => !v)}
            className={cn(
              "px-2 py-1 border rounded-sm transition-colors",
              showFurigana ? "border-primary text-primary bg-primary/5" : "border-border text-muted-foreground hover:border-foreground"
            )}
          >
            ふりがな {showFurigana ? "ON" : "OFF"}
          </button>
        )}
        <button
          onClick={() => setShowTranslation((v) => !v)}
          className={cn(
            "px-2 py-1 border rounded-sm transition-colors",
            showTranslation ? "border-primary text-primary bg-primary/5" : "border-border text-muted-foreground hover:border-foreground"
          )}
        >
          {showTranslation ? "Hide translation" : "Show translation"}
        </button>
      </div>

      {showTranslation && (
        <p className="text-sm text-muted-foreground italic mb-4 px-1">{tale.translation}</p>
      )}

      {/* Vocab used chips */}
      {tale.vocab_used && tale.vocab_used.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tale.vocab_used.map((w) => (
            <span key={w} className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 bg-accent/10 text-accent border border-accent/20 rounded-sm serif-jp">
              {w}
            </span>
          ))}
        </div>
      )}

      {/* Question */}
      <div className="border-t-2 border-dashed border-border pt-4">
        <p className="text-sm font-bold text-foreground mb-3">{tale.question}</p>
        <div className="space-y-2">
          {tale.options.map((opt, idx) => {
            const isSelected = selectedIdx === idx;
            const isCorrect = idx === tale.correct_index;
            const showCorrect = submitted && isCorrect;
            const showWrong = submitted && isSelected && !isCorrect;
            return (
              <button
                key={idx}
                disabled={submitted}
                onClick={() => setSelectedIdx(idx)}
                className={cn(
                  "w-full text-left px-3 py-2 border-2 rounded-sm text-sm transition-colors flex items-center gap-2",
                  !submitted && isSelected && "border-primary bg-primary/5",
                  !submitted && !isSelected && "border-border hover:border-foreground/40",
                  showCorrect && "border-success bg-success/10 text-foreground",
                  showWrong && "border-destructive bg-destructive/10 text-foreground",
                  submitted && !isSelected && !isCorrect && "border-border opacity-60"
                )}
              >
                {showCorrect && <Check className="w-4 h-4 text-success shrink-0" />}
                {showWrong && <X className="w-4 h-4 text-destructive shrink-0" />}
                <span>{opt}</span>
              </button>
            );
          })}
        </div>

        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={selectedIdx === null}
            className="btn-vermillion mt-4 px-4 py-2 text-sm font-brush disabled:opacity-50"
          >
            Submit answer
          </button>
        ) : (
          <div className="mt-4 flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <span className="serif-jp italic">
              {selectedIdx === tale.correct_index ? "見事! Come back tomorrow for a new tale." : "明日また — Tomorrow brings a new tale."}
            </span>
            <button
              onClick={() => speakJapanese(tale.story_jp, 0.7)}
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Replay slowly
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
