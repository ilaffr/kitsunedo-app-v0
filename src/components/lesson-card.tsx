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
  locked: "opacity-50 cursor-not-allowed bg-muted",
  available: "card-interactive bg-card hover:border-primary/50",
  "in-progress": "card-interactive bg-primary/5 border-primary/30",
  completed: "card-interactive bg-success/5 border-success/30",
};

const difficultyColors = {
  easy: "bg-success/15 text-success",
  medium: "bg-warning/15 text-warning",
  hard: "bg-destructive/15 text-destructive",
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
        "w-full p-4 rounded-2xl border text-left transition-all duration-300",
        statusStyles[status]
      )}
    >
      <div className="flex items-center gap-4">
        {/* Lesson number / status icon */}
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg",
          isLocked && "bg-muted-foreground/20 text-muted-foreground",
          isCompleted && "bg-success text-success-foreground",
          isInProgress && "bg-gradient-primary text-primary-foreground",
          status === "available" && "bg-muted text-foreground"
        )}>
          {isLocked ? <Lock className="w-5 h-5" /> : 
           isCompleted ? <Check className="w-5 h-5" /> :
           isInProgress ? <Play className="w-5 h-5" /> :
           lessonNumber}
        </div>
        
        {/* Lesson info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground truncate">{title}</h4>
          {japanese && (
            <p className="text-lg font-japanese text-muted-foreground">{japanese}</p>
          )}
        </div>
        
        {/* Right side info */}
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1 text-sm font-medium text-primary">
            <Star className="w-4 h-4 fill-primary" />
            <span>+{xpReward} XP</span>
          </div>
          <span className={cn(
            "text-xs px-2 py-0.5 rounded-full font-medium",
            difficultyColors[difficulty]
          )}>
            {difficulty}
          </span>
        </div>
      </div>
    </button>
  );
}
