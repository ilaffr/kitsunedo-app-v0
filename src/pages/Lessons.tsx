import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mountain } from "lucide-react";
import { Header } from "@/components/header";
import { LessonRow } from "@/components/lessons/lesson-row";
import { KanaPrimerCard } from "@/components/lessons/kana-primer-card";
import { minnaLessons } from "@/data/minna-lessons";
import { useAllLessonProgress, useLessonProgress } from "@/hooks/use-user-data";
import { KANA_PRIMER_LESSON_ID } from "@/data/kana-data";
import { cn } from "@/lib/utils";

const difficultyLabelsJp: Record<string, string> = {
  beginner: "入門",
  elementary: "初級",
  intermediate: "中級",
};

export default function Lessons() {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | "beginner" | "elementary" | "intermediate">("all");
  const { lessons: progressList } = useAllLessonProgress();
  const { progress: kanaProgress } = useLessonProgress(KANA_PRIMER_LESSON_ID);
  const kanaCleared = kanaProgress?.completed ?? false;
  const progressMap = new Map(progressList.map((p) => [p.lessonId, p]));

  const filtered = filter === "all" ? minnaLessons : minnaLessons.filter((l) => l.difficulty === filter);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-2xl px-4 py-6 pb-24">
        {/* Top bar */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate("/")} className="p-2 rounded-sm hover:bg-foreground/5 transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" strokeWidth={1.5} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">Minna no Nihongo</p>
            <h1 className="text-2xl serif-jp font-medium text-foreground tracking-wide truncate">みんなの日本語</h1>
          </div>
          <button
            onClick={() => navigate("/journey")}
            className="text-[10px] uppercase tracking-[0.2em] px-3 py-2 text-foreground/70 hover:text-foreground border-b border-foreground/30 hover:border-foreground transition-colors flex items-center gap-1.5"
            title="Yokai Journey map"
          >
            <Mountain className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span className="hidden sm:inline">Journey</span>
          </button>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {(["all", "beginner", "elementary", "intermediate"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] whitespace-nowrap transition-colors border-b",
                filter === f
                  ? "text-foreground border-foreground"
                  : "text-muted-foreground border-transparent hover:text-foreground hover:border-foreground/30",
              )}
            >
              {f === "all" ? "All" : `${difficultyLabelsJp[f]} · ${f}`}
            </button>
          ))}
        </div>

        {/* Kana primer card — always shown at the top */}
        <KanaPrimerCard
          cleared={kanaCleared}
          bestScore={kanaProgress?.bestScore}
          onClick={() => navigate("/lesson/kana")}
        />

        {/* Lesson list */}
        <div className="space-y-2">
          {filtered.map((lesson) => {
            const prog = progressMap.get(`lesson_${lesson.id}`);
            const kanaLocked = lesson.id === 1 && !kanaCleared;
            return (
              <LessonRow
                key={lesson.id}
                lesson={lesson}
                completed={prog?.completed ?? false}
                bestScore={prog?.bestScore ?? null}
                expanded={expandedId === lesson.id}
                kanaLocked={kanaLocked}
                onToggle={() => setExpandedId(expandedId === lesson.id ? null : lesson.id)}
                onStart={() => {
                  if (kanaLocked) {
                    navigate("/lesson/kana");
                    return;
                  }
                  if (lesson.id <= 10) navigate(`/lesson/${lesson.id}`);
                }}
              />
            );
          })}
        </div>
      </main>
    </div>
  );
}
