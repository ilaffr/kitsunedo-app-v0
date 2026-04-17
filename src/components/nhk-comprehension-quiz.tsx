import { useState } from "react";
import { Loader2, Sparkles, Check, X, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { usePracticeSession } from "@/hooks/use-user-data";

interface QuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

interface Props {
  articleId: string;
  title: string;
  bodyHtml: string;
  level: string;
}

const XP_PER_CORRECT = 5;

export function NhkComprehensionQuiz({ articleId, title, bodyHtml, level }: Props) {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(0);
  const { savePractice } = usePracticeSession();

  const generate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-nhk-quiz", {
        body: { title, body_html: bodyHtml, level },
      });
      if (error) throw error;
      const fnError = (data as { error?: string } | null)?.error;
      if (fnError) {
        toast.error(fnError);
        return;
      }
      const qs = (data as { quiz?: { questions?: QuizQuestion[] } } | null)?.quiz?.questions;
      if (!qs || qs.length === 0) throw new Error("No questions returned");
      setQuestions(qs);
      setAnswers({});
      setSubmitted(false);
      setXpAwarded(0);
    } catch (e) {
      console.error(e);
      toast.error("Couldn't generate the quiz. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  const allAnswered = questions && Object.keys(answers).length === questions.length;

  const submit = async () => {
    if (!questions) return;
    const correctCount = questions.reduce(
      (sum, q, i) => sum + (answers[i] === q.correct_index ? 1 : 0),
      0,
    );
    const wrongCount = questions.length - correctCount;
    setSubmitted(true);

    try {
      // 5 XP per correct (close), 1 XP per wrong (missed)
      await savePractice({
        practiceType: `nhk_quiz_${level}`,
        perfect: 0,
        close: correctCount,
        missed: wrongCount,
        total: questions.length,
      });
      const xp = correctCount * XP_PER_CORRECT + wrongCount * 1;
      setXpAwarded(xp);
      if (correctCount === questions.length) {
        toast.success(`Perfect! +${xp} XP`);
      } else if (correctCount > 0) {
        toast.success(`+${xp} XP — ${correctCount}/${questions.length} correct`);
      } else {
        toast(`+${xp} XP — keep reading!`);
      }
    } catch (e) {
      console.error(e);
      toast.error("Couldn't save your XP.");
    }
  };

  // ── Initial state: prompt to generate ─────────────────────────────────────
  if (!questions) {
    return (
      <div className="washi-card p-5 mt-6">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
            Comprehension quiz
          </p>
        </div>
        <p className="text-sm text-foreground mb-1 serif-jp">理解度チェック</p>
        <p className="text-xs text-muted-foreground mb-4">
          Generate a 3-question quiz about this article. Earn{" "}
          <strong className="text-primary">{XP_PER_CORRECT} XP</strong> per correct answer.
        </p>
        <button
          onClick={generate}
          disabled={loading}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-sm border-2 border-foreground btn-ink text-background text-xs serif-jp font-medium transition-all",
            loading && "opacity-60 cursor-wait",
          )}
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              Start quiz
            </>
          )}
        </button>
      </div>
    );
  }

  // ── Quiz rendered ────────────────────────────────────────────────────────
  const correctCount = questions.reduce(
    (sum, q, i) => sum + (answers[i] === q.correct_index ? 1 : 0),
    0,
  );

  return (
    <div className="washi-card p-5 mt-6 space-y-5" key={articleId}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
            Comprehension quiz
          </p>
        </div>
        {submitted && (
          <div className="flex items-center gap-1.5 text-xs serif-jp text-primary font-medium">
            <Zap className="w-3.5 h-3.5" />+{xpAwarded} XP
          </div>
        )}
      </div>

      {questions.map((q, qi) => {
        const userPick = answers[qi];
        return (
          <div key={qi} className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              <span className="text-muted-foreground mr-2">{qi + 1}.</span>
              {q.question}
            </p>
            <div className="grid grid-cols-1 gap-2">
              {q.options.map((opt, oi) => {
                const isPicked = userPick === oi;
                const isCorrect = q.correct_index === oi;
                return (
                  <button
                    key={oi}
                    disabled={submitted}
                    onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-sm border-2 text-sm transition-all",
                      !submitted &&
                        isPicked &&
                        "border-foreground bg-foreground/5",
                      !submitted &&
                        !isPicked &&
                        "border-border hover:border-foreground/30",
                      submitted && isCorrect && "border-success bg-success/10",
                      submitted &&
                        isPicked &&
                        !isCorrect &&
                        "border-destructive bg-destructive/10",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span>{opt}</span>
                      {submitted && isCorrect && <Check className="w-4 h-4 text-success shrink-0" />}
                      {submitted && isPicked && !isCorrect && (
                        <X className="w-4 h-4 text-destructive shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            {submitted && (
              <p className="text-xs text-muted-foreground italic pt-1">
                {q.explanation}
              </p>
            )}
          </div>
        );
      })}

      {!submitted ? (
        <button
          onClick={submit}
          disabled={!allAnswered}
          className={cn(
            "w-full py-3 rounded-sm border-2 font-bold serif-jp text-sm transition-colors",
            !allAnswered
              ? "border-border text-muted-foreground bg-muted/30 cursor-not-allowed"
              : "btn-ink text-background border-foreground",
          )}
        >
          Check answers
        </button>
      ) : (
        <div className="flex items-center justify-between gap-3 pt-1">
          <p className="text-xs text-muted-foreground">
            {correctCount}/{questions.length} correct
          </p>
          <button
            onClick={generate}
            disabled={loading}
            className="text-xs serif-jp text-primary hover:underline inline-flex items-center gap-1"
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            New quiz
          </button>
        </div>
      )}
    </div>
  );
}
