import { useState } from "react";
import { BookOpen, Languages, PenTool, BookText, MessageSquare, Flame, Star, Clock } from "lucide-react";
import { Header } from "@/components/header";
import { Navigation } from "@/components/navigation";
import { DailyGoalCard } from "@/components/daily-goal-card";
import { StudyCategoryCard } from "@/components/study-category-card";
import { QuickReviewCard } from "@/components/quick-review-card";
import { StatsCard } from "@/components/stats-card";
import { LessonCard } from "@/components/lesson-card";

const studyCategories = [
  {
    title: "Hiragana",
    japanese: "ひらがな",
    description: "Master the basic Japanese syllabary with 46 characters",
    icon: PenTool,
    progress: 85,
    totalLessons: 12,
    completedLessons: 10,
    variant: "hiragana" as const,
  },
  {
    title: "Katakana",
    japanese: "カタカナ",
    description: "Learn the script used for foreign words and emphasis",
    icon: Languages,
    progress: 60,
    totalLessons: 12,
    completedLessons: 7,
    variant: "katakana" as const,
  },
  {
    title: "Kanji",
    japanese: "漢字",
    description: "Study Japanese characters derived from Chinese",
    icon: BookText,
    progress: 25,
    totalLessons: 50,
    completedLessons: 12,
    variant: "kanji" as const,
  },
  {
    title: "Vocabulary",
    japanese: "語彙",
    description: "Build your word knowledge for everyday conversation",
    icon: BookOpen,
    progress: 40,
    totalLessons: 30,
    completedLessons: 12,
    variant: "vocabulary" as const,
  },
  {
    title: "Grammar",
    japanese: "文法",
    description: "Understand sentence structure and patterns",
    icon: MessageSquare,
    progress: 15,
    totalLessons: 25,
    completedLessons: 4,
    variant: "grammar" as const,
    isLocked: true,
  },
];

const recentLessons = [
  {
    title: "Basic Greetings",
    japanese: "あいさつ",
    lessonNumber: 1,
    status: "completed" as const,
    xpReward: 25,
    difficulty: "easy" as const,
  },
  {
    title: "Numbers 1-10",
    japanese: "数字",
    lessonNumber: 2,
    status: "completed" as const,
    xpReward: 30,
    difficulty: "easy" as const,
  },
  {
    title: "Self Introduction",
    japanese: "自己紹介",
    lessonNumber: 3,
    status: "in-progress" as const,
    xpReward: 35,
    difficulty: "medium" as const,
  },
  {
    title: "Daily Routines",
    japanese: "日課",
    lessonNumber: 4,
    status: "available" as const,
    xpReward: 40,
    difficulty: "medium" as const,
  },
  {
    title: "Shopping Phrases",
    japanese: "買い物",
    lessonNumber: 5,
    status: "locked" as const,
    xpReward: 45,
    difficulty: "hard" as const,
  },
];

export default function Index() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        
        <main className="flex-1 pb-20 md:pb-8">
          <div className="container max-w-6xl px-4 py-6 md:py-8">
            {/* Welcome Section */}
            <section className="mb-8 animate-slide-up">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Welcome back, <span className="text-gradient-primary">Learner</span>! 👋
              </h2>
              <p className="text-muted-foreground">
                Ready to continue your Japanese learning journey?
              </p>
            </section>

            {/* Stats Row */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatsCard
                icon={Flame}
                label="Current Streak"
                value={12}
                sublabel="days"
                variant="primary"
              />
              <StatsCard
                icon={Star}
                label="Total XP"
                value="2,450"
                sublabel="earned"
                variant="success"
              />
              <StatsCard
                icon={BookOpen}
                label="Lessons"
                value={45}
                sublabel="completed"
              />
              <StatsCard
                icon={Clock}
                label="Study Time"
                value="24h"
                sublabel="this month"
              />
            </section>

            {/* Quick Review */}
            <section className="mb-8">
              <QuickReviewCard itemsToReview={23} />
            </section>

            {/* Main Grid */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Column - Daily Goal */}
              <section>
                <DailyGoalCard
                  currentXP={65}
                  goalXP={100}
                  streak={12}
                  studyTime={15}
                />
              </section>

              {/* Right Column - Continue Learning */}
              <section>
                <div className="card-elevated p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground">Continue Learning</h3>
                    <button className="text-sm text-primary font-medium hover:underline">
                      View all
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {recentLessons.map((lesson, index) => (
                      <LessonCard key={index} {...lesson} />
                    ))}
                  </div>
                </div>
              </section>
            </div>

            {/* Study Categories */}
            <section className="mt-8">
              <h3 className="text-xl font-semibold text-foreground mb-4">Study Categories</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {studyCategories.map((category, index) => (
                  <StudyCategoryCard key={index} {...category} />
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
