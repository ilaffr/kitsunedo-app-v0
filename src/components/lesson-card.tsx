import { cn } from "@/lib/utils";
import { Check, Lock, Play, Circle } from "lucide-react";

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
  locked: "opacity-40 cursor-not-allowed bg-muted/30 border-border",
  available: "card-interactive bg-card border-border hover:border-foreground/30",
  "in-progress": "card-interactive bg-primary/5 border-primary/40",
  completed: "card-interactive bg-success/5 border-success/40",
};

const difficultyLabels = {
  easy: "初級",
  medium: "中級", 
  hard: "上級",
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
        "w-full p-3 md:p-4 rounded-sm border-2 text-left transition-all duration-300",
        statusStyles[status]
      )}
    >
      <div className="flex items-center gap-3 md:gap-4">
        {/* Lesson number with brush stroke style */}
        <div className={cn(
          "w-10 h-10 md:w-11 md:h-11 rounded-sm flex items-center justify-center font-brush font-bold text-lg border-2",
          isLocked && "bg-muted border-border text-muted-foreground",
          isCompleted && "bg-success border-success text-success-foreground",
          isInProgress && "bg-primary border-primary text-primary-foreground",
          status === "available" && "bg-card border-foreground/20 text-foreground"
        )}>
          {isLocked ? <Lock className="w-4 h-4" /> : 
           isCompleted ? <Check className="w-5 h-5" strokeWidth={3} /> :
           isInProgress ? <Play className="w-4 h-4" /> :
           <span className="font-japanese">{lessonNumber}</span>}
        </div>
        
        {/* Lesson info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-brush font-bold text-foreground truncate">{title}</h4>
          {japanese && (
            <p className="text-lg font-japanese text-muted-foreground">{japanese}</p>
          )}
        </div>
        
        {/* Right side - XP and difficulty */}
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1 text-sm font-brush font-bold text-primary">
            <Circle className="w-2 h-2 fill-primary" />
            <span>+{xpReward}</span>
          </div>
          <span className="text-xs font-japanese text-muted-foreground">
            {difficultyLabels[difficulty]}
          </span>
        </div>
      </div>
    </button>
  );
}
