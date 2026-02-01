import { cn } from "@/lib/utils";
import { Check, Lock, Play, Star } from "lucide-react";

interface LessonCardProps {
  title: string;
  japanese?: string;
  lessonNumber: number;
  status: "locked" | "available" | "in-progress" | "completed";
  xpReward: number;
  difficulty?: "easy" | "medium" | "hard";
  onClick?: () => void;
}

const statusStyles = {
  locked: "opacity-40 cursor-not-allowed bg-muted/50 border-border",
  available: "card-interactive bg-card border-border hover:border-primary/40",
  "in-progress": "card-interactive bg-primary/10 border-primary/40",
  completed: "card-interactive bg-success/10 border-success/40",
};

const difficultyColors = {
  easy: "bg-success/20 text-success border-success/30",
  medium: "bg-warning/20 text-warning border-warning/30",
  hard: "bg-destructive/20 text-destructive border-destructive/30",
};

export function LessonCard({
  title,
  japanese,
  lessonNumber,
  status,
  xpReward,
  difficulty = "easy",
  onClick,
}: LessonCardProps) {
  const isLocked = status === "locked";
  const isCompleted = status === "completed";
  const isInProgress = status === "in-progress";

  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className={cn(
        "w-full p-3 md:p-4 rounded-xl border text-left transition-all duration-300",
        statusStyles[status]
      )}
    >
      <div className="flex items-center gap-3 md:gap-4">
        {/* Lesson number / status icon */}
        <div className={cn(
          "w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center font-bold text-base md:text-lg border",
          isLocked && "bg-muted border-border text-muted-foreground",
          isCompleted && "bg-success border-success/50 text-success-foreground",
          isInProgress && "btn-golden border-primary/50 text-primary-foreground",
          status === "available" && "bg-secondary border-border text-secondary-foreground"
        )}>
          {isLocked ? <Lock className="w-4 h-4 md:w-5 md:h-5" /> : 
           isCompleted ? <Check className="w-4 h-4 md:w-5 md:h-5" /> :
           isInProgress ? <Play className="w-4 h-4 md:w-5 md:h-5" /> :
           lessonNumber}
        </div>
        
        {/* Lesson info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground truncate text-sm md:text-base">{title}</h4>
          {japanese && (
            <p className="text-base md:text-lg font-japanese text-muted-foreground">{japanese}</p>
          )}
        </div>
        
        {/* Right side info */}
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1 text-xs md:text-sm font-medium text-primary">
            <Star className="w-3 h-3 md:w-4 md:h-4 fill-primary" />
            <span>+{xpReward}</span>
          </div>
          <span className={cn(
            "text-[10px] md:text-xs px-2 py-0.5 rounded-full font-medium border",
            difficultyColors[difficulty]
          )}>
            {difficulty}
          </span>
        </div>
      </div>
    </button>
  );
}
