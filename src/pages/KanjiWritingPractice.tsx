import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, ChevronRight, ChevronLeft, Check, Sparkles, PenTool } from "lucide-react";
import { Header } from "@/components/header";
import { KanjiCanvas } from "@/components/kanji-canvas";
import { StrokeOrderDiagram } from "@/components/stroke-order-diagram";
import { kanjiEntries, type KanjiEntry } from "@/data/daily-practice-data";
import { usePracticeSession } from "@/hooks/use-user-data";
import { cn } from "@/lib/utils";

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type SelfGrade = "perfect" | "okay" | "missed" | null;

interface PracticeState {
  showGuide: boolean;
  showAnswer: boolean;
  showStrokeOrder: boolean;
  selfGrade: SelfGrade;
}

export default function KanjiWritingPractice() {
  const navigate = useNavigate();
  const { savePractice } = usePracticeSession();
  const practiceSet = useMemo(() => shuffleArray(kanjiEntries).slice(0, 10), []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [states, setStates] = useState<Record<number, PracticeState>>({});
  const [finished, setFinished] = useState(false);
  const [xpEarned, setXpEarned] = useState<number | null>(null);

  const current = practiceSet[currentIndex];
  const state = states[currentIndex] ?? { showGuide: true, showAnswer: false, showStrokeOrder: false, selfGrade: null };

  const updateState = (patch: Partial<PracticeState>) => {
    setStates((prev) => ({
      ...prev,
      [currentIndex]: { ...state, ...patch },
    }));
  };

  const gradeCount = (grade: SelfGrade) =>
    Object.values(states).filter((s) => s.selfGrade === grade).length;

  const allGraded = Object.keys(states).filter((k) => states[Number(k)]?.selfGrade).length === practiceSet.length;

  const handleFinish = async () => {
    setFinished(true);
    const xp = await savePractice({
      practiceType: "kanji_writing",
      perfect: gradeCount("perfect"),
      close: gradeCount("okay"),
      missed: gradeCount("missed"),
      total: practiceSet.length,
    });
    setXpEarned(xp);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-3xl px-4 py-6">
        {/* Back */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="serif-jp">道場へ戻る</span>
        </button>

        {/* Title */}
        <div className="mb-8 relative">
          <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground mb-2">The Brush</p>
          <div className="flex items-baseline gap-4">
            <h1 className="text-3xl md:text-4xl serif-jp font-medium text-foreground tracking-wide">書く</h1>
            <span className="text-sm text-muted-foreground italic">Kanji Writing</span>
          </div>
          <div className="mt-3 h-px w-20 bg-foreground/40" />
          <p className="text-sm text-muted-foreground mt-3 max-w-md">
            Trace each character — remember the radicals & their story.
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 rounded-full"
              style={{
                width: `${(Object.keys(states).filter((k) => states[Number(k)]?.selfGrade).length / practiceSet.length) * 100}%`,
              }}
            />
          </div>
          <span className="text-sm text-muted-foreground font-mono">
            {Object.keys(states).filter((k) => states[Number(k)]?.selfGrade).length}/{practiceSet.length}
          </span>
        </div>

        {!finished ? (
          <div className="animate-fade-up">
            {/* Kanji info header */}
            <div className="card-paper border-2 p-5 md:p-6 mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground serif-jp">問{currentIndex + 1}</span>
                <button
                  onClick={() => updateState({ showGuide: !state.showGuide })}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {state.showGuide ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" /> Hide guide
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" /> Show guide
                    </>
                  )}
                </button>
              </div>

              {/* Prompt: meaning + reading */}
              <div className="text-center mb-4">
                <p className="text-lg font-bold text-foreground serif-jp">{current.meaning}</p>
                <p className="text-sm text-muted-foreground japanese-text">{current.reading}</p>
              </div>

              {/* Radicals hint */}
              <div className="flex flex-wrap justify-center gap-2 mb-5">
                {current.radicals.map((r, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 border border-primary/20 rounded-sm text-sm"
                  >
                    <span className="text-lg japanese-text">{r.radical}</span>
                    <span className="text-muted-foreground">= {r.meaning}</span>
                  </span>
                ))}
              </div>

              {/* Mnemonic */}
              <div className="p-3 bg-muted/30 border border-border rounded-sm text-center">
                <p className="text-xs text-primary font-bold uppercase tracking-widest mb-1 flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3" /> Mnemonic
                </p>
                <p className="text-sm text-foreground italic">"{current.mnemonic}"</p>
              </div>
            </div>

            {/* Stroke Order Diagram */}
            <div className="card-paper border-2 p-5 md:p-6 mb-4">
              <button
                onClick={() => updateState({ showStrokeOrder: !state.showStrokeOrder })}
                className="flex items-center gap-2 w-full justify-between text-sm mb-3"
              >
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <PenTool className="w-4 h-4 text-primary" />
                  Stroke Order Guide
                </span>
                <span className="text-xs text-muted-foreground">
                  {state.showStrokeOrder ? "Hide" : "Show"}
                </span>
              </button>
              {state.showStrokeOrder && (
                <div className="flex justify-center">
                  <StrokeOrderDiagram kanji={current.kanji} size={240} />
                </div>
              )}
            </div>

            {/* Canvas */}
            <div className="card-paper border-2 p-5 md:p-6 mb-4 flex flex-col items-center">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4 serif-jp">
                Write the kanji below
              </p>
              <KanjiCanvas
                guideKanji={current.kanji}
                showGuide={state.showGuide}
                size={280}
              />

              {/* Reveal answer */}
              {!state.showAnswer ? (
                <button
                  onClick={() => updateState({ showAnswer: true })}
                  className="mt-4 px-5 py-2 text-sm border-2 border-foreground rounded-sm font-medium
                             hover:bg-foreground hover:text-background transition-colors"
                >
                  Reveal Answer
                </button>
              ) : (
                <div className="mt-4 text-center space-y-3">
                  <div className="flex items-center justify-center gap-4">
                    <span className="text-6xl japanese-text font-bold text-foreground">
                      {current.kanji}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">How did you do?</p>
                  <div className="flex items-center justify-center gap-2">
                    {(
                      [
                        { grade: "perfect" as const, label: "Perfect", style: "border-success text-success hover:bg-success hover:text-success-foreground" },
                        { grade: "okay" as const, label: "Close", style: "border-warning text-warning hover:bg-warning hover:text-warning-foreground" },
                        { grade: "missed" as const, label: "Missed", style: "border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground" },
                      ] as const
                    ).map(({ grade, label, style }) => (
                      <button
                        key={grade}
                        onClick={() => updateState({ selfGrade: grade })}
                        className={cn(
                          "px-4 py-2 text-sm border-2 rounded-sm font-medium transition-colors",
                          state.selfGrade === grade
                            ? grade === "perfect"
                              ? "bg-success text-success-foreground border-success"
                              : grade === "okay"
                                ? "bg-warning text-warning-foreground border-warning"
                                : "bg-destructive text-destructive-foreground border-destructive"
                            : style
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                disabled={currentIndex === 0}
                className="flex items-center gap-1 px-4 py-2 text-sm border-2 border-border rounded-sm
                           disabled:opacity-30 hover:border-foreground/30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              {currentIndex < practiceSet.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex((i) => i + 1)}
                  className="flex items-center gap-1 px-4 py-2 text-sm border-2 border-foreground rounded-sm
                             font-medium hover:bg-foreground hover:text-background transition-colors"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleFinish}
                  disabled={!allGraded}
                  className={cn(
                    "px-6 py-2 text-sm border-2 rounded-sm font-bold serif-jp transition-colors",
                    allGraded
                      ? "btn-ink text-card border-foreground"
                      : "border-border text-muted-foreground bg-muted/30 cursor-not-allowed"
                  )}
                >
                  結果 — Results
                </button>
              )}
            </div>

            {/* Quick-jump dots */}
            <div className="flex justify-center gap-1.5 mt-6">
              {practiceSet.map((_, i) => {
                const s = states[i];
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={cn(
                      "w-2.5 h-2.5 rounded-full transition-colors",
                      i === currentIndex
                        ? "bg-primary scale-125"
                        : s?.selfGrade === "perfect"
                          ? "bg-success"
                          : s?.selfGrade === "okay"
                            ? "bg-warning"
                            : s?.selfGrade === "missed"
                              ? "bg-destructive"
                              : "bg-muted-foreground/20"
                    )}
                  />
                );
              })}
            </div>
          </div>
        ) : (
          /* ── Results ── */
          <div className="space-y-4 animate-fade-up">
            <div className="card-paper border-2 p-6 text-center">
              <p className="text-4xl font-bold serif-jp text-foreground mb-1">
                {gradeCount("perfect")} / {practiceSet.length}
              </p>
              <p className="text-muted-foreground text-sm mb-4">
                {gradeCount("perfect") === practiceSet.length
                  ? "Master calligrapher — 完璧！"
                  : gradeCount("perfect") >= practiceSet.length * 0.7
                    ? "Beautiful strokes — 素晴らしい！"
                    : gradeCount("perfect") >= practiceSet.length * 0.5
                      ? "Getting there — もう少し！"
                      : "Keep practicing — 頑張って！"}
              </p>
              <div className="flex items-center justify-center gap-6 text-sm">
                <span className="text-success font-medium">✓ {gradeCount("perfect")} perfect</span>
                <span className="text-warning font-medium">~ {gradeCount("okay")} close</span>
                <span className="text-destructive font-medium">✗ {gradeCount("missed")} missed</span>
              </div>
              {xpEarned !== null && (
                <p className="mt-3 text-sm font-bold text-primary serif-jp">+{xpEarned} XP earned ✦</p>
              )}
            </div>

            {/* Review cards */}
            {practiceSet.map((entry, i) => {
              const s = states[i];
              const grade = s?.selfGrade;
              return (
                <div
                  key={i}
                  className={cn(
                    "card-paper border-2 p-5",
                    grade === "perfect"
                      ? "border-success/40"
                      : grade === "okay"
                        ? "border-warning/40"
                        : "border-destructive/40"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm serif-jp text-muted-foreground">問{i + 1}</span>
                    {grade === "perfect" ? (
                      <Check className="w-5 h-5 text-success" />
                    ) : grade === "okay" ? (
                      <span className="text-warning text-sm font-medium">~</span>
                    ) : (
                      <span className="text-destructive text-sm font-medium">✗</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-4xl japanese-text font-bold">{entry.kanji}</span>
                    <div>
                      <p className="text-sm text-foreground font-medium">{entry.meaning}</p>
                      <p className="text-xs text-muted-foreground japanese-text">{entry.reading}</p>
                    </div>
                  </div>
                  {grade !== "perfect" && (
                    <div className="mt-3 p-3 bg-primary/5 border border-primary/20 rounded-sm">
                      <p className="text-xs text-primary font-bold uppercase tracking-widest mb-1">Remember</p>
                      <p className="text-sm text-foreground">{entry.mnemonic}</p>
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
                className="px-6 py-2.5 rounded-sm border-2 border-foreground text-sm font-medium
                           hover:bg-foreground hover:text-background transition-colors"
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
