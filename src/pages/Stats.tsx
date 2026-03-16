import { useNavigate } from "react-router-dom";
import { ArrowLeft, Flame, Star, BookOpen, Clock } from "lucide-react";
import { Header } from "@/components/header";
import { StatsCard } from "@/components/stats-card";
import { WeeklyXPChart } from "@/components/weekly-xp-chart";
import { useStreak, usePracticeSession, useWeeklyXP } from "@/hooks/use-user-data";
import { useState, useEffect } from "react";

export default function Stats() {
  const navigate = useNavigate();
  const { streak } = useStreak();
  const { getTodayXP } = usePracticeSession();
  const { days, weekTotal } = useWeeklyXP();
  const [todayXP, setTodayXP] = useState(0);

  useEffect(() => {
    getTodayXP().then(setTodayXP);
  }, [getTodayXP]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-2xl px-4 py-6 pb-24">
        {/* Top bar */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate("/")} className="p-2 rounded-sm hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-brush font-bold text-foreground">修行の記録</h1>
            <p className="text-xs text-muted-foreground serif-jp">Training Statistics</p>
          </div>
        </div>

        {/* Stats grid */}
        <section className="grid grid-cols-2 gap-3 mb-6">
          <StatsCard icon={Flame} label="Streak" value={`${streak.currentStreak}日`} sublabel="days of honor" variant="vermillion" />
          <StatsCard icon={Star} label="Today" value={`${todayXP} XP`} sublabel="earned today" variant="ink" />
          <StatsCard icon={BookOpen} label="Best" value={`${streak.longestStreak}日`} sublabel="longest streak" />
          <StatsCard icon={Clock} label="Week" value={`${weekTotal} XP`} sublabel="this week" />
        </section>

        {/* Full weekly chart */}
        <section>
          <WeeklyXPChart days={days} weekTotal={weekTotal} />
        </section>
      </main>
    </div>
  );
}
