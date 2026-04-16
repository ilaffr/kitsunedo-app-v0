import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Layers, PenTool, Shuffle, ChevronRight, BookmarkCheck, ScrollText } from "lucide-react";
import { Header } from "@/components/header";
import { cn } from "@/lib/utils";
import { useFlashcards } from "@/hooks/use-flashcards";
import { useEffect } from "react";

const modes = [
  {
    id: "flashcards" as const,
    title: "Flashcard Review",
    titleJp: "単語カード",
    description: "SRS-powered vocabulary review with cartoon illustrations",
    icon: Layers,
    emoji: "🎴",
    route: "/flashcards",
  },
  {
    id: "kanji" as const,
    title: "Kanji Writing",
    titleJp: "漢字練習",
    description: "Practice writing kanji with stroke order guides & mnemonics",
    icon: PenTool,
    emoji: "🖌️",
    route: "/kanji-writing",
  },
  {
    id: "jlpt" as const,
    title: "JLPT Practice",
    titleJp: "能力試験",
    description: "Authentic-style mock test — N5 through N1, mixed or by section",
    icon: ScrollText,
    emoji: "📜",
    route: "/jlpt-practice",
  },
  {
    id: "mixed" as const,
    title: "Mixed Training",
    titleJp: "総合練習",
    description: "Alternate between flashcard review and kanji writing drills",
    icon: Shuffle,
    emoji: "⚡",
    route: null, // handled inline
  },
];

export default function Practice() {
  const navigate = useNavigate();
  const { cards, fetchCards, getDueCards } = useFlashcards();
  const [dueCount, setDueCount] = useState(0);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  useEffect(() => {
    setDueCount(getDueCards().length);
  }, [cards, getDueCards]);

  const handleSelect = (modeId: string) => {
    const mode = modes.find((m) => m.id === modeId);
    if (!mode) return;
    if (mode.route) {
      navigate(mode.route);
    } else {
      // Mixed: randomly pick one
      const pick = Math.random() > 0.5 ? "/flashcards" : "/kanji-writing";
      navigate(pick);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-lg px-4 py-6">
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
          <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground mb-2">Training Hall</p>
          <div className="flex items-baseline gap-4">
            <h1 className="text-3xl md:text-4xl serif-jp font-medium text-foreground tracking-wide">練習</h1>
            <span className="text-sm text-muted-foreground italic">Practice</span>
          </div>
          <div className="mt-3 h-px w-20 bg-foreground/40" />
          <p className="text-sm text-muted-foreground mt-3 max-w-md">
            Choose your training style — cards, writing, or both.
          </p>
        </div>

        {/* Stats strip */}
        <div className="flex items-center gap-4 mb-6 px-1">
          <div className="flex items-center gap-1.5 text-sm">
            <Layers className="w-4 h-4 text-primary" />
            <span className="text-foreground font-medium">{cards.length}</span>
            <span className="text-muted-foreground">cards</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-1.5 text-sm">
            <BookmarkCheck className="w-4 h-4 text-success" />
            <span className="text-foreground font-medium">{dueCount}</span>
            <span className="text-muted-foreground">due now</span>
          </div>
        </div>

        {/* Mode cards */}
        <div className="space-y-3">
          {modes.map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => handleSelect(mode.id)}
                className={cn(
                  "w-full card-paper border-2 p-5 flex items-center gap-4 text-left",
                  "hover:border-primary/50 hover:shadow-md transition-all group"
                )}
              >
                <span className="text-3xl">{mode.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-foreground serif-jp group-hover:text-primary transition-colors">
                      {mode.title}
                    </h3>
                    <span className="text-xs text-muted-foreground japanese-text">{mode.titleJp}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{mode.description}</p>
                  {mode.id === "flashcards" && dueCount > 0 && (
                    <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold bg-primary/10 text-primary rounded-sm">
                      {dueCount} due for review
                    </span>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </button>
            );
          })}
        </div>

        {/* Tip */}
        <div className="mt-6 p-4 bg-muted/30 border border-border rounded-sm text-center">
          <p className="text-xs text-muted-foreground">
            💡 Add words to your flashcards from any lesson by tapping the <strong>bookmark</strong> icon during vocabulary sections.
          </p>
        </div>
      </main>
    </div>
  );
}
