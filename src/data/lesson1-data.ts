import type { LessonData } from "@/components/lesson-page";

export const lesson1Data: LessonData = {
  id: "lesson_1",
  number: 1,
  titleJp: "わたしは がくせいです",
  titleEn: "I am a student",
  subtitle: "Minna no Nihongo · Self-introduction & basic identity sentences",
  vocabulary: [
    { japanese: "わたし", reading: "watashi", meaning: "I, me" },
    { japanese: "あなた", reading: "anata", meaning: "you" },
    { japanese: "あの ひと", reading: "ano hito", meaning: "that person, he/she" },
    { japanese: "せんせい", reading: "sensei", meaning: "teacher, instructor" },
    { japanese: "がくせい", reading: "gakusei", meaning: "student" },
    { japanese: "かいしゃいん", reading: "kaishain", meaning: "company employee" },
    { japanese: "いしゃ", reading: "isha", meaning: "doctor" },
    { japanese: "エンジニア", reading: "enjinia", meaning: "engineer" },
    { japanese: "だいがく", reading: "daigaku", meaning: "university" },
    { japanese: "びょういん", reading: "byōin", meaning: "hospital" },
    { japanese: "でんき", reading: "denki", meaning: "electricity, light" },
    { japanese: "にほん", reading: "nihon", meaning: "Japan" },
    { japanese: "アメリカ", reading: "amerika", meaning: "America" },
    { japanese: "～さい", reading: "~sai", meaning: "~ years old" },
    { japanese: "はい", reading: "hai", meaning: "yes" },
    { japanese: "いいえ", reading: "iie", meaning: "no" },
    { japanese: "はじめまして", reading: "hajimemashite", meaning: "How do you do (first meeting)" },
    { japanese: "どうぞ よろしく", reading: "dōzo yoroshiku", meaning: "Pleased to meet you" },
  ],
  grammarPoints: [
    {
      title: "〜は　〜です",
      rule: "Topic は + Noun/Adjective + です",
      explanation: "The foundation of Japanese sentences. は (wa) is the topic-marking particle — it tells us what the sentence is about. です (desu) is the polite copula meaning 'is / am / are'.",
      tip: "Think of は as saying \"as for [topic]…\" — it sets the stage for everything that follows.",
      examples: [
        { jp: "わたしは がくせいです。", en: "I am a student." },
        { jp: "マリアさんは エンジニアです。", en: "Maria is an engineer." },
      ],
    },
    {
      title: "〜は　〜じゃ ありません",
      rule: "Topic は + Noun + じゃ ありません",
      explanation: "The negative form of です. じゃ ありません means 'is not'. It is the polite spoken contraction of では ありません.",
      tip: "じゃ is a casual contraction of では. Both are correct — じゃ for conversation, では for formal writing.",
      examples: [
        { jp: "わたしは せんせいじゃ ありません。", en: "I am not a teacher." },
        { jp: "サントスさんは がくせいじゃ ありません。", en: "Santos is not a student." },
      ],
    },
    {
      title: "〜は　〜ですか",
      rule: "Topic は + Noun + ですか？",
      explanation: "Adding か at the end of a です sentence turns it into a yes/no question. Japanese does NOT change word order — just append か.",
      tip: "か at the end always signals a question. The rising intonation of your voice is optional but natural.",
      examples: [
        { jp: "ミラーさんは アメリカじんですか。", en: "Is Miller American?" },
        { jp: "はい、アメリカじんです。", en: "Yes, (he) is American." },
      ],
    },
    {
      title: "〜も",
      rule: "Topic も + Predicate (replaces は)",
      explanation: "も means 'also / too'. It replaces は entirely — never use は and も together on the same noun.",
      tip: "も replaces は. Never say 「わたしはも」— drop the は completely when adding も.",
      examples: [
        { jp: "ミラーさんは かいしゃいんです。", en: "Miller is a company employee." },
        { jp: "グプタさんも かいしゃいんです。", en: "Gupta is also a company employee." },
      ],
    },
    {
      title: "Noun の Noun",
      rule: "Noun₁ の Noun₂ → Noun₂ of/belonging to Noun₁",
      explanation: "の connects two nouns. The first noun modifies the second — like English 's or 'of'. It shows possession, affiliation, or categorization.",
      tip: "の links two nouns — the first always describes or owns the second. The order is reversed from English.",
      examples: [
        { jp: "わたしは にほんごの がくせいです。", en: "I am a student of Japanese." },
        { jp: "ミラーさんは IMCの しゃいんです。", en: "Miller is an employee of IMC." },
      ],
    },
  ],
  practiceQuestions: [
    { question: "「わたし ＿ がくせいです」— Fill in the particle.", options: ["は", "が", "を", "に"], correct: 0 },
    { question: "How do you say 'I am not a teacher' politely?", options: ["わたしは せんせいです。", "わたしは せんせいじゃ ありません。", "わたしは せんせいか。", "わたしも せんせいです。"], correct: 1 },
    { question: "「マリアさん ＿ エンジニアです」— Maria is ALSO an engineer. Which particle?", options: ["は", "の", "も", "が"], correct: 2 },
    { question: "How do you form a question from 「がくせいです」?", options: ["がくせいですよ", "がくせいですか", "がくせいですね", "がくせいですの"], correct: 1 },
    { question: "「IMC ＿ しゃいん」— An employee OF IMC. Which particle?", options: ["は", "も", "が", "の"], correct: 3 },
    { question: "What does 「はじめまして」mean?", options: ["Goodbye", "Thank you", "How do you do (first meeting)", "Excuse me"], correct: 2 },
  ],
  questionWordMap: [
    { word: "は", meaning: "topic-marking particle (wa)" },
    { word: "じゃ ありません", meaning: "is not (negative copula)" },
    { word: "も", meaning: "also/too particle" },
    { word: "ですか", meaning: "question-forming particle" },
    { word: "の", meaning: "possessive/descriptive particle" },
    { word: "はじめまして", meaning: "How do you do (first meeting)" },
  ],

  // ── Minna-style 練習A: particle fill-in ──────────────────────────────────
  particleDrills: [
    {
      sentence: "わたし___ がくせいです。",
      translation: "I am a student.",
      options: ["は", "が", "を", "に"],
      correctIndex: 0,
    },
    {
      sentence: "ミラーさん___ かいしゃいんです。",
      translation: "Miller is a company employee.",
      options: ["の", "は", "を", "で"],
      correctIndex: 1,
    },
    {
      sentence: "グプタさん___ かいしゃいんです。",
      translation: "Gupta is ALSO a company employee.",
      options: ["は", "の", "も", "が"],
      correctIndex: 2,
    },
    {
      sentence: "わたしは IMC___ しゃいんです。",
      translation: "I am an employee OF IMC.",
      options: ["は", "の", "も", "に"],
      correctIndex: 1,
    },
    {
      sentence: "ミラーさんは アメリカじんです___。",
      translation: "Is Miller American?",
      options: ["よ", "ね", "か", "の"],
      correctIndex: 2,
    },
  ],

  // ── Minna-style 練習A: conjugation drill (です ↔ じゃ ありません ↔ ですか) ──
  conjugationDrills: [
    {
      base: "がくせいです",
      reading: "gakusei desu",
      meaning: "is a student",
      targetFormLabel: "negative",
      acceptedAnswers: ["がくせいじゃ ありません", "がくせいじゃありません", "がくせいでは ありません", "がくせいではありません"],
    },
    {
      base: "せんせいです",
      reading: "sensei desu",
      meaning: "is a teacher",
      targetFormLabel: "question (yes/no)",
      acceptedAnswers: ["せんせいですか", "せんせいですか。"],
    },
    {
      base: "エンジニアです",
      reading: "enjinia desu",
      meaning: "is an engineer",
      targetFormLabel: "negative",
      acceptedAnswers: ["エンジニアじゃ ありません", "エンジニアじゃありません", "エンジニアでは ありません", "エンジニアではありません"],
    },
    {
      base: "アメリカじんです",
      reading: "amerikajin desu",
      meaning: "is American",
      targetFormLabel: "question (yes/no)",
      acceptedAnswers: ["アメリカじんですか", "アメリカじんですか。"],
    },
  ],

  // ── Minna-style 練習B: substitution Q → A ────────────────────────────────
  substitutionDrills: [
    {
      questionJp: "あなたは がくせいですか。",
      questionEn: "Are you a student?",
      cue: "はい / がくせい",
      acceptedAnswers: ["はい、がくせいです", "はい、わたしは がくせいです"],
      hint: "はい、〜です。",
    },
    {
      questionJp: "ミラーさんは せんせいですか。",
      questionEn: "Is Miller a teacher?",
      cue: "いいえ / かいしゃいん",
      acceptedAnswers: [
        "いいえ、せんせいじゃ ありません。かいしゃいんです",
        "いいえ、かいしゃいんです",
      ],
      hint: "いいえ、〜じゃ ありません。〜です。",
    },
    {
      questionJp: "あの ひとは だれですか。",
      questionEn: "Who is that person?",
      cue: "やまださん",
      acceptedAnswers: ["やまださんです", "あの ひとは やまださんです"],
      hint: "〜です。",
    },
  ],

  // ── Minna-style 練習B: transform / rewrite ───────────────────────────────
  transformDrills: [
    {
      source: "わたしは せんせいです。",
      instruction: "Rewrite in the negative",
      acceptedAnswers: [
        "わたしは せんせいじゃ ありません",
        "わたしは せんせいではありません",
        "わたしは せんせいでは ありません",
      ],
      hint: "〜は 〜じゃ ありません。",
    },
    {
      source: "ミラーさんは アメリカじんです。",
      instruction: "Turn into a yes/no question",
      acceptedAnswers: [
        "ミラーさんは アメリカじんですか",
        "ミラーさんは アメリカじんですか。",
      ],
      hint: "〜は 〜ですか。",
    },
    {
      source: "サントスさんは ブラジルじんです。",
      instruction: "Add 'Maria is also Brazilian' using も",
      acceptedAnswers: [
        "マリアさんも ブラジルじんです",
        "マリアさんも ブラジルじんです。",
      ],
      hint: "〜も 〜です。",
    },
  ],

  // ── Listening dictation (uses Web Speech TTS) ────────────────────────────
  dictationDrills: [
    {
      jp: "わたしは がくせいです。",
      acceptedAnswers: ["watashi wa gakusei desu", "わたしは がくせいです", "わたしはがくせいです"],
      translation: "I am a student.",
    },
    {
      jp: "ミラーさんは かいしゃいんです。",
      acceptedAnswers: ["miraa san wa kaishain desu", "mira- san wa kaishain desu", "ミラーさんは かいしゃいんです", "ミラーさんはかいしゃいんです"],
      translation: "Miller is a company employee.",
    },
    {
      jp: "あの ひとは せんせいですか。",
      acceptedAnswers: ["ano hito wa sensei desu ka", "あの ひとは せんせいですか", "あのひとはせんせいですか"],
      translation: "Is that person a teacher?",
    },
  ],

  // ── 会話 — Static scripted dialogue + comprehension ──────────────────────
  dialogue: {
    titleJp: "はじめまして",
    titleEn: "Nice to meet you",
    scene: "Mr. Miller introduces himself to Mr. Yamada at the IMC office.",
    lines: [
      { speaker: "ミラー", jp: "はじめまして。", en: "How do you do." },
      { speaker: "ミラー", jp: "わたしは マイク・ミラーです。", en: "I am Mike Miller." },
      { speaker: "ミラー", jp: "アメリカから きました。IMCの しゃいんです。", en: "I came from America. I'm an employee of IMC." },
      { speaker: "ミラー", jp: "どうぞ よろしく おねがいします。", en: "Pleased to meet you." },
      { speaker: "やまだ", jp: "やまだです。", en: "I'm Yamada." },
      { speaker: "やまだ", jp: "わたしも IMCの しゃいんです。", en: "I'm also an employee of IMC." },
      { speaker: "やまだ", jp: "どうぞ よろしく。", en: "Pleased to meet you." },
    ],
    questions: [
      {
        question: "Where is Mr. Miller from?",
        options: ["Japan", "America", "Brazil", "Korea"],
        correct: 1,
      },
      {
        question: "What does Mr. Yamada say about himself?",
        options: [
          "He is a teacher.",
          "He is a student at IMC.",
          "He is also an employee of IMC.",
          "He works at a hospital.",
        ],
        correct: 2,
      },
    ],
  },

  kanji: [
    {
      kanji: "人",
      onyomi: "ジン, ニン",
      kunyomi: "ひと",
      meaning: "person, people",
      strokes: 2,
      mnemonic: "Two legs of a person walking — the simplest pictograph.",
      examples: [
        { jp: "あの人", reading: "ano hito", en: "that person" },
        { jp: "三人", reading: "sannin", en: "three people" },
      ],
    },
    {
      kanji: "学",
      onyomi: "ガク",
      kunyomi: "まな(ぶ)",
      meaning: "study, learning",
      strokes: 8,
      mnemonic: "A child (子) under a roof with sparkles of knowledge — learning under the temple roof.",
      examples: [
        { jp: "学生", reading: "gakusei", en: "student" },
        { jp: "大学", reading: "daigaku", en: "university" },
      ],
    },
    {
      kanji: "先",
      onyomi: "セン",
      kunyomi: "さき",
      meaning: "before, ahead, previous",
      strokes: 6,
      mnemonic: "A person striding ahead — going first.",
      examples: [
        { jp: "先生", reading: "sensei", en: "teacher" },
        { jp: "先週", reading: "senshū", en: "last week" },
      ],
    },
    {
      kanji: "日",
      onyomi: "ニチ, ジツ",
      kunyomi: "ひ, か",
      meaning: "day, sun",
      strokes: 4,
      mnemonic: "A picture of the sun — a circle with a mark inside.",
      examples: [
        { jp: "日本", reading: "nihon", en: "Japan" },
        { jp: "今日", reading: "kyō", en: "today" },
      ],
    },
  ],
};

