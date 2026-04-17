import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Loader2, Check, X as XIcon, RotateCcw } from "lucide-react";
import { Header } from "@/components/header";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { NhkNewsReader } from "@/components/nhk-news-reader";

type Level = "N5" | "N4" | "N3" | "N2" | "N1";
type Mode = "mixed" | "vocab" | "grammar" | "reading" | "news";

interface Question {
  id?: string;
  level: Level;
  section: "vocab" | "grammar" | "reading";
  question_jp: string;
  passage_jp: string | null;
  options: string[];
  correct_index: number;
  explanation: string;
}

const LEVELS: { id: Level; jp: string; subtitle: string }[] = [
  { id: "N5", jp: "五級", subtitle: "Beginner" },
  { id: "N4", jp: "四級", subtitle: "Upper Beginner" },
  { id: "N3", jp: "三級", subtitle: "Intermediate" },
  { id: "N2", jp: "二級", subtitle: "Upper Intermediate" },
  { id: "N1", jp: "一級", subtitle: "Advanced" },
];

const MODES: { id: Mode; jp: string; label: string; desc: string }[] = [
  { id: "mixed", jp: "総合", label: "Mock Test", desc: "Mixed vocab, grammar & reading" },
  { id: "vocab", jp: "語彙", label: "Vocabulary", desc: "Fill the blank — word choice" },
  { id: "grammar", jp: "文法", label: "Grammar", desc: "Particles, conjugations, expressions" },
  { id: "reading", jp: "読解", label: "Reading", desc: "Short passages with comprehension" },
  { id: "news", jp: "ニュース", label: "NHK News", desc: "Real news matched to your level" },
];

const SECTION_LABEL: Record<Question["section"], string> = {
  vocab: "Vocab",
  grammar: "Grammar",
  reading: "Reading",
};

type Phase = "select" | "loading" | "quiz" | "results" | "news";

export default function JlptPractice() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [phase, setPhase] = useState<Phase>("select");
  const [level, setLevel] = useState<Level>("N5");
  const [mode, setMode] = useState<Mode>("mixed");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<{ correct: boolean; selected: number }[]>([]);
  const [quizStartedAt, setQuizStartedAt] = useState<number | null>(null);

  const SPEEDRUN_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes for full 15-question 100% perfect run

  // Deep-link support: ?level=N5&mode=news jumps straight into the NHK reader
  useEffect(() => {
    const lvl = searchParams.get("level");
    const md = searchParams.get("mode");
    if (lvl && ["N5", "N4", "N3", "N2", "N1"].includes(lvl)) {
      setLevel(lvl as Level);
    }
    if (md && ["mixed", "vocab", "grammar", "reading", "news"].includes(md)) {
      setMode(md as Mode);
      if (md === "news") setPhase("news");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startSession = async () => {
    if (mode === "news") {
      setPhase("news");
      return;
    }
    setPhase("loading");
    try {
      const { data, error } = await supabase.functions.invoke(
        "generate-jlpt-questions",
        { body: { level, mode, count: 15 } },
      );
      if (error) {
        const status = (error as any)?.context?.status;
        if (status === 429) {
          toast.error("Rate limit reached. Please try again in a moment.");
        } else if (status === 402) {
          toast.error("AI credits exhausted. Please add credits.");
        } else {
          toast.error("Failed to load questions.");
        }
        setPhase("select");
        return;
      }
      const qs = (data?.questions ?? []) as Question[];
      if (qs.length === 0) {
        toast.error("No questions available. Try again.");
        setPhase("select");
        return;
      }
      setQuestions(qs);
      setCurrentIdx(0);
      setSelectedIdx(null);
      setRevealed(false);
      setAnswers([]);
      setQuizStartedAt(Date.now());
      setPhase("quiz");
    } catch (e) {
      console.error(e);
      toast.error("Something went wrong starting the session.");
      setPhase("select");
    }
  };

  const submitAnswer = () => {
    if (selectedIdx === null || revealed) return;
    const q = questions[currentIdx];
    const isCorrect = selectedIdx === q.correct_index;
    setAnswers((prev) => [...prev, { correct: isCorrect, selected: selectedIdx }]);
    setRevealed(true);
  };

  const nextQuestion = async () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((i) => i + 1);
      setSelectedIdx(null);
      setRevealed(false);
    } else {
      // Finish
      const correctCount = answers.filter((a) => a.correct).length;
      const xpEarned = correctCount * 5;
      const pct = Math.round((correctCount / questions.length) * 100);
      const elapsedMs = quizStartedAt ? Date.now() - quizStartedAt : Number.MAX_SAFE_INTEGER;
      const isSpeedrun =
        pct === 100 &&
        questions.length >= 15 &&
        mode === "mixed" &&
        elapsedMs < SPEEDRUN_THRESHOLD_MS;

      if (user) {
        await supabase.from("jlpt_sessions").insert({
          user_id: user.id,
          level,
          mode,
          total_questions: questions.length,
          correct_count: correctCount,
          xp_earned: xpEarned,
        });

        // Bestiary tiers:
        //  1 = pass (≥80%) — uncommon
        //  2 = perfect (100%) — mythic
        //  3 = speedrun (100% + <5min on a full 15Q mock test) — legendary
        const tiersToAward: number[] = [];
        if (pct >= 80) tiersToAward.push(1);
        if (pct === 100) tiersToAward.push(2);
        if (isSpeedrun) tiersToAward.push(3);

        for (const t of tiersToAward) {
          supabase.functions
            .invoke("generate-badge", {
              body: {
                user_id: user.id,
                trigger_type: "jlpt_pass",
                trigger_detail: level,
                tier: t,
                jlpt_level: level,
                jlpt_score_pct: pct,
                jlpt_mode: mode,
                jlpt_elapsed_ms: elapsedMs,
              },
            })
            .then(({ data, error }) => {
              if (error) {
                console.error("Bestiary badge failed:", error);
                return;
              }
              if (data?.badge?.title) {
                const prefix =
                  t === 3
                    ? "⚡ SPEEDRUN: "
                    : t === 2
                      ? "✨ MYTHIC: "
                      : "🎌 New Bestiary spirit: ";
                toast.success(`${prefix}${data.badge.title}`, {
                  description: data.badge.description,
                  duration: t >= 2 ? 10000 : 7000,
                });
              }
            })
            .catch((e) => console.error("Bestiary badge error:", e));
        }
      }
      setPhase("results");
    }
  };

  const restart = () => {
    setPhase("select");
    setQuestions([]);
    setAnswers([]);
    setCurrentIdx(0);
    setSelectedIdx(null);
    setRevealed(false);
  };

  // ====== RENDER ======

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-2xl px-4 py-8 md:py-10 pb-24">
        {/* Back */}
        <button
          onClick={() => (phase === "quiz" || phase === "news" ? restart() : navigate("/practice"))}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="serif-jp">
            {phase === "quiz" ? "Abandon session" : phase === "news" ? "Back to selection" : "Back to Practice"}
          </span>
        </button>

        {/* Cinematic title block */}
        {phase === "select" && (
          <>
            <div className="text-center mb-10 md:mb-14">
              <p className="text-[10px] uppercase tracking-[0.5em] text-muted-foreground mb-4">
                JLPT Practice
              </p>
              <h1 className="serif-jp font-medium text-foreground text-5xl md:text-7xl tracking-[0.08em] leading-none">
                日本語能力試験
              </h1>
              <div className="mt-6 mx-auto h-px w-32 bg-foreground/40" />
              <p className="text-sm text-foreground/60 mt-5 max-w-md mx-auto italic tracking-wide">
                Test your skill against authentic JLPT-style questions.
              </p>
            </div>

            {/* Level select */}
            <div className="mb-8">
              <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground mb-3">
                Choose Level
              </p>
              <div className="grid grid-cols-5 gap-2">
                {LEVELS.map((lv) => {
                  const active = level === lv.id;
                  return (
                    <button
                      key={lv.id}
                      onClick={() => setLevel(lv.id)}
                      className={cn(
                        "washi-card relative py-4 px-2 text-center transition-all",
                        active && "ring-1 ring-foreground/60 translate-y-[-2px]",
                      )}
                    >
                      <p className="serif-jp text-foreground text-lg font-medium">
                        {lv.id}
                      </p>
                      <p className="serif-jp text-muted-foreground text-[10px] mt-1">
                        {lv.jp}
                      </p>
                      {active && (
                        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-4 h-4 rounded-[1px] serif-jp text-[8px] bg-primary text-primary-foreground">
                          選
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="text-center text-xs text-muted-foreground mt-3 italic">
                {LEVELS.find((l) => l.id === level)?.subtitle}
              </p>
            </div>

            {/* Mode select */}
            <div className="mb-10">
              <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground mb-3">
                Choose Mode
              </p>
              <div className="grid grid-cols-2 gap-3">
                {MODES.map((m) => {
                  const active = mode === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setMode(m.id)}
                      className={cn(
                        "washi-card text-left p-4 transition-all",
                        active && "ring-1 ring-foreground/60 translate-y-[-2px]",
                      )}
                    >
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="serif-jp text-foreground text-base font-medium">
                          {m.label}
                        </span>
                        <span className="serif-jp text-muted-foreground text-xs">
                          {m.jp}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-snug">
                        {m.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Start */}
            <button
              onClick={startSession}
              className="btn-vermillion w-full py-4 text-sm tracking-[0.3em]"
            >
              {mode === "news" ? "Read News · 読む" : "Begin · 始める"}
            </button>
            <p className="text-center text-[10px] text-muted-foreground mt-3 tracking-wide">
              {mode === "news"
                ? "Real NHK articles, matched to your level"
                : "15 questions · earn 5 XP per correct answer"}
            </p>
          </>
        )}

        {phase === "loading" && (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-8 h-8 text-foreground animate-spin mb-6" />
            <p className="serif-jp text-foreground text-lg">準備中…</p>
            <p className="text-sm text-muted-foreground mt-2 italic">
              The examiner is preparing your scroll.
            </p>
          </div>
        )}

        {phase === "quiz" && questions.length > 0 && (
          <QuizView
            question={questions[currentIdx]}
            index={currentIdx}
            total={questions.length}
            level={level}
            mode={mode}
            startedAt={quizStartedAt}
            speedrunThresholdMs={SPEEDRUN_THRESHOLD_MS}
            selectedIdx={selectedIdx}
            revealed={revealed}
            onSelect={(i) => !revealed && setSelectedIdx(i)}
            onSubmit={submitAnswer}
            onNext={nextQuestion}
          />
        )}

        {phase === "results" && (
          <ResultsView
            answers={answers}
            total={questions.length}
            level={level}
            mode={mode}
            onRestart={restart}
          />
        )}

        {phase === "news" && <NhkNewsReader level={level} />}
      </main>
    </div>
  );
}

// ============= QUIZ VIEW =============

interface QuizViewProps {
  question: Question;
  index: number;
  total: number;
  level: Level;
  selectedIdx: number | null;
  revealed: boolean;
  onSelect: (i: number) => void;
  onSubmit: () => void;
  onNext: () => void;
}

function QuizView({
  question,
  index,
  total,
  level,
  selectedIdx,
  revealed,
  onSelect,
  onSubmit,
  onNext,
}: QuizViewProps) {
  return (
    <div>
      {/* Progress + meta */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
          {level} · {SECTION_LABEL[question.section]}
        </p>
        <p className="serif-jp text-sm text-foreground">
          {index + 1}
          <span className="text-muted-foreground">／{total}</span>
        </p>
      </div>
      <div className="h-px bg-foreground/15 relative overflow-hidden mb-8">
        <div
          className="absolute inset-y-0 left-0 bg-foreground transition-all duration-500"
          style={{ width: `${((index + (revealed ? 1 : 0)) / total) * 100}%` }}
        />
      </div>

      {/* Question card */}
      <div className="washi-card p-6 md:p-8 mb-6">
        {question.passage_jp && (
          <div className="mb-5 pb-5 border-b border-border">
            <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground mb-2">
              Passage · 文章
            </p>
            <p className="japanese-text text-foreground text-base leading-loose">
              {question.passage_jp}
            </p>
          </div>
        )}
        <p className="japanese-text text-foreground text-lg md:text-xl leading-loose">
          {question.question_jp}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {question.options.map((opt, i) => {
          const isSelected = selectedIdx === i;
          const isCorrect = revealed && i === question.correct_index;
          const isWrongPick = revealed && isSelected && i !== question.correct_index;
          return (
            <button
              key={i}
              onClick={() => onSelect(i)}
              disabled={revealed}
              className={cn(
                "w-full washi-card text-left p-4 transition-all flex items-center gap-3",
                !revealed && isSelected && "ring-1 ring-foreground/60 translate-y-[-1px]",
                isCorrect && "ring-1 ring-success bg-success/5",
                isWrongPick && "ring-1 ring-destructive bg-destructive/5",
                !revealed && "hover:translate-y-[-1px]",
              )}
            >
              <span
                className={cn(
                  "flex items-center justify-center w-7 h-7 rounded-[2px] serif-jp text-xs shrink-0",
                  isCorrect && "bg-success text-success-foreground",
                  isWrongPick && "bg-destructive text-destructive-foreground",
                  !revealed && isSelected && "bg-foreground text-background",
                  !revealed && !isSelected && "bg-foreground/10 text-foreground",
                )}
              >
                {isCorrect ? <Check className="w-3.5 h-3.5" /> : isWrongPick ? <XIcon className="w-3.5 h-3.5" /> : String.fromCharCode(65 + i)}
              </span>
              <span className="japanese-text text-foreground text-base flex-1">
                {opt}
              </span>
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {revealed && (
        <div className="washi-card p-5 mb-6 animate-fade-up">
          <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground mb-2">
            Explanation · 解説
          </p>
          <p className="text-sm text-foreground leading-relaxed italic">
            {question.explanation}
          </p>
        </div>
      )}

      {/* CTA */}
      {!revealed ? (
        <button
          onClick={onSubmit}
          disabled={selectedIdx === null}
          className={cn(
            "btn-vermillion w-full py-4 text-sm tracking-[0.3em]",
            selectedIdx === null && "opacity-40 cursor-not-allowed",
          )}
        >
          Submit · 答える
        </button>
      ) : (
        <button
          onClick={onNext}
          className="btn-vermillion w-full py-4 text-sm tracking-[0.3em] flex items-center justify-center gap-2"
        >
          {index + 1 < total ? "Next · 次へ" : "See Results · 結果"}
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// ============= RESULTS VIEW =============

interface ResultsViewProps {
  answers: { correct: boolean; selected: number }[];
  total: number;
  level: Level;
  mode: Mode;
  onRestart: () => void;
}

function ResultsView({ answers, total, level, mode, onRestart }: ResultsViewProps) {
  const navigate = useNavigate();
  const correctCount = answers.filter((a) => a.correct).length;
  const pct = Math.round((correctCount / total) * 100);
  const xp = correctCount * 5;

  let verdict: { jp: string; en: string };
  if (pct >= 80) verdict = { jp: "合格", en: "Pass — exam-ready precision." };
  else if (pct >= 60) verdict = { jp: "良好", en: "Good — keep refining." };
  else if (pct >= 40) verdict = { jp: "修行", en: "Train more before the exam." };
  else verdict = { jp: "再挑戦", en: "Begin again, with patience." };

  return (
    <div className="text-center animate-fade-up">
      <p className="text-[10px] uppercase tracking-[0.5em] text-muted-foreground mb-4">
        {level} · {MODES.find((m) => m.id === mode)?.label} Result
      </p>
      <h1 className="serif-jp font-medium text-foreground text-6xl md:text-7xl tracking-[0.08em] leading-none">
        {verdict.jp}
      </h1>
      <div className="mt-6 mx-auto h-px w-24 bg-foreground/40" />
      <p className="text-sm text-foreground/60 mt-5 italic tracking-wide">
        {verdict.en}
      </p>

      {/* Score block */}
      <div className="washi-card p-8 my-10 flex items-center justify-around">
        <div>
          <p className="serif-jp text-foreground text-5xl font-medium">{correctCount}<span className="text-muted-foreground text-2xl">／{total}</span></p>
          <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground mt-2">Correct</p>
        </div>
        <div className="w-px self-stretch bg-foreground/15" />
        <div>
          <p className="serif-jp text-foreground text-5xl font-medium">{pct}<span className="text-muted-foreground text-2xl">%</span></p>
          <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground mt-2">Score</p>
        </div>
        <div className="w-px self-stretch bg-foreground/15" />
        <div>
          <p className="serif-jp text-primary text-5xl font-medium">+{xp}</p>
          <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground mt-2">XP</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onRestart}
          className="washi-card py-4 flex items-center justify-center gap-2 text-sm serif-jp text-foreground hover:translate-y-[-1px] transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          Try Again
        </button>
        <button
          onClick={() => navigate("/practice")}
          className="btn-vermillion py-4 text-sm tracking-[0.3em]"
        >
          Done · 終
        </button>
      </div>
    </div>
  );
}
