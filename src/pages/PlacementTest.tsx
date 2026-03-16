import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Volume2, BookOpen, MessageSquare, Eye, Headphones, ChevronRight } from "lucide-react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { speakJapanese } from "@/lib/japanese-tts";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  placementQuestions,
  determinePlacementLevel,
  type PlacementQuestion,
  type PlacementResult,
} from "@/data/placement-test-data";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Phase = "intro" | "test" | "results";

const categoryIcons = {
  vocab: BookOpen,
  grammar: MessageSquare,
  reading: Eye,
  listening: Headphones,
};

const categoryLabels = {
  vocab: "Vocabulary",
  grammar: "Grammar",
  reading: "Reading",
  listening: "Listening",
};

export default function PlacementTest() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>("intro");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [scores, setScores] = useState({ vocab: 0, grammar: 0, reading: 0, listening: 0 });
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [highestCorrectLesson, setHighestCorrectLesson] = useState(0);
  const [result, setResult] = useState<PlacementResult | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [saving, setSaving] = useState(false);

  // Shuffle questions once
  const questions = useMemo(() => shuffle([...placementQuestions]), []);
  const totalQuestions = questions.length;
  const question = questions[currentIdx] as PlacementQuestion | undefined;
  const progress = ((currentIdx) / totalQuestions) * 100;

  // Auto-play TTS for listening questions
  useEffect(() => {
    if (phase === "test" && question?.category === "listening" && question.promptJp && !submitted) {
      const timer = setTimeout(() => speakJapanese(question.promptJp!, 0.8), 300);
      return () => clearTimeout(timer);
    }
  }, [phase, currentIdx, question, submitted]);

  const handleSubmit = useCallback(() => {
    if (selectedOption === null || !question) return;
    setSubmitted(true);

    const correct = selectedOption === question.correctIndex;
    if (correct) {
      setTotalCorrect((c) => c + 1);
      setScores((s) => ({ ...s, [question.category]: s[question.category] + 1 }));
      setHighestCorrectLesson((h) => Math.max(h, question.coversUpToLesson));
    }
  }, [selectedOption, question]);

  const handleNext = useCallback(() => {
    setSelectedOption(null);
    setSubmitted(false);
    setShowTranslation(false);

    if (currentIdx + 1 >= totalQuestions) {
      // Calculate results
      const finalCorrect = totalCorrect;
      const res = determinePlacementLevel(finalCorrect, totalQuestions, highestCorrectLesson);
      setResult(res);
      setPhase("results");
    } else {
      setCurrentIdx((i) => i + 1);
    }
  }, [currentIdx, totalQuestions, totalCorrect, highestCorrectLesson]);

  const handleSaveAndContinue = useCallback(async () => {
    if (!user || !result) return;
    setSaving(true);

    try {
      // Save placement result
      await supabase.from("placement_results" as any).insert({
        user_id: user.id,
        level: result.level,
        score: totalCorrect,
        total_questions: totalQuestions,
        vocab_score: scores.vocab,
        grammar_score: scores.grammar,
        reading_score: scores.reading,
        listening_score: scores.listening,
        unlocked_up_to: result.unlockedUpTo,
      } as any);

      // Auto-unlock lessons up to the determined level
      if (result.unlockedUpTo > 0) {
        for (let i = 1; i <= result.unlockedUpTo; i++) {
          await supabase.from("lesson_progress").upsert(
            {
              user_id: user.id,
              lesson_id: `lesson_${i}`,
              completed: true,
              best_score: 100,
              section: "vocabulary",
            },
            { onConflict: "user_id,lesson_id,section" as any }
          );
        }
      }
    } catch (e) {
      console.error("Failed to save placement result:", e);
    }

    setSaving(false);
    navigate("/");
  }, [user, result, totalCorrect, totalQuestions, scores, navigate]);

  // ── Intro Screen ──────────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container max-w-lg px-4 py-8">
          <button onClick={() => navigate(-1)} className="p-2 rounded-sm hover:bg-muted transition-colors mb-4">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>

          <div className="card-paper border-2 p-6 md:p-8 text-center space-y-5 animate-fade-up">
            <span className="text-5xl block">⛩️</span>
            <h1 className="text-2xl font-bold serif-jp text-foreground">Placement Test</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Test your existing Japanese knowledge to find your level. This will determine which lessons
              you've already mastered and where to start your journey.
            </p>

            <div className="grid grid-cols-2 gap-3 text-left">
              {(["vocab", "grammar", "reading", "listening"] as const).map((cat) => {
                const Icon = categoryIcons[cat];
                const count = placementQuestions.filter((q) => q.category === cat).length;
                return (
                  <div key={cat} className="flex items-center gap-2 p-3 rounded-sm bg-muted/30 border border-border">
                    <Icon className="w-4 h-4 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-foreground">{categoryLabels[cat]}</p>
                      <p className="text-xs text-muted-foreground">{count} questions</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-muted-foreground">
              ~5 minutes • {totalQuestions} questions • No penalty for wrong answers
            </p>

            <Button
              onClick={() => setPhase("test")}
              className="w-full py-3 font-bold serif-jp"
              size="lg"
            >
              Begin Test — 始める
            </Button>

            <button
              onClick={() => navigate("/")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip — I'm a complete beginner
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ── Results Screen ────────────────────────────────────────────────────
  if (phase === "results" && result) {
    const pct = Math.round((totalCorrect / totalQuestions) * 100);
    const vocabTotal = placementQuestions.filter((q) => q.category === "vocab").length;
    const grammarTotal = placementQuestions.filter((q) => q.category === "grammar").length;
    const readingTotal = placementQuestions.filter((q) => q.category === "reading").length;
    const listeningTotal = placementQuestions.filter((q) => q.category === "listening").length;

    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container max-w-lg px-4 py-8">
          <div className="card-paper border-2 p-6 md:p-8 text-center space-y-5 animate-fade-up">
            <span className="text-6xl block">{result.emoji}</span>
            <h2 className="text-2xl font-bold serif-jp text-foreground">Your Level: {result.level}</h2>
            <p className="text-sm text-muted-foreground">{result.description}</p>

            <div className="text-4xl font-bold text-primary serif-jp">{pct}%</div>
            <p className="text-sm text-muted-foreground">{totalCorrect}/{totalQuestions} correct</p>

            {/* Breakdown by category */}
            <div className="space-y-2 text-left">
              {([
                { label: "Vocabulary", score: scores.vocab, total: vocabTotal },
                { label: "Grammar", score: scores.grammar, total: grammarTotal },
                { label: "Reading", score: scores.reading, total: readingTotal },
                { label: "Listening", score: scores.listening, total: listeningTotal },
              ]).map((cat) => (
                <div key={cat.label} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-foreground w-20">{cat.label}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${cat.total > 0 ? (cat.score / cat.total) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-10 text-right">
                    {cat.score}/{cat.total}
                  </span>
                </div>
              ))}
            </div>

            {result.unlockedUpTo > 0 && (
              <div className="bg-primary/5 border border-primary/25 rounded-sm p-3 text-sm text-foreground">
                <strong className="text-primary">🎌 Lessons 1–{result.unlockedUpTo} unlocked!</strong>
                <p className="text-muted-foreground text-xs mt-1">
                  You've proven mastery of these lessons. Continue from Lesson {result.unlockedUpTo + 1}!
                </p>
              </div>
            )}

            <Button
              onClick={handleSaveAndContinue}
              className="w-full py-3 font-bold serif-jp"
              size="lg"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save & Continue — 続ける"}
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // ── Test Screen ───────────────────────────────────────────────────────
  if (!question) return null;

  const CatIcon = categoryIcons[question.category];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-2xl px-4 py-6">
        {/* Progress bar */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate("/")} className="p-2 rounded-sm hover:bg-muted transition-colors">
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
          <span className="text-xs text-muted-foreground font-bold">
            {currentIdx + 1}/{totalQuestions}
          </span>
        </div>

        {/* Question card */}
        <div className="card-paper border-2 p-5 md:p-6 animate-fade-up" key={question.id}>
          {/* Category badge */}
          <div className="flex items-center gap-2 mb-4">
            <CatIcon className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground serif-jp">
              {categoryLabels[question.category]}
            </span>
          </div>

          {/* Reading passage */}
          {question.passage && (
            <div className="bg-muted/30 rounded-sm p-4 border border-border mb-4">
              <p className="text-sm japanese-text text-foreground whitespace-pre-line leading-relaxed">
                {question.passage}
              </p>
              {question.passageTranslation && (
                <>
                  <button
                    onClick={() => setShowTranslation(!showTranslation)}
                    className="text-xs text-primary hover:underline mt-2"
                  >
                    {showTranslation ? "Hide translation" : "Show translation"}
                  </button>
                  {showTranslation && (
                    <p className="text-xs text-muted-foreground mt-2 whitespace-pre-line">
                      {question.passageTranslation}
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {/* Listening TTS button */}
          {question.category === "listening" && question.promptJp && (
            <button
              onClick={() => speakJapanese(question.promptJp!, 0.8)}
              className="flex items-center gap-2 p-3 rounded-sm bg-primary/5 border border-primary/25 mb-4 w-full justify-center hover:bg-primary/10 transition-colors"
            >
              <Volume2 className="w-5 h-5 text-primary" />
              <span className="text-sm text-primary font-bold serif-jp">Play Audio</span>
            </button>
          )}

          {/* Prompt */}
          <h3 className="text-lg font-bold text-foreground mb-5">{question.prompt}</h3>

          {/* Options */}
          <div className="space-y-2.5">
            {question.options.map((opt, i) => {
              const isSelected = selectedOption === i;
              const isCorrect = i === question.correctIndex;

              let optionClass = "border-border hover:border-foreground/30 bg-card";
              if (submitted) {
                if (isCorrect) optionClass = "border-primary bg-primary/10 text-primary";
                else if (isSelected && !isCorrect) optionClass = "border-destructive bg-destructive/10 text-destructive";
                else optionClass = "border-border bg-card opacity-50";
              } else if (isSelected) {
                optionClass = "border-primary bg-primary/5";
              }

              return (
                <button
                  key={i}
                  onClick={() => !submitted && setSelectedOption(i)}
                  disabled={submitted}
                  className={cn(
                    "w-full p-3.5 rounded-sm border-2 text-left text-sm font-medium transition-all",
                    optionClass
                  )}
                >
                  <span className="inline-flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Submit / Next button */}
          <div className="mt-5">
            {!submitted ? (
              <Button
                onClick={handleSubmit}
                disabled={selectedOption === null}
                className="w-full py-3 font-bold serif-jp"
                size="lg"
              >
                Check Answer
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="w-full py-3 font-bold serif-jp"
                size="lg"
              >
                {currentIdx + 1 >= totalQuestions ? "See Results" : "Next"}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
