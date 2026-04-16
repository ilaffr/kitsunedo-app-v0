import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Lock, Trophy, X, List, Swords } from "lucide-react";
import { Header } from "@/components/header";
import { journeyRegions, type JourneyRegion } from "@/data/journey-regions";
import { minnaLessons } from "@/data/minna-lessons";
import { useAllLessonProgress } from "@/hooks/use-user-data";
import { cn } from "@/lib/utils";
import { BossQuiz } from "@/components/boss-quiz";

const AVAILABLE_LESSON_IDS = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

export default function Journey() {
  const navigate = useNavigate();
  const { lessons: progressList } = useAllLessonProgress();
  const [activeRegion, setActiveRegion] = useState<JourneyRegion | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [bossRegion, setBossRegion] = useState<JourneyRegion | null>(null);

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

  const totalCompleted = regionStats.reduce((s, r) => s + r.completed, 0);
  const totalLessons = regionStats.reduce((s, r) => s + r.total, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-6xl px-4 py-6 pb-24">
        {/* Top bar */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-sm hover:bg-muted transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-0.5">
              妖怪の旅 — Yōkai no Tabi
            </p>
            <h1 className="text-2xl md:text-3xl serif-jp font-bold text-foreground leading-none">
              The Yōkai Journey
            </h1>
          </div>
          <button
            onClick={() => navigate("/lessons")}
            className="text-xs px-3 py-2 border border-border/60 rounded-sm hover:border-foreground/40 hover:bg-muted/50 transition-colors flex items-center gap-2"
            title="Flat lesson list"
          >
            <List className="w-3.5 h-3.5" />
            <span className="hidden sm:inline tracking-wider uppercase">Scroll</span>
          </button>
        </div>

        {/* Cinematic map panel */}
        <div className="relative mb-8 overflow-hidden rounded-sm border border-foreground/10 shadow-2xl">
          {/* Atmospheric dark wash background */}
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(30_15%_10%)] via-[hsl(30_12%_14%)] to-[hsl(30_15%_8%)]" />
          {/* Paper grain overlay */}
          <div
            className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
            }}
          />

          {/* Top brand bar */}
          <div className="relative z-10 flex items-center justify-between px-5 md:px-8 pt-5 md:pt-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-px bg-[hsl(5_85%_55%)]" />
              <span className="text-[10px] tracking-[0.4em] uppercase text-[hsl(35_25%_75%)]">
                Chapter I — The Five Lands
              </span>
            </div>
            <div className="text-[10px] tracking-[0.3em] uppercase text-[hsl(35_15%_55%)] font-mono tabular-nums">
              {String(totalCompleted).padStart(2, "0")} / {String(totalLessons).padStart(2, "0")}
            </div>
          </div>

          {/* SVG Map */}
          <SumieMap
            stats={regionStats}
            hoveredId={hoveredId}
            setHovered={setHoveredId}
            onSelect={(r) => setActiveRegion(r)}
          />

          {/* Bottom caption — shows hovered region or default */}
          <div className="relative z-10 px-5 md:px-8 pb-5 md:pb-6 -mt-2 min-h-[4rem]">
            {(() => {
              const hovered = hoveredId ? regionStats.find((s) => s.region.id === hoveredId) : null;
              if (hovered) {
                return (
                  <div className="animate-fade-up">
                    <div className="flex items-baseline gap-3 mb-1">
                      <span className="serif-jp text-2xl md:text-3xl text-[hsl(5_85%_60%)] font-bold leading-none">
                        {hovered.region.nameJp}
                      </span>
                      <span className="text-[hsl(35_25%_85%)] tracking-widest uppercase text-sm">
                        {hovered.region.name}
                      </span>
                    </div>
                    <p className="text-xs text-[hsl(35_15%_65%)] italic max-w-2xl">
                      {hovered.region.flavor}
                    </p>
                  </div>
                );
              }
              return (
                <p className="text-xs text-[hsl(35_15%_50%)] italic tracking-wide">
                  Hover a seal to glimpse the land. Tap to enter.
                </p>
              );
            })()}
          </div>
        </div>

        {/* Region cards — rendered as scroll-like vertical strips */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {regionStats.map(({ region, completed, total, bossUnlocked, progress }) => (
            <button
              key={region.id}
              onClick={() => setActiveRegion(region)}
              onMouseEnter={() => setHoveredId(region.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="group relative text-left card-paper border border-border/60 p-5 hover:border-primary/50 hover:shadow-lg transition-all overflow-hidden"
            >
              {/* Decorative kanji watermark */}
              <span
                className="absolute -right-2 -top-3 serif-jp text-7xl font-bold text-foreground/[0.04] leading-none select-none pointer-events-none"
                aria-hidden
              >
                {region.nameJp.charAt(0)}
              </span>

              <div className="relative">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <p className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground mb-1">
                      {region.nameJp} · Region
                    </p>
                    <h3 className="serif-jp font-bold text-lg text-foreground group-hover:text-primary transition-colors leading-tight">
                      {region.name}
                    </h3>
                  </div>
                  <span className="text-3xl shrink-0 grayscale group-hover:grayscale-0 transition-all" aria-hidden>
                    {region.yokai.emoji}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground italic mb-4 line-clamp-2 leading-relaxed">
                  {region.flavor}
                </p>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-border relative overflow-hidden">
                    <div
                      className={cn(
                        "absolute inset-y-0 left-0 transition-all",
                        bossUnlocked ? "bg-success" : "bg-primary"
                      )}
                      style={{ width: `${progress * 100}%`, height: "2px", top: "-0.5px" }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground tabular-nums tracking-wider">
                    {String(completed).padStart(2, "0")}/{String(total).padStart(2, "0")}
                  </span>
                  {bossUnlocked && (
                    <Trophy className="w-3.5 h-3.5 text-success" />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </main>

      {activeRegion && (
        <RegionDetail
          region={activeRegion}
          progressMap={progressMap}
          onClose={() => setActiveRegion(null)}
          onLessonStart={(id) => navigate(`/lesson/${id}`)}
          onBossStart={(r) => {
            setActiveRegion(null);
            setBossRegion(r);
          }}
        />
      )}

      {bossRegion && (
        <BossQuiz region={bossRegion} onClose={() => setBossRegion(null)} />
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
  hoveredId,
  setHovered,
  onSelect,
}: {
  stats: RegionStat[];
  hoveredId: string | null;
  setHovered: (id: string | null) => void;
  onSelect: (r: JourneyRegion) => void;
}) {
  return (
    <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
      <svg
        viewBox="0 0 100 56"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
        aria-label="Sumi-e map of feudal Japan"
      >
        <defs>
          {/* Misty atmospheric gradient — pale ink wash */}
          <linearGradient id="mistGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(35 20% 90%)" stopOpacity="0.04" />
            <stop offset="50%" stopColor="hsl(35 20% 85%)" stopOpacity="0.10" />
            <stop offset="100%" stopColor="hsl(0 0% 0%)" stopOpacity="0" />
          </linearGradient>
          {/* Vermillion sun glow */}
          <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(5 85% 55%)" stopOpacity="0.6" />
            <stop offset="60%" stopColor="hsl(5 85% 45%)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="hsl(5 85% 45%)" stopOpacity="0" />
          </radialGradient>
          {/* Mountain silhouette gradients (far/mid/near) */}
          <linearGradient id="mountFar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(30 10% 22%)" />
            <stop offset="100%" stopColor="hsl(30 10% 16%)" />
          </linearGradient>
          <linearGradient id="mountMid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(30 10% 16%)" />
            <stop offset="100%" stopColor="hsl(30 10% 10%)" />
          </linearGradient>
          <linearGradient id="mountNear" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(0 0% 6%)" />
            <stop offset="100%" stopColor="hsl(0 0% 4%)" />
          </linearGradient>
          {/* Soft mist filter */}
          <filter id="softMist">
            <feGaussianBlur stdDeviation="0.3" />
          </filter>
        </defs>

        {/* Pale rising mist behind everything */}
        <rect width="100" height="56" fill="url(#mistGrad)" />

        {/* The blood-red Yōtei sun */}
        <circle cx="78" cy="18" r="8" fill="url(#sunGlow)" />
        <circle cx="78" cy="18" r="3.5" fill="hsl(5 85% 50%)" opacity="0.85" />
        <circle cx="78" cy="18" r="3.5" fill="hsl(5 85% 50%)" opacity="0.5">
          <animate attributeName="r" values="3.5;4.2;3.5" dur="6s" repeatCount="indefinite" />
        </circle>

        {/* Far mountain silhouette layer */}
        <path
          d="M 0 32 L 8 24 L 14 28 L 22 20 L 30 26 L 38 22 L 48 28 L 56 23 L 65 27 L 72 22 L 82 26 L 92 23 L 100 27 L 100 56 L 0 56 Z"
          fill="url(#mountFar)"
          opacity="0.85"
        />

        {/* Mist band */}
        <rect x="0" y="28" width="100" height="6" fill="hsl(35 20% 85%)" opacity="0.06" filter="url(#softMist)" />

        {/* Mid mountain layer (Mt. Yōtei-like cone center-left) */}
        <path
          d="M 0 38 L 6 34 L 12 36 L 18 30 L 26 38 L 34 32 L 42 28 L 48 22 L 54 28 L 60 34 L 70 36 L 78 32 L 88 36 L 96 33 L 100 36 L 100 56 L 0 56 Z"
          fill="url(#mountMid)"
        />

        {/* Snow caps on the central peak */}
        <path
          d="M 44 26 L 48 22 L 52 26 L 50 27 L 48 25 L 46 27 Z"
          fill="hsl(35 20% 88%)"
          opacity="0.7"
        />

        {/* Lower mist band */}
        <rect x="0" y="38" width="100" height="4" fill="hsl(35 20% 85%)" opacity="0.08" filter="url(#softMist)" />

        {/* Near mountain layer */}
        <path
          d="M 0 46 L 8 42 L 16 44 L 24 40 L 32 44 L 40 41 L 50 44 L 58 40 L 66 43 L 74 41 L 82 44 L 90 42 L 100 44 L 100 56 L 0 56 Z"
          fill="url(#mountNear)"
        />

        {/* Vermillion torii silhouette in foreground left */}
        <g transform="translate(8 44)" opacity="0.92">
          <rect x="-3.2" y="-7" width="6.4" height="0.5" fill="hsl(5 85% 38%)" />
          <rect x="-3.6" y="-6.3" width="7.2" height="0.7" fill="hsl(5 85% 42%)" />
          <rect x="-2.6" y="-6" width="0.5" height="6" fill="hsl(5 85% 38%)" />
          <rect x="2.1" y="-6" width="0.5" height="6" fill="hsl(5 85% 38%)" />
          <rect x="-2" y="-3.5" width="4" height="0.4" fill="hsl(5 85% 38%)" />
        </g>

        {/* Drifting flock of birds (V-shape strokes) */}
        <g fill="none" stroke="hsl(0 0% 8%)" strokeWidth="0.18" strokeLinecap="round" opacity="0.85">
          <path d="M 30 14 q 0.6 -0.5 1.2 0 q 0.6 -0.5 1.2 0" />
          <path d="M 35 12 q 0.5 -0.4 1 0 q 0.5 -0.4 1 0" />
          <path d="M 40 15 q 0.4 -0.35 0.8 0 q 0.4 -0.35 0.8 0" />
          <path d="M 45 13 q 0.4 -0.35 0.8 0 q 0.4 -0.35 0.8 0" />
        </g>

        {/* Region seal markers (hanko-style) */}
        {stats.map(({ region, completed, total, bossUnlocked }) => {
          const { x: px, y: py } = region.pos;
          // Remap from old 0-100 sq coords to new 16:9 (0-100 x 0-56)
          // Keep x as-is, compress y to 0.56 range
          const x = px;
          const y = Math.max(8, Math.min(48, py * 0.56));
          const isHovered = hoveredId === region.id;
          const isComplete = bossUnlocked;
          const seal = isComplete
            ? "hsl(150 45% 50%)"
            : completed > 0
              ? "hsl(5 85% 55%)"
              : "hsl(35 15% 60%)";

          return (
            <g
              key={region.id}
              transform={`translate(${x} ${y})`}
              className="cursor-pointer"
              onClick={() => onSelect(region)}
              onMouseEnter={() => setHovered(region.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Outer pulse halo when hovered */}
              {isHovered && (
                <circle r="5" fill={seal} opacity="0.15">
                  <animate attributeName="r" values="3;6;3" dur="1.8s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.25;0;0.25" dur="1.8s" repeatCount="indefinite" />
                </circle>
              )}

              {/* Stem line down to ground (subtle) */}
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="3"
                stroke={seal}
                strokeWidth="0.15"
                opacity={isHovered ? 0.6 : 0.3}
              />

              {/* Hanko-style square seal */}
              <rect
                x="-2.2"
                y="-2.2"
                width="4.4"
                height="4.4"
                fill="hsl(0 0% 6%)"
                stroke={seal}
                strokeWidth={isHovered ? 0.4 : 0.25}
                rx="0.3"
                style={{ transition: "all 0.2s" }}
              />
              <rect
                x="-1.7"
                y="-1.7"
                width="3.4"
                height="3.4"
                fill="none"
                stroke={seal}
                strokeWidth="0.15"
                opacity="0.5"
                rx="0.2"
              />

              {/* Single kanji glyph inside seal */}
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="2.6"
                fill={seal}
                fontWeight="700"
                style={{
                  fontFamily: "'Noto Serif JP', serif",
                  pointerEvents: "none",
                }}
              >
                {region.nameJp.charAt(0)}
              </text>

              {/* Completion check badge */}
              {isComplete && (
                <circle cx="2.4" cy="-2.4" r="0.9" fill="hsl(150 45% 50%)" />
              )}

              {/* Romaji label below — shown on hover */}
              {isHovered && (
                <g style={{ pointerEvents: "none" }} className="animate-fade-up">
                  <text
                    y="6"
                    textAnchor="middle"
                    fontSize="1.6"
                    fill="hsl(35 25% 88%)"
                    fontWeight="600"
                    style={{ letterSpacing: "0.15em", textTransform: "uppercase" }}
                  >
                    {region.name}
                  </text>
                  <text
                    y="8.5"
                    textAnchor="middle"
                    fontSize="1.3"
                    fill="hsl(35 15% 60%)"
                    fontFamily="monospace"
                  >
                    {String(completed).padStart(2, "0")} / {String(total).padStart(2, "0")}
                  </text>
                </g>
              )}
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
  onBossStart,
}: {
  region: JourneyRegion;
  progressMap: Map<string, { completed: boolean; bestScore: number | null }>;
  onClose: () => void;
  onLessonStart: (id: number) => void;
  onBossStart: (region: JourneyRegion) => void;
}) {
  const lessons = region.lessonIds
    .map((id) => minnaLessons.find((l) => l.id === id))
    .filter((l): l is NonNullable<typeof l> => !!l);

  const completedCount = region.lessonIds.filter((id) => progressMap.get(`lesson_${id}`)?.completed).length;
  const bossUnlocked = completedCount === region.lessonIds.length;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-2 sm:p-4 animate-fade-up"
      onClick={onClose}
    >
      <div
        className="card-paper border border-foreground/10 w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero banner — atmospheric dark with kanji watermark */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[hsl(30_15%_10%)] to-[hsl(30_12%_18%)] px-6 py-8">
          <span
            className="absolute -right-4 -top-6 serif-jp text-[10rem] font-bold text-white/[0.04] leading-none select-none pointer-events-none"
            aria-hidden
          >
            {region.nameJp.charAt(0)}
          </span>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-sm text-[hsl(35_15%_70%)] hover:bg-white/10 transition-colors z-10"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-px bg-[hsl(5_85%_55%)]" />
              <p className="text-[10px] uppercase tracking-[0.4em] text-[hsl(5_85%_60%)]">
                Region · {region.nameJp}
              </p>
            </div>
            <h2 className="text-3xl serif-jp font-bold text-[hsl(35_25%_92%)] mb-2 leading-tight">
              {region.name}
            </h2>
            <p className="text-sm text-[hsl(35_15%_70%)] italic max-w-md leading-relaxed">
              {region.flavor}
            </p>
          </div>
        </div>

        <div className="p-5 md:p-6 space-y-6">
          {/* Yokai guardian card */}
          <div className="relative border border-border/60 bg-gradient-to-br from-card to-muted/30 rounded-sm p-5 overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <div className="flex items-start gap-4 mb-3">
              <div className="text-4xl shrink-0 leading-none" aria-hidden>{region.yokai.emoji}</div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-[0.3em] text-primary mb-1">Guardian</p>
                <h3 className="serif-jp font-bold text-foreground text-lg leading-tight">{region.yokai.name}</h3>
                <p className="text-sm text-muted-foreground serif-jp">{region.yokai.nameJp}</p>
              </div>
            </div>
            <p className="text-sm text-foreground/85 leading-relaxed mb-4 italic">{region.yokai.lore}</p>
            <button
              disabled={!bossUnlocked}
              onClick={() => bossUnlocked && onBossStart(region)}
              className={cn(
                "w-full py-2.5 rounded-sm border text-sm font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2",
                bossUnlocked
                  ? "border-primary bg-primary text-primary-foreground hover:shadow-[0_0_20px_hsl(var(--primary)/0.4)]"
                  : "border-border bg-muted/40 text-muted-foreground cursor-not-allowed"
              )}
              title={bossUnlocked ? "Challenge the guardian" : `Complete all ${region.lessonIds.length} lessons to unlock`}
            >
              {bossUnlocked ? <Swords className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5" />}
              {bossUnlocked
                ? "Challenge the guardian"
                : `${completedCount} / ${region.lessonIds.length} lessons cleared`}
            </button>
          </div>

          {/* Lesson scroll */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-1 h-4 bg-foreground" />
              <h4 className="text-[10px] uppercase tracking-[0.3em] text-foreground font-bold">
                Lessons of {region.name}
              </h4>
              <div className="flex-1 h-px bg-border" />
            </div>
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
                      "w-full flex items-center gap-3 p-3 border rounded-sm text-left transition-all group",
                      completed && "border-success/40 bg-success/5 hover:border-success/60",
                      !completed && available && "border-border hover:border-primary/50 hover:bg-muted/30",
                      !available && "border-border/40 opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-sm flex items-center justify-center text-xs serif-jp font-bold border shrink-0 transition-colors",
                      completed ? "bg-success border-success text-success-foreground" :
                      available ? "bg-primary/10 border-primary/50 text-primary group-hover:bg-primary group-hover:text-primary-foreground" :
                      "bg-muted border-border text-muted-foreground"
                    )}>
                      {completed ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : l.id}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate leading-tight">{l.title}</p>
                      <p className="text-xs text-muted-foreground serif-jp truncate">{l.titleJp}</p>
                    </div>
                    {!available && <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                    {prog?.bestScore != null && (
                      <span className="text-[10px] font-mono text-muted-foreground shrink-0 tracking-wider">
                        {prog.bestScore}%
                      </span>
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
