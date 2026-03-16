import type { VocabItem, GrammarPoint, ReadingPassage } from "@/components/lesson-page";

// ── Exercise types ─────────────────────────────────────────────────────────

export type ExerciseType =
  | "multiple_choice"
  | "type_answer"
  | "match_pairs"
  | "sentence_builder"
  | "translate_compose"
  | "reading_comprehension";

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
  acceptedAnswers: string[]; // multiple valid answers
  hint?: string;
}

export interface MatchPairsExercise {
  type: "match_pairs";
  pairs: { left: string; right: string }[];
}

export interface SentenceBuilderExercise {
  type: "sentence_builder";
  prompt: string; // English sentence to construct
  tiles: string[]; // shuffled Japanese tiles
  correctOrder: string[]; // correct sequence
}

export interface TranslateComposeExercise {
  type: "translate_compose";
  prompt: string; // English sentence to translate
  acceptedAnswers: string[]; // valid Japanese translations
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

export type Exercise =
  | MultipleChoiceExercise
  | TypeAnswerExercise
  | MatchPairsExercise
  | SentenceBuilderExercise
  | TranslateComposeExercise
  | ReadingComprehensionExercise;

// ── Lesson step (mixed progression) ────────────────────────────────────────

export type LessonStepType = "vocab_intro" | "grammar_intro" | "exercise";

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

export type LessonStep = VocabIntroStep | GrammarIntroStep | ExerciseStep;

// ── Generate lesson steps from lesson data ─────────────────────────────────

export function generateLessonSteps(
  vocabulary: VocabItem[],
  grammarPoints: GrammarPoint[],
  readingPassages?: ReadingPassage[],
): LessonStep[] {
  const steps: LessonStep[] = [];
  const CHUNK = 4;
  const vocabChunks: VocabItem[][] = [];
  
  for (let i = 0; i < vocabulary.length; i += CHUNK) {
    vocabChunks.push(vocabulary.slice(i, i + CHUNK));
  }

  // For each chunk: intro words → mini exercises → then grammar + exercises
  vocabChunks.forEach((chunk, chunkIdx) => {
    // Introduce words
    steps.push({ type: "vocab_intro", words: chunk });

    // Mini quiz on just-learned words
    const exercises = generateVocabExercises(chunk, vocabulary);
    exercises.forEach((ex) => steps.push({ type: "exercise", exercise: ex, xpReward: 5 }));

    // Interleave grammar points
    const gpIdx = chunkIdx % grammarPoints.length;
    if (chunkIdx < grammarPoints.length) {
      steps.push({ type: "grammar_intro", point: grammarPoints[gpIdx] });
      const gExercises = generateGrammarExercises(grammarPoints[gpIdx], vocabulary);
      gExercises.forEach((ex) => steps.push({ type: "exercise", exercise: ex, xpReward: 10 }));
    }
  });

  return steps;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateVocabExercises(chunk: VocabItem[], allVocab: VocabItem[]): Exercise[] {
  const exercises: Exercise[] = [];

  // 1. Multiple choice: "What does X mean?"
  const mcWord = chunk[0];
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

  // 2. Type answer: "Type the reading for X"
  if (chunk.length > 1) {
    const taWord = chunk[1];
    exercises.push({
      type: "type_answer",
      prompt: `Type the reading for 「${taWord.japanese}」`,
      promptJp: taWord.japanese,
      acceptedAnswers: [taWord.reading, taWord.reading.replace(/ō/g, "ou").replace(/ū/g, "uu")],
      hint: taWord.meaning,
    });
  }

  // 3. Match pairs (if enough words)
  if (chunk.length >= 3) {
    const matchItems = chunk.slice(0, 4);
    exercises.push({
      type: "match_pairs",
      pairs: matchItems.map((w) => ({ left: w.japanese, right: w.meaning })),
    });
  }

  return exercises;
}

function generateGrammarExercises(point: GrammarPoint, allVocab: VocabItem[]): Exercise[] {
  const exercises: Exercise[] = [];

  // Sentence builder from first example
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

  // Translate compose from second example
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
