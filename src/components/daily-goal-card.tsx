import { Flame, Target, Clock } from "lucide-react";
import { ProgressRing } from "./ui/progress-ring";
import { Button } from "./ui/button";

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

  return (
    <div className="card-elevated p-6 animate-slide-up">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-1">Daily Goal</h2>
          <p className="text-sm text-muted-foreground">
            {isComplete ? "Goal completed! 🎉" : "Keep going, you're doing great!"}
          </p>
        </div>
        
        <div className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 rounded-full">
          <Flame className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-primary">{streak} day streak</span>
        </div>
      </div>
      
      <div className="flex items-center gap-8 mb-6">
        <ProgressRing progress={progress} size={140} strokeWidth={10}>
          <div className="text-center">
            <p className="text-3xl font-bold text-foreground">{currentXP}</p>
            <p className="text-sm text-muted-foreground">/ {goalXP} XP</p>
          </div>
        </ProgressRing>
        
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/15 flex items-center justify-center">
              <Target className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Today's Progress</p>
              <p className="font-semibold text-foreground">{Math.round(progress)}% complete</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
              <Clock className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Study Time</p>
              <p className="font-semibold text-foreground">{studyTime} minutes today</p>
            </div>
          </div>
        </div>
      </div>
      
      <Button 
        onClick={onStartStudy}
        className="w-full h-12 text-base font-semibold bg-gradient-primary hover:opacity-90 btn-primary-glow"
      >
        {isComplete ? "Continue Learning" : "Start Today's Lesson"}
      </Button>
    </div>
  );
}
