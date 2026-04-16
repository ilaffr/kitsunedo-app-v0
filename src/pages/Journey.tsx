import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Lock, Mountain, Trophy, X, List } from "lucide-react";
import { Header } from "@/components/header";
import { journeyRegions, type JourneyRegion } from "@/data/journey-regions";
import { minnaLessons } from "@/data/minna-lessons";
import { useAllLessonProgress } from "@/hooks/use-user-data";
import { cn } from "@/lib/utils";

const AVAILABLE_LESSON_IDS = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

export default function Journey() {
  const navigate = useNavigate();
  const { lessons: progressList } = useAllLessonProgress();
  const [activeRegion, setActiveRegion] = useState<JourneyRegion | null>(null);

  const progressMap = useMemo(
    () => new Map(progressList.map((p) => [p.lessonId, p])),
    [progressList]
  );

  const regionStats = useMemo(() => {
    return journeyRegions.map((r) => {
      const total = r.lessonIds.length;
      const completed = r.lessonIds.filter((id) => progressMap.get(`lesson_${id}`)?.completed).length;
      const playable = r.lessonIds.filter((id) => AVAILABLE_LESSON_IDS.has(id)).length;
      return {
        region: r,
        completed,
        total,
        playable,
        bossUnlocked: completed === total && total > 0,
        progress: total > 0 ? completed / total : 0,
      };
    });
  }, [progressMap]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-5xl px-4 py-6 pb-24">
        {/* Top bar */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate("/")} className="p-2 rounded-sm hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-brush font-bold text-foreground flex items-center gap-2">
              <Mountain className="w-5 h-5 text-primary" />
              Yokai Journey
            </h1>
            <p className="text-xs text-muted-foreground serif-jp">妖怪の旅 — Five regions, five guardians</p>
          </div>
          <button
            onClick={() => navigate("/lessons")}
            className="text-xs px-3 py-1.5 border-2 border-border rounded-sm hover:border-foreground/40 transition-colors flex items-center gap-1.5"
            title="Flat lesson list"
          >
            <List className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">List view</span>
          </button>
        </div>

        {/* Sumi-e map */}
        <div className="relative card-paper border-2 p-3 md:p-5 mb-6 overflow-hidden">
          <SumieMap
            stats={regionStats}
            onSelect={(r) => setActiveRegion(r)}
          />
        </div>

        {/* Region list (always visible — works as a fallback for the map markers) */}
        <div className="grid sm:grid-cols-2 gap-3">
          {regionStats.map(({ region, completed, total, bossUnlocked, progress }) => (
            <button
              key={region.id}
              onClick={() => setActiveRegion(region)}
              className="text-left card-paper border-2 p-4 hover:border-primary/40 transition-colors group"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">
                    {region.nameJp}
                  </p>
                  <h3 className="font-brush font-bold text-foreground group-hover:text-primary transition-colors">
                    {region.name}
                  </h3>
                </div>
                <span className="text-2xl shrink-0" aria-hidden>{region.yokai.emoji}</span>
              </div>
              <p className="text-xs text-muted-foreground italic mb-3 line-clamp-2">{region.flavor}</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all",
                      bossUnlocked ? "bg-success" : "bg-primary"
                    )}
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-muted-foreground tabular-nums">
                  {completed}/{total}
                </span>
              </div>
            </button>
          ))}
        </div>
      </main>

      {/* Region detail drawer */}
      {activeRegion && (
        <RegionDetail
          region={activeRegion}
          progressMap={progressMap}
          onClose={() => setActiveRegion(null)}
          onLessonStart={(id) => navigate(`/lesson/${id}`)}
        />
      )}
    </div>
  );
}

// ──────────────────────── Sumi-e SVG map ────────────────────────

interface RegionStat {
  region: JourneyRegion;
  completed: number;
  total: number;
  playable: number;
  bossUnlocked: boolean;
  progress: number;
}

function SumieMap({
  stats,
  onSelect,
}: {
  stats: RegionStat[];
  onSelect: (r: JourneyRegion) => void;
}) {
  return (
    <div className="relative w-full" style={{ aspectRatio: "5 / 4" }}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 w-full h-full"
        aria-label="Sumi-e map of feudal Japan"
      >
        {/* Paper wash */}
        <defs>
          <radialGradient id="paperWash" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="hsl(var(--muted) / 0.05)" />
            <stop offset="100%" stopColor="hsl(var(--muted) / 0.25)" />
          </radialGradient>
          <pattern id="inkSpeckle" patternUnits="userSpaceOnUse" width="6" height="6">
            <circle cx="1" cy="1" r="0.3" fill="hsl(var(--foreground) / 0.08)" />
            <circle cx="4" cy="3" r="0.2" fill="hsl(var(--foreground) / 0.05)" />
          </pattern>
        </defs>

        <rect width="100" height="100" fill="url(#paperWash)" />
        <rect width="100" height="100" fill="url(#inkSpeckle)" />

        {/* Stylised Japan archipelago — abstract sumi-e brush strokes */}
        <g
          fill="hsl(var(--foreground) / 0.12)"
          stroke="hsl(var(--foreground) / 0.55)"
          strokeWidth="0.4"
          strokeLinejoin="round"
          strokeLinecap="round"
        >
          {/* Hokkaido — top island */}
          <path d="M 70 6 Q 78 4 86 8 Q 90 14 88 20 Q 82 23 74 21 Q 68 17 70 6 Z" />
          {/* Tōhoku → Honshu north */}
          <path d="M 68 24 Q 72 22 76 24 Q 80 30 78 38 Q 75 44 72 42 Q 66 38 68 24 Z" />
          {/* Honshu central (Edo / Kyoto stretch) */}
          <path d="M 72 42 Q 78 46 76 54 Q 70 60 60 60 Q 50 62 42 64 Q 36 60 38 54 Q 46 50 56 50 Q 64 46 72 42 Z" />
          {/* Shikoku */}
          <path d="M 32 70 Q 38 68 42 72 Q 40 76 34 76 Q 30 74 32 70 Z" />
          {/* Kyushu */}
          <path d="M 16 72 Q 24 70 28 76 Q 28 84 22 86 Q 14 84 14 78 Q 14 74 16 72 Z" />
          {/* Okinawa hint */}
          <path d="M 6 92 Q 10 90 12 92 Q 11 95 8 95 Q 5 94 6 92 Z" />
        </g>

        {/* Brushed wave under archipelago */}
        <path
          d="M 0 90 Q 20 86 40 90 T 80 90 T 100 92"
          fill="none"
          stroke="hsl(var(--primary) / 0.35)"
          strokeWidth="0.5"
          strokeLinecap="round"
        />
        <path
          d="M 0 95 Q 25 92 50 95 T 100 96"
          fill="none"
          stroke="hsl(var(--primary) / 0.2)"
          strokeWidth="0.4"
          strokeLinecap="round"
        />

        {/* Region pins */}
        {stats.map(({ region, completed, total, bossUnlocked }) => {
          const { x, y } = region.pos;
          const isComplete = bossUnlocked;
          const ringColor = isComplete
            ? "hsl(var(--success))"
            : completed > 0
              ? "hsl(var(--primary))"
              : "hsl(var(--muted-foreground))";
          return (
            <g
              key={region.id}
              transform={`translate(${x} ${y})`}
              className="cursor-pointer"
              onClick={() => onSelect(region)}
            >
              {/* Halo */}
              <circle r="5" fill={ringColor} opacity="0.12" />
              <circle r="3.4" fill="hsl(var(--background))" stroke={ringColor} strokeWidth="0.6" />
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="3.2"
                style={{ pointerEvents: "none" }}
              >
                {region.yokai.emoji}
              </text>
              {/* Label */}
              <text
                y="9"
                textAnchor="middle"
                fontSize="2.6"
                fill="hsl(var(--foreground))"
                fontWeight="700"
                style={{ pointerEvents: "none" }}
              >
                {region.name}
              </text>
              <text
                y="12.2"
                textAnchor="middle"
                fontSize="1.8"
                fill="hsl(var(--muted-foreground))"
                style={{ pointerEvents: "none" }}
              >
                {completed}/{total}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ──────────────────────── Region detail drawer ────────────────────────

function RegionDetail({
  region,
  progressMap,
  onClose,
  onLessonStart,
}: {
  region: JourneyRegion;
  progressMap: Map<string, { completed: boolean; bestScore: number | null }>;
  onClose: () => void;
  onLessonStart: (id: number) => void;
}) {
  const lessons = region.lessonIds
    .map((id) => minnaLessons.find((l) => l.id === id))
    .filter((l): l is NonNullable<typeof l> => !!l);

  const completedCount = region.lessonIds.filter((id) => progressMap.get(`lesson_${id}`)?.completed).length;
  const bossUnlocked = completedCount === region.lessonIds.length;

  return (
    <div
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="card-paper border-2 w-full max-w-2xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b-2 border-border px-5 py-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{region.nameJp}</p>
            <h2 className="text-lg font-brush font-bold text-foreground">{region.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-sm hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <p className="text-sm text-muted-foreground italic">{region.flavor}</p>

          {/* Yokai card */}
          <div className="border-2 border-accent/30 bg-accent/5 rounded-sm p-4">
            <div className="flex items-start gap-3 mb-2">
              <div className="text-3xl shrink-0" aria-hidden>{region.yokai.emoji}</div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-accent mb-0.5">Region guardian</p>
                <h3 className="font-brush font-bold text-foreground">{region.yokai.name}</h3>
                <p className="text-xs text-muted-foreground serif-jp">{region.yokai.nameJp}</p>
              </div>
            </div>
            <p className="text-sm text-foreground/90 mb-3">{region.yokai.lore}</p>
            <button
              disabled={!bossUnlocked}
              className={cn(
                "w-full py-2 rounded-sm border-2 text-sm font-brush font-bold transition-colors flex items-center justify-center gap-2",
                bossUnlocked
                  ? "border-accent bg-accent text-accent-foreground hover:opacity-90"
                  : "border-border text-muted-foreground cursor-not-allowed"
              )}
              title={bossUnlocked ? "Challenge the guardian" : `Complete all ${region.lessonIds.length} lessons to unlock`}
            >
              {bossUnlocked ? <Trophy className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              {bossUnlocked ? "Challenge the guardian (coming soon)" : `Locked — ${completedCount}/${region.lessonIds.length} lessons cleared`}
            </button>
          </div>

          {/* Lesson list */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-2 serif-jp">
              Lessons of {region.name}
            </h4>
            <div className="space-y-1.5">
              {lessons.map((l) => {
                const prog = progressMap.get(`lesson_${l.id}`);
                const completed = prog?.completed ?? false;
                const available = AVAILABLE_LESSON_IDS.has(l.id);
                return (
                  <button
                    key={l.id}
                    disabled={!available}
                    onClick={() => available && onLessonStart(l.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-2.5 border-2 rounded-sm text-left transition-colors",
                      completed && "border-success/40 bg-success/5",
                      !completed && available && "border-border hover:border-primary/40",
                      !available && "border-border opacity-60 cursor-not-allowed"
                    )}
                  >
                    <div className={cn(
                      "w-7 h-7 rounded-sm flex items-center justify-center text-xs font-brush font-bold border-2 shrink-0",
                      completed ? "bg-success border-success text-success-foreground" :
                      available ? "bg-primary/10 border-primary text-primary" :
                      "bg-muted border-border text-muted-foreground"
                    )}>
                      {completed ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : l.id}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{l.title}</p>
                      <p className="text-xs text-muted-foreground serif-jp truncate">{l.titleJp}</p>
                    </div>
                    {!available && <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                    {prog?.bestScore != null && (
                      <span className="text-xs font-mono text-muted-foreground shrink-0">{prog.bestScore}%</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
