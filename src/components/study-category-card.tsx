import { cn } from "@/lib/utils";
import { LucideIcon, ChevronRight, Lock } from "lucide-react";
import { ProgressRing } from "./ui/progress-ring";

interface StudyCategoryCardProps {
  title: string;
  japanese: string;
  description: string;
  icon: LucideIcon;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  isLocked?: boolean;
  variant?: "hiragana" | "katakana" | "kanji" | "vocabulary" | "grammar";
  onClick?: () => void;
}

const ringVariant = {
  hiragana: "vermillion" as const,
  katakana: "ink" as const,
  kanji: "bamboo" as const,
  vocabulary: "vermillion" as const,
  grammar: "ink" as const,
};

export function StudyCategoryCard({
  title,
  japanese,
  description,
  icon: Icon,
  progress,
  totalLessons,
  completedLessons,
  isLocked = false,
  variant = "hiragana",
  onClick,
}: StudyCategoryCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className={cn(
        "group relative w-full text-left washi-card p-5 md:p-6 overflow-hidden transition-all duration-300",
        isLocked
          ? "opacity-50 cursor-not-allowed"
          : "hover:shadow-lg hover:-translate-y-0.5"
      )}
    >
      {/* Faint giant kanji watermark */}
      <span
        aria-hidden
        className="absolute -right-4 -bottom-8 serif-jp text-[8rem] leading-none text-foreground/[0.05] select-none pointer-events-none"
      >
        {japanese.charAt(0)}
      </span>

      {isLocked && (
        <div className="absolute top-4 right-4">
          <Lock className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
        </div>
      )}

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="w-10 h-10 flex items-center justify-center mb-4 text-foreground/70">
            <Icon className="w-6 h-6" strokeWidth={1.5} />
          </div>

          <div className="mb-2">
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-1">
              {title}
            </p>
            <h3 className="text-2xl md:text-3xl serif-jp font-medium text-foreground tracking-wide">
              {japanese}
            </h3>
          </div>

          <p className="text-xs text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
            {description}
          </p>

          <div className="flex items-center gap-2 text-xs text-muted-foreground tracking-wider">
            <span>{completedLessons} / {totalLessons}</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:text-foreground" strokeWidth={1.5} />
          </div>
        </div>

        <ProgressRing progress={progress} size={56} strokeWidth={3} variant={ringVariant[variant]}>
          <span className="text-xs serif-jp font-medium text-foreground">{progress}%</span>
        </ProgressRing>
      </div>
    </button>
  );
}
