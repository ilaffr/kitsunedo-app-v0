import { useNavigate } from "react-router-dom";
import { ArrowLeft, Flame, Star, BookOpen, Clock, Target, Zap } from "lucide-react";
import { Header } from "@/components/header";
import { StatsCard } from "@/components/stats-card";
import { WeeklyXPChart } from "@/components/weekly-xp-chart";
import { JlptHistoryChart } from "@/components/jlpt-history-chart";
import { useStreak, usePracticeSession, useWeeklyXP, useOverallStats, useAllLessonProgress } from "@/hooks/use-user-data";
import { useState, useEffect } from "react";

export default function Stats() {
  const navigate = useNavigate();
  const { streak } = useStreak();
  const { getTodayXP } = usePracticeSession();
  const { days, weekTotal } = useWeeklyXP();
  const { totalXP, sessionsCount, completedLessons } = useOverallStats();
  const { lessons: progressList } = useAllLessonProgress();
  const [todayXP, setTodayXP] = useState(0);

  useEffect(() => {
    getTodayXP().then(setTodayXP);
  }, [getTodayXP]);

  const avgScore = progressList.length > 0
    ? Math.round(progressList.reduce((s, l) => s + (l.bestScore ?? 0), 0) / progressList.length)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-2xl px-4 py-6 pb-24">
        {/* Top bar */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate("/")} className="p-2 rounded-sm hover:bg-foreground/5 transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" strokeWidth={1.5} />
          </button>
          <div>
            <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">Training Statistics</p>
            <h1 className="text-2xl serif-jp font-medium text-foreground tracking-wide">修行の記録</h1>
          </div>
        </div>

        {/* Stats grid */}
        <section className="grid grid-cols-2 gap-3 mb-6">
          <StatsCard icon={Flame} label="Streak" value={`${streak.currentStreak}日`} sublabel="current streak" variant="vermillion" />
          <StatsCard icon={Star} label="Total XP" value={totalXP.toLocaleString()} sublabel="all time" variant="ink" />
          <StatsCard icon={Zap} label="Today" value={`${todayXP} XP`} sublabel="earned today" />
          <StatsCard icon={Clock} label="Week" value={`${weekTotal} XP`} sublabel="this week" />
          <StatsCard icon={BookOpen} label="Lessons" value={completedLessons} sublabel="completed" />
          <StatsCard icon={Target} label="Sessions" value={sessionsCount} sublabel="total practices" />
        </section>

        {/* Extra stats */}
        <section className="grid grid-cols-2 gap-3 mb-6">
          <div className="washi-card p-5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.25em] mb-1.5">Longest Streak</p>
            <p className="text-2xl serif-jp font-medium text-foreground">{streak.longestStreak}日</p>
          </div>
          <div className="washi-card p-5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.25em] mb-1.5">Avg Score</p>
            <p className="text-2xl serif-jp font-medium text-foreground">{avgScore}%</p>
          </div>
        </section>

        {/* Full weekly chart */}
        <section className="mb-6">
          <WeeklyXPChart days={days} weekTotal={weekTotal} />
        </section>

        {/* JLPT history */}
        <section>
          <JlptHistoryChart />
        </section>
      </main>
    </div>
  );
}
