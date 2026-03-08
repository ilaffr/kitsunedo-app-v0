import { Flame, Target, Clock } from "lucide-react";
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
    ? "素晴らしい! Your spirit grows stronger." 
    : "The path reveals itself to those who walk it.";

  return (
    <div className="card-paper p-5 md:p-6 animate-fade-up">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-lg font-brush font-bold text-foreground mb-1">Daily Practice</h2>
          <p className="text-sm text-muted-foreground">
            {isComplete ? "Today's training complete 🌸" : "Honor demands dedication"}
          </p>
        </div>
        
        <div className="hanko-badge animate-stamp">
          <span className="text-sm">{streak}日</span>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row items-center gap-6 mb-5">
        <ProgressRing progress={progress} size={110} strokeWidth={7} variant="vermillion">
          <div className="text-center">
            <p className="text-2xl font-brush font-bold text-foreground">{currentXP}</p>
            <p className="text-xs text-muted-foreground">/ {goalXP}</p>
          </div>
        </ProgressRing>
        
        <div className="flex-1 w-full space-y-2.5">
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
            <Target className="w-5 h-5 text-success" />
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Progress</p>
              <p className="text-sm font-brush font-bold text-foreground">{Math.round(progress)}% mastered</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
            <Clock className="w-5 h-5 text-primary" />
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Training</p>
              <p className="text-sm font-brush font-bold text-foreground">{studyTime} minutes</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-5">
        <FoxMascot size="sm" message={foxMessage} />
      </div>
      
      <Button 
        onClick={onStartStudy}
        className="w-full h-12 text-base font-brush font-bold btn-vermillion text-primary-foreground hover:opacity-90 transition-all rounded-xl"
      >
        {isComplete ? "Continue Training" : "Begin Practice"}
      </Button>
    </div>
  );
}
