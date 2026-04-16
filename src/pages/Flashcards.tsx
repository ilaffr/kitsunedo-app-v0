import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RotateCcw, BookmarkCheck, Layers } from "lucide-react";
import { Header } from "@/components/header";
import { useFlashcards } from "@/hooks/use-flashcards";
import { cn } from "@/lib/utils";

type SRSGrade = "again" | "hard" | "good" | "easy";

const gradeStyles: Record<SRSGrade, { label: string; labelJp: string; style: string }> = {
  again: { label: "Again", labelJp: "もう一度", style: "border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground" },
  hard: { label: "Hard", labelJp: "難しい", style: "border-warning text-warning hover:bg-warning hover:text-warning-foreground" },
  good: { label: "Good", labelJp: "良い", style: "border-success text-success hover:bg-success hover:text-success-foreground" },
  easy: { label: "Easy", labelJp: "簡単", style: "border-primary text-primary hover:bg-primary hover:text-primary-foreground" },
};

export default function FlashcardsPage() {
  const navigate = useNavigate();
  const { cards, loading, fetchCards, getDueCards, reviewCard } = useFlashcards();
  const [dueCards, setDueCards] = useState<typeof cards>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  useEffect(() => {
    const due = getDueCards();
    setDueCards(due);
    if (due.length === 0 && cards.length > 0) setFinished(true);
  }, [cards, getDueCards]);

  const current = dueCards[currentIdx];

  const handleGrade = async (grade: SRSGrade) => {
    if (!current) return;
    await reviewCard(current.id, grade);
    setFlipped(false);
    setReviewed((r) => r + 1);
    if (currentIdx + 1 >= dueCards.length) {
      setFinished(true);
    } else {
      setCurrentIdx((i) => i + 1);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-lg px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate("/")} className="p-2 rounded-sm hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <p className="text-xs text-muted-foreground tracking-wide mt-1">
              <Layers className="w-3 h-3 inline mr-1" strokeWidth={1.5} />
              {cards.length} cards · {dueCards.length} due for review
            </p>
          </div>
        </div>

        {loading && <p className="text-sm text-muted-foreground text-center py-12">Loading cards…</p>}

        {!loading && cards.length === 0 && (
          <div className="card-paper border-2 p-8 text-center">
            <BookmarkCheck className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-bold serif-jp text-foreground mb-2">No flashcards yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add words from lessons by tapping the bookmark icon during vocabulary sections.
            </p>
            <button
              onClick={() => navigate("/lessons")}
              className="px-6 py-2.5 rounded-sm border-2 border-foreground text-sm font-medium hover:bg-foreground hover:text-background transition-colors"
            >
              Go to Lessons
            </button>
          </div>
        )}

        {!loading && finished && cards.length > 0 && (
          <div className="card-paper border-2 p-8 text-center space-y-4 animate-fade-up">
            <div className="text-5xl">🎴</div>
            <h3 className="text-lg font-bold serif-jp text-foreground">All caught up!</h3>
            <p className="text-sm text-muted-foreground">
              {reviewed > 0
                ? `You reviewed ${reviewed} card${reviewed === 1 ? "" : "s"}. Come back later for more.`
                : "No cards due right now. Keep studying!"}
            </p>
            <button
              onClick={() => { fetchCards(); setFinished(false); setCurrentIdx(0); setReviewed(0); }}
              className="px-6 py-2.5 rounded-sm border-2 border-border text-sm hover:border-foreground/30 transition-colors inline-flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Refresh
            </button>
          </div>
        )}

        {!loading && !finished && current && (
          <div className="space-y-4 animate-fade-up" key={current.id}>
            {/* Progress */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 rounded-full"
                  style={{ width: `${(currentIdx / dueCards.length) * 100}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground font-mono">{currentIdx + 1}/{dueCards.length}</span>
            </div>

            {/* Card */}
            <button
              onClick={() => setFlipped((f) => !f)}
              className={cn(
                "w-full min-h-[280px] card-paper border-2 p-8 flex flex-col items-center justify-center transition-all",
                flipped ? "border-primary/40 bg-primary/5" : "border-border hover:border-foreground/30"
              )}
            >
              {!flipped ? (
                <>
                  {current.image_url && (
                    <img
                      src={current.image_url}
                      alt={current.meaning}
                      className="w-24 h-24 object-contain rounded-lg mb-4"
                    />
                  )}
                  <span className="text-4xl japanese-text font-bold text-foreground mb-2">{current.japanese}</span>
                  <span className="text-xs text-muted-foreground">tap to flip</span>
                </>
              ) : (
                <>
                  {current.image_url && (
                    <img
                      src={current.image_url}
                      alt={current.meaning}
                      className="w-20 h-20 object-contain rounded-lg mb-3 opacity-80"
                    />
                  )}
                  <span className="text-sm text-muted-foreground mb-2">{current.reading}</span>
                  <span className="text-2xl font-bold text-foreground mb-1">{current.meaning}</span>
                  <span className="text-lg japanese-text text-primary">{current.japanese}</span>
                </>
              )}
            </button>

            {/* Grade buttons */}
            {flipped && (
              <div className="grid grid-cols-4 gap-2 animate-fade-up">
                {(["again", "hard", "good", "easy"] as SRSGrade[]).map((grade) => (
                  <button
                    key={grade}
                    onClick={() => handleGrade(grade)}
                    className={cn(
                      "py-3 rounded-sm border-2 text-xs font-bold transition-colors",
                      gradeStyles[grade].style
                    )}
                  >
                    <span className="block">{gradeStyles[grade].label}</span>
                    <span className="block text-[10px] opacity-70">{gradeStyles[grade].labelJp}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
