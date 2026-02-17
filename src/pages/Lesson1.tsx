import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, X, BookOpen, MessageSquare, PenTool } from "lucide-react";
import { Header } from "@/components/header";
import { cn } from "@/lib/utils";

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
    explanation: "The basic sentence pattern. は (wa) marks the topic, です (desu) is the polite copula meaning 'is/am/are'.",
    examples: [
      { jp: "わたしは がくせいです。", en: "I am a student." },
      { jp: "マリアさんは エンジニアです。", en: "Maria is an engineer." },
    ],
  },
  {
    title: "〜は　〜じゃ ありません",
    explanation: "Negative form of です. じゃ ありません (ja arimasen) means 'is not'. More formal: では ありません.",
    examples: [
      { jp: "わたしは せんせいじゃ ありません。", en: "I am not a teacher." },
      { jp: "サントスさんは がくせいじゃ ありません。", en: "Santos is not a student." },
    ],
  },
  {
    title: "〜は　〜ですか",
    explanation: "Add か (ka) at the end to form a question. Japanese doesn't change word order for questions.",
    examples: [
      { jp: "ミラーさんは アメリカじんですか。", en: "Is Miller American?" },
      { jp: "はい、アメリカじんです。", en: "Yes, (he) is American." },
    ],
  },
  {
    title: "〜も",
    explanation: "も (mo) replaces は to mean 'also/too'. It indicates the same predicate applies.",
    examples: [
      { jp: "ミラーさんは かいしゃいんです。", en: "Miller is a company employee." },
      { jp: "グプタさんも かいしゃいんです。", en: "Gupta is also a company employee." },
    ],
  },
  {
    title: "Noun の Noun",
    explanation: "の (no) connects two nouns, showing possession, affiliation, or description.",
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

export default function Lesson1() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<Section>("vocabulary");
  const [practiceAnswers, setPracticeAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (qIndex: number, optIndex: number) => {
    if (showResults) return;
    setPracticeAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
  };

  const handleSubmit = () => setShowResults(true);
  const handleReset = () => {
    setPracticeAnswers({});
    setShowResults(false);
  };

  const correctCount = showResults
    ? practiceQuestions.filter((q, i) => practiceAnswers[i] === q.correct).length
    : 0;

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
              onClick={() => setActiveSection(s.key)}
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

        {/* Vocabulary section */}
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

        {/* Grammar section */}
        {activeSection === "grammar" && (
          <div className="space-y-4">
            {grammarPoints.map((point, i) => (
              <div key={i} className="card-paper border-2 p-5 md:p-6">
                <div className="flex items-start gap-3 mb-3">
                  <span className="hanko-badge text-sm">{i + 1}</span>
                  <h3 className="text-xl font-bold japanese-text text-foreground">{point.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{point.explanation}</p>
                <div className="ink-divider mb-4" />
                <div className="space-y-3">
                  {point.examples.map((ex, j) => (
                    <div key={j} className="bg-muted/30 rounded-sm p-3 border border-border">
                      <p className="text-lg japanese-text text-foreground">{ex.jp}</p>
                      <p className="text-sm text-muted-foreground mt-1">{ex.en}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Practice section */}
        {activeSection === "practice" && (
          <div className="space-y-4">
            {practiceQuestions.map((q, i) => (
              <div key={i} className="card-paper border-2 p-5">
                <div className="flex items-start gap-3 mb-4">
                  <span className="text-sm font-bold serif-jp text-muted-foreground">問{i + 1}</span>
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
