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
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    ringVariant: "vermillion" as const,
  },
  katakana: {
    iconBg: "bg-accent/10",
    iconColor: "text-accent",
    ringVariant: "ink" as const,
  },
  kanji: {
    iconBg: "bg-success/10",
    iconColor: "text-success",
    ringVariant: "bamboo" as const,
  },
  vocabulary: {
    iconBg: "bg-warning/10",
    iconColor: "text-warning",
    ringVariant: "vermillion" as const,
  },
  grammar: {
    iconBg: "bg-secondary",
    iconColor: "text-secondary-foreground",
    ringVariant: "ink" as const,
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
        "w-full text-left card-paper p-5 relative overflow-hidden group border-2 transition-all duration-300",
        isLocked 
          ? "opacity-50 cursor-not-allowed border-border" 
          : "border-border hover:border-primary/40 hover:shadow-md"
      )}
    >
      {/* Brush stroke accent line */}
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary via-primary/50 to-transparent" />
      
      {isLocked && (
        <div className="absolute top-4 right-4">
          <Lock className="w-5 h-5 text-muted-foreground" />
        </div>
      )}
      
      <div className="flex items-start justify-between gap-4 pl-3">
        <div className="flex-1">
          <div className={cn(
            "w-12 h-12 rounded-sm flex items-center justify-center mb-3 border",
            styles.iconBg,
            "border-current/10"
          )}>
            <Icon className={cn("w-6 h-6", styles.iconColor)} />
          </div>
          
          <div className="mb-2">
            <h3 className="text-lg font-brush font-bold text-foreground">{title}</h3>
            <p className="text-2xl font-japanese text-foreground/60">{japanese}</p>
          </div>
          
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{description}</p>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium">{completedLessons}/{totalLessons} scrolls</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
          </div>
        </div>
        
        <ProgressRing progress={progress} size={64} strokeWidth={5} variant={styles.ringVariant}>
          <span className="text-sm font-brush font-bold text-foreground">{progress}%</span>
        </ProgressRing>
      </div>
    </button>
  );
}
