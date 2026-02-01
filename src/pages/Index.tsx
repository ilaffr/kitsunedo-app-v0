import { useState } from "react";
import { BookOpen, Languages, PenTool, BookText, MessageSquare, Flame, Star, Clock } from "lucide-react";
import { Header } from "@/components/header";
import { Navigation } from "@/components/navigation";
import { DailyGoalCard } from "@/components/daily-goal-card";
import { StudyCategoryCard } from "@/components/study-category-card";
import { QuickReviewCard } from "@/components/quick-review-card";
import { StatsCard } from "@/components/stats-card";
import { LessonCard } from "@/components/lesson-card";
import { HeroBanner } from "@/components/hero-banner";

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
          <div className="container max-w-6xl px-4 py-4 md:py-6">
            {/* Hero Banner */}
            <HeroBanner />

            {/* Stats Row */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
              <StatsCard
                icon={Flame}
                label="Fire Streak"
                value={12}
                sublabel="days"
                variant="golden"
              />
              <StatsCard
                icon={Star}
                label="Spirit XP"
                value="2,450"
                sublabel="earned"
                variant="cherry"
              />
              <StatsCard
                icon={BookOpen}
                label="Lessons"
                value={45}
                sublabel="completed"
              />
              <StatsCard
                icon={Clock}
                label="Training"
                value="24h"
                sublabel="this moon"
              />
            </section>

            {/* Quick Review */}
            <section className="mb-6 md:mb-8">
              <QuickReviewCard itemsToReview={23} />
            </section>

            {/* Main Grid */}
            <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
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
                <div className="card-atmospheric p-5 md:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base md:text-lg font-title font-semibold text-foreground">Continue Journey</h3>
                    <button className="text-xs md:text-sm text-primary font-medium hover:underline">
                      View all
                    </button>
                  </div>
                  
                  <div className="space-y-2 md:space-y-3">
                    {recentLessons.map((lesson, index) => (
                      <LessonCard key={index} {...lesson} />
                    ))}
                  </div>
                </div>
              </section>
            </div>

            {/* Study Categories */}
            <section className="mt-6 md:mt-8">
              <h3 className="text-lg md:text-xl font-title font-semibold text-foreground mb-4">Training Grounds</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
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
