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

export type Exercise =
  | MultipleChoiceExercise
  | TypeAnswerExercise
  | MatchPairsExercise
  | SentenceBuilderExercise
  | TranslateComposeExercise
  | ReadingComprehensionExercise;

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

// ── Generate lesson steps (Duolingo-style) ─────────────────────────────────

export function generateLessonSteps(
  vocabulary: VocabItem[],
  grammarPoints: GrammarPoint[],
  readingPassages?: ReadingPassage[],
): LessonStep[] {
  const steps: LessonStep[] = [];
  const CHUNK = 4;
  const vocabChunks = chunk(vocabulary, CHUNK);

  // ── PHASE 1: Vocabulary — learn + immediate mini-quiz ────────────────
  steps.push({
    type: "phase_label",
    title: "Vocabulary",
    subtitle: "Learn new words, then test yourself",
    emoji: "📝",
  });

  for (const words of vocabChunks) {
    steps.push({ type: "vocab_intro", words });
    const exercises = generateVocabExercises(words, vocabulary);
    exercises.forEach((ex) => steps.push({ type: "exercise", exercise: ex, xpReward: 5 }));
  }

  // ── PHASE 2: Grammar — learn each rule + practice it ─────────────────
  if (grammarPoints.length > 0) {
    steps.push({
      type: "phase_label",
      title: "Grammar",
      subtitle: "Learn each rule, then put it into practice",
      emoji: "📖",
    });

    for (const point of grammarPoints) {
      steps.push({ type: "grammar_intro", point });
      const gExercises = generateGrammarExercises(point, vocabulary);
      gExercises.forEach((ex) => steps.push({ type: "exercise", exercise: ex, xpReward: 10 }));
    }
  }

  // ── PHASE 3: Final Quiz — mixed review of everything ─────────────────
  const finalExercises = generateFinalQuiz(vocabulary, grammarPoints, readingPassages);
  if (finalExercises.length > 0) {
    steps.push({
      type: "phase_label",
      title: "Final Quiz — 総復習",
      subtitle: "Mixed review of everything you learned",
      emoji: "🏯",
    });

    finalExercises.forEach((ex) => steps.push({ type: "exercise", exercise: ex, xpReward: 15 }));
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
