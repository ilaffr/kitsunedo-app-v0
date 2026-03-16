import { cn } from "@/lib/utils";
import { Flame, ChevronRight } from "lucide-react";

interface DayXP {
  label: string;
  xp: number;
  isToday: boolean;
}

interface WeeklyXPMiniProps {
  days: DayXP[];
  weekTotal: number;
  onViewDetails?: () => void;
}

export function WeeklyXPMini({ days, weekTotal, onViewDetails }: WeeklyXPMiniProps) {
  const maxXP = Math.max(...days.map((d) => d.xp), 1);

  return (
    <button
      onClick={onViewDetails}
      className="card-interactive w-full p-3 md:p-4 border-2 text-left"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-brush font-bold text-foreground">Weekly</span>
        </div>
        <div className="flex items-center gap-1 text-xs font-brush text-primary">
          <span>{weekTotal} XP</span>
          <ChevronRight className="w-3 h-3" />
        </div>
      </div>

      {/* Mini bar chart */}
      <div className="flex items-end gap-1 h-10">
        {days.map((day, i) => {
          const heightPct = maxXP > 0 ? (day.xp / maxXP) * 100 : 0;
          return (
            <div key={i} className="flex-1 h-full flex items-end">
              <div
                className={cn(
                  "w-full rounded-t-sm min-h-[2px]",
                  day.isToday ? "bg-primary" : day.xp > 0 ? "bg-primary/40" : "bg-muted/60"
                )}
                style={{ height: `${Math.max(heightPct, 5)}%` }}
              />
            </div>
          );
        })}
      </div>
    </button>
  );
}

interface WeeklyXPChartProps {
  days: DayXP[];
  weekTotal: number;
}

export function WeeklyXPChart({ days, weekTotal }: WeeklyXPChartProps) {
  const maxXP = Math.max(...days.map((d) => d.xp), 1);

  return (
    <div className="card-paper p-5 md:p-6 border-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-brush font-bold text-foreground">Weekly Training</h3>
        <div className="flex items-center gap-1.5 text-sm font-brush text-primary">
          <Flame className="w-4 h-4" />
          <span>{weekTotal} XP</span>
        </div>
      </div>

      {/* Bar chart */}
      <div className="flex items-end justify-between gap-1.5 h-32 md:h-40">
        {days.map((day, i) => {
          const heightPct = maxXP > 0 ? (day.xp / maxXP) * 100 : 0;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <span className={cn(
                "text-[10px] font-bold serif-jp tabular-nums",
                day.xp > 0 ? "text-foreground" : "text-muted-foreground/50"
              )}>
                {day.xp > 0 ? day.xp : "·"}
              </span>

              <div className="w-full flex-1 flex items-end">
                <div
                  className={cn(
                    "w-full rounded-t-sm transition-all duration-500 min-h-[4px]",
                    day.isToday ? "bg-primary" : day.xp > 0 ? "bg-primary/40" : "bg-muted/60"
                  )}
                  style={{ height: `${Math.max(heightPct, 4)}%` }}
                />
              </div>

              <span className={cn(
                "text-[10px] font-bold uppercase serif-jp",
                day.isToday ? "text-primary" : "text-muted-foreground"
              )}>
                {day.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
