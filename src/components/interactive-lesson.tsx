import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookmarkPlus, BookmarkCheck, Heart, Zap, Volume2 } from "lucide-react";
import { Header } from "@/components/header";
import { speakJapanese } from "@/lib/japanese-tts";
import { cn } from "@/lib/utils";
import { useFlashcards } from "@/hooks/use-flashcards";
import { usePracticeSession, useStreak, useLessonProgress } from "@/hooks/use-user-data";
import {
  MultipleChoiceCard,
  TypeAnswerCard,
  MatchPairsCard,
  SentenceBuilderCard,
  TranslateComposeCard,
  ReadingComprehensionCard,
} from "@/components/exercise-cards";
import { generateLessonSteps, type LessonStep } from "@/lib/exercise-engine";
import type { LessonData, VocabItem } from "@/components/lesson-page";

interface InteractiveLessonProps {
  lesson: LessonData;
}

export default function InteractiveLesson({ lesson }: InteractiveLessonProps) {
  const navigate = useNavigate();
  const { savedSet, addCard, removeCard, fetchCards } = useFlashcards();
  const { savePractice } = usePracticeSession();
  const { recordStudy } = useStreak();
  const { saveProgress } = useLessonProgress(`lesson_${lesson.number}`);

  const steps = useMemo(
    () => generateLessonSteps(lesson.vocabulary, lesson.grammarPoints, lesson.readingPassages),
    [lesson]
  );

  const [currentStep, setCurrentStep] = useState(0);
  const [xpTotal, setXpTotal] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [exerciseCount, setExerciseCount] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const totalSteps = steps.length;
  const step = steps[currentStep];
  const progress = ((currentStep) / totalSteps) * 100;

  const advanceStep = () => {
    if (currentStep + 1 >= totalSteps) {
      handleFinish();
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleExerciseComplete = (correct: boolean, xp: number) => {
    setExerciseCount((c) => c + 1);
    if (correct) {
      setCorrectCount((c) => c + 1);
      setXpTotal((x) => x + xp);
    } else {
      setHearts((h) => Math.max(0, h - 1));
    }
    if (hearts <= 1 && !correct) {
      handleFinish();
      return;
    }
    advanceStep();
  };

  const handleFinish = async () => {
    setFinished(true);
    const pctScore = exerciseCount > 0 ? Math.round((correctCount / exerciseCount) * 100) : 0;
    await savePractice({
      practiceType: `lesson_${lesson.number}`,
      perfect: correctCount,
      close: 0,
      missed: exerciseCount - correctCount,
      total: exerciseCount,
    });
    await saveProgress({ completed: true, bestScore: pctScore });
    await recordStudy();
  };

  const handleToggleFlashcard = (word: VocabItem) => {
    if (savedSet.has(word.japanese)) {
      removeCard(word.japanese);
    } else {
      addCard({
        japanese: word.japanese,
        reading: word.reading,
        meaning: word.meaning,
        lessonId: lesson.id,
      });
    }
  };

  const kanjiNum = ["一", "二", "三", "四", "五"];

  if (finished) {
    const pct = exerciseCount > 0 ? Math.round((correctCount / exerciseCount) * 100) : 0;
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container max-w-lg px-4 py-12">
          <div className="card-paper border-2 p-8 text-center space-y-4 animate-fade-up">
            <div className="text-6xl mb-2">{pct >= 80 ? "🎌" : pct >= 50 ? "⛩️" : "🌊"}</div>
            <h2 className="text-2xl font-bold serif-jp text-foreground">Lesson Complete</h2>
            <p className="text-4xl font-bold text-primary serif-jp">+{xpTotal} XP</p>
            <div className="flex justify-center gap-6 text-sm">
              <span className="text-success font-medium">✓ {correctCount} correct</span>
              <span className="text-destructive font-medium">✗ {exerciseCount - correctCount} wrong</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {pct === 100
                ? "Perfect — 完璧！"
                : pct >= 80
                  ? "Excellent — 素晴らしい！"
                  : pct >= 50
                    ? "Good effort — もう少し！"
                    : "Keep going — 頑張って！"}
            </p>
            <div className="flex gap-3 justify-center pt-4">
              <button
                onClick={() => navigate("/lessons")}
                className="px-6 py-2.5 rounded-sm border-2 border-border text-sm hover:border-foreground/30 transition-colors"
              >
                Back to Lessons
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 rounded-sm border-2 border-foreground text-sm font-medium hover:bg-foreground hover:text-background transition-colors"
              >
                もう一度 — Retry
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-2xl px-4 py-6">
        {/* Top bar */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate("/lessons")} className="p-2 rounded-sm hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1">
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-1 text-destructive">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart
                key={i}
                className={cn("w-5 h-5 transition-all", i < hearts ? "fill-destructive" : "opacity-20")}
              />
            ))}
          </div>
          <div className="flex items-center gap-1 text-primary font-bold text-sm serif-jp">
            <Zap className="w-4 h-4" />
            {xpTotal}
          </div>
        </div>

        {/* Step content */}
        <div className="animate-fade-up" key={currentStep}>
          {step.type === "vocab_intro" && (
            <VocabIntroView
              words={step.words}
              lessonId={lesson.id}
              savedSet={savedSet}
              onToggle={handleToggleFlashcard}
              onContinue={advanceStep}
            />
          )}

          {step.type === "grammar_intro" && (
            <GrammarIntroView point={step.point} onContinue={advanceStep} />
          )}

          {step.type === "exercise" && (
            <div className="card-paper border-2 p-5 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground serif-jp">
                  Exercise
                </span>
                <span className="text-xs text-primary font-bold">+{step.xpReward} XP</span>
              </div>
              {step.exercise.type === "multiple_choice" && (
                <MultipleChoiceCard
                  exercise={step.exercise}
                  onComplete={(r) => handleExerciseComplete(r.correct, step.xpReward)}
                />
              )}
              {step.exercise.type === "type_answer" && (
                <TypeAnswerCard
                  exercise={step.exercise}
                  onComplete={(r) => handleExerciseComplete(r.correct, step.xpReward)}
                />
              )}
              {step.exercise.type === "match_pairs" && (
                <MatchPairsCard
                  exercise={step.exercise}
                  onComplete={(r) => handleExerciseComplete(r.correct, step.xpReward)}
                />
              )}
              {step.exercise.type === "sentence_builder" && (
                <SentenceBuilderCard
                  exercise={step.exercise}
                  onComplete={(r) => handleExerciseComplete(r.correct, step.xpReward)}
                />
              )}
              {step.exercise.type === "translate_compose" && (
                <TranslateComposeCard
                  exercise={step.exercise}
                  onComplete={(r) => handleExerciseComplete(r.correct, step.xpReward)}
                />
              )}
              {step.exercise.type === "reading_comprehension" && (
                <ReadingComprehensionCard
                  exercise={step.exercise}
                  onComplete={(r) => handleExerciseComplete(r.correct, step.xpReward)}
                />
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ── Vocab Intro (flashcard-style) ──────────────────────────────────────────

function VocabIntroView({
  words,
  lessonId,
  savedSet,
  onToggle,
  onContinue,
}: {
  words: VocabItem[];
  lessonId: string;
  savedSet: Set<string>;
  onToggle: (word: VocabItem) => void;
  onContinue: () => void;
}) {
  const [flippedIdx, setFlippedIdx] = useState<Set<number>>(new Set());

  const toggleFlip = (i: number) => {
    setFlippedIdx((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="card-paper border-2 p-5">
        <h3 className="text-lg font-bold serif-jp text-foreground mb-1">New Words</h3>
        <p className="text-sm text-muted-foreground mb-4">Tap a card to flip. Bookmark words to add them to your flashcard deck.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {words.map((word, i) => {
          const flipped = flippedIdx.has(i);
          const saved = savedSet.has(word.japanese);
          return (
            <div key={i} className="relative">
              <button
                onClick={() => toggleFlip(i)}
                className={cn(
                  "w-full p-5 rounded-sm border-2 text-center transition-all min-h-[100px] flex flex-col items-center justify-center",
                  flipped
                    ? "border-primary/40 bg-primary/5"
                    : "border-border hover:border-foreground/30 bg-card"
                )}
              >
                {!flipped ? (
                  <>
                    <span className="text-2xl japanese-text font-bold text-foreground">{word.japanese}</span>
                    <span className="text-xs text-muted-foreground mt-1">tap to reveal</span>
                  </>
                ) : (
                  <>
                    <span className="text-sm text-muted-foreground mb-1">{word.reading}</span>
                    <span className="text-lg font-bold text-foreground">{word.meaning}</span>
                    <span className="text-xl japanese-text text-primary mt-1">{word.japanese}</span>
                  </>
                )}
              </button>
              {/* Audio button */}
              <button
                onClick={(e) => { e.stopPropagation(); speakJapanese(word.japanese); }}
                className="absolute top-2 left-2 p-1.5 rounded-sm text-muted-foreground/40 hover:text-primary transition-colors"
                title="Listen to pronunciation"
              >
                <Volume2 className="w-4 h-4" />
              </button>
              {/* Bookmark button */}
              <button
                onClick={(e) => { e.stopPropagation(); onToggle(word); }}
                className={cn(
                  "absolute top-2 right-2 p-1.5 rounded-sm transition-colors",
                  saved ? "text-primary" : "text-muted-foreground/40 hover:text-muted-foreground"
                )}
                title={saved ? "Remove from flashcards" : "Add to flashcards"}
              >
                {saved ? <BookmarkCheck className="w-5 h-5" /> : <BookmarkPlus className="w-5 h-5" />}
              </button>
            </div>
          );
        })}
      </div>

      <button
        onClick={onContinue}
        className="w-full py-3 rounded-sm border-2 border-foreground font-bold serif-jp text-sm btn-ink text-background transition-colors"
      >
        Got it — Continue
      </button>
    </div>
  );
}

// ── Grammar Intro ──────────────────────────────────────────────────────────

function GrammarIntroView({
  point,
  onContinue,
}: {
  point: import("@/components/lesson-page").GrammarPoint;
  onContinue: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="card-paper border-2 overflow-hidden">
        <div className="p-5 pb-3 border-b border-border bg-muted/10">
          <span className="text-xs font-bold uppercase tracking-widest text-primary serif-jp">Grammar</span>
          <h3 className="text-xl font-bold japanese-text text-foreground mt-1">{point.title}</h3>
          <code className="text-xs text-primary font-mono">{point.rule}</code>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm text-foreground leading-relaxed">{point.explanation}</p>
          <div className="bg-primary/5 border border-primary/25 rounded-sm p-3 flex gap-2.5 items-start">
            <span className="text-primary text-base flex-shrink-0 serif-jp">✦</span>
            <p className="text-sm text-foreground leading-relaxed">
              <strong className="text-primary serif-jp">Tip: </strong>{point.tip}
            </p>
          </div>
          <div className="space-y-3">
            {point.examples.map((ex, j) => (
              <div key={j} className="bg-muted/30 rounded-sm p-3 border border-border">
                <p className="text-lg japanese-text text-foreground">{ex.jp}</p>
                <p className="text-sm text-muted-foreground mt-1">{ex.en}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <button
        onClick={onContinue}
        className="w-full py-3 rounded-sm border-2 border-foreground font-bold serif-jp text-sm btn-ink text-background transition-colors"
      >
        Got it — Continue
      </button>
    </div>
  );
}
