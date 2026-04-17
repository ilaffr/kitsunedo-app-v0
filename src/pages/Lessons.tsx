import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Lock, Check, Play, ChevronDown, ChevronUp, Mountain, Sparkles } from "lucide-react";
import { Header } from "@/components/header";
import { minnaLessons, type MinnaLesson } from "@/data/minna-lessons";
import { useAllLessonProgress, useLessonProgress } from "@/hooks/use-user-data";
import { KANA_PRIMER_LESSON_ID, KANA_PASS_THRESHOLD } from "@/data/kana-data";
import { cn } from "@/lib/utils";

const difficultyColors = {
  beginner: "bg-success/10 text-success border-success/30",
  elementary: "bg-primary/10 text-primary border-primary/30",
  intermediate: "bg-accent/10 text-accent-foreground border-accent/30",
};

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

  const filtered = filter === "all" ? minnaLessons : minnaLessons.filter(l => l.difficulty === filter);

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
                  : "text-muted-foreground border-transparent hover:text-foreground hover:border-foreground/30"
              )}
            >
              {f === "all" ? "All" : `${difficultyLabelsJp[f]} · ${f}`}
            </button>
          ))}
        </div>

        {/* Kana primer card — always shown at the top */}
        <button
          onClick={() => navigate("/lesson/kana")}
          className={cn(
            "w-full mb-3 card-paper border-2 p-4 flex items-center gap-3 text-left transition-colors",
            kanaCleared
              ? "border-success/40 hover:border-success/70"
              : "border-primary/40 hover:border-primary/70",
          )}
        >
          <span className="text-3xl">{kanaCleared ? "🎌" : "✍️"}</span>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Prerequisite · 入門前
            </p>
            <h3 className="font-brush font-bold text-foreground text-sm">
              かな入門 — Hiragana &amp; Katakana primer
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {kanaCleared
                ? `Cleared${kanaProgress?.bestScore != null ? ` · best ${kanaProgress.bestScore}%` : ""} — Lesson 1 unlocked`
                : `Pass the ${KANA_PASS_THRESHOLD}% knowledge check to unlock Lesson 1 (or skip)`}
            </p>
          </div>
          {kanaCleared ? (
            <Check className="w-5 h-5 text-success" strokeWidth={3} />
          ) : (
            <Sparkles className="w-5 h-5 text-primary" />
          )}
        </button>

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

function LessonRow({
  lesson,
  completed,
  bestScore,
  expanded,
  onToggle,
  onStart,
}: {
  lesson: MinnaLesson;
  completed: boolean;
  bestScore: number | null;
  expanded: boolean;
  onToggle: () => void;
  onStart: () => void;
}) {
  const available = lesson.id <= 10;

  return (
    <div className={cn("border-2 rounded-sm transition-colors", expanded ? "border-foreground/30" : "border-border")}>
      <button onClick={onToggle} className="w-full p-3 md:p-4 text-left flex items-center gap-3">
        {/* Number / Status */}
        <div className={cn(
          "w-9 h-9 rounded-sm flex items-center justify-center font-brush font-bold text-sm border-2 shrink-0",
          completed ? "bg-success border-success text-success-foreground" :
          available ? "bg-primary border-primary text-primary-foreground" : "bg-muted border-border text-muted-foreground"
        )}>
          {completed ? <Check className="w-4 h-4" strokeWidth={3} /> :
           available ? <Play className="w-3.5 h-3.5" /> : lesson.id}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-brush font-bold text-foreground text-sm truncate">
              第{lesson.id}課 — {lesson.title}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground serif-jp truncate">
            {lesson.titleJp} · {lesson.theme}
            {completed && bestScore != null && ` · ${bestScore}%`}
          </p>
        </div>

        {/* Badge + chevron */}
        <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm border shrink-0", difficultyColors[lesson.difficulty])}>
          {difficultyLabelsJp[lesson.difficulty]}
        </span>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>

      {expanded && (
        <div className="px-3 md:px-4 pb-4 space-y-3 border-t border-border pt-3">
          {/* Grammar */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5 serif-jp">Grammar 文法</h4>
            <div className="flex flex-wrap gap-1.5">
              {lesson.grammarPoints.map((g, i) => (
                <span key={i} className="text-xs px-2 py-1 rounded-sm bg-primary/10 text-primary border border-primary/20 font-japanese">
                  {g}
                </span>
              ))}
            </div>
          </div>

          {/* Vocab themes */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5 serif-jp">Vocabulary 語彙</h4>
            <div className="flex flex-wrap gap-1.5">
              {lesson.vocabThemes.map((v, i) => (
                <span key={i} className="text-xs px-2 py-1 rounded-sm bg-muted text-foreground border border-border">
                  {v}
                </span>
              ))}
            </div>
          </div>

          {/* Key expressions */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5 serif-jp">Key Expressions 重要表現</h4>
            <div className="flex flex-wrap gap-1.5">
              {lesson.keyExpressions.map((k, i) => (
                <span key={i} className="text-xs px-2 py-1 rounded-sm bg-success/10 text-success border border-success/20 font-japanese">
                  {k}
                </span>
              ))}
            </div>
          </div>

          {/* Start button */}
          {available && (
            <button
              onClick={onStart}
              className="w-full py-2.5 rounded-sm border-2 font-bold serif-jp text-sm btn-ink text-background border-foreground mt-1 transition-opacity"
            >
              入門 — Start Lesson
            </button>
          )}
          {!available && (
            <p className="text-xs text-muted-foreground serif-jp flex items-center gap-1.5 mt-1">
              <Lock className="w-3 h-3" /> Coming soon — lesson content under development
            </p>
          )}
        </div>
      )}
    </div>
  );
}
