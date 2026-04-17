import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { KANA_PASS_THRESHOLD } from "@/data/kana-data";

export interface KanaPrimerCardProps {
  cleared: boolean;
  bestScore?: number | null;
  onClick: () => void;
}

export function KanaPrimerCard({ cleared, bestScore, onClick }: KanaPrimerCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full mb-3 card-paper border-2 p-4 flex items-center gap-3 text-left transition-colors",
        cleared
          ? "border-success/40 hover:border-success/70"
          : "border-primary/40 hover:border-primary/70",
      )}
    >
      <span className="text-3xl">{cleared ? "🎌" : "✍️"}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          Prerequisite · 入門前
        </p>
        <h3 className="font-brush font-bold text-foreground text-sm">
          かな入門 — Hiragana &amp; Katakana primer
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {cleared
            ? `Cleared${bestScore != null ? ` · best ${bestScore}%` : ""} — Lesson 1 unlocked`
            : `Pass the ${KANA_PASS_THRESHOLD}% knowledge check to unlock Lesson 1 (or skip)`}
        </p>
      </div>
      {cleared ? (
        <Check className="w-5 h-5 text-success" strokeWidth={3} />
      ) : (
        <Sparkles className="w-5 h-5 text-primary" />
      )}
    </button>
  );
}
