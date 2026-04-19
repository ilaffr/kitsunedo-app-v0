import { Lock, Check, Play, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MinnaLesson } from "@/data/minna-lessons";

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

export interface LessonRowProps {
  lesson: MinnaLesson;
  completed: boolean;
  bestScore: number | null;
  expanded: boolean;
  kanaLocked?: boolean;
  onToggle: () => void;
  onStart: () => void;
}

export function LessonRow({
  lesson,
  completed,
  bestScore,
  expanded,
  kanaLocked,
  onToggle,
  onStart,
}: LessonRowProps) {
  const available = lesson.id <= 10 && !kanaLocked;
  const showLockBadge = lesson.id <= 10 && kanaLocked;

  return (
    <div className={cn("border-2 rounded-sm transition-colors", expanded ? "border-foreground/30" : "border-border")}>
      <button onClick={onToggle} className="w-full p-3 md:p-4 text-left flex items-center gap-3">
        {/* Number / Status */}
        <div
          className={cn(
            "w-9 h-9 rounded-sm flex items-center justify-center font-brush font-bold text-sm border-2 shrink-0",
            completed
              ? "bg-success border-success text-success-foreground"
              : showLockBadge
              ? "bg-muted border-border text-muted-foreground"
              : available
              ? "bg-primary border-primary text-primary-foreground"
              : "bg-muted border-border text-muted-foreground",
          )}
        >
          {completed ? (
            <Check className="w-4 h-4" strokeWidth={1.5} />
          ) : showLockBadge ? (
            <Lock className="w-3.5 h-3.5" />
          ) : available ? (
            <Play className="w-3.5 h-3.5" />
          ) : (
            lesson.id
          )}
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
            {showLockBadge && " · pass kana primer to unlock"}
          </p>
        </div>

        {/* Badge + chevron */}
        <span
          className={cn(
            "text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm border shrink-0",
            difficultyColors[lesson.difficulty],
          )}
        >
          {difficultyLabelsJp[lesson.difficulty]}
        </span>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="px-3 md:px-4 pb-4 space-y-3 border-t border-border pt-3">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5 serif-jp">
              Grammar 文法
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {lesson.grammarPoints.map((g, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-1 rounded-sm bg-primary/10 text-primary border border-primary/20 font-japanese"
                >
                  {g}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5 serif-jp">
              Vocabulary 語彙
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {lesson.vocabThemes.map((v, i) => (
                <span key={i} className="text-xs px-2 py-1 rounded-sm bg-muted text-foreground border border-border">
                  {v}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5 serif-jp">
              Key Expressions 重要表現
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {lesson.keyExpressions.map((k, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-1 rounded-sm bg-success/10 text-success border border-success/20 font-japanese"
                >
                  {k}
                </span>
              ))}
            </div>
          </div>

          {available && (
            <button
              onClick={onStart}
              className="w-full py-2.5 rounded-sm border-2 font-bold serif-jp text-sm btn-ink text-background border-foreground mt-1 transition-opacity"
            >
              入門 — Start Lesson
            </button>
          )}
          {showLockBadge && (
            <button
              onClick={onStart}
              className="w-full py-2.5 rounded-sm border-2 border-primary/40 text-foreground text-sm font-medium hover:border-primary transition-colors mt-1 flex items-center justify-center gap-2"
            >
              <Lock className="w-3.5 h-3.5" /> Pass the kana primer to unlock
            </button>
          )}
          {lesson.id > 10 && (
            <p className="text-xs text-muted-foreground serif-jp flex items-center gap-1.5 mt-1">
              <Lock className="w-3 h-3" /> Coming soon — lesson content under development
            </p>
          )}
        </div>
      )}
    </div>
  );
}
