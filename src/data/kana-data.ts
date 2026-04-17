/**
 * Hiragana & Katakana primer data.
 * The 5 vowels + a representative sample for each row, plus the most common
 * "must-know" characters for absolute beginners. Intentionally compact so the
 * primer stays short.
 */

export interface KanaChar {
  /** The hiragana character. */
  hira: string;
  /** The katakana counterpart (same sound). */
  kata: string;
  /** Roman reading, e.g. "ka". */
  romaji: string;
  /** Memory hook to recognise the shape. */
  mnemonic: string;
}

export interface KanaRow {
  label: string; // e.g. "あ row (vowels)"
  chars: KanaChar[];
}

export const kanaRows: KanaRow[] = [
  {
    label: "Vowels — あ row",
    chars: [
      { hira: "あ", kata: "ア", romaji: "a", mnemonic: "あ looks like an Apple with a stem and a bite — 'a'." },
      { hira: "い", kata: "イ", romaji: "i", mnemonic: "い is two ee-ls swimming side by side." },
      { hira: "う", kata: "ウ", romaji: "u", mnemonic: "う is a person saying 'oooh' with a hooked beak." },
      { hira: "え", kata: "エ", romaji: "e", mnemonic: "え looks like an exotic bird's profile — 'eh!'" },
      { hira: "お", kata: "オ", romaji: "o", mnemonic: "お is an Olympic torch with two flames — 'oh!'" },
    ],
  },
  {
    label: "K row — か行",
    chars: [
      { hira: "か", kata: "カ", romaji: "ka", mnemonic: "か = a Karate kick — leg out, fist up." },
      { hira: "き", kata: "キ", romaji: "ki", mnemonic: "き looks like an old-fashioned key." },
      { hira: "く", kata: "ク", romaji: "ku", mnemonic: "く is a cuckoo bird's open beak." },
      { hira: "け", kata: "ケ", romaji: "ke", mnemonic: "け = a keg of beer with a tap on the side." },
      { hira: "こ", kata: "コ", romaji: "ko", mnemonic: "こ looks like two cocoons stacked." },
    ],
  },
  {
    label: "S row — さ行",
    chars: [
      { hira: "さ", kata: "サ", romaji: "sa", mnemonic: "さ = a samurai sword with a curved hilt." },
      { hira: "し", kata: "シ", romaji: "shi", mnemonic: "し is a fishing hook — 'she' caught one." },
      { hira: "す", kata: "ス", romaji: "su", mnemonic: "す is a swing curling around a pole." },
      { hira: "せ", kata: "セ", romaji: "se", mnemonic: "せ looks like a 'set' of stairs going up." },
      { hira: "そ", kata: "ソ", romaji: "so", mnemonic: "そ = a zig-zag, 'so' it goes." },
    ],
  },
  {
    label: "T row — た行",
    chars: [
      { hira: "た", kata: "タ", romaji: "ta", mnemonic: "た is a 'ta'rget — cross plus dots." },
      { hira: "ち", kata: "チ", romaji: "chi", mnemonic: "ち looks like a chibi person bowing." },
      { hira: "つ", kata: "ツ", romaji: "tsu", mnemonic: "つ is a tsunami wave curling." },
      { hira: "て", kata: "テ", romaji: "te", mnemonic: "て looks like a ten-cent coin's curve." },
      { hira: "と", kata: "ト", romaji: "to", mnemonic: "と is a toe with a nail clipping off." },
    ],
  },
  {
    label: "N row — な行",
    chars: [
      { hira: "な", kata: "ナ", romaji: "na", mnemonic: "な is a NUN praying with a cross." },
      { hira: "に", kata: "ニ", romaji: "ni", mnemonic: "に = knee bent with a sock on top." },
      { hira: "ぬ", kata: "ヌ", romaji: "nu", mnemonic: "ぬ is noodles tangled in a bowl." },
      { hira: "ね", kata: "ネ", romaji: "ne", mnemonic: "ね = a nest with a cat's tail curling out." },
      { hira: "の", kata: "ノ", romaji: "no", mnemonic: "の is a NO sign — a slash through a circle." },
    ],
  },
  {
    label: "Other essentials",
    chars: [
      { hira: "は", kata: "ハ", romaji: "ha", mnemonic: "は = a HAt rack with a pole." },
      { hira: "ま", kata: "マ", romaji: "ma", mnemonic: "ま looks like 'ma'ma rocking a baby." },
      { hira: "や", kata: "ヤ", romaji: "ya", mnemonic: "や is a yacht's sail." },
      { hira: "ら", kata: "ラ", romaji: "ra", mnemonic: "ら = a rabbit's ear and tail." },
      { hira: "わ", kata: "ワ", romaji: "wa", mnemonic: "わ is a 'wa'sp's tail curling up." },
      { hira: "を", kata: "ヲ", romaji: "wo", mnemonic: "を = a wobbly-legged person — only used as a particle." },
      { hira: "ん", kata: "ン", romaji: "n", mnemonic: "ん is a sleepy 'n' sound — like 'nnnn'." },
    ],
  },
];

export interface KanaQuizQuestion {
  /** Character shown to user. */
  prompt: string;
  /** Whether this is a hiragana or katakana character. */
  script: "hiragana" | "katakana";
  /** 4 romaji options. */
  options: string[];
  /** Index of correct answer in options. */
  correctIndex: number;
}

/**
 * 10-question knowledge-check quiz mixing hiragana & katakana from the rows
 * above. Kept short on purpose so users don't get bored.
 */
export const kanaQuizQuestions: KanaQuizQuestion[] = [
  { prompt: "あ", script: "hiragana", options: ["a", "o", "n", "e"], correctIndex: 0 },
  { prompt: "シ", script: "katakana", options: ["tsu", "shi", "n", "so"], correctIndex: 1 },
  { prompt: "き", script: "hiragana", options: ["sa", "ki", "chi", "su"], correctIndex: 1 },
  { prompt: "ス", script: "katakana", options: ["su", "ku", "ya", "ra"], correctIndex: 0 },
  { prompt: "の", script: "hiragana", options: ["me", "no", "nu", "ne"], correctIndex: 1 },
  { prompt: "ン", script: "katakana", options: ["so", "shi", "tsu", "n"], correctIndex: 3 },
  { prompt: "た", script: "hiragana", options: ["na", "ta", "ka", "ha"], correctIndex: 1 },
  { prompt: "コ", script: "katakana", options: ["ko", "yu", "ni", "ya"], correctIndex: 0 },
  { prompt: "わ", script: "hiragana", options: ["wa", "ne", "re", "ru"], correctIndex: 0 },
  { prompt: "ヲ", script: "katakana", options: ["wo", "yu", "ho", "ya"], correctIndex: 0 },
];

/** Threshold (percent) required to pass the knowledge-check and unlock Lesson 1. */
export const KANA_PASS_THRESHOLD = 60;

/** Lesson-progress key used to persist whether the kana primer is cleared. */
export const KANA_PRIMER_LESSON_ID = "kana_primer";
