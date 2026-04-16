import { useEffect, useMemo, useRef, useState } from "react";
import { X, Heart, Sparkles, Trophy, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { JourneyRegion } from "@/data/journey-regions";
import { getRegionLessonData } from "@/lib/region-lessons";
import {
  MultipleChoiceCard,
  TypeAnswerCard,
  SentenceBuilderCard,
} from "@/components/exercise-cards";
import type { Exercise } from "@/lib/exercise-engine";
import { useAchievement } from "@/hooks/use-achievement";
import { speakJapanese } from "@/lib/japanese-tts";
import bakenekoImg from "@/assets/yokai-bakeneko.png";
import yokaiTenguImg from "@/assets/yokai-tengu.png";
import kappaImg from "@/assets/yokai-kappa.png";
import yukionnaImg from "@/assets/yokai-yukionna.png";
import kamuyImg from "@/assets/yokai-kamuy.png";

const YOKAI_IMAGE: Record<string, string> = {
  boss_bakeneko: bakenekoImg,
  boss_tengu: yokaiTenguImg,
  boss_kappa: kappaImg,
  boss_yukionna: yukionnaImg,
  boss_kamuy: kamuyImg,
};

const TOTAL_QUESTIONS = 5;
const STARTING_HP = 3;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Build a mixed-review pool of `TOTAL_QUESTIONS` exercises from the region's lessons. */
function buildBossExercises(region: JourneyRegion): Exercise[] {
  const lessons = getRegionLessonData(region.lessonIds);
  if (lessons.length === 0) return [];

  const allVocab = lessons.flatMap((l) => l.vocabulary);
  const allGrammar = lessons.flatMap((l) => l.grammarPoints);

  const exercises: Exercise[] = [];

  // 2 multiple-choice (vocab meaning)
  const mcWords = shuffle(allVocab).slice(0, 2);
  for (const word of mcWords) {
    const distractors = shuffle(allVocab.filter((w) => w.japanese !== word.japanese))
      .slice(0, 3)
      .map((w) => w.meaning);
    const options = shuffle([word.meaning, ...distractors]);
    exercises.push({
      type: "multiple_choice",
      prompt: `What does 「${word.japanese}」mean?`,
      promptJp: word.japanese,
      options,
      correctIndex: options.indexOf(word.meaning),
    });
  }

  // 2 type-answer (vocab reading)
  const taWords = shuffle(allVocab.filter((w) => !mcWords.includes(w))).slice(0, 2);
  for (const word of taWords) {
    exercises.push({
      type: "type_answer",
      prompt: `Type the reading for 「${word.japanese}」`,
      promptJp: word.japanese,
      acceptedAnswers: [
        word.reading,
        word.reading.replace(/ō/g, "ou").replace(/ū/g, "uu"),
      ],
      hint: word.meaning,
    });
  }

  // 1 sentence builder (grammar)
  const grammarWithExamples = allGrammar.filter((g) => g.examples.length > 0);
  if (grammarWithExamples.length > 0) {
    const point = shuffle(grammarWithExamples)[0];
    const ex = point.examples[Math.floor(Math.random() * point.examples.length)];
    const tokens = ex.jp.replace(/。/g, "").split(/\s+/).filter(Boolean);
    exercises.push({
      type: "sentence_builder",
      prompt: ex.en,
      tiles: shuffle([...tokens]),
      correctOrder: tokens,
    });
  }

  return shuffle(exercises).slice(0, TOTAL_QUESTIONS);
}

type Phase = "intro" | "fight" | "victory" | "defeat" | "no-content";

interface BossQuizProps {
  region: JourneyRegion;
  onClose: () => void;
}

export function BossQuiz({ region, onClose }: BossQuizProps) {
  const { unlock } = useAchievement();
  const [phase, setPhase] = useState<Phase>("intro");
  const [hp, setHp] = useState(STARTING_HP);
  // "Yokai HP": each correct answer = 1 hit. Total = TOTAL_QUESTIONS.
  const [yokaiHits, setYokaiHits] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [bossLine, setBossLine] = useState<string>(region.yokai.dialogue.intro);
  const [shake, setShake] = useState(false);
  const [yokaiHurt, setYokaiHurt] = useState(false);
  const exerciseKey = useRef(0);

  const exercises = useMemo(() => buildBossExercises(region), [region]);
  const yokaiImg = YOKAI_IMAGE[region.yokai.achievementId];

  // No playable lesson data for this region yet
  useEffect(() => {
    if (phase === "intro" && exercises.length === 0) {
      setPhase("no-content");
    }
  }, [exercises.length, phase]);

  // Award achievement on victory
  useEffect(() => {
    if (phase === "victory") {
      unlock(region.yokai.achievementId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const startFight = () => {
    setPhase("fight");
    setHp(STARTING_HP);
    setYokaiHits(0);
    setQuestionIndex(0);
    setBossLine(region.yokai.dialogue.intro);
    exerciseKey.current = 0;
  };

  const handleAnswer = (correct: boolean) => {
    if (correct) {
      const newHits = yokaiHits + 1;
      setYokaiHits(newHits);
      setYokaiHurt(true);
      setTimeout(() => setYokaiHurt(false), 400);
      const praise = region.yokai.dialogue.praise;
      setBossLine(praise[Math.floor(Math.random() * praise.length)]);

      if (newHits >= TOTAL_QUESTIONS) {
        setTimeout(() => {
          setBossLine(region.yokai.dialogue.defeat);
          setPhase("victory");
        }, 700);
        return;
      }
    } else {
      const newHp = hp - 1;
      setHp(newHp);
      setShake(true);
      setTimeout(() => setShake(false), 400);
      const taunts = region.yokai.dialogue.taunt;
      setBossLine(taunts[Math.floor(Math.random() * taunts.length)]);

      if (newHp <= 0) {
        setTimeout(() => {
          setBossLine(region.yokai.dialogue.victory);
          setPhase("defeat");
        }, 700);
        return;
      }
    }

    // Advance to next question
    setTimeout(() => {
      setQuestionIndex((i) => i + 1);
      exerciseKey.current += 1;
    }, 600);
  };

  const currentExercise = exercises[questionIndex];

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-2 sm:p-4 animate-fade-up"
      onClick={(e) => {
        if (e.target === e.currentTarget && (phase === "victory" || phase === "defeat" || phase === "no-content" || phase === "intro")) {
          onClose();
        }
      }}
    >
      <div
        className={cn(
          "relative w-full max-w-2xl max-h-[95vh] overflow-y-auto rounded-sm border border-foreground/20 shadow-2xl",
          "bg-gradient-to-br from-[hsl(30_15%_8%)] via-[hsl(30_12%_12%)] to-[hsl(30_15%_6%)]",
          shake && "animate-shake"
        )}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-sm text-[hsl(35_15%_70%)] hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Decorative kanji watermark */}
        <span
          className="pointer-events-none absolute -right-6 -top-10 serif-jp text-[12rem] font-bold text-white/[0.03] leading-none select-none"
          aria-hidden
        >
          {region.nameJp.charAt(0)}
        </span>

        {/* INTRO */}
        {phase === "intro" && (
          <div className="relative p-6 md:p-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-8 h-px bg-[hsl(5_85%_55%)]" />
              <p className="text-[10px] uppercase tracking-[0.4em] text-[hsl(5_85%_60%)]">
                Boss Encounter · 妖怪戦
              </p>
              <div className="w-8 h-px bg-[hsl(5_85%_55%)]" />
            </div>

            <img
              src={yokaiImg}
              alt={region.yokai.name}
              loading="lazy"
              width={1024}
              height={1024}
              className="w-48 h-48 md:w-64 md:h-64 object-contain mx-auto my-3 drop-shadow-[0_8px_24px_hsl(5_85%_30%/0.5)]"
            />

            <h2 className="serif-jp font-bold text-2xl md:text-3xl text-[hsl(35_25%_92%)] leading-tight mb-1">
              {region.yokai.name}
            </h2>
            <p className="serif-jp text-sm text-[hsl(5_85%_60%)] mb-5">{region.yokai.nameJp}</p>

            <p className="text-sm text-[hsl(35_15%_75%)] italic max-w-md mx-auto leading-relaxed mb-6">
              {region.yokai.lore}
            </p>

            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto mb-6 text-left">
              <div className="border border-[hsl(35_15%_25%)] rounded-sm p-3">
                <p className="text-[10px] uppercase tracking-widest text-[hsl(35_15%_55%)] mb-1">Your hearts</p>
                <div className="flex gap-1">
                  {Array.from({ length: STARTING_HP }).map((_, i) => (
                    <Heart key={i} className="w-4 h-4 fill-[hsl(5_85%_55%)] text-[hsl(5_85%_55%)]" />
                  ))}
                </div>
              </div>
              <div className="border border-[hsl(35_15%_25%)] rounded-sm p-3">
                <p className="text-[10px] uppercase tracking-widest text-[hsl(35_15%_55%)] mb-1">Strikes needed</p>
                <p className="serif-jp font-bold text-xl text-[hsl(35_25%_92%)]">{TOTAL_QUESTIONS}</p>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-2 justify-center">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-sm border border-[hsl(35_15%_30%)] text-[hsl(35_15%_75%)] hover:bg-white/5 transition-colors text-sm uppercase tracking-wider"
              >
                Withdraw
              </button>
              <button
                onClick={startFight}
                className="px-6 py-2.5 rounded-sm bg-[hsl(5_85%_50%)] text-white hover:shadow-[0_0_24px_hsl(5_85%_50%/0.5)] transition-all text-sm uppercase tracking-wider font-bold serif-jp"
              >
                Begin the duel
              </button>
            </div>
          </div>
        )}

        {/* NO CONTENT */}
        {phase === "no-content" && (
          <div className="relative p-8 text-center">
            <div className="text-5xl mb-4 grayscale opacity-70" aria-hidden>{region.yokai.emoji}</div>
            <h2 className="serif-jp font-bold text-xl text-[hsl(35_25%_92%)] mb-2">
              The {region.yokai.name.split(" of ")[0]} sleeps
            </h2>
            <p className="text-sm text-[hsl(35_15%_70%)] italic max-w-md mx-auto leading-relaxed mb-5">
              The lessons of {region.name} are still being inscribed onto scrolls. Return when more of this land has been mapped.
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-sm border border-[hsl(35_15%_30%)] text-[hsl(35_15%_85%)] hover:bg-white/5 transition-colors text-sm uppercase tracking-wider"
            >
              Return to map
            </button>
          </div>
        )}

        {/* FIGHT */}
        {phase === "fight" && currentExercise && (
          <div className="relative">
            {/* Combat HUD */}
            <div className="px-5 md:px-6 pt-5 pb-4 border-b border-[hsl(35_15%_18%)]">
              {/* Yokai status */}
              <div className="flex items-center gap-3 mb-3">
                <div className={cn(
                  "relative w-14 h-14 md:w-16 md:h-16 shrink-0 rounded-sm bg-black/30 border border-[hsl(35_15%_25%)] overflow-hidden transition-all",
                  yokaiHurt && "scale-95 brightness-150"
                )}>
                  <img
                    src={yokaiImg}
                    alt={region.yokai.name}
                    loading="lazy"
                    className={cn(
                      "w-full h-full object-contain transition-all",
                      yokaiHurt && "animate-pulse"
                    )}
                  />
                  {yokaiHurt && (
                    <div className="absolute inset-0 bg-[hsl(5_85%_55%)]/40 mix-blend-overlay" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2 mb-1.5">
                    <p className="serif-jp font-bold text-sm text-[hsl(35_25%_92%)] truncate">
                      {region.yokai.name.split(" of ")[0]}
                    </p>
                    <p className="text-[10px] font-mono tabular-nums text-[hsl(35_15%_60%)]">
                      {yokaiHits}/{TOTAL_QUESTIONS}
                    </p>
                  </div>
                  {/* Yokai HP bar (depletes as you land hits) */}
                  <div className="h-1.5 bg-[hsl(0_0%_15%)] rounded-full overflow-hidden border border-[hsl(35_15%_20%)]">
                    <div
                      className="h-full bg-gradient-to-r from-[hsl(5_85%_55%)] to-[hsl(5_85%_45%)] transition-all duration-500"
                      style={{ width: `${100 - (yokaiHits / TOTAL_QUESTIONS) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Yokai dialogue bubble */}
              <div className="relative bg-[hsl(0_0%_10%)] border border-[hsl(35_15%_22%)] rounded-sm px-3 py-2 mb-3">
                <div className="absolute -top-1.5 left-6 w-3 h-3 bg-[hsl(0_0%_10%)] border-t border-l border-[hsl(35_15%_22%)] rotate-45" />
                <p className="text-xs serif-jp italic text-[hsl(35_15%_82%)] leading-snug">
                  {bossLine}
                </p>
              </div>

              {/* Player status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: STARTING_HP }).map((_, i) => (
                    <Heart
                      key={i}
                      className={cn(
                        "w-4 h-4 transition-all",
                        i < hp
                          ? "fill-[hsl(5_85%_55%)] text-[hsl(5_85%_55%)]"
                          : "text-[hsl(35_15%_30%)]"
                      )}
                    />
                  ))}
                </div>
                <p className="text-[10px] font-mono tabular-nums text-[hsl(35_15%_55%)] uppercase tracking-wider">
                  Strike {questionIndex + 1} / {exercises.length}
                </p>
              </div>
            </div>

            {/* Exercise (rendered on light paper card for legibility) */}
            <div className="bg-card text-foreground p-5 md:p-6 m-3 rounded-sm border border-border/40">
              {currentExercise.type === "multiple_choice" && (
                <MultipleChoiceCard
                  key={exerciseKey.current}
                  exercise={currentExercise}
                  onComplete={(r) => handleAnswer(r.correct)}
                />
              )}
              {currentExercise.type === "type_answer" && (
                <TypeAnswerCard
                  key={exerciseKey.current}
                  exercise={currentExercise}
                  onComplete={(r) => handleAnswer(r.correct)}
                />
              )}
              {currentExercise.type === "sentence_builder" && (
                <SentenceBuilderCard
                  key={exerciseKey.current}
                  exercise={currentExercise}
                  onComplete={(r) => handleAnswer(r.correct)}
                />
              )}
            </div>
          </div>
        )}

        {/* VICTORY */}
        {phase === "victory" && (
          <div className="relative p-6 md:p-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Sparkles className="w-4 h-4 text-[hsl(5_85%_60%)]" />
              <p className="text-[10px] uppercase tracking-[0.4em] text-[hsl(5_85%_60%)]">
                Victory · 勝利
              </p>
              <Sparkles className="w-4 h-4 text-[hsl(5_85%_60%)]" />
            </div>

            <div className="relative inline-block animate-stamp my-2">
              <img
                src={yokaiImg}
                alt={region.yokai.name}
                loading="lazy"
                width={1024}
                height={1024}
                className="w-44 h-44 md:w-56 md:h-56 object-contain mx-auto opacity-60 grayscale-[40%]"
              />
              {/* Hanko stamp */}
              <div className="absolute top-2 right-2 w-16 h-16 rounded-sm border-2 border-[hsl(5_85%_55%)] bg-[hsl(5_85%_55%)]/15 backdrop-blur flex items-center justify-center -rotate-12 shadow-lg">
                <span className="serif-jp font-bold text-[hsl(5_85%_60%)] text-2xl">勝</span>
              </div>
            </div>

            <h2 className="serif-jp font-bold text-2xl text-[hsl(35_25%_92%)] mt-4 mb-1">
              {region.name} is yours
            </h2>
            <p className="serif-jp text-sm text-[hsl(5_85%_60%)] mb-4">
              {region.yokai.nameJp} — defeated
            </p>

            <div className="bg-black/30 border border-[hsl(35_15%_22%)] rounded-sm p-4 max-w-md mx-auto mb-5">
              <p className="text-sm text-[hsl(35_15%_82%)] italic leading-relaxed serif-jp">
                "{bossLine}"
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-[hsl(35_25%_85%)] mb-5">
              <Trophy className="w-4 h-4 text-[hsl(5_85%_60%)]" />
              <span className="text-xs uppercase tracking-widest">
                A spirit has joined your bestiary
              </span>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-sm bg-[hsl(5_85%_50%)] text-white hover:shadow-[0_0_24px_hsl(5_85%_50%/0.5)] transition-all text-sm uppercase tracking-wider font-bold serif-jp"
            >
              Continue your journey
            </button>
          </div>
        )}

        {/* DEFEAT */}
        {phase === "defeat" && (
          <div className="relative p-6 md:p-8 text-center">
            <p className="text-[10px] uppercase tracking-[0.4em] text-[hsl(35_15%_55%)] mb-3">
              Defeat · 敗北
            </p>
            <img
              src={yokaiImg}
              alt={region.yokai.name}
              loading="lazy"
              width={1024}
              height={1024}
              className="w-44 h-44 md:w-56 md:h-56 object-contain mx-auto my-2 drop-shadow-[0_8px_24px_hsl(5_85%_30%/0.4)]"
            />
            <h2 className="serif-jp font-bold text-2xl text-[hsl(35_25%_92%)] mb-4">
              The duel is lost
            </h2>
            <div className="bg-black/30 border border-[hsl(35_15%_22%)] rounded-sm p-4 max-w-md mx-auto mb-5">
              <p className="text-sm text-[hsl(35_15%_82%)] italic leading-relaxed serif-jp">
                "{bossLine}"
              </p>
            </div>
            <p className="text-xs text-[hsl(35_15%_60%)] italic mb-5 max-w-md mx-auto">
              Sharpen your verbs in the lessons of {region.name} and return when you are ready.
            </p>
            <div className="flex flex-col-reverse sm:flex-row gap-2 justify-center">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-sm border border-[hsl(35_15%_30%)] text-[hsl(35_15%_75%)] hover:bg-white/5 transition-colors text-sm uppercase tracking-wider"
              >
                Withdraw
              </button>
              <button
                onClick={startFight}
                className="px-6 py-2.5 rounded-sm bg-[hsl(5_85%_50%)] text-white hover:shadow-[0_0_24px_hsl(5_85%_50%/0.5)] transition-all text-sm uppercase tracking-wider font-bold serif-jp"
              >
                Try again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
