/**
 * Data for the mixed daily practice session.
 * Includes kanji with radical breakdowns & funny mnemonics,
 * vocabulary recall, and grammar fill-in exercises.
 */

// ─── Kanji exercises ───────────────────────────────────────────────

export interface KanjiRadical {
  radical: string;
  meaning: string;
}

export interface KanjiEntry {
  kanji: string;
  reading: string;
  meaning: string;
  radicals: KanjiRadical[];
  /** A funny visual story built from the radical meanings */
  mnemonic: string;
}

export const kanjiEntries: KanjiEntry[] = [
  {
    kanji: "遅",
    reading: "おそい (osoi)",
    meaning: "late / slow",
    radicals: [
      { radical: "⻌", meaning: "road" },
      { radical: "尸", meaning: "corpse / body" },
      { radical: "羊", meaning: "sheep" },
    ],
    mnemonic: "A dead sheep lying on the road — no wonder you're LATE!",
  },
  {
    kanji: "休",
    reading: "やすむ (yasumu)",
    meaning: "to rest",
    radicals: [
      { radical: "亻", meaning: "person" },
      { radical: "木", meaning: "tree" },
    ],
    mnemonic: "A person leaning against a tree — taking a REST under the shade.",
  },
  {
    kanji: "森",
    reading: "もり (mori)",
    meaning: "forest",
    radicals: [
      { radical: "木", meaning: "tree" },
      { radical: "木", meaning: "tree" },
      { radical: "木", meaning: "tree" },
    ],
    mnemonic: "Three trees hanging out together — that's a whole FOREST party!",
  },
  {
    kanji: "明",
    reading: "あかるい (akarui)",
    meaning: "bright / clear",
    radicals: [
      { radical: "日", meaning: "sun" },
      { radical: "月", meaning: "moon" },
    ],
    mnemonic: "Sun AND moon in the sky at once — it's BRIGHT 24/7, no sleep allowed!",
  },
  {
    kanji: "男",
    reading: "おとこ (otoko)",
    meaning: "man / male",
    radicals: [
      { radical: "田", meaning: "rice field" },
      { radical: "力", meaning: "power / strength" },
    ],
    mnemonic: "Power in the rice field — apparently being a MAN means doing farm work all day!",
  },
  {
    kanji: "好",
    reading: "すき (suki)",
    meaning: "to like / fond of",
    radicals: [
      { radical: "女", meaning: "woman" },
      { radical: "子", meaning: "child" },
    ],
    mnemonic: "A woman holding her child — pure LOVE and fondness!",
  },
  {
    kanji: "岩",
    reading: "いわ (iwa)",
    meaning: "rock / crag",
    radicals: [
      { radical: "山", meaning: "mountain" },
      { radical: "石", meaning: "stone" },
    ],
    mnemonic: "A stone on top of a mountain — that's one dramatic ROCK!",
  },
  {
    kanji: "困",
    reading: "こまる (komaru)",
    meaning: "to be troubled",
    radicals: [
      { radical: "囗", meaning: "enclosure / box" },
      { radical: "木", meaning: "tree" },
    ],
    mnemonic: "A tree stuck inside a box — it's TROUBLED and can't grow!",
  },
  {
    kanji: "炎",
    reading: "ほのお (honoo)",
    meaning: "flame / blaze",
    radicals: [
      { radical: "火", meaning: "fire" },
      { radical: "火", meaning: "fire" },
    ],
    mnemonic: "Fire on top of fire — when one fire isn't enough, you get a BLAZE!",
  },
  {
    kanji: "雷",
    reading: "かみなり (kaminari)",
    meaning: "thunder / lightning",
    radicals: [
      { radical: "雨", meaning: "rain" },
      { radical: "田", meaning: "rice field" },
    ],
    mnemonic: "Rain hammering the rice field — farmers screaming at THUNDER!",
  },
  // ── New entries ──
  {
    kanji: "鳴",
    reading: "なく (naku)",
    meaning: "to cry / to chirp",
    radicals: [
      { radical: "口", meaning: "mouth" },
      { radical: "鳥", meaning: "bird" },
    ],
    mnemonic: "A bird opening its mouth — CHIRPING so loud the neighbors complain!",
  },
  {
    kanji: "思",
    reading: "おもう (omou)",
    meaning: "to think",
    radicals: [
      { radical: "田", meaning: "rice field" },
      { radical: "心", meaning: "heart" },
    ],
    mnemonic: "Your heart is in the rice field — all you THINK about is lunch!",
  },
  {
    kanji: "忘",
    reading: "わすれる (wasureru)",
    meaning: "to forget",
    radicals: [
      { radical: "亡", meaning: "to perish / dead" },
      { radical: "心", meaning: "heart" },
    ],
    mnemonic: "Your heart has perished — you FORGOT everything because your feelings died!",
  },
  {
    kanji: "空",
    reading: "そら (sora)",
    meaning: "sky / empty",
    radicals: [
      { radical: "穴", meaning: "hole / cave" },
      { radical: "工", meaning: "craft / work" },
    ],
    mnemonic: "A craftsman digs a hole so deep he reaches the SKY on the other side!",
  },
  {
    kanji: "花",
    reading: "はな (hana)",
    meaning: "flower",
    radicals: [
      { radical: "艹", meaning: "grass / plant" },
      { radical: "化", meaning: "to change" },
    ],
    mnemonic: "A plant that CHANGES into something beautiful — that's a FLOWER blooming!",
  },
  {
    kanji: "泣",
    reading: "なく (naku)",
    meaning: "to cry / weep",
    radicals: [
      { radical: "氵", meaning: "water" },
      { radical: "立", meaning: "to stand" },
    ],
    mnemonic: "Standing in water? No, those are your tears — you're CRYING standing up!",
  },
  {
    kanji: "飲",
    reading: "のむ (nomu)",
    meaning: "to drink",
    radicals: [
      { radical: "食", meaning: "eat / food" },
      { radical: "欠", meaning: "yawn / lack" },
    ],
    mnemonic: "You're yawning at food because you'd rather DRINK than eat!",
  },
  {
    kanji: "教",
    reading: "おしえる (oshieru)",
    meaning: "to teach",
    radicals: [
      { radical: "孝", meaning: "filial piety" },
      { radical: "攵", meaning: "to strike / hit" },
    ],
    mnemonic: "Teaching filial piety by hitting — old-school TEACHING methods!",
  },
  {
    kanji: "話",
    reading: "はなす (hanasu)",
    meaning: "to speak / story",
    radicals: [
      { radical: "言", meaning: "say / words" },
      { radical: "舌", meaning: "tongue" },
    ],
    mnemonic: "Words flying off your tongue — you just can't stop TALKING!",
  },
  {
    kanji: "寺",
    reading: "てら (tera)",
    meaning: "temple",
    radicals: [
      { radical: "土", meaning: "earth / soil" },
      { radical: "寸", meaning: "measurement / inch" },
    ],
    mnemonic: "Every inch of earth is sacred — that's what makes it a TEMPLE!",
  },
  {
    kanji: "持",
    reading: "もつ (motsu)",
    meaning: "to hold / to have",
    radicals: [
      { radical: "扌", meaning: "hand" },
      { radical: "寺", meaning: "temple" },
    ],
    mnemonic: "A hand grabbing a temple — you can't HOLD an entire temple, but you're trying!",
  },
  {
    kanji: "鉄",
    reading: "てつ (tetsu)",
    meaning: "iron",
    radicals: [
      { radical: "金", meaning: "metal / gold" },
      { radical: "失", meaning: "to lose" },
    ],
    mnemonic: "You lost your gold and all that's left is boring IRON!",
  },
  {
    kanji: "読",
    reading: "よむ (yomu)",
    meaning: "to read",
    radicals: [
      { radical: "言", meaning: "say / words" },
      { radical: "売", meaning: "to sell" },
    ],
    mnemonic: "Selling words? That's just writing books — someone has to READ them!",
  },
  {
    kanji: "聞",
    reading: "きく (kiku)",
    meaning: "to hear / to ask",
    radicals: [
      { radical: "門", meaning: "gate" },
      { radical: "耳", meaning: "ear" },
    ],
    mnemonic: "An ear pressed against the gate — eavesdropping is just HEARING with extra steps!",
  },
  {
    kanji: "体",
    reading: "からだ (karada)",
    meaning: "body",
    radicals: [
      { radical: "亻", meaning: "person" },
      { radical: "本", meaning: "book / origin" },
    ],
    mnemonic: "A person IS the origin of everything — your BODY is your first book!",
  },
];
// ─── Exercise types ────────────────────────────────────────────────

export type ExerciseType = "kanji_radical" | "kanji_mnemonic" | "vocab_recall" | "grammar_fill";

export interface BaseExercise {
  id: string;
  type: ExerciseType;
}

export interface KanjiRadicalExercise extends BaseExercise {
  type: "kanji_radical";
  kanji: string;
  meaning: string;
  /** Show the radicals; user picks the correct meaning combo */
  radicals: KanjiRadical[];
  question: string;
  options: string[];
  correct: number;
}

export interface KanjiMnemonicExercise extends BaseExercise {
  type: "kanji_mnemonic";
  kanji: string;
  reading: string;
  meaning: string;
  radicals: KanjiRadical[];
  /** The correct funny mnemonic */
  mnemonic: string;
  question: string;
  options: string[];
  correct: number;
}

export interface VocabRecallExercise extends BaseExercise {
  type: "vocab_recall";
  japanese: string;
  question: string;
  options: string[];
  correct: number;
}

export interface GrammarFillExercise extends BaseExercise {
  type: "grammar_fill";
  question: string;
  hint: string;
  options: string[];
  correct: number;
}

export type Exercise =
  | KanjiRadicalExercise
  | KanjiMnemonicExercise
  | VocabRecallExercise
  | GrammarFillExercise;

// ─── Pre-built exercise pool ───────────────────────────────────────

const exercisePool: Exercise[] = [
  // Kanji radical breakdowns
  {
    id: "kr1",
    type: "kanji_radical",
    kanji: "遅",
    meaning: "late / slow",
    radicals: kanjiEntries[0].radicals,
    question: "What radicals make up 遅 (late)?",
    options: [
      "road + corpse + sheep",
      "road + person + cow",
      "walk + death + wool",
      "path + body + goat",
    ],
    correct: 0,
  },
  {
    id: "kr2",
    type: "kanji_radical",
    kanji: "休",
    meaning: "to rest",
    radicals: kanjiEntries[1].radicals,
    question: "What radicals make up 休 (rest)?",
    options: [
      "person + fire",
      "person + tree",
      "body + leaf",
      "human + mountain",
    ],
    correct: 1,
  },
  {
    id: "kr3",
    type: "kanji_radical",
    kanji: "困",
    meaning: "to be troubled",
    radicals: kanjiEntries[7].radicals,
    question: "What radicals make up 困 (troubled)?",
    options: [
      "box + fire",
      "square + person",
      "enclosure + tree",
      "fence + stone",
    ],
    correct: 2,
  },
  {
    id: "kr4",
    type: "kanji_radical",
    kanji: "雷",
    meaning: "thunder",
    radicals: kanjiEntries[9].radicals,
    question: "What radicals make up 雷 (thunder)?",
    options: [
      "cloud + power",
      "sky + field",
      "rain + rice field",
      "water + lightning",
    ],
    correct: 2,
  },

  // Kanji mnemonic exercises — pick the funniest correct story
  {
    id: "km1",
    type: "kanji_mnemonic",
    kanji: "遅",
    reading: "おそい",
    meaning: "late / slow",
    radicals: kanjiEntries[0].radicals,
    mnemonic: kanjiEntries[0].mnemonic,
    question: "遅 = road + corpse + sheep. Which funny story helps you remember 'late'?",
    options: [
      "A dead sheep lying on the road — no wonder you're LATE!",
      "A sheep running fast on the road — too quick to be late",
      "A shepherd sleeping on the road with his sheep",
      "A road made of sheep wool — soft but slow",
    ],
    correct: 0,
  },
  {
    id: "km2",
    type: "kanji_mnemonic",
    kanji: "男",
    reading: "おとこ",
    meaning: "man",
    radicals: kanjiEntries[4].radicals,
    mnemonic: kanjiEntries[4].mnemonic,
    question: "男 = rice field + power. Which mnemonic fits 'man'?",
    options: [
      "A strong wind blowing through a field of flowers",
      "Power in the rice field — being a MAN means farm work all day!",
      "A field of rice that grew really tall and powerful",
      "A man eating rice to become more powerful",
    ],
    correct: 1,
  },
  {
    id: "km3",
    type: "kanji_mnemonic",
    kanji: "好",
    reading: "すき",
    meaning: "to like",
    radicals: kanjiEntries[5].radicals,
    mnemonic: kanjiEntries[5].mnemonic,
    question: "好 = woman + child. Which mnemonic fits 'to like / fond of'?",
    options: [
      "A woman teaching a child kanji — strict LOVE!",
      "A child running away from a woman — not fond at all",
      "A woman holding her child — pure LOVE and fondness!",
      "A woman and child shopping together — they LIKE sales",
    ],
    correct: 2,
  },

  // Vocab recall (from Lesson 1)
  {
    id: "vr1",
    type: "vocab_recall",
    japanese: "せんせい",
    question: "What does 「せんせい」 mean?",
    options: ["student", "doctor", "teacher", "engineer"],
    correct: 2,
  },
  {
    id: "vr2",
    type: "vocab_recall",
    japanese: "びょういん",
    question: "What does 「びょういん」 mean?",
    options: ["university", "hospital", "company", "station"],
    correct: 1,
  },
  {
    id: "vr3",
    type: "vocab_recall",
    japanese: "はじめまして",
    question: "What does 「はじめまして」 mean?",
    options: [
      "Goodbye",
      "Thank you",
      "How do you do (first meeting)",
      "Excuse me",
    ],
    correct: 2,
  },

  // Grammar fill-in
  {
    id: "gf1",
    type: "grammar_fill",
    question: "わたし ＿ がくせいです。",
    hint: "Topic-marking particle",
    options: ["は", "が", "を", "に"],
    correct: 0,
  },
  {
    id: "gf2",
    type: "grammar_fill",
    question: "マリアさん ＿ エンジニアです。(Maria is ALSO an engineer)",
    hint: "'Also' particle — replaces は",
    options: ["は", "の", "も", "が"],
    correct: 2,
  },
  {
    id: "gf3",
    type: "grammar_fill",
    question: "IMC ＿ しゃいん (employee OF IMC)",
    hint: "Possessive particle",
    options: ["は", "も", "が", "の"],
    correct: 3,
  },
];

/** Returns a shuffled copy of exercises, picking `count` items with balanced types */
export function getDailyExercises(count: number = 10): Exercise[] {
  const shuffled = [...exercisePool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
