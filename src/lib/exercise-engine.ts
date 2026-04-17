import type {
  VocabItem,
  GrammarPoint,
  ReadingPassage,
  LessonData,
  ParticleFillItem,
  ConjugationItem,
  SubstitutionItem,
  DictationItem,
  TransformItem,
  Dialogue,
} from "@/components/lesson-page";

// ── Exercise types ─────────────────────────────────────────────────────────

export type ExerciseType =
  | "multiple_choice"
  | "type_answer"
  | "match_pairs"
  | "sentence_builder"
  | "translate_compose"
  | "reading_comprehension"
  | "particle_fill"
  | "conjugation"
  | "substitution"
  | "dictation"
  | "transform"
  | "dialogue";

export interface MultipleChoiceExercise {
  type: "multiple_choice";
  prompt: string;
  promptJp?: string;
  options: string[];
  correctIndex: number;
}

export interface TypeAnswerExercise {
  type: "type_answer";
  prompt: string;
  promptJp?: string;
  acceptedAnswers: string[];
  hint?: string;
}

export interface MatchPairsExercise {
  type: "match_pairs";
  pairs: { left: string; right: string }[];
}

export interface SentenceBuilderExercise {
  type: "sentence_builder";
  prompt: string;
  tiles: string[];
  correctOrder: string[];
}

export interface TranslateComposeExercise {
  type: "translate_compose";
  prompt: string;
  acceptedAnswers: string[];
  hint?: string;
}

export interface ReadingComprehensionExercise {
  type: "reading_comprehension";
  title: string;
  titleJp: string;
  text: string;
  translation: string;
  question: string;
  options: string[];
  correctIndex: number;
}

// ── Minna-style exercises ──────────────────────────────────────────────────

export interface ParticleFillExercise extends ParticleFillItem {
  type: "particle_fill";
}

export interface ConjugationExercise extends ConjugationItem {
  type: "conjugation";
}

export interface SubstitutionExercise extends SubstitutionItem {
  type: "substitution";
}

export interface DictationExercise extends DictationItem {
  type: "dictation";
}

export interface TransformExercise extends TransformItem {
  type: "transform";
}

export interface DialogueExercise extends Dialogue {
  type: "dialogue";
}

export type Exercise =
  | MultipleChoiceExercise
  | TypeAnswerExercise
  | MatchPairsExercise
  | SentenceBuilderExercise
  | TranslateComposeExercise
  | ReadingComprehensionExercise
  | ParticleFillExercise
  | ConjugationExercise
  | SubstitutionExercise
  | DictationExercise
  | TransformExercise
  | DialogueExercise;

// ── Lesson step types ──────────────────────────────────────────────────────

export type LessonStepType = "vocab_intro" | "grammar_intro" | "exercise" | "phase_label";

export interface VocabIntroStep {
  type: "vocab_intro";
  words: VocabItem[];
}

export interface GrammarIntroStep {
  type: "grammar_intro";
  point: GrammarPoint;
}

export interface ExerciseStep {
  type: "exercise";
  exercise: Exercise;
  xpReward: number;
}

export interface PhaseLabelStep {
  type: "phase_label";
  title: string;
  subtitle: string;
  emoji: string;
}

export type LessonStep = VocabIntroStep | GrammarIntroStep | ExerciseStep | PhaseLabelStep;

// ── Helpers ────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

// ── Generate lesson steps (Minna-style two-phase flow) ─────────────────────

/**
 * Two-phase Minna-style flow:
 *   PHASE 1 — LEARN: vocab chunks (intro + mini quiz) → grammar points (intro + light exercise).
 *   PHASE 2 — REVIEW: particle drills, conjugation, substitution, transform, dictation, dialogue,
 *                     and a final mixed quiz (MC, type-answer, sentence builder, reading).
 *
 * If a lesson opts in via the new optional fields (particleDrills, conjugationDrills, …, dialogue),
 * those Minna-style exercises are inserted in PHASE 2.
 */
export function generateLessonSteps(
  vocabulary: VocabItem[],
  grammarPoints: GrammarPoint[],
  readingPassages?: ReadingPassage[],
  minna?: Pick<
    LessonData,
    "particleDrills" | "conjugationDrills" | "substitutionDrills" | "dictationDrills" | "transformDrills" | "dialogue"
  >,
): LessonStep[] {
  const steps: LessonStep[] = [];
  const CHUNK = 4;
  const vocabChunks = chunk(vocabulary, CHUNK);

  // ───────── PHASE 1 — LEARN ─────────
  steps.push({
    type: "phase_label",
    title: "Phase 1 — 学ぶ Learn",
    subtitle: "Meet new words & grammar, with light practice as you go",
    emoji: "📝",
  });

  // Vocabulary chunks: intro + mini-quiz
  for (const words of vocabChunks) {
    steps.push({ type: "vocab_intro", words });
    const exercises = generateVocabExercises(words, vocabulary);
    exercises.forEach((ex) => steps.push({ type: "exercise", exercise: ex, xpReward: 5 }));
  }

  // Grammar points: each rule + 1-2 quick exercises
  for (const point of grammarPoints) {
    steps.push({ type: "grammar_intro", point });
    const gExercises = generateGrammarExercises(point, vocabulary);
    gExercises.forEach((ex) => steps.push({ type: "exercise", exercise: ex, xpReward: 10 }));
  }

  // ───────── PHASE 2 — REVIEW (Minna 練習A/B/C style) ─────────
  const reviewExercises: ExerciseStep[] = [];

  // 練習A — particle fill-in
  if (minna?.particleDrills?.length) {
    for (const item of minna.particleDrills) {
      reviewExercises.push({ type: "exercise", xpReward: 8, exercise: { type: "particle_fill", ...item } });
    }
  }
  // 練習A — conjugation
  if (minna?.conjugationDrills?.length) {
    for (const item of minna.conjugationDrills) {
      reviewExercises.push({ type: "exercise", xpReward: 10, exercise: { type: "conjugation", ...item } });
    }
  }
  // 練習B — substitution Q→A
  if (minna?.substitutionDrills?.length) {
    for (const item of minna.substitutionDrills) {
      reviewExercises.push({ type: "exercise", xpReward: 12, exercise: { type: "substitution", ...item } });
    }
  }
  // 練習B — transform / rewrite
  if (minna?.transformDrills?.length) {
    for (const item of minna.transformDrills) {
      reviewExercises.push({ type: "exercise", xpReward: 12, exercise: { type: "transform", ...item } });
    }
  }
  // Listening dictation
  if (minna?.dictationDrills?.length) {
    for (const item of minna.dictationDrills) {
      reviewExercises.push({ type: "exercise", xpReward: 12, exercise: { type: "dictation", ...item } });
    }
  }

  // Mixed final quiz (existing engine logic)
  const finalExercises = generateFinalQuiz(vocabulary, grammarPoints, readingPassages);
  finalExercises.forEach((ex) => reviewExercises.push({ type: "exercise", exercise: ex, xpReward: 15 }));

  // 会話 — Dialogue (always last in review, Minna-style)
  if (minna?.dialogue) {
    reviewExercises.push({ type: "exercise", xpReward: 20, exercise: { type: "dialogue", ...minna.dialogue } });
  }

  if (reviewExercises.length > 0) {
    steps.push({
      type: "phase_label",
      title: "Phase 2 — 復習 Review",
      subtitle: "Drill particles, conjugation, listening & a real conversation",
      emoji: "🏯",
    });
    steps.push(...reviewExercises);
  }

  return steps;
}

// ── Vocab exercises (mini-quiz after each chunk) ───────────────────────────

function generateVocabExercises(chunkWords: VocabItem[], allVocab: VocabItem[]): Exercise[] {
  const exercises: Exercise[] = [];

  // Multiple choice: "What does X mean?"
  const mcWord = chunkWords[0];
  const distractors = shuffle(allVocab.filter((w) => w.japanese !== mcWord.japanese))
    .slice(0, 3)
    .map((w) => w.meaning);
  const mcOptions = shuffle([mcWord.meaning, ...distractors]);
  exercises.push({
    type: "multiple_choice",
    prompt: `What does 「${mcWord.japanese}」mean?`,
    promptJp: mcWord.japanese,
    options: mcOptions,
    correctIndex: mcOptions.indexOf(mcWord.meaning),
  });

  // Type answer: "Type the reading for X"
  if (chunkWords.length > 1) {
    const taWord = chunkWords[1];
    exercises.push({
      type: "type_answer",
      prompt: `Type the reading for 「${taWord.japanese}」`,
      promptJp: taWord.japanese,
      acceptedAnswers: [taWord.reading, taWord.reading.replace(/ō/g, "ou").replace(/ū/g, "uu")],
      hint: taWord.meaning,
    });
  }

  // Match pairs
  if (chunkWords.length >= 3) {
    const matchItems = chunkWords.slice(0, 4);
    exercises.push({
      type: "match_pairs",
      pairs: matchItems.map((w) => ({ left: w.japanese, right: w.meaning })),
    });
  }

  return exercises;
}

// ── Grammar exercises (inline after each rule) ─────────────────────────────

function generateGrammarExercises(point: GrammarPoint, _allVocab: VocabItem[]): Exercise[] {
  const exercises: Exercise[] = [];

  if (point.examples.length > 0) {
    const ex = point.examples[0];
    const tokens = ex.jp.replace(/。/g, "").split(/\s+/).filter(Boolean);
    exercises.push({
      type: "sentence_builder",
      prompt: ex.en,
      tiles: shuffle([...tokens]),
      correctOrder: tokens,
    });
  }

  if (point.examples.length > 1) {
    const ex = point.examples[1];
    exercises.push({
      type: "translate_compose",
      prompt: ex.en,
      acceptedAnswers: [ex.jp.replace(/。/g, "").trim(), ex.jp.trim()],
      hint: point.rule,
    });
  }

  return exercises;
}

// ── Final Quiz — mixed review ──────────────────────────────────────────────

function generateFinalQuiz(
  vocabulary: VocabItem[],
  grammarPoints: GrammarPoint[],
  readingPassages?: ReadingPassage[],
): Exercise[] {
  const exercises: Exercise[] = [];

  // Pick random vocab for MC questions (up to 3)
  const shuffledVocab = shuffle(vocabulary);
  const mcCount = Math.min(3, shuffledVocab.length);
  for (let i = 0; i < mcCount; i++) {
    const word = shuffledVocab[i];
    const distractors = shuffle(vocabulary.filter((w) => w.japanese !== word.japanese))
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

  // Pick random vocab for type-answer (up to 2, different from MC)
  const taVocab = shuffledVocab.slice(mcCount, mcCount + 2);
  for (const word of taVocab) {
    exercises.push({
      type: "type_answer",
      prompt: `Type the reading for 「${word.japanese}」`,
      promptJp: word.japanese,
      acceptedAnswers: [word.reading, word.reading.replace(/ō/g, "ou").replace(/ū/g, "uu")],
      hint: word.meaning,
    });
  }

  // Sentence builder from random grammar points (up to 2)
  const shuffledGrammar = shuffle(grammarPoints);
  for (let i = 0; i < Math.min(2, shuffledGrammar.length); i++) {
    const point = shuffledGrammar[i];
    const ex = point.examples[Math.floor(Math.random() * point.examples.length)];
    if (ex) {
      const tokens = ex.jp.replace(/。/g, "").split(/\s+/).filter(Boolean);
      exercises.push({
        type: "sentence_builder",
        prompt: ex.en,
        tiles: shuffle([...tokens]),
        correctOrder: tokens,
      });
    }
  }

  // Reading comprehension
  if (readingPassages && readingPassages.length > 0) {
    for (const passage of readingPassages) {
      for (const q of passage.questions) {
        exercises.push({
          type: "reading_comprehension",
          title: passage.title,
          titleJp: passage.titleJp,
          text: passage.text,
          translation: passage.translation,
          question: q.question,
          options: q.options,
          correctIndex: q.correct,
        });
      }
    }
  }

  return shuffle(exercises);
}
