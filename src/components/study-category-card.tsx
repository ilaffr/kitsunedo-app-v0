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

const variantStyles = {
  hiragana: {
    bg: "from-primary/15 to-primary/5",
    iconBg: "bg-primary/20",
    iconColor: "text-primary",
    ringVariant: "golden" as const,
  },
  katakana: {
    bg: "from-accent/15 to-accent/5",
    iconBg: "bg-accent/20",
    iconColor: "text-accent",
    ringVariant: "cherry" as const,
  },
  kanji: {
    bg: "from-success/15 to-success/5",
    iconBg: "bg-success/20",
    iconColor: "text-success",
    ringVariant: "jade" as const,
  },
  vocabulary: {
    bg: "from-warning/15 to-warning/5",
    iconBg: "bg-warning/20",
    iconColor: "text-warning",
    ringVariant: "golden" as const,
  },
  grammar: {
    bg: "from-secondary/30 to-secondary/10",
    iconBg: "bg-secondary",
    iconColor: "text-secondary-foreground",
    ringVariant: "golden" as const,
  },
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
  const styles = variantStyles[variant];

  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className={cn(
        "w-full text-left card-interactive p-5 md:p-6 relative overflow-hidden group bg-gradient-to-br border",
        styles.bg,
        isLocked ? "opacity-50 cursor-not-allowed border-border" : "border-border hover:border-primary/30"
      )}
    >
      {isLocked && (
        <div className="absolute top-4 right-4">
          <Lock className="w-5 h-5 text-muted-foreground" />
        </div>
      )}
      
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className={cn(
            "w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-3 md:mb-4",
            styles.iconBg
          )}>
            <Icon className={cn("w-6 h-6 md:w-7 md:h-7", styles.iconColor)} />
          </div>
          
          <div className="mb-2">
            <h3 className="text-lg md:text-xl font-semibold text-foreground font-title">{title}</h3>
            <p className="text-xl md:text-2xl font-japanese font-bold text-foreground/70">{japanese}</p>
          </div>
          
          <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4 line-clamp-2">{description}</p>
          
          <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
            <span>{completedLessons}/{totalLessons} lessons</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
          </div>
        </div>
        
        <ProgressRing progress={progress} size={70} strokeWidth={5} variant={styles.ringVariant}>
          <span className="text-base font-bold text-foreground">{progress}%</span>
        </ProgressRing>
      </div>
    </button>
  );
}
