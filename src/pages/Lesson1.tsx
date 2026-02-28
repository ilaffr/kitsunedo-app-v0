import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, X, BookOpen, MessageSquare, PenTool } from "lucide-react";
import { Header } from "@/components/header";
import { cn } from "@/lib/utils";
import { useAchievement, useAchievementEffect } from "@/hooks/use-achievement";
import { useStreak, useLessonProgress } from "@/hooks/use-user-data";
import { usePersonalBadges } from "@/hooks/use-personal-badges";
import { useAuth } from "@/context/AuthContext";

type Section = "vocabulary" | "grammar" | "practice";

const vocabulary = [
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
];

const grammarPoints = [
  {
    title: "〜は　〜です",
    rule: "Topic は + Noun/Adjective + です",
    explanation:
      "The foundation of Japanese sentences. は (wa) is the topic-marking particle — it tells us what the sentence is about. です (desu) is the polite copula meaning 'is / am / are'. The topic is not always the grammatical subject; it marks what you are making a statement about.",
    tip: "Think of は as saying \"as for [topic]…\" — it sets the stage for everything that follows.",
    examples: [
      { jp: "わたしは がくせいです。", en: "I am a student." },
      { jp: "マリアさんは エンジニアです。", en: "Maria is an engineer." },
    ],
  },
  {
    title: "〜は　〜じゃ ありません",
    rule: "Topic は + Noun + じゃ ありません",
    explanation:
      "The negative form of です. じゃ ありません (ja arimasen) means 'is not'. It is the polite spoken contraction of では ありません (de wa arimasen). The more formal written version is では ありません, used in business or academic writing.",
    tip: "じゃ is a casual contraction of では. Both are correct — じゃ for conversation, では for formal writing.",
    examples: [
      { jp: "わたしは せんせいじゃ ありません。", en: "I am not a teacher." },
      { jp: "サントスさんは がくせいじゃ ありません。", en: "Santos is not a student." },
    ],
  },
  {
    title: "〜は　〜ですか",
    rule: "Topic は + Noun + ですか？",
    explanation:
      "Adding the question particle か (ka) at the end of a です sentence turns it into a yes/no question. Unlike English, Japanese does NOT change word order to ask a question — the structure is identical to a statement, just with か appended. No question mark is technically needed in Japanese writing, but か alone signals a question.",
    tip: "か at the end always signals a question. The rising intonation of your voice is optional but natural.",
    examples: [
      { jp: "ミラーさんは アメリカじんですか。", en: "Is Miller American?" },
      { jp: "はい、アメリカじんです。", en: "Yes, (he) is American." },
    ],
  },
  {
    title: "〜も",
    rule: "Topic も + Predicate (replaces は)",
    explanation:
      "も (mo) means 'also / too / as well'. It replaces は entirely — you never use は and も together on the same noun. When も appears, it signals that the same predicate applies to this topic just as it did to the previous one. It creates parallel structure between two topics.",
    tip: "も replaces は. Never say 「わたしはも」— drop the は completely when adding も.",
    examples: [
      { jp: "ミラーさんは かいしゃいんです。", en: "Miller is a company employee." },
      { jp: "グプタさんも かいしゃいんです。", en: "Gupta is also a company employee." },
    ],
  },
  {
    title: "Noun の Noun",
    rule: "Noun₁ の Noun₂ → Noun₂ of/belonging to Noun₁",
    explanation:
      "の (no) is a possessive/descriptive particle that connects two nouns. The first noun modifies the second — think of it as English 's (possessive) or 'of'. It can show: possession (わたしの本 = my book), affiliation (IMCのしゃいん = employee of IMC), or categorisation (にほんごのがくせい = student of Japanese).",
    tip: "の links two nouns and the first noun always describes or owns the second. The order is reversed compared to English: 'Japan's language student' = にほんごのがくせい.",
    examples: [
      { jp: "わたしは にほんごの がくせいです。", en: "I am a student of Japanese." },
      { jp: "ミラーさんは IMCの しゃいんです。", en: "Miller is an employee of IMC." },
    ],
  },
];

const practiceQuestions = [
  {
    question: "「わたし ＿ がくせいです」— Fill in the particle.",
    options: ["は", "が", "を", "に"],
    correct: 0,
  },
  {
    question: "How do you say 'I am not a teacher' politely?",
    options: [
      "わたしは せんせいです。",
      "わたしは せんせいじゃ ありません。",
      "わたしは せんせいか。",
      "わたしも せんせいです。",
    ],
    correct: 1,
  },
  {
    question: "「マリアさん ＿ エンジニアです」— Maria is ALSO an engineer. Which particle?",
    options: ["は", "の", "も", "が"],
    correct: 2,
  },
  {
    question: "How do you form a question from 「がくせいです」?",
    options: [
      "がくせいですよ",
      "がくせいですか",
      "がくせいですね",
      "がくせいですの",
    ],
    correct: 1,
  },
  {
    question: "「IMC ＿ しゃいん」— An employee OF IMC. Which particle?",
    options: ["は", "も", "が", "の"],
    correct: 3,
  },
  {
    question: "What does 「はじめまして」mean?",
    options: [
      "Goodbye",
      "Thank you",
      "How do you do (first meeting)",
      "Excuse me",
    ],
    correct: 2,
  },
];

// Map question index to the word/particle being tested
const QUESTION_WORD_MAP: { word: string; meaning: string }[] = [
  { word: "は", meaning: "topic-marking particle (wa)" },
  { word: "じゃ ありません", meaning: "is not (negative copula)" },
  { word: "も", meaning: "also/too particle" },
  { word: "ですか", meaning: "question-forming particle" },
  { word: "の", meaning: "possessive/descriptive particle" },
  { word: "はじめまして", meaning: "How do you do (first meeting)" },
];

function extractWordFromQuestion(qIndex: number): string {
  return QUESTION_WORD_MAP[qIndex]?.word || `q${qIndex}`;
}

function extractMeaningFromQuestion(qIndex: number): string {
  return QUESTION_WORD_MAP[qIndex]?.meaning || "unknown";
}

export default function Lesson1() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { unlock } = useAchievement();
  const { recordStudy } = useStreak();
  const { saveProgress } = useLessonProgress("lesson_1");
  const { trackMistake, checkAndGenerate } = usePersonalBadges();
  const [activeSection, setActiveSection] = useState<Section>("vocabulary");
  const [practiceAnswers, setPracticeAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [viewedGrammar, setViewedGrammar] = useState<Set<number>>(new Set());
  const lessonCompleteFired = useRef(false);
  // Track per-word mistakes within this session
  const sessionMistakes = useRef<Record<string, { count: number; meaning: string }>>({});

  const handleAnswer = (qIndex: number, optIndex: number) => {
    if (showResults) return;
    setPracticeAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
  };

  const handleSubmit = async () => {
    setShowResults(true);

    // Track mistakes for each wrong answer
    if (user?.id) {
      for (let i = 0; i < practiceQuestions.length; i++) {
        if (practiceAnswers[i] !== practiceQuestions[i].correct) {
          // Extract the key word/particle from the question
          const word = extractWordFromQuestion(i);
          const meaning = extractMeaningFromQuestion(i);
          const newCount = await trackMistake("lesson_1", word);
          sessionMistakes.current[word] = { count: newCount, meaning };
        }
      }

      // Check if any words crossed badge thresholds
      if (Object.keys(sessionMistakes.current).length > 0) {
        checkAndGenerate("lesson_1", sessionMistakes.current);
      }
    }
  };

  const handleReset = () => {
    setPracticeAnswers({});
    setShowResults(false);
    sessionMistakes.current = {};
  };

  const correctCount = showResults
    ? practiceQuestions.filter((q, i) => practiceAnswers[i] === q.correct).length
    : 0;

  // Track grammar points viewed
  const handleSectionChange = (section: Section) => {
    setActiveSection(section);
  };

  const handleGrammarView = (index: number) => {
    setViewedGrammar((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  };

  // Achievements
  useAchievementEffect("vocabulary_master", activeSection === "vocabulary");
  useAchievementEffect("all_grammar", viewedGrammar.size >= grammarPoints.length);

  useEffect(() => {
    if (showResults && !lessonCompleteFired.current) {
      lessonCompleteFired.current = true;
      unlock("first_lesson");
      // Record study session for streak + persist lesson completion
      recordStudy();
      saveProgress({ completed: true, bestScore: correctCount, section: "practice" });
    }
  }, [showResults]);

  useEffect(() => {
    if (showResults && correctCount === practiceQuestions.length) {
      unlock("perfect_practice");
    }
  }, [showResults, correctCount]);

  // Track all grammar points as viewed when grammar section is opened
  useEffect(() => {
    if (activeSection === "grammar") {
      setViewedGrammar(new Set(grammarPoints.map((_, i) => i)));
    }
  }, [activeSection]);

  const sections: { key: Section; label: string; kanji: string; icon: typeof BookOpen }[] = [
    { key: "vocabulary", label: "Vocabulary", kanji: "語彙", icon: BookOpen },
    { key: "grammar", label: "Grammar", kanji: "文法", icon: MessageSquare },
    { key: "practice", label: "Practice", kanji: "練習", icon: PenTool },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container max-w-4xl px-4 py-6">
        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="serif-jp">道場へ戻る</span>
        </button>

        {/* Lesson header */}
        <div className="card-paper p-6 md:p-8 border-2 mb-6">
          <div className="flex items-start gap-4">
            <div className="hanko-badge text-lg">第一課</div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground serif-jp">
                Lesson 1 — わたしは がくせいです
              </h1>
              <p className="text-muted-foreground mt-1">
                Minna no Nihongo · Self-introduction & basic identity sentences
              </p>
            </div>
          </div>
          <div className="ink-divider mt-5" />
          <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
            <span>{vocabulary.length} words</span>
            <span>{grammarPoints.length} grammar points</span>
            <span>{practiceQuestions.length} questions</span>
          </div>
        </div>

        {/* Section tabs */}
        <div className="flex gap-2 mb-6">
          {sections.map((s) => (
            <button
              key={s.key}
              onClick={() => handleSectionChange(s.key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-sm border-2 text-sm font-medium transition-colors",
                activeSection === s.key
                  ? "bg-foreground text-background border-foreground"
                  : "bg-card text-muted-foreground border-border hover:border-foreground/30"
              )}
            >
              <s.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{s.label}</span>
              <span className="japanese-text text-xs">{s.kanji}</span>
            </button>
          ))}
        </div>

        {/* ── Vocabulary section ── */}
        {activeSection === "vocabulary" && (
          <div className="card-paper border-2 overflow-hidden">
            <div className="p-5 border-b border-border">
              <h2 className="text-lg font-bold serif-jp text-foreground">語彙 — Vocabulary</h2>
              <p className="text-sm text-muted-foreground mt-1">Key words from Lesson 1</p>
            </div>
            <div className="divide-y divide-border">
              {vocabulary.map((word, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-3 hover:bg-muted/30 transition-colors">
                  <span className="text-xs text-muted-foreground w-6 text-right serif-jp">{i + 1}</span>
                  <span className="text-xl japanese-text font-medium text-foreground min-w-[120px]">
                    {word.japanese}
                  </span>
                  <span className="text-sm text-muted-foreground min-w-[100px]">{word.reading}</span>
                  <span className="text-sm text-foreground flex-1">{word.meaning}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Grammar section ── */}
        {activeSection === "grammar" && (
          <div className="space-y-5">
            {/* Overview note */}
            <div className="card-paper border-2 p-4 bg-muted/20 flex gap-3 items-start">
              <span className="text-primary serif-jp text-lg mt-0.5">筆</span>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Each grammar point shows the <strong className="text-foreground">pattern rule</strong>, a plain-English <strong className="text-foreground">explanation</strong>, a quick <strong className="text-foreground">tip</strong>, and model sentences. Read each section carefully before moving to Practice.
              </p>
            </div>

            {grammarPoints.map((point, i) => (
              <div key={i} className="card-paper border-2 overflow-hidden">
                {/* Title bar */}
                <div className="flex items-center gap-3 p-5 pb-4 border-b border-border bg-muted/10">
                  <span className="hanko-badge text-sm flex-shrink-0">{i + 1}</span>
                  <div>
                    <h3 className="text-xl font-bold japanese-text text-foreground leading-tight">
                      {point.title}
                    </h3>
                    <code className="text-xs text-primary font-mono mt-0.5 block">
                      {point.rule}
                    </code>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {/* Explanation */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5 serif-jp">
                      Explanation
                    </p>
                    <p className="text-sm text-foreground leading-relaxed">
                      {point.explanation}
                    </p>
                  </div>

                  {/* Tip */}
                  <div className="bg-primary/5 border border-primary/25 rounded-sm p-3 flex gap-2.5 items-start">
                    <span className="text-primary text-base flex-shrink-0 serif-jp">✦</span>
                    <p className="text-sm text-foreground leading-relaxed">
                      <strong className="text-primary serif-jp">Tip: </strong>
                      {point.tip}
                    </p>
                  </div>

                  {/* Examples */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 serif-jp">
                      Examples
                    </p>
                    <div className="ink-divider mb-3" />
                    <div className="space-y-3">
                      {point.examples.map((ex, j) => (
                        <div key={j} className="bg-muted/30 rounded-sm p-3 border border-border">
                          <p className="text-lg japanese-text text-foreground">{ex.jp}</p>
                          <p className="text-sm text-muted-foreground mt-1">{ex.en}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Practice section ── */}
        {activeSection === "practice" && (
          <div className="space-y-4">
            {practiceQuestions.map((q, i) => (
              <div key={i} className="card-paper border-2 p-5">
                <div className="flex items-start gap-3 mb-4">
                  <span className="text-sm font-bold serif-jp text-muted-foreground flex-shrink-0">問{i + 1}</span>
                  <p className="text-foreground font-medium japanese-text">{q.question}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt, j) => {
                    const isSelected = practiceAnswers[i] === j;
                    const isCorrect = showResults && j === q.correct;
                    const isWrong = showResults && isSelected && j !== q.correct;

                    return (
                      <button
                        key={j}
                        onClick={() => handleAnswer(i, j)}
                        className={cn(
                          "text-left px-4 py-3 rounded-sm border-2 text-sm japanese-text transition-colors",
                          !showResults && isSelected && "border-foreground bg-foreground/5",
                          !showResults && !isSelected && "border-border hover:border-foreground/30 bg-card",
                          isCorrect && "border-success bg-success/10 text-foreground",
                          isWrong && "border-destructive bg-destructive/10 text-foreground"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span>{opt}</span>
                          {isCorrect && <Check className="w-4 h-4 text-success" />}
                          {isWrong && <X className="w-4 h-4 text-destructive" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Submit / Results */}
            <div className="card-paper border-2 p-5">
              {!showResults ? (
                <button
                  onClick={handleSubmit}
                  disabled={Object.keys(practiceAnswers).length < practiceQuestions.length}
                  className={cn(
                    "w-full py-3 rounded-sm font-bold serif-jp text-sm border-2 transition-colors",
                    Object.keys(practiceAnswers).length < practiceQuestions.length
                      ? "border-border text-muted-foreground bg-muted/30 cursor-not-allowed"
                      : "btn-ink text-card border-foreground"
                  )}
                >
                  答え合わせ — Check Answers
                </button>
              ) : (
                <div className="text-center">
                  <p className="text-2xl font-bold serif-jp text-foreground mb-1">
                    {correctCount} / {practiceQuestions.length}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {correctCount === practiceQuestions.length
                      ? "Perfect — 完璧！"
                      : correctCount >= practiceQuestions.length / 2
                        ? "Good effort — もう少し！"
                        : "Keep studying — 頑張って！"}
                  </p>
                  <button
                    onClick={handleReset}
                    className="px-6 py-2 rounded-sm border-2 border-foreground text-foreground text-sm font-medium hover:bg-foreground hover:text-background transition-colors"
                  >
                    もう一度 — Try Again
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
