import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, X, Sparkles, BookOpen, MessageSquare, PenTool, Zap } from "lucide-react";
import { Header } from "@/components/header";
import { cn } from "@/lib/utils";
import {
  getDailyExercises,
  type Exercise,
  type KanjiRadicalExercise,
  type KanjiMnemonicExercise,
  type VocabRecallExercise,
  type GrammarFillExercise,
} from "@/data/daily-practice-data";

const typeLabel: Record<Exercise["type"], { label: string; icon: typeof BookOpen; color: string }> = {
  kanji_radical: { label: "Kanji Radicals", icon: PenTool, color: "text-primary" },
  kanji_mnemonic: { label: "Kanji Story", icon: Sparkles, color: "text-accent-foreground" },
  vocab_recall: { label: "Vocabulary", icon: BookOpen, color: "text-success" },
  grammar_fill: { label: "Grammar", icon: MessageSquare, color: "text-primary" },
};

function ExerciseTypeBadge({ type }: { type: Exercise["type"] }) {
  const info = typeLabel[type];
  const Icon = info.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest", info.color)}>
      <Icon className="w-3.5 h-3.5" />
      {info.label}
    </span>
  );
}

function KanjiRadicalCard({ ex, radicals }: { ex: KanjiRadicalExercise; radicals: typeof ex.radicals }) {
  return (
    <div className="mb-4 space-y-3">
      <div className="flex items-center gap-4">
        <span className="text-5xl japanese-text font-bold text-foreground">{ex.kanji}</span>
        <div>
          <p className="text-sm text-muted-foreground">Meaning: <strong className="text-foreground">{ex.meaning}</strong></p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {radicals.map((r, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 border border-border rounded-sm text-sm">
            <span className="text-lg japanese-text">{r.radical}</span>
            <span className="text-muted-foreground">= {r.meaning}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function KanjiMnemonicCard({ ex }: { ex: KanjiMnemonicExercise }) {
  return (
    <div className="mb-4 space-y-3">
      <div className="flex items-center gap-4">
        <span className="text-5xl japanese-text font-bold text-foreground">{ex.kanji}</span>
        <div>
          <p className="text-base japanese-text text-muted-foreground">{ex.reading}</p>
          <p className="text-sm text-muted-foreground">"{ex.meaning}"</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {ex.radicals.map((r, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 border border-primary/20 rounded-sm text-sm">
            <span className="text-lg japanese-text">{r.radical}</span>
            <span className="text-muted-foreground">= {r.meaning}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function DailyPractice() {
  const navigate = useNavigate();
  const exercises = useMemo(() => getDailyExercises(10), []);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleAnswer = (id: string, optIndex: number) => {
    if (showResults) return;
    setAnswers((prev) => ({ ...prev, [id]: optIndex }));
  };

  const correctCount = exercises.filter((ex) => answers[ex.id] === ex.correct).length;
  const allAnswered = Object.keys(answers).length === exercises.length;
  const current = exercises[currentIndex];

  const renderExerciseContent = (ex: Exercise) => {
    switch (ex.type) {
      case "kanji_radical":
        return <KanjiRadicalCard ex={ex} radicals={ex.radicals} />;
      case "kanji_mnemonic":
        return <KanjiMnemonicCard ex={ex} />;
      case "vocab_recall":
        return (
          <div className="mb-4">
            <span className="text-4xl japanese-text font-bold text-foreground">{(ex as VocabRecallExercise).japanese}</span>
          </div>
        );
      case "grammar_fill":
        return (
          <div className="mb-4">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1 serif-jp">Hint</p>
            <p className="text-sm text-primary italic">{(ex as GrammarFillExercise).hint}</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-3xl px-4 py-6">
        {/* Back */}
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" />
          <span className="serif-jp">道場へ戻る</span>
        </button>

        {/* Title */}
        <div className="card-paper p-6 border-2 mb-6">
          <div className="flex items-start gap-4">
            <div className="hanko-badge text-lg">修行</div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground serif-jp">Daily Practice</h1>
              <p className="text-muted-foreground mt-1">Mixed training — kanji, vocabulary & grammar</p>
            </div>
          </div>
          <div className="ink-divider mt-5" />
          <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
            <span>{exercises.length} exercises</span>
            <span>
              {exercises.filter((e) => e.type.startsWith("kanji")).length} kanji ·{" "}
              {exercises.filter((e) => e.type === "vocab_recall").length} vocab ·{" "}
              {exercises.filter((e) => e.type === "grammar_fill").length} grammar
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 rounded-full"
              style={{ width: `${(Object.keys(answers).length / exercises.length) * 100}%` }}
            />
          </div>
          <span className="text-sm text-muted-foreground font-mono">{Object.keys(answers).length}/{exercises.length}</span>
        </div>

        {!showResults ? (
          <>
            {/* Exercise card */}
            <div className="card-paper border-2 p-5 md:p-6 mb-4 animate-fade-up">
              <div className="flex items-center justify-between mb-4">
                <ExerciseTypeBadge type={current.type} />
                <span className="text-xs text-muted-foreground serif-jp">問{currentIndex + 1}</span>
              </div>

              {renderExerciseContent(current)}

              <p className="text-foreground font-medium japanese-text mb-4">{current.question}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {current.options.map((opt, j) => {
                  const isSelected = answers[current.id] === j;
                  return (
                    <button
                      key={j}
                      onClick={() => handleAnswer(current.id, j)}
                      className={cn(
                        "text-left px-4 py-3 rounded-sm border-2 text-sm japanese-text transition-colors",
                        isSelected
                          ? "border-foreground bg-foreground/5"
                          : "border-border hover:border-foreground/30 bg-card"
                      )}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                disabled={currentIndex === 0}
                className="px-4 py-2 text-sm border-2 border-border rounded-sm disabled:opacity-30 hover:border-foreground/30 transition-colors"
              >
                ← Previous
              </button>

              {currentIndex < exercises.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex((i) => i + 1)}
                  className="px-4 py-2 text-sm border-2 border-foreground rounded-sm font-medium hover:bg-foreground hover:text-background transition-colors"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={() => setShowResults(true)}
                  disabled={!allAnswered}
                  className={cn(
                    "px-6 py-2 text-sm border-2 rounded-sm font-bold serif-jp transition-colors",
                    allAnswered
                      ? "btn-ink text-card border-foreground"
                      : "border-border text-muted-foreground bg-muted/30 cursor-not-allowed"
                  )}
                >
                  答え合わせ — Check
                </button>
              )}
            </div>

            {/* Quick-jump dots */}
            <div className="flex justify-center gap-1.5 mt-6">
              {exercises.map((ex, i) => (
                <button
                  key={ex.id}
                  onClick={() => setCurrentIndex(i)}
                  className={cn(
                    "w-2.5 h-2.5 rounded-full transition-colors",
                    i === currentIndex
                      ? "bg-primary scale-125"
                      : answers[ex.id] !== undefined
                        ? "bg-foreground/40"
                        : "bg-muted-foreground/20"
                  )}
                />
              ))}
            </div>
          </>
        ) : (
          /* ── Results ── */
          <div className="space-y-4">
            {/* Score */}
            <div className="card-paper border-2 p-6 text-center">
              <p className="text-4xl font-bold serif-jp text-foreground mb-1">
                {correctCount} / {exercises.length}
              </p>
              <p className="text-muted-foreground text-sm">
                {correctCount === exercises.length
                  ? "Perfect — 完璧！"
                  : correctCount >= exercises.length * 0.7
                    ? "Great work — 素晴らしい！"
                    : correctCount >= exercises.length * 0.5
                      ? "Good effort — もう少し！"
                      : "Keep studying — 頑張って！"}
              </p>
            </div>

            {/* Review each */}
            {exercises.map((ex, i) => {
              const userAns = answers[ex.id];
              const isCorrect = userAns === ex.correct;
              return (
                <div key={ex.id} className={cn("card-paper border-2 p-5", isCorrect ? "border-success/40" : "border-destructive/40")}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm serif-jp text-muted-foreground">問{i + 1}</span>
                      <ExerciseTypeBadge type={ex.type} />
                    </div>
                    {isCorrect ? (
                      <Check className="w-5 h-5 text-success" />
                    ) : (
                      <X className="w-5 h-5 text-destructive" />
                    )}
                  </div>

                  {/* Show kanji info in results */}
                  {(ex.type === "kanji_radical" || ex.type === "kanji_mnemonic") && (
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl japanese-text font-bold">{ex.kanji}</span>
                      <span className="text-sm text-muted-foreground">({ex.meaning})</span>
                    </div>
                  )}

                  <p className="text-sm text-foreground japanese-text mb-2">{ex.question}</p>

                  {!isCorrect && (
                    <div className="flex flex-col gap-1 text-sm">
                      <span className="text-destructive line-through">{ex.options[userAns]}</span>
                      <span className="text-success font-medium">✓ {ex.options[ex.correct]}</span>
                    </div>
                  )}

                  {/* Show mnemonic tip for kanji */}
                  {ex.type === "kanji_mnemonic" && (
                    <div className="mt-3 p-3 bg-primary/5 border border-primary/20 rounded-sm">
                      <p className="text-xs text-primary font-bold uppercase tracking-widest mb-1">Remember</p>
                      <p className="text-sm text-foreground">{(ex as any).mnemonic}</p>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Actions */}
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => navigate("/")}
                className="px-6 py-2.5 rounded-sm border-2 border-border text-sm hover:border-foreground/30 transition-colors"
              >
                Back to Dōjō
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 rounded-sm border-2 border-foreground text-sm font-medium hover:bg-foreground hover:text-background transition-colors"
              >
                もう一度 — New Set
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
