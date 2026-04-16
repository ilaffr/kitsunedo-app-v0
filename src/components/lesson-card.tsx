import { cn } from "@/lib/utils";
import { Check, Lock, Play } from "lucide-react";

interface LessonCardProps {
  title: string;
  japanese?: string;
  lessonNumber: number;
  status: "locked" | "available" | "in-progress" | "completed";
  xpReward: number;
  difficulty?: "easy" | "medium" | "hard";
  onClick?: () => void;
}

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
        "group w-full p-3 md:p-4 text-left transition-all duration-300 relative",
        "border-b border-foreground/10 last:border-b-0",
        isLocked && "opacity-40 cursor-not-allowed",
        !isLocked && "hover:bg-foreground/[0.03]"
      )}
    >
      {/* Vermillion ginkgo dot for in-progress */}
      {isInProgress && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary" />
      )}

      <div className="flex items-center gap-3 md:gap-4 pl-2">
        {/* Lesson seal */}
        <div
          className={cn(
            "w-10 h-10 md:w-11 md:h-11 flex items-center justify-center serif-jp font-medium text-lg shrink-0 transition-all",
            isCompleted && "bg-foreground text-background",
            isInProgress && "bg-primary text-primary-foreground shadow-[0_2px_8px_hsl(var(--primary)/0.3)]",
            !isLocked && status === "available" && "border border-foreground/30 text-foreground group-hover:border-foreground",
            isLocked && "border border-foreground/20 text-muted-foreground"
          )}
        >
          {isLocked ? <Lock className="w-4 h-4" strokeWidth={1.5} /> :
           isCompleted ? <Check className="w-5 h-5" strokeWidth={2} /> :
           isInProgress ? <Play className="w-4 h-4" fill="currentColor" /> :
           <span>{lessonNumber}</span>}
        </div>

        {/* Lesson info */}
        <div className="flex-1 min-w-0">
          <h4 className="serif-jp font-medium text-foreground truncate tracking-wide">{title}</h4>
          {japanese && (
            <p className="text-base font-japanese text-muted-foreground truncate">{japanese}</p>
          )}
        </div>

        {/* Right side — XP & difficulty */}
        <div className="flex flex-col items-end gap-0.5 shrink-0">
          <div className="flex items-center gap-1 text-xs serif-jp text-primary tracking-wider">
            <span>+{xpReward}</span>
          </div>
          <span className="text-[10px] font-japanese text-muted-foreground tracking-widest">
            {difficultyLabels[difficulty]}
          </span>
        </div>
      </div>
    </button>
  );
}
