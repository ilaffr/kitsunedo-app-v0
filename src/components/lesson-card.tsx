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
  locked: "opacity-40 cursor-not-allowed bg-muted/30",
  available: "card-interactive bg-card hover:border-foreground/15",
  "in-progress": "card-interactive bg-primary/[0.03] border-primary/20",
  completed: "card-interactive bg-success/[0.03] border-success/20",
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
        "w-full p-3 md:p-4 rounded-xl border text-left transition-all duration-300",
        statusStyles[status]
      )}
    >
      <div className="flex items-center gap-3 md:gap-4">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center font-brush font-bold text-base flex-shrink-0",
          isLocked && "bg-muted text-muted-foreground",
          isCompleted && "bg-success text-success-foreground",
          isInProgress && "bg-primary text-primary-foreground",
          status === "available" && "bg-muted text-foreground"
        )}>
          {isLocked ? <Lock className="w-4 h-4" /> : 
           isCompleted ? <Check className="w-5 h-5" strokeWidth={3} /> :
           isInProgress ? <Play className="w-4 h-4" /> :
           <span className="font-japanese">{lessonNumber}</span>}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-brush font-bold text-foreground truncate text-sm">{title}</h4>
          {japanese && (
            <p className="text-base font-japanese text-muted-foreground">{japanese}</p>
          )}
        </div>
        
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1 text-sm font-brush font-bold text-primary">
            <Circle className="w-1.5 h-1.5 fill-primary" />
            <span>+{xpReward}</span>
          </div>
          <span className="text-[11px] font-japanese text-muted-foreground">
            {difficultyLabels[difficulty]}
          </span>
        </div>
      </div>
    </button>
  );
}
