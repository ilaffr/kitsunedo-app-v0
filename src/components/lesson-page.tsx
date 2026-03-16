import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, X, BookOpen, MessageSquare, PenTool } from "lucide-react";
import { Header } from "@/components/header";
import { cn } from "@/lib/utils";
import { useAchievement, useAchievementEffect } from "@/hooks/use-achievement";
import { useStreak, useLessonProgress } from "@/hooks/use-user-data";
import { usePersonalBadges } from "@/hooks/use-personal-badges";
import { useAuth } from "@/context/AuthContext";

export interface VocabItem {
  japanese: string;
  reading: string;
  meaning: string;
}

export interface GrammarPoint {
  title: string;
  rule: string;
  explanation: string;
  tip: string;
  examples: { jp: string; en: string }[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

export interface QuestionWordMap {
  word: string;
  meaning: string;
}

export interface ReadingPassage {
  title: string;
  titleJp: string;
  text: string;          // Japanese text with furigana markers
  translation: string;   // English translation
  questions: { question: string; options: string[]; correct: number }[];
}

export interface LessonData {
  id: string;
  number: number;
  titleJp: string;
  titleEn: string;
  subtitle: string;
  vocabulary: VocabItem[];
  grammarPoints: GrammarPoint[];
  practiceQuestions: QuizQuestion[];
  questionWordMap: QuestionWordMap[];
  readingPassages?: ReadingPassage[];
}

type Section = "vocabulary" | "grammar" | "practice";

export default function LessonPage({ lesson }: { lesson: LessonData }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { unlock } = useAchievement();
  const { recordStudy } = useStreak();
  const { saveProgress } = useLessonProgress(lesson.id);
  const { trackMistake, checkAndGenerate } = usePersonalBadges();
  const [activeSection, setActiveSection] = useState<Section>("vocabulary");
  const [practiceAnswers, setPracticeAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [viewedGrammar, setViewedGrammar] = useState<Set<number>>(new Set());
  const lessonCompleteFired = useRef(false);
  const sessionMistakes = useRef<Record<string, { count: number; meaning: string }>>({});

  const handleAnswer = (qIndex: number, optIndex: number) => {
    if (showResults) return;
    setPracticeAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
  };

  const handleSubmit = async () => {
    setShowResults(true);
    if (user?.id) {
      for (let i = 0; i < lesson.practiceQuestions.length; i++) {
        if (practiceAnswers[i] !== lesson.practiceQuestions[i].correct) {
          const wm = lesson.questionWordMap[i];
          if (wm) {
            const newCount = await trackMistake(lesson.id, wm.word);
            sessionMistakes.current[wm.word] = { count: newCount, meaning: wm.meaning };
          }
        }
      }
      if (Object.keys(sessionMistakes.current).length > 0) {
        checkAndGenerate(lesson.id, sessionMistakes.current);
      }
    }
  };

  const handleReset = () => {
    setPracticeAnswers({});
    setShowResults(false);
    sessionMistakes.current = {};
  };

  const correctCount = showResults
    ? lesson.practiceQuestions.filter((q, i) => practiceAnswers[i] === q.correct).length
    : 0;

  useAchievementEffect("vocabulary_master", activeSection === "vocabulary");
  useAchievementEffect("all_grammar", viewedGrammar.size >= lesson.grammarPoints.length);

  useEffect(() => {
    if (showResults && !lessonCompleteFired.current) {
      lessonCompleteFired.current = true;
      unlock("first_lesson");
      recordStudy();
      saveProgress({ completed: true, bestScore: correctCount, section: "practice" });
    }
  }, [showResults]);

  useEffect(() => {
    if (showResults && correctCount === lesson.practiceQuestions.length) {
      unlock("perfect_practice");
    }
  }, [showResults, correctCount]);

  useEffect(() => {
    if (activeSection === "grammar") {
      setViewedGrammar(new Set(lesson.grammarPoints.map((_, i) => i)));
    }
  }, [activeSection]);

  const kanjiNum = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
  const sections: { key: Section; label: string; kanji: string; icon: typeof BookOpen }[] = [
    { key: "vocabulary", label: "Vocabulary", kanji: "語彙", icon: BookOpen },
    { key: "grammar", label: "Grammar", kanji: "文法", icon: MessageSquare },
    { key: "practice", label: "Practice", kanji: "練習", icon: PenTool },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-4xl px-4 py-6">
        <button
          onClick={() => navigate("/lessons")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="serif-jp">道場へ戻る</span>
        </button>

        {/* Lesson header */}
        <div className="card-paper p-6 md:p-8 border-2 mb-6">
          <div className="flex items-start gap-4">
            <div className="hanko-badge text-lg">第{kanjiNum[lesson.number - 1] ?? lesson.number}課</div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground serif-jp">
                Lesson {lesson.number} — {lesson.titleJp}
              </h1>
              <p className="text-muted-foreground mt-1">{lesson.subtitle}</p>
            </div>
          </div>
          <div className="ink-divider mt-5" />
          <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
            <span>{lesson.vocabulary.length} words</span>
            <span>{lesson.grammarPoints.length} grammar points</span>
            <span>{lesson.practiceQuestions.length} questions</span>
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

        {/* Vocabulary */}
        {activeSection === "vocabulary" && (
          <div className="card-paper border-2 overflow-hidden">
            <div className="p-5 border-b border-border">
              <h2 className="text-lg font-bold serif-jp text-foreground">語彙 — Vocabulary</h2>
              <p className="text-sm text-muted-foreground mt-1">Key words from Lesson {lesson.number}</p>
            </div>
            <div className="divide-y divide-border">
              {lesson.vocabulary.map((word, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-3 hover:bg-muted/30 transition-colors">
                  <span className="text-xs text-muted-foreground w-6 text-right serif-jp">{i + 1}</span>
                  <span className="text-xl japanese-text font-medium text-foreground min-w-[120px]">{word.japanese}</span>
                  <span className="text-sm text-muted-foreground min-w-[100px]">{word.reading}</span>
                  <span className="text-sm text-foreground flex-1">{word.meaning}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grammar */}
        {activeSection === "grammar" && (
          <div className="space-y-5">
            <div className="card-paper border-2 p-4 bg-muted/20 flex gap-3 items-start">
              <span className="text-primary serif-jp text-lg mt-0.5">筆</span>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Each grammar point shows the <strong className="text-foreground">pattern rule</strong>, a plain-English <strong className="text-foreground">explanation</strong>, a quick <strong className="text-foreground">tip</strong>, and model sentences.
              </p>
            </div>
            {lesson.grammarPoints.map((point, i) => (
              <div key={i} className="card-paper border-2 overflow-hidden">
                <div className="flex items-center gap-3 p-5 pb-4 border-b border-border bg-muted/10">
                  <span className="hanko-badge text-sm flex-shrink-0">{i + 1}</span>
                  <div>
                    <h3 className="text-xl font-bold japanese-text text-foreground leading-tight">{point.title}</h3>
                    <code className="text-xs text-primary font-mono mt-0.5 block">{point.rule}</code>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5 serif-jp">Explanation</p>
                    <p className="text-sm text-foreground leading-relaxed">{point.explanation}</p>
                  </div>
                  <div className="bg-primary/5 border border-primary/25 rounded-sm p-3 flex gap-2.5 items-start">
                    <span className="text-primary text-base flex-shrink-0 serif-jp">✦</span>
                    <p className="text-sm text-foreground leading-relaxed">
                      <strong className="text-primary serif-jp">Tip: </strong>{point.tip}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 serif-jp">Examples</p>
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

        {/* Practice */}
        {activeSection === "practice" && (
          <div className="space-y-4">
            {lesson.practiceQuestions.map((q, i) => (
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

            <div className="card-paper border-2 p-5">
              {!showResults ? (
                <button
                  onClick={handleSubmit}
                  disabled={Object.keys(practiceAnswers).length < lesson.practiceQuestions.length}
                  className={cn(
                    "w-full py-3 rounded-sm font-bold serif-jp text-sm border-2 transition-colors",
                    Object.keys(practiceAnswers).length < lesson.practiceQuestions.length
                      ? "border-border text-muted-foreground bg-muted/30 cursor-not-allowed"
                      : "btn-ink text-card border-foreground"
                  )}
                >
                  答え合わせ — Check Answers
                </button>
              ) : (
                <div className="text-center">
                  <p className="text-2xl font-bold serif-jp text-foreground mb-1">
                    {correctCount} / {lesson.practiceQuestions.length}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {correctCount === lesson.practiceQuestions.length
                      ? "Perfect — 完璧！"
                      : correctCount >= lesson.practiceQuestions.length / 2
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
