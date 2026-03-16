import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Languages, PenTool, BookText, MessageSquare, Flame, Star, Clock } from "lucide-react";
import { Header } from "@/components/header";
import { Navigation } from "@/components/navigation";
import { DailyGoalCard } from "@/components/daily-goal-card";
import { StudyCategoryCard } from "@/components/study-category-card";
import { QuickReviewCard } from "@/components/quick-review-card";
import { StatsCard } from "@/components/stats-card";
import { LessonCard } from "@/components/lesson-card";
import { HeroBanner } from "@/components/hero-banner";
import { RecentSpiritsPreview } from "@/components/recent-spirits-preview";
import { useStreak, usePracticeSession, useAllLessonProgress, useWeeklyXP, useOverallStats } from "@/hooks/use-user-data";
import { minnaLessons } from "@/data/minna-lessons";
import { WeeklyXPMini } from "@/components/weekly-xp-chart";

const studyCategories = [
  {
    title: "Hiragana",
    japanese: "ひらがな",
    description: "Master the flowing brush strokes of the basic syllabary",
    icon: PenTool,
    progress: 85,
    totalLessons: 12,
    completedLessons: 10,
    variant: "hiragana" as const,
  },
  {
    title: "Katakana",
    japanese: "カタカナ",
    description: "Learn the angular script for foreign words",
    icon: Languages,
    progress: 60,
    totalLessons: 12,
    completedLessons: 7,
    variant: "katakana" as const,
  },
  {
    title: "Kanji",
    japanese: "漢字",
    description: "Study the ancient characters of wisdom",
    icon: BookText,
    progress: 25,
    totalLessons: 50,
    completedLessons: 12,
    variant: "kanji" as const,
    href: "/kanji-writing",
  },
  {
    title: "Vocabulary",
    japanese: "語彙",
    description: "Build your arsenal of words",
    icon: BookOpen,
    progress: 40,
    totalLessons: 30,
    completedLessons: 12,
    variant: "vocabulary" as const,
    href: "/flashcards",
  },
  {
    title: "Grammar",
    japanese: "文法",
    description: "Understand the structure of the language",
    icon: MessageSquare,
    progress: 15,
    totalLessons: 25,
    completedLessons: 4,
    variant: "grammar" as const,
    isLocked: true,
  },
];

export default function Index() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("home");
  const { streak } = useStreak();
  const { getTodayXP } = usePracticeSession();
  const { lessons: progressList } = useAllLessonProgress();
  const { days, weekTotal } = useWeeklyXP();
  const { totalXP, sessionsCount, completedLessons } = useOverallStats();
  const [todayXP, setTodayXP] = useState(0);

  useEffect(() => {
    getTodayXP().then(setTodayXP);
  }, [getTodayXP]);

  const progressMap = useMemo(
    () => new Map(progressList.map((p) => [p.lessonId, p])),
    [progressList]
  );

  const continueLessons = useMemo(() => {
    const first10 = minnaLessons.slice(0, 10);
    return first10.map((l) => {
      const prog = progressMap.get(`lesson_${l.id}`);
      const completed = prog?.completed ?? false;
      // Find the first non-completed lesson to mark as in-progress
      const firstIncomplete = first5.find(
        (x) => !(progressMap.get(`lesson_${x.id}`)?.completed)
      );
      let status: "completed" | "in-progress" | "available" | "locked";
      if (completed) status = "completed";
      else if (firstIncomplete?.id === l.id) status = "in-progress";
      else if (l.id <= (firstIncomplete?.id ?? 1)) status = "available";
      else status = "available";
      return {
        title: l.title,
        japanese: l.titleJp,
        lessonNumber: l.id,
        status,
        xpReward: 20 + l.id * 5,
        difficulty: (l.difficulty === "beginner" ? "easy" : l.difficulty === "elementary" ? "medium" : "hard") as "easy" | "medium" | "hard",
      };
    });
  }, [progressMap]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        
        <main className="flex-1 pb-20 md:pb-8">
          <div className="container max-w-6xl px-4 py-4 md:py-6">
            {/* Hero Banner */}
            <HeroBanner />

            {/* Stats Row */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 md:mb-8">
              <StatsCard
                icon={Flame}
                label="Streak"
                value={`${streak.currentStreak}日`}
                sublabel="days of honor"
                variant="vermillion"
              />
              <StatsCard
                icon={Star}
                label="Spirit"
                value={totalXP.toLocaleString()}
                sublabel="total XP"
                variant="ink"
              />
              <StatsCard
                icon={BookOpen}
                label="Scrolls"
                value={completedLessons}
                sublabel="completed"
              />
              <StatsCard
                icon={Clock}
                label="Sessions"
                value={sessionsCount}
                sublabel="practices"
              />
            </section>

            {/* Quick Review */}
            <section className="mb-6 md:mb-8">
              <QuickReviewCard itemsToReview={23} />
            </section>

            {/* Weekly XP Mini */}
            <section className="mb-6 md:mb-8">
              <WeeklyXPMini days={days} weekTotal={weekTotal} onViewDetails={() => navigate("/stats")} />
            </section>

            <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
              {/* Daily Goal */}
              <section>
              <DailyGoalCard
                  currentXP={todayXP}
                  goalXP={100}
                  streak={streak.currentStreak}
                  studyTime={15}
                  onStartStudy={() => navigate("/daily-practice")}
                />
              </section>

              {/* Continue Learning */}
              <section>
                <div className="card-paper p-5 md:p-6 border-2">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-brush font-bold text-foreground">Continue Path</h3>
                    <button
                      className="text-sm text-primary font-brush hover:underline"
                      onClick={() => navigate("/lessons")}
                    >
                      View all
                    </button>
                  </div>
                  
                  <div className="space-y-2 md:space-y-3">
                    {continueLessons.map((lesson, index) => (
                      <LessonCard key={index} {...lesson} onClick={() => navigate(`/lesson/${lesson.lessonNumber}`)} />
                    ))}
                  </div>
                </div>
              </section>
            </div>

            {/* Study Categories */}
            <section className="mt-6 md:mt-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-6 bg-primary rounded-full" />
                <h3 className="text-xl font-brush font-bold text-foreground">Training Grounds</h3>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {studyCategories.map((category, index) => (
                  <StudyCategoryCard key={index} {...category} onClick={() => navigate((category as any).href ?? "/lesson/1")} />
                ))}
              </div>
            </section>

            {/* Spirit Bestiary Preview */}
            <section className="mt-6 md:mt-8">
              <RecentSpiritsPreview />
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
