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
    iconBg: "bg-muted",
    iconColor: "text-muted-foreground",
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
        "w-full text-left card-paper p-5 relative overflow-hidden group transition-all duration-300",
        isLocked 
          ? "opacity-50 cursor-not-allowed" 
          : "hover:shadow-lg hover:-translate-y-0.5"
      )}
    >
      {/* Subtle left accent */}
      <div className="absolute top-3 bottom-3 left-0 w-[3px] rounded-r-full bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {isLocked && (
        <div className="absolute top-4 right-4">
          <Lock className="w-5 h-5 text-muted-foreground" />
        </div>
      )}
      
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center mb-3",
            styles.iconBg
          )}>
            <Icon className={cn("w-5 h-5", styles.iconColor)} />
          </div>
          
          <div className="mb-2">
            <h3 className="text-base font-brush font-bold text-foreground">{title}</h3>
            <p className="text-xl font-japanese text-foreground/40">{japanese}</p>
          </div>
          
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">{description}</p>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium">{completedLessons}/{totalLessons} scrolls</span>
            <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
          </div>
        </div>
        
        <ProgressRing progress={progress} size={56} strokeWidth={4} variant={styles.ringVariant}>
          <span className="text-xs font-brush font-bold text-foreground">{progress}%</span>
        </ProgressRing>
      </div>
    </button>
  );
}
