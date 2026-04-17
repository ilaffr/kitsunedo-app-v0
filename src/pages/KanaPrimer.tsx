import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Volume2, Check, X, ChevronRight, Sparkles } from "lucide-react";
import { Header } from "@/components/header";
import { cn } from "@/lib/utils";
import { speakJapanese } from "@/lib/japanese-tts";
import { useLessonProgress, useStreak } from "@/hooks/use-user-data";
import { useAuth } from "@/context/AuthContext";
import {
  kanaRows,
  kanaQuizQuestions,
  KANA_PASS_THRESHOLD,
  KANA_PRIMER_LESSON_ID,
  type KanaQuizQuestion,
} from "@/data/kana-data";

type Phase = "intro" | "hiragana" | "katakana" | "quiz" | "result";

export default function KanaPrimer() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isGuest = !user;
  const { saveProgress, progress } = useLessonProgress(KANA_PRIMER_LESSON_ID);
  const { recordStudy } = useStreak();
  const [phase, setPhase] = useState<Phase>("intro");
  const [quizIdx, setQuizIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const totalQ = kanaQuizQuestions.length;
  const currentQ = kanaQuizQuestions[quizIdx];

  const correctCount = useMemo(
    () => answers.reduce((acc, a, i) => acc + (a === kanaQuizQuestions[i].correctIndex ? 1 : 0), 0),
    [answers],
  );
  const pct = answers.length > 0 ? Math.round((correctCount / answers.length) * 100) : 0;
  const passed = pct >= KANA_PASS_THRESHOLD;

  const handlePick = (i: number) => {
    if (revealed) return;
    setPicked(i);
    setRevealed(true);
    setAnswers((prev) => [...prev, i]);
  };

  const handleNext = async () => {
    setPicked(null);
    setRevealed(false);
    if (quizIdx + 1 >= totalQ) {
      // Finished — compute and save (only if signed in)
      const finalCorrect =
        [...answers].reduce(
          (acc, a, i) => acc + (a === kanaQuizQuestions[i].correctIndex ? 1 : 0),
          0,
        );
      const finalPct = Math.round((finalCorrect / totalQ) * 100);
      const didPass = finalPct >= KANA_PASS_THRESHOLD;
      if (!isGuest) {
        // Save best score; mark completed only if passed (so Lesson 1 unlocks)
        await saveProgress({
          completed: didPass,
          bestScore: Math.max(progress?.bestScore ?? 0, finalPct),
        });
        if (didPass) await recordStudy();
      }
      setPhase("result");
    } else {
      setQuizIdx((i) => i + 1);
    }
  };

  const restartQuiz = () => {
    setQuizIdx(0);
    setAnswers([]);
    setPicked(null);
    setRevealed(false);
    setPhase("quiz");
  };

  const handleSkip = async () => {
    if (isGuest) {
      navigate("/auth");
      return;
    }
    // Skipping does NOT unlock Lesson 1 — but record they've seen the primer.
    await saveProgress({ completed: false, bestScore: progress?.bestScore ?? 0 });
    navigate("/lessons");
  };

  const backHref = isGuest ? "/auth" : "/lessons";
  const backLabel = isGuest ? "戻る — Back to sign in" : "道場へ戻る";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-3xl px-4 py-6 pb-24">
        <button
          onClick={() => navigate(backHref)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="serif-jp">{backLabel}</span>
        </button>

        {isGuest && <GuestPreviewBanner />}

        <div className="mb-6">
          <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground mb-2">
            Prerequisite · 入門前
          </p>
          <div className="flex items-baseline gap-4 flex-wrap">
            <h1 className="text-3xl md:text-4xl serif-jp font-medium text-foreground tracking-wide">
              かな入門
            </h1>
            <span className="text-base md:text-lg serif-jp text-muted-foreground tracking-wide">
              Hiragana &amp; Katakana primer
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-3 italic max-w-2xl">
            Before Lesson 1, get comfortable reading Japan's two phonetic alphabets. You can skip
            this — but to unlock Lesson 1 you need to pass a short {KANA_PASS_THRESHOLD}% knowledge
            check.
          </p>
          <div className="mt-4 h-px w-20 bg-foreground/40" />
        </div>

        {/* Phase nav chips */}
        <div className="flex gap-1 mb-6 border-b border-foreground/10 overflow-x-auto">
          {(
            [
              { key: "intro", label: "Overview", jp: "概要" },
              { key: "hiragana", label: "Hiragana", jp: "ひらがな" },
              { key: "katakana", label: "Katakana", jp: "カタカナ" },
              { key: "quiz", label: "Knowledge check", jp: "テスト" },
            ] as { key: Phase; label: string; jp: string }[]
          ).map((p) => (
            <button
              key={p.key}
              onClick={() => setPhase(p.key)}
              className={cn(
                "px-3 md:px-4 py-3 text-[11px] uppercase tracking-[0.22em] transition-colors border-b-2 -mb-px whitespace-nowrap flex items-center gap-2",
                phase === p.key || (phase === "result" && p.key === "quiz")
                  ? "text-foreground border-foreground"
                  : "text-muted-foreground border-transparent hover:text-foreground",
              )}
            >
              <span className="hidden sm:inline">{p.label}</span>
              <span className="japanese-text text-xs">{p.jp}</span>
            </button>
          ))}
        </div>

        {phase === "intro" && (
          <IntroView
            onStart={() => setPhase("hiragana")}
            onSkip={handleSkip}
            onJumpQuiz={() => setPhase("quiz")}
            primerCleared={progress?.completed ?? false}
            bestScore={progress?.bestScore ?? null}
          />
        )}

        {phase === "hiragana" && (
          <KanaTable script="hiragana" onContinue={() => setPhase("katakana")} />
        )}

        {phase === "katakana" && (
          <KanaTable script="katakana" onContinue={() => setPhase("quiz")} />
        )}

        {phase === "quiz" && (
          <QuizView
            qIdx={quizIdx}
            total={totalQ}
            question={currentQ}
            picked={picked}
            revealed={revealed}
            onPick={handlePick}
            onNext={handleNext}
          />
        )}

        {phase === "result" && (
          <ResultView
            pct={pct}
            correct={correctCount}
            total={totalQ}
            passed={passed}
            isGuest={isGuest}
            onRetry={restartQuiz}
            onContinue={() => navigate(isGuest ? "/auth" : "/lesson/1")}
            onBack={() => navigate(isGuest ? "/auth" : "/lessons")}
          />
        )}
      </main>
    </div>
  );
}

// ── Intro ──────────────────────────────────────────────────────────────────

function IntroView({
  onStart,
  onSkip,
  onJumpQuiz,
  primerCleared,
  bestScore,
}: {
  onStart: () => void;
  onSkip: () => void;
  onJumpQuiz: () => void;
  primerCleared: boolean;
  bestScore: number | null;
}) {
  return (
    <div className="space-y-4">
      <div className="card-paper border-2 p-6">
        <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2 serif-jp">
          What you'll learn
        </p>
        <h2 className="text-xl serif-jp text-foreground mb-3">The two Japanese syllabaries</h2>
        <p className="text-sm text-foreground leading-relaxed">
          <strong>Hiragana</strong> (ひらがな) is the curvy script used for native Japanese words
          and grammar particles. <strong>Katakana</strong> (カタカナ) is its angular sibling, used
          for foreign loanwords, names, and emphasis. Every kana represents a single syllable —
          learn them and you can read out any Japanese sound.
        </p>
      </div>

      <div className="card-paper border-2 p-5 bg-muted/10">
        <h3 className="text-sm font-bold serif-jp text-foreground mb-3">How this primer works</h3>
        <ol className="space-y-2 text-sm text-foreground">
          <li className="flex gap-2">
            <span className="text-primary serif-jp">①</span> Browse the hiragana chart with
            mnemonics and audio.
          </li>
          <li className="flex gap-2">
            <span className="text-primary serif-jp">②</span> Browse the katakana chart side-by-side
            with hiragana.
          </li>
          <li className="flex gap-2">
            <span className="text-primary serif-jp">③</span> Take the knowledge check —
            <strong> {KANA_PASS_THRESHOLD}% to pass</strong> and unlock Lesson 1.
          </li>
        </ol>
        <p className="text-xs text-muted-foreground mt-3 italic">
          Already comfortable? Skip straight to the knowledge check below — you only need to pass
          it once.
        </p>
      </div>

      {primerCleared && (
        <div className="card-paper border-2 border-success/40 p-4 bg-success/5 flex items-center gap-3">
          <Check className="w-5 h-5 text-success" strokeWidth={3} />
          <div className="flex-1 text-sm text-foreground">
            You've already passed this primer
            {bestScore != null && ` with a best score of ${bestScore}%`}. Lesson 1 is unlocked.
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        <button
          onClick={onStart}
          className="w-full py-3 rounded-sm border-2 border-foreground font-bold serif-jp text-sm btn-ink text-background transition-colors flex items-center justify-center gap-2"
        >
          始めましょう — Start with Hiragana
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={onJumpQuiz}
          className="w-full py-3 rounded-sm border-2 border-border text-foreground text-sm hover:border-foreground/50 transition-colors"
        >
          I know kana — go straight to the quiz
        </button>
      </div>

      <button
        onClick={onSkip}
        className="w-full py-2 text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
      >
        Skip the primer for now (Lesson 1 will stay locked until you pass the quiz)
      </button>
    </div>
  );
}

// ── Kana Table ─────────────────────────────────────────────────────────────

function KanaTable({
  script,
  onContinue,
}: {
  script: "hiragana" | "katakana";
  onContinue: () => void;
}) {
  const [openIdx, setOpenIdx] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="card-paper border-2 p-5">
        <h3 className="text-lg font-bold serif-jp text-foreground mb-1">
          {script === "hiragana" ? "ひらがな — Hiragana" : "カタカナ — Katakana"}
        </h3>
        <p className="text-sm text-muted-foreground">
          Tap a character to hear it and reveal a memory hook. The matching {script === "hiragana" ? "katakana" : "hiragana"} is shown in grey.
        </p>
      </div>

      {kanaRows.map((row) => (
        <div key={row.label} className="card-paper border-2 p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3 serif-jp">
            {row.label}
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {row.chars.map((c) => {
              const key = `${row.label}-${c.romaji}`;
              const open = openIdx === key;
              const main = script === "hiragana" ? c.hira : c.kata;
              const partner = script === "hiragana" ? c.kata : c.hira;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setOpenIdx(open ? null : key);
                    speakJapanese(main);
                  }}
                  className={cn(
                    "p-3 rounded-sm border-2 text-center transition-all",
                    open
                      ? "border-primary/50 bg-primary/5"
                      : "border-border hover:border-foreground/30 bg-card",
                  )}
                >
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-3xl japanese-text font-medium text-foreground">{main}</span>
                    <span className="text-base japanese-text text-muted-foreground/60">{partner}</span>
                  </div>
                  <p className="text-xs text-primary serif-jp mt-1">{c.romaji}</p>
                </button>
              );
            })}
          </div>
          {/* Mnemonic for the currently open char in this row */}
          {row.chars.map((c) => {
            const key = `${row.label}-${c.romaji}`;
            if (openIdx !== key) return null;
            return (
              <div
                key={`mn-${key}`}
                className="mt-3 bg-primary/5 border border-primary/25 rounded-sm p-3 flex items-start gap-2"
              >
                <Volume2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-foreground leading-relaxed">
                  <strong className="text-primary">{c.romaji}</strong> — {c.mnemonic}
                </p>
              </div>
            );
          })}
        </div>
      ))}

      <button
        onClick={onContinue}
        className="w-full py-3 rounded-sm border-2 border-foreground font-bold serif-jp text-sm btn-ink text-background transition-colors"
      >
        {script === "hiragana" ? "Continue → Katakana" : "Continue → Knowledge Check"}
      </button>
    </div>
  );
}

// ── Quiz ───────────────────────────────────────────────────────────────────

function QuizView({
  qIdx,
  total,
  question,
  picked,
  revealed,
  onPick,
  onNext,
}: {
  qIdx: number;
  total: number;
  question: KanaQuizQuestion;
  picked: number | null;
  revealed: boolean;
  onPick: (i: number) => void;
  onNext: () => void;
}) {
  const isCorrect = picked === question.correctIndex;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 rounded-full"
              style={{ width: `${(qIdx / total) * 100}%` }}
            />
          </div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
            Question {qIdx + 1} / {total}
          </p>
        </div>
      </div>

      <div className="card-paper border-2 p-6 md:p-8 text-center">
        <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-3 serif-jp">
          Read this {question.script}
        </p>
        <p className="text-7xl md:text-8xl japanese-text text-foreground my-4">{question.prompt}</p>
        <div className="grid grid-cols-2 gap-2 mt-6">
          {question.options.map((opt, i) => {
            const isPicked = picked === i;
            const showCorrect = revealed && i === question.correctIndex;
            const showWrong = revealed && isPicked && i !== question.correctIndex;
            return (
              <button
                key={i}
                onClick={() => onPick(i)}
                disabled={revealed}
                className={cn(
                  "py-3 px-4 rounded-sm border-2 text-base font-medium transition-colors",
                  !revealed && "border-border hover:border-foreground/40 bg-card",
                  showCorrect && "border-success bg-success/10 text-foreground",
                  showWrong && "border-destructive bg-destructive/10 text-foreground",
                  revealed && !showCorrect && !showWrong && "border-border opacity-50",
                )}
              >
                <span className="flex items-center justify-center gap-2">
                  {opt}
                  {showCorrect && <Check className="w-4 h-4 text-success" />}
                  {showWrong && <X className="w-4 h-4 text-destructive" />}
                </span>
              </button>
            );
          })}
        </div>

        {revealed && (
          <button
            onClick={onNext}
            className="mt-6 px-8 py-2.5 rounded-sm border-2 border-foreground text-sm font-medium hover:bg-foreground hover:text-background transition-colors"
          >
            {qIdx + 1 >= total
              ? isCorrect
                ? "Finish — see result"
                : "Finish — see result"
              : isCorrect
                ? "正解！ Next →"
                : "Next →"}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Result ─────────────────────────────────────────────────────────────────

function ResultView({
  pct,
  correct,
  total,
  passed,
  isGuest,
  onRetry,
  onContinue,
  onBack,
}: {
  pct: number;
  correct: number;
  total: number;
  passed: boolean;
  isGuest: boolean;
  onRetry: () => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  return (
    <div className="card-paper border-2 p-8 text-center space-y-4">
      <div className="text-6xl mb-2">{passed ? "🎌" : "🌊"}</div>
      <h2 className="text-2xl font-bold serif-jp text-foreground">
        {passed ? "合格！ Passed" : "もう少し — Almost"}
      </h2>
      <p className="text-4xl font-bold text-primary serif-jp">{pct}%</p>
      <div className="flex justify-center gap-6 text-sm">
        <span className="text-success font-medium">✓ {correct} correct</span>
        <span className="text-destructive font-medium">✗ {total - correct} wrong</span>
      </div>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
        {isGuest
          ? passed
            ? `Brilliant — you'd unlock Lesson 1 at this score. Sign up free to save your progress and continue the path.`
            : `So close. Sign up free to save your attempts, retake the quiz, and unlock Lesson 1 once you pass ${KANA_PASS_THRESHOLD}%.`
          : passed
            ? `You scored above the ${KANA_PASS_THRESHOLD}% threshold — Lesson 1 is now unlocked.`
            : `You need at least ${KANA_PASS_THRESHOLD}% to unlock Lesson 1. Review the charts and try again — you've got this.`}
      </p>
      <div className="flex gap-3 justify-center pt-4 flex-wrap">
        <button
          onClick={onBack}
          className="px-6 py-2.5 rounded-sm border-2 border-border text-sm hover:border-foreground/30 transition-colors"
        >
          {isGuest ? "Back to sign in" : "Back to Lessons"}
        </button>
        <button
          onClick={onRetry}
          className="px-6 py-2.5 rounded-sm border-2 border-border text-sm hover:border-foreground/30 transition-colors"
        >
          もう一度 — Retry quiz
        </button>
        {isGuest ? (
          <button
            onClick={onContinue}
            className="px-6 py-2.5 rounded-sm border-2 border-foreground text-sm font-medium btn-ink text-background transition-colors"
          >
            Sign up to continue →
          </button>
        ) : (
          passed && (
            <button
              onClick={onContinue}
              className="px-6 py-2.5 rounded-sm border-2 border-foreground text-sm font-medium btn-ink text-background transition-colors"
            >
              Start Lesson 1 →
            </button>
          )
        )}
      </div>
    </div>
  );
}

// ── Guest Banner ──────────────────────────────────────────────────────────

function GuestPreviewBanner() {
  return (
    <div className="card-paper border-2 border-primary/40 bg-primary/5 p-4 mb-6 flex items-start gap-3">
      <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
      <div className="flex-1 text-sm text-foreground">
        <p className="font-medium serif-jp mb-1">You're trying Kitsune-dō as a guest</p>
        <p className="text-muted-foreground text-xs leading-relaxed">
          Browse the kana charts and take the knowledge check freely. To save your progress,
          unlock Lesson 1, and start the full 50-lesson journey,{" "}
          <Link
            to="/auth"
            className="text-primary underline underline-offset-4 font-medium hover:no-underline"
          >
            create a free account
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
