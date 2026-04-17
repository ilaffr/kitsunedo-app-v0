import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookmarkPlus,
  BookmarkCheck,
  Heart,
  Zap,
  Volume2,
  BookOpen,
  MessageSquare,
  PenTool,
  Brush,
  Check,
  Lock,
  ChevronRight,
} from "lucide-react";
import { Header } from "@/components/header";
import { speakJapanese } from "@/lib/japanese-tts";
import { cn } from "@/lib/utils";
import { useFlashcards } from "@/hooks/use-flashcards";
import { usePracticeSession, useStreak, useLessonProgress } from "@/hooks/use-user-data";
import {
  MultipleChoiceCard,
  TypeAnswerCard,
  MatchPairsCard,
  SentenceBuilderCard,
  TranslateComposeCard,
  ReadingComprehensionCard,
} from "@/components/exercise-cards";
import {
  ParticleFillCard,
  ConjugationCard,
  SubstitutionCard,
  DictationCard,
  TransformCard,
  DialogueCard,
} from "@/components/exercise-cards-minna";
import { generateLessonSteps, type LessonStep, type ExerciseStep } from "@/lib/exercise-engine";
import type { LessonData, VocabItem, GrammarPoint, KanjiItem } from "@/components/lesson-page";

interface InteractiveLessonProps {
  lesson: LessonData;
}

type SectionKey = "summary" | "vocabulary" | "grammar" | "kanji" | "practice";

const SECTION_ORDER: SectionKey[] = ["summary", "vocabulary", "grammar", "kanji", "practice"];

export default function InteractiveLesson({ lesson }: InteractiveLessonProps) {
  const navigate = useNavigate();
  const { savedSet, addCard, removeCard, fetchCards } = useFlashcards();
  const { savePractice } = usePracticeSession();
  const { recordStudy } = useStreak();
  const { saveProgress } = useLessonProgress(`lesson_${lesson.number}`);

  const allSteps = useMemo(
    () =>
      generateLessonSteps(lesson.vocabulary, lesson.grammarPoints, lesson.readingPassages, {
        particleDrills: lesson.particleDrills,
        conjugationDrills: lesson.conjugationDrills,
        substitutionDrills: lesson.substitutionDrills,
        dictationDrills: lesson.dictationDrills,
        transformDrills: lesson.transformDrills,
        dialogue: lesson.dialogue,
      }),
    [lesson],
  );

  // Practice exercises only (everything from Phase 2 in the engine).
  const practiceSteps: ExerciseStep[] = useMemo(() => {
    const phase2Idx = allSteps.findIndex(
      (s) => s.type === "phase_label" && s.title.toLowerCase().includes("review"),
    );
    if (phase2Idx === -1) return allSteps.filter((s): s is ExerciseStep => s.type === "exercise");
    return allSteps.slice(phase2Idx + 1).filter((s): s is ExerciseStep => s.type === "exercise");
  }, [allSteps]);

  const hasKanji = !!(lesson.kanji && lesson.kanji.length > 0);

  const visibleSections: SectionKey[] = useMemo(
    () => SECTION_ORDER.filter((s) => s !== "kanji" || hasKanji),
    [hasKanji],
  );

  const [activeSection, setActiveSection] = useState<SectionKey>("summary");
  // Sections the user has visited (consumed) — used as "soft completion".
  const [visited, setVisited] = useState<Set<SectionKey>>(new Set(["summary"]));

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  // Mark visited when user lands on a section.
  useEffect(() => {
    setVisited((prev) => {
      if (prev.has(activeSection)) return prev;
      const next = new Set(prev);
      next.add(activeSection);
      return next;
    });
  }, [activeSection]);

  const recommendedNext: SectionKey | null = useMemo(() => {
    for (const s of visibleSections) {
      if (!visited.has(s) || (s === "practice" && !practiceComplete)) return s;
    }
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visited, visibleSections]);

  // ── Practice state (hearts only here) ────────────────────────────────────
  const [practiceStep, setPracticeStep] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [xpTotal, setXpTotal] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [exerciseCount, setExerciseCount] = useState(0);
  const [practiceComplete, setPracticeComplete] = useState(false);
  const [practiceFailed, setPracticeFailed] = useState(false);

  const totalPractice = practiceSteps.length;
  const currentEx = practiceSteps[practiceStep];
  const practiceProgress = totalPractice > 0 ? (practiceStep / totalPractice) * 100 : 0;

  const handlePracticeAnswer = (correct: boolean, xp: number) => {
    setExerciseCount((c) => c + 1);
    if (correct) {
      setCorrectCount((c) => c + 1);
      setXpTotal((x) => x + xp);
    } else {
      const newHearts = Math.max(0, hearts - 1);
      setHearts(newHearts);
      if (newHearts === 0) {
        setPracticeFailed(true);
        return;
      }
    }
    if (practiceStep + 1 >= totalPractice) {
      finishPractice();
    } else {
      setPracticeStep((s) => s + 1);
    }
  };

  const finishPractice = async () => {
    setPracticeComplete(true);
    const pct = exerciseCount > 0 ? Math.round((correctCount / exerciseCount) * 100) : 100;
    await savePractice({
      practiceType: `lesson_${lesson.number}`,
      perfect: correctCount,
      close: 0,
      missed: exerciseCount - correctCount,
      total: exerciseCount,
    });
    await saveProgress({ completed: true, bestScore: pct });
    await recordStudy();
  };

  const handleRetryPractice = () => {
    setPracticeStep(0);
    setHearts(3);
    setXpTotal(0);
    setCorrectCount(0);
    setExerciseCount(0);
    setPracticeComplete(false);
    setPracticeFailed(false);
  };

  const handleToggleFlashcard = (word: VocabItem) => {
    if (savedSet.has(word.japanese)) removeCard(word.japanese);
    else
      addCard({
        japanese: word.japanese,
        reading: word.reading,
        meaning: word.meaning,
        lessonId: lesson.id,
      });
  };

  const kanjiNum = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-3xl px-4 py-6 pb-24">
        {/* Top bar */}
        <button
          onClick={() => navigate("/lessons")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="serif-jp">道場へ戻る</span>
        </button>

        {/* Lesson header */}
        <div className="mb-6">
          <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground mb-2">
            Lesson {lesson.number}
          </p>
          <div className="flex items-baseline gap-4 flex-wrap">
            <h1 className="text-3xl md:text-4xl serif-jp font-medium text-foreground tracking-wide">
              第{kanjiNum[lesson.number - 1] ?? lesson.number}課
            </h1>
            <span className="text-base md:text-lg serif-jp text-muted-foreground tracking-wide">
              {lesson.titleJp}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-3 italic max-w-2xl">{lesson.subtitle}</p>
          <div className="mt-4 h-px w-20 bg-foreground/40" />
        </div>

        {/* Section nav (all unlocked, soft recommendation) */}
        <SectionNav
          sections={visibleSections}
          active={activeSection}
          visited={visited}
          recommended={recommendedNext}
          practiceComplete={practiceComplete}
          onSelect={setActiveSection}
        />

        {/* Section content */}
        <div className="animate-fade-up" key={activeSection}>
          {activeSection === "summary" && (
            <SummaryView
              lesson={lesson}
              hasKanji={hasKanji}
              practiceCount={totalPractice}
              onStart={() => setActiveSection(visibleSections[1] ?? "vocabulary")}
            />
          )}

          {activeSection === "vocabulary" && (
            <VocabSection
              vocabulary={lesson.vocabulary}
              lessonId={lesson.id}
              savedSet={savedSet}
              onToggle={handleToggleFlashcard}
              onContinue={() => setActiveSection(nextOf(visibleSections, "vocabulary"))}
            />
          )}

          {activeSection === "grammar" && (
            <GrammarSection
              points={lesson.grammarPoints}
              onContinue={() => setActiveSection(nextOf(visibleSections, "grammar"))}
            />
          )}

          {activeSection === "kanji" && hasKanji && (
            <KanjiSection
              kanji={lesson.kanji!}
              onContinue={() => setActiveSection(nextOf(visibleSections, "kanji"))}
            />
          )}

          {activeSection === "practice" && (
            <>
              {practiceComplete ? (
                <PracticeCompleteView
                  xp={xpTotal}
                  correct={correctCount}
                  total={exerciseCount}
                  onRetry={handleRetryPractice}
                  onBackToLessons={() => navigate("/lessons")}
                />
              ) : practiceFailed ? (
                <PracticeFailedView onRetry={handleRetryPractice} />
              ) : totalPractice === 0 ? (
                <div className="card-paper border-2 p-8 text-center text-muted-foreground">
                  No practice exercises configured for this lesson.
                </div>
              ) : (
                <PracticeView
                  step={currentEx}
                  stepIndex={practiceStep}
                  total={totalPractice}
                  hearts={hearts}
                  xp={xpTotal}
                  progress={practiceProgress}
                  onAnswer={handlePracticeAnswer}
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function nextOf(sections: SectionKey[], current: SectionKey): SectionKey {
  const i = sections.indexOf(current);
  return sections[i + 1] ?? "practice";
}

// ── Section Nav ────────────────────────────────────────────────────────────

function SectionNav({
  sections,
  active,
  visited,
  recommended,
  practiceComplete,
  onSelect,
}: {
  sections: SectionKey[];
  active: SectionKey;
  visited: Set<SectionKey>;
  recommended: SectionKey | null;
  practiceComplete: boolean;
  onSelect: (s: SectionKey) => void;
}) {
  const meta: Record<SectionKey, { label: string; kanji: string; icon: typeof BookOpen }> = {
    summary: { label: "Overview", kanji: "概要", icon: BookOpen },
    vocabulary: { label: "Vocabulary", kanji: "語彙", icon: BookOpen },
    grammar: { label: "Grammar", kanji: "文法", icon: MessageSquare },
    kanji: { label: "Kanji", kanji: "漢字", icon: Brush },
    practice: { label: "Practice", kanji: "練習", icon: PenTool },
  };
  return (
    <div className="flex gap-1 mb-6 border-b border-foreground/10 overflow-x-auto">
      {sections.map((key) => {
        const m = meta[key];
        const isActive = active === key;
        const done = key === "practice" ? practiceComplete : visited.has(key) && key !== active;
        const isRecommended = recommended === key && !isActive;
        return (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={cn(
              "relative flex items-center gap-2 px-3 md:px-4 py-3 text-[11px] uppercase tracking-[0.22em] transition-colors border-b-2 -mb-px whitespace-nowrap",
              isActive
                ? "text-foreground border-foreground"
                : "text-muted-foreground border-transparent hover:text-foreground",
            )}
            title={isRecommended ? "Recommended next" : undefined}
          >
            <m.icon className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span className="hidden sm:inline">{m.label}</span>
            <span className="japanese-text text-xs">{m.kanji}</span>
            {done && <Check className="w-3 h-3 text-success" strokeWidth={3} />}
            {isRecommended && (
              <span className="absolute -top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary" />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Summary (Overview) ─────────────────────────────────────────────────────

function SummaryView({
  lesson,
  hasKanji,
  practiceCount,
  onStart,
}: {
  lesson: LessonData;
  hasKanji: boolean;
  practiceCount: number;
  onStart: () => void;
}) {
  const items = [
    { label: "Vocabulary words", value: lesson.vocabulary.length, kanji: "語彙" },
    { label: "Grammar points", value: lesson.grammarPoints.length, kanji: "文法" },
    ...(hasKanji ? [{ label: "Kanji", value: lesson.kanji!.length, kanji: "漢字" }] : []),
    { label: "Practice exercises", value: practiceCount, kanji: "練習" },
  ];

  return (
    <div className="space-y-4">
      <div className="card-paper border-2 p-6">
        <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2 serif-jp">
          What you'll learn
        </p>
        <h2 className="text-xl serif-jp text-foreground mb-3">{lesson.titleEn}</h2>
        <p className="text-sm text-foreground leading-relaxed">{lesson.subtitle}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {items.map((it) => (
          <div key={it.label} className="card-paper border-2 p-4">
            <p className="text-xs text-muted-foreground serif-jp">{it.kanji}</p>
            <p className="text-2xl font-bold serif-jp text-foreground mt-1">{it.value}</p>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground mt-0.5">
              {it.label}
            </p>
          </div>
        ))}
      </div>

      <div className="card-paper border-2 p-5 bg-muted/10">
        <h3 className="text-sm font-bold serif-jp text-foreground mb-3">How this lesson works</h3>
        <ol className="space-y-2 text-sm text-foreground">
          <li className="flex gap-2">
            <span className="text-primary serif-jp">①</span> Read the vocabulary cards.
          </li>
          <li className="flex gap-2">
            <span className="text-primary serif-jp">②</span> Study the grammar rules with examples.
          </li>
          {hasKanji && (
            <li className="flex gap-2">
              <span className="text-primary serif-jp">③</span> Meet the kanji and their mnemonics.
            </li>
          )}
          <li className="flex gap-2">
            <span className="text-primary serif-jp">{hasKanji ? "④" : "③"}</span> Then test yourself
            in <strong>Practice</strong> — only the practice section uses hearts.
          </li>
        </ol>
        <p className="text-xs text-muted-foreground mt-3 italic">
          You can jump between sections freely. The • dot marks what we recommend next.
        </p>
      </div>

      <button
        onClick={onStart}
        className="w-full py-3 rounded-sm border-2 border-foreground font-bold serif-jp text-sm btn-ink text-background transition-colors flex items-center justify-center gap-2"
      >
        始めましょう — Begin
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ── Vocabulary section (full list, browseable, no quiz here) ───────────────

function VocabSection({
  vocabulary,
  lessonId,
  savedSet,
  onToggle,
  onContinue,
}: {
  vocabulary: VocabItem[];
  lessonId: string;
  savedSet: Set<string>;
  onToggle: (w: VocabItem) => void;
  onContinue: () => void;
}) {
  const [flippedIdx, setFlippedIdx] = useState<Set<number>>(new Set());
  const toggleFlip = (i: number) =>
    setFlippedIdx((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  return (
    <div className="space-y-4">
      <div className="card-paper border-2 p-5">
        <h3 className="text-lg font-bold serif-jp text-foreground mb-1">語彙 — Vocabulary</h3>
        <p className="text-sm text-muted-foreground">
          Tap a card to reveal the reading & meaning. Bookmark words to add them to your flashcard
          deck. No hearts here — this is a study section.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {vocabulary.map((word, i) => {
          const flipped = flippedIdx.has(i);
          const saved = savedSet.has(word.japanese);
          return (
            <div key={i} className="relative">
              <button
                onClick={() => toggleFlip(i)}
                className={cn(
                  "w-full p-5 rounded-sm border-2 text-center transition-all min-h-[100px] flex flex-col items-center justify-center",
                  flipped
                    ? "border-primary/40 bg-primary/5"
                    : "border-border hover:border-foreground/30 bg-card",
                )}
              >
                {!flipped ? (
                  <>
                    <span className="text-2xl japanese-text font-bold text-foreground">
                      {word.japanese}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">tap to reveal</span>
                  </>
                ) : (
                  <>
                    <span className="text-sm text-muted-foreground mb-1">{word.reading}</span>
                    <span className="text-lg font-bold text-foreground">{word.meaning}</span>
                    <span className="text-xl japanese-text text-primary mt-1">{word.japanese}</span>
                  </>
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  speakJapanese(word.japanese);
                }}
                className="absolute top-2 left-2 p-1.5 rounded-sm text-muted-foreground/40 hover:text-primary transition-colors"
                title="Listen"
              >
                <Volume2 className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle(word);
                }}
                className={cn(
                  "absolute top-2 right-2 p-1.5 rounded-sm transition-colors",
                  saved ? "text-primary" : "text-muted-foreground/40 hover:text-muted-foreground",
                )}
                title={saved ? "Remove from flashcards" : "Add to flashcards"}
              >
                {saved ? <BookmarkCheck className="w-5 h-5" /> : <BookmarkPlus className="w-5 h-5" />}
              </button>
            </div>
          );
        })}
      </div>

      <button
        onClick={onContinue}
        className="w-full py-3 rounded-sm border-2 border-foreground font-bold serif-jp text-sm btn-ink text-background transition-colors"
      >
        Continue → Grammar
      </button>
    </div>
  );
}

// ── Grammar section ────────────────────────────────────────────────────────

function GrammarSection({
  points,
  onContinue,
}: {
  points: GrammarPoint[];
  onContinue: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="card-paper border-2 p-5">
        <h3 className="text-lg font-bold serif-jp text-foreground mb-1">文法 — Grammar</h3>
        <p className="text-sm text-muted-foreground">
          Read each rule, the explanation, and study the example sentences. Take your time — these
          are the patterns you'll be tested on later.
        </p>
      </div>

      {points.map((point, i) => (
        <div key={i} className="card-paper border-2 overflow-hidden">
          <div className="flex items-center gap-3 p-5 pb-4 border-b border-border bg-muted/10">
            <span className="hanko-badge text-sm flex-shrink-0">{i + 1}</span>
            <div>
              <h4 className="text-xl font-bold japanese-text text-foreground leading-tight">
                {point.title}
              </h4>
              <code className="text-xs text-primary font-mono mt-0.5 block">{point.rule}</code>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <p className="text-sm text-foreground leading-relaxed">{point.explanation}</p>
            <div className="bg-primary/5 border border-primary/25 rounded-sm p-3 flex gap-2.5 items-start">
              <span className="text-primary text-base flex-shrink-0 serif-jp">✦</span>
              <p className="text-sm text-foreground leading-relaxed">
                <strong className="text-primary serif-jp">Tip: </strong>
                {point.tip}
              </p>
            </div>
            <div className="space-y-3">
              {point.examples.map((ex, j) => (
                <div
                  key={j}
                  className="bg-muted/30 rounded-sm p-3 border border-border flex items-start gap-3"
                >
                  <button
                    onClick={() => speakJapanese(ex.jp)}
                    className="text-muted-foreground hover:text-primary transition-colors mt-0.5"
                    title="Listen"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <div>
                    <p className="text-lg japanese-text text-foreground">{ex.jp}</p>
                    <p className="text-sm text-muted-foreground mt-1">{ex.en}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={onContinue}
        className="w-full py-3 rounded-sm border-2 border-foreground font-bold serif-jp text-sm btn-ink text-background transition-colors"
      >
        Continue →
      </button>
    </div>
  );
}

// ── Kanji section ──────────────────────────────────────────────────────────

function KanjiSection({ kanji, onContinue }: { kanji: KanjiItem[]; onContinue: () => void }) {
  return (
    <div className="space-y-4">
      <div className="card-paper border-2 p-5">
        <h3 className="text-lg font-bold serif-jp text-foreground mb-1">漢字 — Kanji</h3>
        <p className="text-sm text-muted-foreground">
          Each kanji shows its readings, meaning, and a memory hook. Stroke order and writing
          practice live in the dedicated{" "}
          <span className="text-foreground font-medium">Kanji Writing</span> page.
        </p>
      </div>

      {kanji.map((k, i) => (
        <div key={i} className="card-paper border-2 overflow-hidden">
          <div className="flex items-stretch gap-0">
            <div className="flex-shrink-0 w-28 md:w-32 bg-foreground/[0.03] border-r border-border flex flex-col items-center justify-center p-4">
              <span className="text-6xl md:text-7xl font-brush text-foreground leading-none">
                {k.kanji}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-2">
                {k.strokes} strokes
              </span>
            </div>
            <div className="flex-1 p-4 md:p-5 space-y-3 min-w-0">
              <div>
                <p className="text-xs text-muted-foreground serif-jp uppercase tracking-wider">
                  Meaning
                </p>
                <p className="text-base font-bold text-foreground">{k.meaning}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    On'yomi 音
                  </p>
                  <p className="japanese-text text-primary">{k.onyomi || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Kun'yomi 訓
                  </p>
                  <p className="japanese-text text-foreground">{k.kunyomi || "—"}</p>
                </div>
              </div>
              <div className="bg-primary/5 border border-primary/25 rounded-sm p-3">
                <p className="text-[10px] uppercase tracking-wider text-primary serif-jp mb-1">
                  Mnemonic
                </p>
                <p className="text-sm text-foreground leading-relaxed">{k.mnemonic}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Examples
                </p>
                {k.examples.map((ex, j) => (
                  <div key={j} className="flex items-baseline gap-2 text-sm">
                    <button
                      onClick={() => speakJapanese(ex.jp)}
                      className="text-muted-foreground/60 hover:text-primary transition-colors"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                    <span className="japanese-text text-foreground font-medium">{ex.jp}</span>
                    <span className="text-xs text-muted-foreground">{ex.reading}</span>
                    <span className="text-xs text-muted-foreground">— {ex.en}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={onContinue}
        className="w-full py-3 rounded-sm border-2 border-foreground font-bold serif-jp text-sm btn-ink text-background transition-colors"
      >
        Continue → Practice
      </button>
    </div>
  );
}

// ── Practice runner (the only place hearts live) ───────────────────────────

function PracticeView({
  step,
  stepIndex,
  total,
  hearts,
  xp,
  progress,
  onAnswer,
}: {
  step: ExerciseStep;
  stepIndex: number;
  total: number;
  hearts: number;
  xp: number;
  progress: number;
  onAnswer: (correct: boolean, xp: number) => void;
}) {
  const ex = step.exercise;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
            Question {stepIndex + 1} / {total}
          </p>
        </div>
        <div className="flex items-center gap-1 text-destructive">
          {Array.from({ length: 3 }).map((_, i) => (
            <Heart
              key={i}
              className={cn("w-5 h-5 transition-all", i < hearts ? "fill-destructive" : "opacity-20")}
            />
          ))}
        </div>
        <div className="flex items-center gap-1 text-primary font-bold text-sm serif-jp">
          <Zap className="w-4 h-4" />
          {xp}
        </div>
      </div>

      <div className="card-paper border-2 p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground serif-jp">
            練習 — Exercise
          </span>
          <span className="text-xs text-primary font-bold">+{step.xpReward} XP</span>
        </div>
        {ex.type === "multiple_choice" && (
          <MultipleChoiceCard exercise={ex} onComplete={(r) => onAnswer(r.correct, step.xpReward)} />
        )}
        {ex.type === "type_answer" && (
          <TypeAnswerCard exercise={ex} onComplete={(r) => onAnswer(r.correct, step.xpReward)} />
        )}
        {ex.type === "match_pairs" && (
          <MatchPairsCard exercise={ex} onComplete={(r) => onAnswer(r.correct, step.xpReward)} />
        )}
        {ex.type === "sentence_builder" && (
          <SentenceBuilderCard exercise={ex} onComplete={(r) => onAnswer(r.correct, step.xpReward)} />
        )}
        {ex.type === "translate_compose" && (
          <TranslateComposeCard exercise={ex} onComplete={(r) => onAnswer(r.correct, step.xpReward)} />
        )}
        {ex.type === "reading_comprehension" && (
          <ReadingComprehensionCard exercise={ex} onComplete={(r) => onAnswer(r.correct, step.xpReward)} />
        )}
        {ex.type === "particle_fill" && (
          <ParticleFillCard exercise={ex} onComplete={(r) => onAnswer(r.correct, step.xpReward)} />
        )}
        {ex.type === "conjugation" && (
          <ConjugationCard exercise={ex} onComplete={(r) => onAnswer(r.correct, step.xpReward)} />
        )}
        {ex.type === "substitution" && (
          <SubstitutionCard exercise={ex} onComplete={(r) => onAnswer(r.correct, step.xpReward)} />
        )}
        {ex.type === "dictation" && (
          <DictationCard exercise={ex} onComplete={(r) => onAnswer(r.correct, step.xpReward)} />
        )}
        {ex.type === "transform" && (
          <TransformCard exercise={ex} onComplete={(r) => onAnswer(r.correct, step.xpReward)} />
        )}
        {ex.type === "dialogue" && (
          <DialogueCard exercise={ex} onComplete={(r) => onAnswer(r.correct, step.xpReward)} />
        )}
      </div>
    </div>
  );
}

function PracticeCompleteView({
  xp,
  correct,
  total,
  onRetry,
  onBackToLessons,
}: {
  xp: number;
  correct: number;
  total: number;
  onRetry: () => void;
  onBackToLessons: () => void;
}) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  return (
    <div className="card-paper border-2 p-8 text-center space-y-4">
      <div className="text-6xl mb-2">{pct >= 80 ? "🎌" : pct >= 50 ? "⛩️" : "🌊"}</div>
      <h2 className="text-2xl font-bold serif-jp text-foreground">Lesson Complete</h2>
      <p className="text-4xl font-bold text-primary serif-jp">+{xp} XP</p>
      <div className="flex justify-center gap-6 text-sm">
        <span className="text-success font-medium">✓ {correct} correct</span>
        <span className="text-destructive font-medium">✗ {total - correct} wrong</span>
      </div>
      <p className="text-sm text-muted-foreground">
        {pct === 100
          ? "Perfect — 完璧！"
          : pct >= 80
            ? "Excellent — 素晴らしい！"
            : pct >= 50
              ? "Good effort — もう少し！"
              : "Keep going — 頑張って！"}
      </p>
      <div className="flex gap-3 justify-center pt-4 flex-wrap">
        <button
          onClick={onBackToLessons}
          className="px-6 py-2.5 rounded-sm border-2 border-border text-sm hover:border-foreground/30 transition-colors"
        >
          Back to Lessons
        </button>
        <button
          onClick={onRetry}
          className="px-6 py-2.5 rounded-sm border-2 border-foreground text-sm font-medium hover:bg-foreground hover:text-background transition-colors"
        >
          もう一度 — Retry Practice
        </button>
      </div>
    </div>
  );
}

function PracticeFailedView({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="card-paper border-2 p-8 text-center space-y-4">
      <div className="text-6xl mb-2">💔</div>
      <h2 className="text-2xl font-bold serif-jp text-foreground">Out of hearts</h2>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
        Don't worry — review the vocabulary, grammar, and kanji sections, then try again. The
        practice is the only section that uses hearts.
      </p>
      <button
        onClick={onRetry}
        className="px-6 py-2.5 rounded-sm border-2 border-foreground text-sm font-medium hover:bg-foreground hover:text-background transition-colors"
      >
        もう一度 — Try Again
      </button>
    </div>
  );
}
