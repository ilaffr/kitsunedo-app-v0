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
    ? "素晴らしい! You completed today's goal!" 
    : "Follow me on the path to mastery!";

  return (
    <div className="card-atmospheric p-5 md:p-6 animate-slide-up">
      <div className="flex items-start justify-between mb-5 md:mb-6">
        <div>
          <h2 className="text-lg font-title font-semibold text-foreground mb-1">Daily Journey</h2>
          <p className="text-sm text-muted-foreground">
            {isComplete ? "Your spirit grows stronger! 🌸" : "The path awaits, warrior"}
          </p>
        </div>
        
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/15 rounded-full border border-primary/30">
          <Flame className="w-4 h-4 text-primary animate-pulse-glow" />
          <span className="text-sm font-semibold text-primary">{streak} days</span>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 mb-5 md:mb-6">
        <ProgressRing progress={progress} size={130} strokeWidth={10} variant="golden">
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-bold text-foreground">{currentXP}</p>
            <p className="text-xs md:text-sm text-muted-foreground">/ {goalXP} XP</p>
          </div>
        </ProgressRing>
        
        <div className="flex-1 w-full space-y-3 md:space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-success/15 flex items-center justify-center border border-success/30">
              <Target className="w-4 h-4 md:w-5 md:h-5 text-success" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-muted-foreground">Today's Progress</p>
              <p className="font-semibold text-foreground">{Math.round(progress)}% complete</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-accent/15 flex items-center justify-center border border-accent/30">
              <Clock className="w-4 h-4 md:w-5 md:h-5 text-accent" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-muted-foreground">Study Time</p>
              <p className="font-semibold text-foreground">{studyTime} minutes today</p>
            </div>
          </div>
        </div>
      </div>

      {/* Fox Mascot */}
      <div className="mb-5">
        <FoxMascot size="sm" message={foxMessage} />
      </div>
      
      <Button 
        onClick={onStartStudy}
        className="w-full h-11 md:h-12 text-sm md:text-base font-semibold btn-golden text-primary-foreground hover:opacity-90 transition-opacity"
      >
        {isComplete ? "Continue Your Journey" : "Begin Today's Training"}
      </Button>
    </div>
  );
}
