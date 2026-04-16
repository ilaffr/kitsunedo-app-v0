import { Target, Clock } from "lucide-react";
import { ProgressRing } from "./ui/progress-ring";
import { Button } from "./ui/button";
import { FoxMascot } from "./fox-mascot";

interface DailyGoalCardProps {
  currentXP: number;
  goalXP: number;
  streak: number;
  studyTime: number;
  onStartStudy?: () => void;
}

export function DailyGoalCard({
  currentXP,
  goalXP,
  streak,
  studyTime,
  onStartStudy,
}: DailyGoalCardProps) {
  const progress = Math.min((currentXP / goalXP) * 100, 100);
  const isComplete = currentXP >= goalXP;

  const foxMessage = isComplete
    ? "素晴らしい. Your spirit grows stronger."
    : "The path reveals itself to those who walk it.";

  return (
    <div className="washi-card p-6 md:p-7 animate-fade-up relative overflow-hidden">
      {/* Decorative kanji watermark */}
      <span aria-hidden className="absolute -top-4 -right-4 serif-jp text-[7rem] leading-none text-foreground/[0.05] select-none pointer-events-none">
        道
      </span>

      <div className="flex items-start justify-between mb-6 relative">
        <div>
          <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground mb-1.5">
            Daily Practice
          </p>
          <h2 className="text-2xl serif-jp font-medium text-foreground tracking-wide">
            {isComplete ? "本日完了" : "今日の道"}
          </h2>
          <p className="text-xs text-muted-foreground mt-1 italic">
            {isComplete ? "Today's training is complete" : "Honor demands dedication"}
          </p>
        </div>

        {/* Hanko-style streak seal */}
        <div className="ginkgo-seal w-12 h-12 text-sm shrink-0">
          {streak}日
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6 mb-6 relative">
        <ProgressRing progress={progress} size={120} strokeWidth={5} variant="vermillion">
          <div className="text-center">
            <p className="text-2xl serif-jp font-medium text-foreground">{currentXP}</p>
            <p className="text-[10px] text-muted-foreground tracking-widest uppercase">/ {goalXP}</p>
          </div>
        </ProgressRing>

        <div className="flex-1 w-full space-y-3">
          <div className="flex items-center gap-3 py-2 border-b border-foreground/10">
            <Target className="w-4 h-4 text-foreground/60" strokeWidth={1.5} />
            <div className="flex-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.25em]">Progress</p>
              <p className="serif-jp text-foreground tracking-wide">{Math.round(progress)}% mastered</p>
            </div>
          </div>

          <div className="flex items-center gap-3 py-2">
            <Clock className="w-4 h-4 text-foreground/60" strokeWidth={1.5} />
            <div className="flex-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.25em]">Training</p>
              <p className="serif-jp text-foreground tracking-wide">{studyTime} minutes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Fox Mascot */}
      <div className="mb-5 relative">
        <FoxMascot size="sm" message={foxMessage} />
      </div>

      <Button
        onClick={onStartStudy}
        className="w-full h-12 text-sm tracking-[0.25em] uppercase serif-jp font-medium bg-foreground text-background hover:bg-foreground/90 transition-colors rounded-sm"
      >
        {isComplete ? "Continue Training" : "Begin Practice"}
      </Button>
    </div>
  );
}
