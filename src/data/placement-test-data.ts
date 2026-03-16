// ── Placement Test Question Bank ────────────────────────────────────────────
// Questions span N5 (beginner) → N4 (elementary) difficulty.
// Each question maps to a lesson range so we can determine unlock level.

export type PlacementCategory = "vocab" | "grammar" | "reading" | "listening";

export interface PlacementQuestion {
  id: string;
  category: PlacementCategory;
  difficulty: number; // 1-10, maps to lesson tiers
  prompt: string;
  promptJp?: string; // for TTS listening questions
  options: string[];
  correctIndex: number;
  /** For reading questions */
  passage?: string;
  passageTranslation?: string;
  /** Lesson range this question covers (e.g. if user gets it right, they know up to this lesson) */
  coversUpToLesson: number;
}

export const placementQuestions: PlacementQuestion[] = [
  // ═══════════════════════════════════════════════════════════════════════
  // VOCABULARY — Lessons 1-10
  // ═══════════════════════════════════════════════════════════════════════

  // Lesson 1-2 level
  {
    id: "v1",
    category: "vocab",
    difficulty: 1,
    prompt: "What does 「せんせい」mean?",
    promptJp: "せんせい",
    options: ["Student", "Teacher", "Doctor", "Friend"],
    correctIndex: 1,
    coversUpToLesson: 1,
  },
  {
    id: "v2",
    category: "vocab",
    difficulty: 1,
    prompt: "What does 「ほん」mean?",
    promptJp: "ほん",
    options: ["Pen", "Notebook", "Book", "Bag"],
    correctIndex: 2,
    coversUpToLesson: 2,
  },
  {
    id: "v3",
    category: "vocab",
    difficulty: 2,
    prompt: "What does 「じしょ」mean?",
    promptJp: "じしょ",
    options: ["Newspaper", "Magazine", "Dictionary", "Textbook"],
    correctIndex: 2,
    coversUpToLesson: 2,
  },

  // Lesson 3-4 level
  {
    id: "v4",
    category: "vocab",
    difficulty: 3,
    prompt: "What does 「デパート」mean?",
    promptJp: "デパート",
    options: ["Department store", "Restaurant", "Hospital", "Station"],
    correctIndex: 0,
    coversUpToLesson: 3,
  },
  {
    id: "v5",
    category: "vocab",
    difficulty: 4,
    prompt: "What does 「おきます」mean?",
    promptJp: "おきます",
    options: ["To sleep", "To eat", "To wake up", "To go"],
    correctIndex: 2,
    coversUpToLesson: 4,
  },

  // Lesson 5-6 level
  {
    id: "v6",
    category: "vocab",
    difficulty: 5,
    prompt: "What does 「のみます」mean?",
    promptJp: "のみます",
    options: ["To eat", "To drink", "To read", "To write"],
    correctIndex: 1,
    coversUpToLesson: 6,
  },
  {
    id: "v7",
    category: "vocab",
    difficulty: 5,
    prompt: "What does 「でんしゃ」mean?",
    promptJp: "でんしゃ",
    options: ["Bus", "Taxi", "Train", "Airplane"],
    correctIndex: 2,
    coversUpToLesson: 5,
  },

  // Lesson 7-8 level
  {
    id: "v8",
    category: "vocab",
    difficulty: 7,
    prompt: "What does 「あげます」mean?",
    promptJp: "あげます",
    options: ["To receive", "To give", "To borrow", "To lend"],
    correctIndex: 1,
    coversUpToLesson: 7,
  },
  {
    id: "v9",
    category: "vocab",
    difficulty: 8,
    prompt: "What does 「しずかな」mean?",
    promptJp: "しずかな",
    options: ["Noisy", "Beautiful", "Quiet", "Busy"],
    correctIndex: 2,
    coversUpToLesson: 8,
  },

  // Lesson 9-10 level
  {
    id: "v10",
    category: "vocab",
    difficulty: 9,
    prompt: "What does 「じょうずな」mean?",
    promptJp: "じょうずな",
    options: ["Dislike", "Skillful", "Difficult", "Easy"],
    correctIndex: 1,
    coversUpToLesson: 9,
  },
  {
    id: "v11",
    category: "vocab",
    difficulty: 10,
    prompt: "What does 「あります」mean?",
    promptJp: "あります",
    options: ["There is (living)", "To do", "There is (non-living)", "To go"],
    correctIndex: 2,
    coversUpToLesson: 10,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // GRAMMAR — Lessons 1-10
  // ═══════════════════════════════════════════════════════════════════════

  {
    id: "g1",
    category: "grammar",
    difficulty: 1,
    prompt: "「わたし＿ がくせいです」— Fill in the particle.",
    options: ["を", "は", "に", "で"],
    correctIndex: 1,
    coversUpToLesson: 1,
  },
  {
    id: "g2",
    category: "grammar",
    difficulty: 2,
    prompt: "「これ＿ ほんです」— This IS a book.",
    options: ["が", "は", "を", "の"],
    correctIndex: 1,
    coversUpToLesson: 2,
  },
  {
    id: "g3",
    category: "grammar",
    difficulty: 3,
    prompt: "「トイレは どこですか」— What does this mean?",
    options: ["What is the toilet?", "Where is the toilet?", "How is the toilet?", "Whose toilet?"],
    correctIndex: 1,
    coversUpToLesson: 3,
  },
  {
    id: "g4",
    category: "grammar",
    difficulty: 4,
    prompt: "「7じ＿ おきます」— I wake up AT 7.",
    options: ["で", "を", "に", "は"],
    correctIndex: 2,
    coversUpToLesson: 4,
  },
  {
    id: "g5",
    category: "grammar",
    difficulty: 5,
    prompt: "「とうきょう＿ いきます」— I go TO Tokyo.",
    options: ["を", "で", "に", "へ"],
    correctIndex: 3,
    coversUpToLesson: 5,
  },
  {
    id: "g6",
    category: "grammar",
    difficulty: 6,
    prompt: "「いっしょに たべ＿か」— Shall we eat together?",
    options: ["ます", "ません", "ました", "ましょう"],
    correctIndex: 1,
    coversUpToLesson: 6,
  },
  {
    id: "g7",
    category: "grammar",
    difficulty: 7,
    prompt: "「はさみ＿ きります」— Cut WITH scissors.",
    options: ["を", "に", "で", "は"],
    correctIndex: 2,
    coversUpToLesson: 7,
  },
  {
    id: "g8",
    category: "grammar",
    difficulty: 8,
    prompt: "How do you say 'Tokyo is not quiet' in Japanese?",
    options: [
      "とうきょうは しずかです",
      "とうきょうは しずかじゃ ありません",
      "とうきょうは しずかくない",
      "とうきょうは しずかでした",
    ],
    correctIndex: 1,
    coversUpToLesson: 8,
  },
  {
    id: "g9",
    category: "grammar",
    difficulty: 9,
    prompt: "「にほんご＿ わかります」— I understand Japanese.",
    options: ["を", "は", "が", "に"],
    correctIndex: 2,
    coversUpToLesson: 9,
  },
  {
    id: "g10",
    category: "grammar",
    difficulty: 10,
    prompt: "「つくえの うえ＿ ほんが あります」— There's a book ON the desk.",
    options: ["で", "を", "に", "は"],
    correctIndex: 2,
    coversUpToLesson: 10,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // READING COMPREHENSION — Mid to high level
  // ═══════════════════════════════════════════════════════════════════════

  {
    id: "r1",
    category: "reading",
    difficulty: 4,
    prompt: "What time does Tanaka wake up?",
    passage:
      "たなかさんは まいにち 6じに おきます。\n7じに あさごはんを たべます。\n8じに かいしゃへ いきます。",
    passageTranslation:
      "Tanaka wakes up at 6 every day.\nEats breakfast at 7.\nGoes to the company at 8.",
    options: ["5 o'clock", "6 o'clock", "7 o'clock", "8 o'clock"],
    correctIndex: 1,
    coversUpToLesson: 4,
  },
  {
    id: "r2",
    category: "reading",
    difficulty: 7,
    prompt: "What did Suzuki receive from the teacher?",
    passage:
      "すずきさんは せんせいに ほんを もらいました。\nともだちに チョコレートを あげました。\nとても たのしい いちにちでした。",
    passageTranslation:
      "Suzuki received a book from the teacher.\nGave chocolate to a friend.\nIt was a very fun day.",
    options: ["Chocolate", "A letter", "A book", "Flowers"],
    correctIndex: 2,
    coversUpToLesson: 7,
  },
  {
    id: "r3",
    category: "reading",
    difficulty: 9,
    prompt: "What does Maria like?",
    passage:
      "マリアさんは おんがくが すきです。\nピアノが じょうずです。\nでも うたは あまり じょうずじゃ ありません。",
    passageTranslation:
      "Maria likes music.\nShe is good at piano.\nBut she is not very good at singing.",
    options: ["Singing", "Dancing", "Music", "Cooking"],
    correctIndex: 2,
    coversUpToLesson: 9,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // LISTENING — TTS-based questions
  // ═══════════════════════════════════════════════════════════════════════

  {
    id: "l1",
    category: "listening",
    difficulty: 2,
    prompt: "Listen and choose the correct meaning:",
    promptJp: "おはようございます",
    options: ["Good evening", "Good morning", "Goodbye", "Thank you"],
    correctIndex: 1,
    coversUpToLesson: 1,
  },
  {
    id: "l2",
    category: "listening",
    difficulty: 4,
    prompt: "Listen and choose what this sentence means:",
    promptJp: "いま なんじですか",
    options: ["Where are you?", "What time is it now?", "How are you?", "What is this?"],
    correctIndex: 1,
    coversUpToLesson: 4,
  },
  {
    id: "l3",
    category: "listening",
    difficulty: 6,
    prompt: "Listen and choose the correct meaning:",
    promptJp: "いっしょに ひるごはんを たべませんか",
    options: [
      "I don't eat lunch",
      "Shall we eat lunch together?",
      "I ate lunch already",
      "Where is lunch?",
    ],
    correctIndex: 1,
    coversUpToLesson: 6,
  },
  {
    id: "l4",
    category: "listening",
    difficulty: 8,
    prompt: "Listen and choose the correct meaning:",
    promptJp: "この まちは とても きれいです",
    options: [
      "This town is very noisy",
      "This town is very quiet",
      "This town is very beautiful",
      "This town is very big",
    ],
    correctIndex: 2,
    coversUpToLesson: 8,
  },
  {
    id: "l5",
    category: "listening",
    difficulty: 10,
    prompt: "Listen and choose the correct meaning:",
    promptJp: "つくえの うえに ねこが います",
    options: [
      "The cat is under the desk",
      "There is a cat on the desk",
      "There is a book on the desk",
      "The desk is next to the cat",
    ],
    correctIndex: 1,
    coversUpToLesson: 10,
  },
];

// ── Level determination ────────────────────────────────────────────────────

export interface PlacementResult {
  level: string;
  description: string;
  unlockedUpTo: number; // lesson number
  emoji: string;
}

export function determinePlacementLevel(
  score: number,
  totalQuestions: number,
  highestCorrectLesson: number,
): PlacementResult {
  const pct = totalQuestions > 0 ? score / totalQuestions : 0;

  if (pct >= 0.85 && highestCorrectLesson >= 8) {
    return {
      level: "N4",
      description: "Elementary — You have a solid foundation!",
      unlockedUpTo: 10,
      emoji: "🏯",
    };
  }
  if (pct >= 0.65 && highestCorrectLesson >= 5) {
    return {
      level: "N5 Upper",
      description: "Upper Beginner — You know the basics well!",
      unlockedUpTo: highestCorrectLesson,
      emoji: "⛩️",
    };
  }
  if (pct >= 0.4 && highestCorrectLesson >= 3) {
    return {
      level: "N5 Mid",
      description: "Mid Beginner — A good start on your journey!",
      unlockedUpTo: highestCorrectLesson,
      emoji: "🌸",
    };
  }
  return {
    level: "N5",
    description: "Beginner — The perfect place to start!",
    unlockedUpTo: 0,
    emoji: "🌱",
  };
}
