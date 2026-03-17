// ── Placement Test Question Bank ────────────────────────────────────────────
// Questions span N5 (beginner) → N1 (advanced) difficulty.
// Each question maps to a lesson range so we can determine unlock level.

export type PlacementCategory = "vocab" | "grammar" | "reading" | "listening";

export interface PlacementQuestion {
  id: string;
  category: PlacementCategory;
  difficulty: number; // 1-20, maps to lesson/level tiers
  prompt: string;
  promptJp?: string; // for TTS listening questions
  options: string[];
  correctIndex: number;
  /** For reading questions */
  passage?: string;
  passageTranslation?: string;
  /** Lesson range this question covers */
  coversUpToLesson: number;
  /** JLPT level this question targets */
  jlptLevel: "N5" | "N4" | "N3" | "N2" | "N1";
}

export const placementQuestions: PlacementQuestion[] = [
  // ═══════════════════════════════════════════════════════════════════════
  // N5 — VOCABULARY
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "v1", category: "vocab", difficulty: 1, jlptLevel: "N5",
    prompt: "What does 「せんせい」mean?", promptJp: "せんせい",
    options: ["Student", "Teacher", "Doctor", "Friend"],
    correctIndex: 1, coversUpToLesson: 1,
  },
  {
    id: "v2", category: "vocab", difficulty: 1, jlptLevel: "N5",
    prompt: "What does 「ほん」mean?", promptJp: "ほん",
    options: ["Pen", "Notebook", "Book", "Bag"],
    correctIndex: 2, coversUpToLesson: 2,
  },
  {
    id: "v3", category: "vocab", difficulty: 2, jlptLevel: "N5",
    prompt: "What does 「デパート」mean?", promptJp: "デパート",
    options: ["Department store", "Restaurant", "Hospital", "Station"],
    correctIndex: 0, coversUpToLesson: 3,
  },
  {
    id: "v4", category: "vocab", difficulty: 3, jlptLevel: "N5",
    prompt: "What does 「おきます」mean?", promptJp: "おきます",
    options: ["To sleep", "To eat", "To wake up", "To go"],
    correctIndex: 2, coversUpToLesson: 4,
  },
  {
    id: "v5", category: "vocab", difficulty: 4, jlptLevel: "N5",
    prompt: "What does 「でんしゃ」mean?", promptJp: "でんしゃ",
    options: ["Bus", "Taxi", "Train", "Airplane"],
    correctIndex: 2, coversUpToLesson: 5,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // N5 — GRAMMAR
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "g1", category: "grammar", difficulty: 1, jlptLevel: "N5",
    prompt: "「わたし＿ がくせいです」— Fill in the particle.",
    options: ["を", "は", "に", "で"], correctIndex: 1, coversUpToLesson: 1,
  },
  {
    id: "g2", category: "grammar", difficulty: 2, jlptLevel: "N5",
    prompt: "「トイレは どこですか」— What does this mean?",
    options: ["What is the toilet?", "Where is the toilet?", "How is the toilet?", "Whose toilet?"],
    correctIndex: 1, coversUpToLesson: 3,
  },
  {
    id: "g3", category: "grammar", difficulty: 3, jlptLevel: "N5",
    prompt: "「7じ＿ おきます」— I wake up AT 7.",
    options: ["で", "を", "に", "は"], correctIndex: 2, coversUpToLesson: 4,
  },
  {
    id: "g4", category: "grammar", difficulty: 4, jlptLevel: "N5",
    prompt: "「とうきょう＿ いきます」— I go TO Tokyo.",
    options: ["を", "で", "に", "へ"], correctIndex: 3, coversUpToLesson: 5,
  },
  {
    id: "g5", category: "grammar", difficulty: 5, jlptLevel: "N5",
    prompt: "「つくえの うえ＿ ほんが あります」— There's a book ON the desk.",
    options: ["で", "を", "に", "は"], correctIndex: 2, coversUpToLesson: 10,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // N5 — READING
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "r1", category: "reading", difficulty: 3, jlptLevel: "N5",
    prompt: "What time does Tanaka wake up?",
    passage: "たなかさんは まいにち 6じに おきます。\n7じに あさごはんを たべます。",
    passageTranslation: "Tanaka wakes up at 6 every day.\nEats breakfast at 7.",
    options: ["5 o'clock", "6 o'clock", "7 o'clock", "8 o'clock"],
    correctIndex: 1, coversUpToLesson: 4,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // N5 — LISTENING
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "l1", category: "listening", difficulty: 1, jlptLevel: "N5",
    prompt: "Listen and choose the correct meaning:",
    promptJp: "おはようございます",
    options: ["Good evening", "Good morning", "Goodbye", "Thank you"],
    correctIndex: 1, coversUpToLesson: 1,
  },
  {
    id: "l2", category: "listening", difficulty: 3, jlptLevel: "N5",
    prompt: "Listen and choose what this sentence means:",
    promptJp: "いま なんじですか",
    options: ["Where are you?", "What time is it now?", "How are you?", "What is this?"],
    correctIndex: 1, coversUpToLesson: 4,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // N4 — VOCABULARY
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "v6", category: "vocab", difficulty: 6, jlptLevel: "N4",
    prompt: "What does 「あげます」mean?", promptJp: "あげます",
    options: ["To receive", "To give", "To borrow", "To lend"],
    correctIndex: 1, coversUpToLesson: 7,
  },
  {
    id: "v7", category: "vocab", difficulty: 7, jlptLevel: "N4",
    prompt: "What does 「しずかな」mean?", promptJp: "しずかな",
    options: ["Noisy", "Beautiful", "Quiet", "Busy"],
    correctIndex: 2, coversUpToLesson: 8,
  },
  {
    id: "v8", category: "vocab", difficulty: 8, jlptLevel: "N4",
    prompt: "What does 「にもつ」mean?", promptJp: "にもつ",
    options: ["Letter", "Luggage", "Gift", "Ticket"],
    correctIndex: 1, coversUpToLesson: 10,
  },
  {
    id: "v9", category: "vocab", difficulty: 8, jlptLevel: "N4",
    prompt: "What does 「うんてんする」mean?", promptJp: "うんてんする",
    options: ["To walk", "To fly", "To drive", "To swim"],
    correctIndex: 2, coversUpToLesson: 10,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // N4 — GRAMMAR
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "g6", category: "grammar", difficulty: 6, jlptLevel: "N4",
    prompt: "「はさみ＿ きります」— Cut WITH scissors.",
    options: ["を", "に", "で", "は"], correctIndex: 2, coversUpToLesson: 7,
  },
  {
    id: "g7", category: "grammar", difficulty: 7, jlptLevel: "N4",
    prompt: "How do you say 'Tokyo is not quiet'?",
    options: [
      "とうきょうは しずかです",
      "とうきょうは しずかじゃ ありません",
      "とうきょうは しずかくない",
      "とうきょうは しずかでした",
    ],
    correctIndex: 1, coversUpToLesson: 8,
  },
  {
    id: "g8", category: "grammar", difficulty: 8, jlptLevel: "N4",
    prompt: "「たべた＿ あとで、さんぽします」— After eating, I take a walk.",
    options: ["の", "を", "に", "が"], correctIndex: 0, coversUpToLesson: 10,
  },
  {
    id: "g9", category: "grammar", difficulty: 8, jlptLevel: "N4",
    prompt: "「あめが ふって＿、しあいは ちゅうしに なりました」— Because it rained, the game was cancelled.",
    options: ["から", "ので", "ても", "のに"], correctIndex: 0, coversUpToLesson: 10,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // N4 — READING
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "r2", category: "reading", difficulty: 7, jlptLevel: "N4",
    prompt: "What did Suzuki receive from the teacher?",
    passage: "すずきさんは せんせいに ほんを もらいました。\nともだちに チョコレートを あげました。",
    passageTranslation: "Suzuki received a book from the teacher.\nGave chocolate to a friend.",
    options: ["Chocolate", "A letter", "A book", "Flowers"],
    correctIndex: 2, coversUpToLesson: 7,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // N4 — LISTENING
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "l3", category: "listening", difficulty: 6, jlptLevel: "N4",
    prompt: "Listen and choose the correct meaning:",
    promptJp: "いっしょに ひるごはんを たべませんか",
    options: ["I don't eat lunch", "Shall we eat lunch together?", "I ate lunch already", "Where is lunch?"],
    correctIndex: 1, coversUpToLesson: 6,
  },
  {
    id: "l4", category: "listening", difficulty: 8, jlptLevel: "N4",
    prompt: "Listen and choose the correct meaning:",
    promptJp: "この まちは とても きれいです",
    options: ["This town is very noisy", "This town is very quiet", "This town is very beautiful", "This town is very big"],
    correctIndex: 2, coversUpToLesson: 8,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // N3 — VOCABULARY
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "v10", category: "vocab", difficulty: 10, jlptLevel: "N3",
    prompt: "What does 「経験（けいけん）」mean?", promptJp: "けいけん",
    options: ["Experiment", "Experience", "Result", "Effort"],
    correctIndex: 1, coversUpToLesson: 15,
  },
  {
    id: "v11", category: "vocab", difficulty: 11, jlptLevel: "N3",
    prompt: "What does 「影響（えいきょう）」mean?", promptJp: "えいきょう",
    options: ["Shadow", "Movie", "Influence", "Reflection"],
    correctIndex: 2, coversUpToLesson: 18,
  },
  {
    id: "v12", category: "vocab", difficulty: 12, jlptLevel: "N3",
    prompt: "What does 「相談する（そうだんする）」mean?", promptJp: "そうだんする",
    options: ["To argue", "To consult", "To refuse", "To explain"],
    correctIndex: 1, coversUpToLesson: 20,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // N3 — GRAMMAR
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "g10", category: "grammar", difficulty: 10, jlptLevel: "N3",
    prompt: "「彼は 走る＿ 速い」— He is fast at running. (nominalization)",
    options: ["のが", "ことが", "のは", "ことは"], correctIndex: 0, coversUpToLesson: 15,
  },
  {
    id: "g11", category: "grammar", difficulty: 11, jlptLevel: "N3",
    prompt: "「雨が 降り＿ 試合は 続いた」— Despite the rain, the game continued.",
    options: ["ながら", "ても", "つつも", "にもかかわらず"], correctIndex: 3, coversUpToLesson: 18,
  },
  {
    id: "g12", category: "grammar", difficulty: 12, jlptLevel: "N3",
    prompt: "「この本は 読む＿ あります」— This book is worth reading.",
    options: ["ために", "ように", "かいが", "べきで"], correctIndex: 2, coversUpToLesson: 20,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // N3 — READING
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "r3", category: "reading", difficulty: 10, jlptLevel: "N3",
    prompt: "What is the main reason the writer started running?",
    passage: "去年、健康のために走り始めました。最初はつらかったですが、今は毎朝5キロ走っています。体も心も元気になりました。",
    passageTranslation: "Last year I started running for my health. It was hard at first, but now I run 5km every morning. Both body and mind have become healthier.",
    options: ["To lose weight", "For health", "For a competition", "A friend recommended it"],
    correctIndex: 1, coversUpToLesson: 15,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // N3 — LISTENING
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "l5", category: "listening", difficulty: 10, jlptLevel: "N3",
    prompt: "Listen and choose the correct meaning:",
    promptJp: "もし時間があれば、映画を見に行きませんか",
    options: ["I don't have time for movies", "If you have time, shall we go see a movie?", "I already saw the movie", "The movie starts soon"],
    correctIndex: 1, coversUpToLesson: 15,
  },
  {
    id: "l6", category: "listening", difficulty: 12, jlptLevel: "N3",
    prompt: "Listen and choose the correct meaning:",
    promptJp: "彼女は忙しいにもかかわらず、手伝ってくれました",
    options: ["She was too busy to help", "She helped despite being busy", "She will help when she's free", "She asked for help"],
    correctIndex: 1, coversUpToLesson: 20,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // N2 — VOCABULARY
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "v13", category: "vocab", difficulty: 14, jlptLevel: "N2",
    prompt: "What does 「把握する（はあくする）」mean?", promptJp: "はあくする",
    options: ["To release", "To grasp / understand", "To compare", "To predict"],
    correctIndex: 1, coversUpToLesson: 25,
  },
  {
    id: "v14", category: "vocab", difficulty: 15, jlptLevel: "N2",
    prompt: "What does 「矛盾（むじゅん）」mean?", promptJp: "むじゅん",
    options: ["Harmony", "Contradiction", "Agreement", "Compromise"],
    correctIndex: 1, coversUpToLesson: 30,
  },
  {
    id: "v15", category: "vocab", difficulty: 16, jlptLevel: "N2",
    prompt: "What does 「徹底的（てっていてき）」mean?", promptJp: "てっていてき",
    options: ["Occasional", "Gradual", "Thorough", "Superficial"],
    correctIndex: 2, coversUpToLesson: 30,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // N2 — GRAMMAR
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "g13", category: "grammar", difficulty: 14, jlptLevel: "N2",
    prompt: "「勉強する＿、成績は上がらない」— Unless you study, your grades won't improve.",
    options: ["ことには", "からには", "ものなら", "以上は"], correctIndex: 0, coversUpToLesson: 25,
  },
  {
    id: "g14", category: "grammar", difficulty: 15, jlptLevel: "N2",
    prompt: "「彼の成功は 努力＿ ほかならない」— His success is nothing but effort.",
    options: ["に", "と", "で", "から"], correctIndex: 0, coversUpToLesson: 30,
  },
  {
    id: "g15", category: "grammar", difficulty: 16, jlptLevel: "N2",
    prompt: "「約束した＿、必ず行きます」— Since I promised, I will definitely go.",
    options: ["以上は", "からには", "ものの", "わりに"], correctIndex: 0, coversUpToLesson: 30,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // N2 — READING
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "r4", category: "reading", difficulty: 14, jlptLevel: "N2",
    prompt: "What is the author's main argument?",
    passage: "技術の発展は便利さをもたらす一方で、人と人とのつながりを薄くしている面もある。大切なのは、技術に使われるのではなく、技術を使いこなすことだ。",
    passageTranslation: "While technological development brings convenience, it also thins human connections. What's important is not being controlled by technology, but mastering it.",
    options: ["Technology is dangerous", "We should reject technology", "We should master technology, not be mastered by it", "Human connections are unnecessary"],
    correctIndex: 2, coversUpToLesson: 25,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // N2 — LISTENING
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "l7", category: "listening", difficulty: 14, jlptLevel: "N2",
    prompt: "Listen and choose the correct meaning:",
    promptJp: "締め切りに間に合わないことには、評価されようがない",
    options: ["Missing the deadline doesn't matter", "You can't be evaluated unless you meet the deadline", "The deadline was extended", "The evaluation was cancelled"],
    correctIndex: 1, coversUpToLesson: 25,
  },
  {
    id: "l8", category: "listening", difficulty: 16, jlptLevel: "N2",
    prompt: "Listen and choose the correct meaning:",
    promptJp: "この問題は複雑であるがゆえに、慎重に対応する必要がある",
    options: ["This problem is simple", "This problem requires careful handling because it's complex", "We should ignore this problem", "This problem was already solved"],
    correctIndex: 1, coversUpToLesson: 30,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // N1 — VOCABULARY
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "v16", category: "vocab", difficulty: 18, jlptLevel: "N1",
    prompt: "What does 「顕著（けんちょ）」mean?", promptJp: "けんちょ",
    options: ["Obscure", "Remarkable / Prominent", "Ordinary", "Ancient"],
    correctIndex: 1, coversUpToLesson: 40,
  },
  {
    id: "v17", category: "vocab", difficulty: 19, jlptLevel: "N1",
    prompt: "What does 「齟齬（そご）」mean?", promptJp: "そご",
    options: ["Agreement", "Discrepancy", "Silence", "Nostalgia"],
    correctIndex: 1, coversUpToLesson: 45,
  },
  {
    id: "v18", category: "vocab", difficulty: 20, jlptLevel: "N1",
    prompt: "What does 「忖度（そんたく）」mean?", promptJp: "そんたく",
    options: ["Objection", "Surmising (someone's feelings)", "Obedience", "Meditation"],
    correctIndex: 1, coversUpToLesson: 50,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // N1 — GRAMMAR
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "g16", category: "grammar", difficulty: 18, jlptLevel: "N1",
    prompt: "「彼の行動は 理解＿ 苦しむ」— His actions are hard to understand.",
    options: ["するに", "に", "して", "しがたく"], correctIndex: 1, coversUpToLesson: 40,
  },
  {
    id: "g17", category: "grammar", difficulty: 19, jlptLevel: "N1",
    prompt: "「結果＿ 問わず、全力を尽くすべきだ」— Regardless of the result, one should do their best.",
    options: ["を", "に", "は", "と"], correctIndex: 0, coversUpToLesson: 45,
  },
  {
    id: "g18", category: "grammar", difficulty: 20, jlptLevel: "N1",
    prompt: "「社長＿ あろう人が、遅刻するとは」— For someone who is supposed to be the president, being late...",
    options: ["たる", "なる", "である", "とした"], correctIndex: 0, coversUpToLesson: 50,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // N1 — READING
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "r5", category: "reading", difficulty: 18, jlptLevel: "N1",
    prompt: "What does the author suggest about modern education?",
    passage: "現代の教育は知識の詰め込みに偏りがちであるが、真に求められるのは批判的思考力と創造性の涵養である。知識は手段であって、目的ではない。",
    passageTranslation: "Modern education tends to focus on cramming knowledge, but what is truly needed is the cultivation of critical thinking and creativity. Knowledge is a means, not an end.",
    options: ["More memorization is needed", "Knowledge should be the goal", "Critical thinking and creativity matter more than rote knowledge", "Education should be abolished"],
    correctIndex: 2, coversUpToLesson: 40,
  },
  {
    id: "r6", category: "reading", difficulty: 20, jlptLevel: "N1",
    prompt: "What is the paradox described in the passage?",
    passage: "情報化社会においては、情報へのアクセスが容易になればなるほど、かえって本質的な理解が浅くなるという逆説が生じている。量が質を凌駕してしまうのだ。",
    passageTranslation: "In the information society, the easier access to information becomes, the more superficial essential understanding becomes — a paradox. Quantity overwhelms quality.",
    options: ["More information leads to deeper understanding", "Easier access to information leads to shallower understanding", "Quality always wins over quantity", "Information society has no problems"],
    correctIndex: 1, coversUpToLesson: 50,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // N1 — LISTENING
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "l9", category: "listening", difficulty: 18, jlptLevel: "N1",
    prompt: "Listen and choose the correct meaning:",
    promptJp: "いかなる困難に直面しようとも、諦めるわけにはいかない",
    options: ["We should give up when facing difficulties", "No matter what difficulties we face, we cannot give up", "Difficulties are unavoidable", "We have already given up"],
    correctIndex: 1, coversUpToLesson: 40,
  },
  {
    id: "l10", category: "listening", difficulty: 20, jlptLevel: "N1",
    prompt: "Listen and choose the correct meaning:",
    promptJp: "彼の主張は一見もっともらしいが、根拠に乏しいと言わざるを得ない",
    options: ["His argument is well-supported", "His argument seems plausible but lacks evidence", "His argument is completely wrong", "His argument was accepted by everyone"],
    correctIndex: 1, coversUpToLesson: 50,
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

  if (pct >= 0.85 && highestCorrectLesson >= 40) {
    return {
      level: "N1",
      description: "Advanced — You have near-native proficiency!",
      unlockedUpTo: 50,
      emoji: "🐉",
    };
  }
  if (pct >= 0.75 && highestCorrectLesson >= 25) {
    return {
      level: "N2",
      description: "Upper Intermediate — You can handle complex material!",
      unlockedUpTo: Math.min(highestCorrectLesson, 30),
      emoji: "🏯",
    };
  }
  if (pct >= 0.65 && highestCorrectLesson >= 15) {
    return {
      level: "N3",
      description: "Intermediate — You have a solid grasp of everyday Japanese!",
      unlockedUpTo: Math.min(highestCorrectLesson, 20),
      emoji: "⚔️",
    };
  }
  if (pct >= 0.55 && highestCorrectLesson >= 8) {
    return {
      level: "N4",
      description: "Elementary — You know the fundamentals well!",
      unlockedUpTo: Math.min(highestCorrectLesson, 10),
      emoji: "⛩️",
    };
  }
  if (pct >= 0.35 && highestCorrectLesson >= 3) {
    return {
      level: "N5",
      description: "Beginner — A good start on your journey!",
      unlockedUpTo: Math.min(highestCorrectLesson, 5),
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
