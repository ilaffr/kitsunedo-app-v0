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
    bg: "bg-gradient-to-br from-primary/10 to-primary/5",
    iconBg: "bg-primary/15",
    iconColor: "text-primary",
    progressColor: "primary",
  },
  katakana: {
    bg: "bg-gradient-to-br from-accent/10 to-accent/5",
    iconBg: "bg-accent/15",
    iconColor: "text-accent",
    progressColor: "accent",
  },
  kanji: {
    bg: "bg-gradient-to-br from-success/10 to-success/5",
    iconBg: "bg-success/15",
    iconColor: "text-success",
    progressColor: "success",
  },
  vocabulary: {
    bg: "bg-gradient-to-br from-warning/10 to-warning/5",
    iconBg: "bg-warning/15",
    iconColor: "text-warning",
    progressColor: "warning",
  },
  grammar: {
    bg: "bg-gradient-to-br from-secondary-foreground/10 to-secondary-foreground/5",
    iconBg: "bg-secondary-foreground/15",
    iconColor: "text-secondary-foreground",
    progressColor: "secondary",
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
        "w-full text-left card-interactive p-6 relative overflow-hidden group",
        styles.bg,
        isLocked && "opacity-60 cursor-not-allowed"
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
            "w-14 h-14 rounded-2xl flex items-center justify-center mb-4",
            styles.iconBg
          )}>
            <Icon className={cn("w-7 h-7", styles.iconColor)} />
          </div>
          
          <div className="mb-2">
            <h3 className="text-xl font-semibold text-foreground">{title}</h3>
            <p className="text-2xl font-japanese font-bold text-foreground/80">{japanese}</p>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{completedLessons}/{totalLessons} lessons</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
        
        <ProgressRing progress={progress} size={80} strokeWidth={6}>
          <span className="text-lg font-bold">{progress}%</span>
        </ProgressRing>
      </div>
    </button>
  );
}
