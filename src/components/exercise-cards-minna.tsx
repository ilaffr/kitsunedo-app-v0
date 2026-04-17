import { useState } from "react";
import { Check, X, ArrowRight, Volume2, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { speakJapanese } from "@/lib/japanese-tts";
import type {
  ParticleFillExercise,
  ConjugationExercise,
  SubstitutionExercise,
  DictationExercise,
  TransformExercise,
  DialogueExercise,
} from "@/lib/exercise-engine";

interface ExerciseResult { correct: boolean }

// Light JP-aware normalizer (lowercase, trim, drop punctuation/spaces)
function normalizeJp(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/[。、,.!?！？\s　]/g, "");
}

// ── Particle Fill-in ───────────────────────────────────────────────────────
export function ParticleFillCard({
  exercise,
  onComplete,
}: {
  exercise: ParticleFillExercise;
  onComplete: (r: ExerciseResult) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const isCorrect = selected === exercise.correctIndex;

  const renderedSentence = selected !== null
    ? exercise.sentence.replace("___", `【${exercise.options[selected]}】`)
    : exercise.sentence;

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium text-foreground serif-jp">Pick the correct particle</p>
      <div className="p-4 rounded-sm bg-muted/30 border border-border space-y-2">
        <p className="text-2xl japanese-text text-foreground leading-relaxed">{renderedSentence}</p>
        <p className="text-xs text-muted-foreground">{exercise.translation}</p>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {exercise.options.map((opt, i) => (
          <button
            key={i}
            disabled={submitted}
            onClick={() => setSelected(i)}
            className={cn(
              "py-3 rounded-sm border-2 text-lg japanese-text font-bold transition-all",
              !submitted && selected === i && "border-foreground bg-foreground/5 scale-[1.04]",
              !submitted && selected !== i && "border-border hover:border-foreground/30",
              submitted && i === exercise.correctIndex && "border-success bg-success/10",
              submitted && selected === i && i !== exercise.correctIndex && "border-destructive bg-destructive/10"
            )}
          >
            {opt}
          </button>
        ))}
      </div>
      {!submitted ? (
        <button
          onClick={() => setSubmitted(true)}
          disabled={selected === null}
          className={cn(
            "w-full py-3 rounded-sm border-2 font-bold serif-jp text-sm transition-colors",
            selected === null
              ? "border-border text-muted-foreground bg-muted/30 cursor-not-allowed"
              : "btn-ink text-background border-foreground"
          )}
        >Check</button>
      ) : (
        <div className={cn("p-3 rounded-sm border-2 flex items-center justify-between", isCorrect ? "border-success bg-success/10" : "border-destructive bg-destructive/10")}>
          <span className="text-sm font-medium">
            {isCorrect ? "Correct! ✨" : `Answer: ${exercise.options[exercise.correctIndex]}`}
          </span>
          <button onClick={() => onComplete({ correct: isCorrect })} className="flex items-center gap-1 text-sm font-bold hover:underline">
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Conjugation Drill ──────────────────────────────────────────────────────
export function ConjugationCard({
  exercise,
  onComplete,
}: {
  exercise: ConjugationExercise;
  onComplete: (r: ExerciseResult) => void;
}) {
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const isCorrect = exercise.acceptedAnswers.some(a => normalizeJp(a) === normalizeJp(input));

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium text-foreground serif-jp">Conjugate the verb</p>
      <div className="p-4 rounded-sm bg-muted/30 border border-border text-center space-y-1">
        <p className="text-3xl japanese-text font-bold text-foreground">{exercise.base}</p>
        {exercise.reading && <p className="text-xs text-muted-foreground">{exercise.reading} — {exercise.meaning}</p>}
        <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-sm bg-primary/10 border border-primary/30 text-xs font-bold text-primary serif-jp">
          → {exercise.targetFormLabel}
        </div>
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && !submitted && input.trim() && setSubmitted(true)}
        disabled={submitted}
        placeholder="日本語で…"
        className="w-full px-4 py-3 rounded-sm border-2 border-border bg-background text-foreground text-lg japanese-text focus:outline-none focus:border-foreground transition-colors"
        autoFocus
      />
      {!submitted ? (
        <button
          onClick={() => setSubmitted(true)}
          disabled={!input.trim()}
          className={cn(
            "w-full py-3 rounded-sm border-2 font-bold serif-jp text-sm transition-colors",
            !input.trim()
              ? "border-border text-muted-foreground bg-muted/30 cursor-not-allowed"
              : "btn-ink text-background border-foreground"
          )}
        >Check</button>
      ) : (
        <div className={cn("p-3 rounded-sm border-2 flex items-center justify-between", isCorrect ? "border-success bg-success/10" : "border-destructive bg-destructive/10")}>
          <div className="text-sm">
            <span className="font-medium">{isCorrect ? "Correct! ✨" : "Not quite"}</span>
            {!isCorrect && <p className="text-xs mt-1 japanese-text">Answer: {exercise.acceptedAnswers[0]}</p>}
          </div>
          <button onClick={() => onComplete({ correct: isCorrect })} className="flex items-center gap-1 text-sm font-bold hover:underline">
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Substitution Drill (Q → A) ─────────────────────────────────────────────
export function SubstitutionCard({
  exercise,
  onComplete,
}: {
  exercise: SubstitutionExercise;
  onComplete: (r: ExerciseResult) => void;
}) {
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const isCorrect = exercise.acceptedAnswers.some(a => normalizeJp(a) === normalizeJp(input));

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium text-foreground serif-jp">Answer the question</p>
      <div className="p-4 rounded-sm bg-muted/30 border border-border space-y-2">
        <div className="flex items-center gap-2">
          <p className="text-xl japanese-text text-foreground flex-1">{exercise.questionJp}</p>
          <button onClick={() => speakJapanese(exercise.questionJp)} className="p-1.5 rounded-sm text-muted-foreground hover:text-primary transition-colors" title="Listen">
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground">{exercise.questionEn}</p>
        <div className="inline-flex items-center gap-2 mt-1 px-3 py-1 rounded-sm bg-primary/10 border border-primary/30 text-xs font-bold text-primary serif-jp">
          Use: <span className="japanese-text">{exercise.cue}</span>
        </div>
      </div>
      {exercise.hint && <p className="text-xs text-muted-foreground">Pattern: <span className="japanese-text">{exercise.hint}</span></p>}
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={submitted}
        placeholder="日本語で答えてください…"
        rows={2}
        className="w-full px-4 py-3 rounded-sm border-2 border-border bg-background text-foreground text-sm japanese-text focus:outline-none focus:border-foreground transition-colors resize-none"
      />
      {!submitted ? (
        <button
          onClick={() => setSubmitted(true)}
          disabled={!input.trim()}
          className={cn(
            "w-full py-3 rounded-sm border-2 font-bold serif-jp text-sm transition-colors",
            !input.trim()
              ? "border-border text-muted-foreground bg-muted/30 cursor-not-allowed"
              : "btn-ink text-background border-foreground"
          )}
        >Check</button>
      ) : (
        <div className={cn("p-3 rounded-sm border-2 flex items-center justify-between", isCorrect ? "border-success bg-success/10" : "border-destructive bg-destructive/10")}>
          <div className="text-sm">
            <span className="font-medium">{isCorrect ? "Correct! ✨" : "Not quite"}</span>
            {!isCorrect && <p className="text-xs mt-1 japanese-text">Answer: {exercise.acceptedAnswers[0]}</p>}
          </div>
          <button onClick={() => onComplete({ correct: isCorrect })} className="flex items-center gap-1 text-sm font-bold hover:underline shrink-0">
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Listening Dictation ────────────────────────────────────────────────────
export function DictationCard({
  exercise,
  onComplete,
}: {
  exercise: DictationExercise;
  onComplete: (r: ExerciseResult) => void;
}) {
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const isCorrect = exercise.acceptedAnswers.some(a => normalizeJp(a) === normalizeJp(input));

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium text-foreground serif-jp">Listening — type what you hear</p>
      <div className="p-6 rounded-sm bg-muted/30 border border-border flex flex-col items-center gap-3">
        <button
          onClick={() => speakJapanese(exercise.jp, 0.75)}
          className="w-16 h-16 rounded-full border-2 border-foreground btn-ink text-background flex items-center justify-center hover:scale-105 transition-transform"
          title="Play audio"
        >
          <Play className="w-7 h-7 ml-1" />
        </button>
        <p className="text-xs text-muted-foreground">Tap to play. You can replay as many times as you like.</p>
        {revealed && (
          <p className="text-base japanese-text text-foreground mt-2">{exercise.jp}</p>
        )}
        {!revealed && !submitted && (
          <button onClick={() => setRevealed(true)} className="text-xs text-primary hover:underline">
            Show text (skip dictation)
          </button>
        )}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && !submitted && input.trim() && setSubmitted(true)}
        disabled={submitted}
        placeholder="Type in romaji or kana…"
        className="w-full px-4 py-3 rounded-sm border-2 border-border bg-background text-foreground text-sm focus:outline-none focus:border-foreground transition-colors"
        autoFocus
      />
      {!submitted ? (
        <button
          onClick={() => setSubmitted(true)}
          disabled={!input.trim()}
          className={cn(
            "w-full py-3 rounded-sm border-2 font-bold serif-jp text-sm transition-colors",
            !input.trim()
              ? "border-border text-muted-foreground bg-muted/30 cursor-not-allowed"
              : "btn-ink text-background border-foreground"
          )}
        >Check</button>
      ) : (
        <div className={cn("p-3 rounded-sm border-2", isCorrect ? "border-success bg-success/10" : "border-destructive bg-destructive/10")}>
          <div className="flex items-start justify-between gap-3">
            <div className="text-sm">
              <p className="font-medium">{isCorrect ? "Correct! ✨" : "Not quite"}</p>
              <p className="text-xs mt-1 japanese-text text-foreground">{exercise.jp}</p>
              <p className="text-xs text-muted-foreground">{exercise.translation}</p>
            </div>
            <button onClick={() => onComplete({ correct: isCorrect })} className="flex items-center gap-1 text-sm font-bold hover:underline shrink-0">
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Transform / Rewrite ────────────────────────────────────────────────────
export function TransformCard({
  exercise,
  onComplete,
}: {
  exercise: TransformExercise;
  onComplete: (r: ExerciseResult) => void;
}) {
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const isCorrect = exercise.acceptedAnswers.some(a => normalizeJp(a) === normalizeJp(input));

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium text-foreground serif-jp">Rewrite the sentence</p>
      <div className="p-4 rounded-sm bg-muted/30 border border-border space-y-2">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Original</p>
        <p className="text-xl japanese-text text-foreground">{exercise.source}</p>
        <div className="inline-flex items-center gap-2 mt-1 px-3 py-1 rounded-sm bg-primary/10 border border-primary/30 text-xs font-bold text-primary serif-jp">
          → {exercise.instruction}
        </div>
      </div>
      {exercise.hint && <p className="text-xs text-muted-foreground">Pattern: <span className="japanese-text">{exercise.hint}</span></p>}
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={submitted}
        placeholder="日本語で書いてください…"
        rows={2}
        className="w-full px-4 py-3 rounded-sm border-2 border-border bg-background text-foreground text-sm japanese-text focus:outline-none focus:border-foreground transition-colors resize-none"
      />
      {!submitted ? (
        <button
          onClick={() => setSubmitted(true)}
          disabled={!input.trim()}
          className={cn(
            "w-full py-3 rounded-sm border-2 font-bold serif-jp text-sm transition-colors",
            !input.trim()
              ? "border-border text-muted-foreground bg-muted/30 cursor-not-allowed"
              : "btn-ink text-background border-foreground"
          )}
        >Check</button>
      ) : (
        <div className={cn("p-3 rounded-sm border-2 flex items-center justify-between", isCorrect ? "border-success bg-success/10" : "border-destructive bg-destructive/10")}>
          <div className="text-sm">
            <span className="font-medium">{isCorrect ? "Correct! ✨" : "Not quite"}</span>
            {!isCorrect && <p className="text-xs mt-1 japanese-text">Answer: {exercise.acceptedAnswers[0]}</p>}
          </div>
          <button onClick={() => onComplete({ correct: isCorrect })} className="flex items-center gap-1 text-sm font-bold hover:underline shrink-0">
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Dialogue (会話) ────────────────────────────────────────────────────────
export function DialogueCard({
  exercise,
  onComplete,
}: {
  exercise: DialogueExercise;
  onComplete: (r: ExerciseResult) => void;
}) {
  const [showTranslation, setShowTranslation] = useState(false);
  const [phase, setPhase] = useState<"read" | "quiz">("read");
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [allCorrect, setAllCorrect] = useState(true);

  const playAll = () => {
    // Cancel any queued speech, then queue lines sequentially.
    if (typeof speechSynthesis === "undefined") return;
    speechSynthesis.cancel();
    exercise.lines.forEach((line) => {
      const u = new SpeechSynthesisUtterance(line.jp);
      u.lang = "ja-JP";
      u.rate = 0.8;
      speechSynthesis.speak(u);
    });
  };

  if (phase === "read") {
    return (
      <div className="space-y-4">
        <div className="card-paper border-2 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-primary serif-jp">会話 — Dialogue</span>
              <h3 className="text-xl font-bold japanese-text text-foreground mt-1">{exercise.titleJp}</h3>
              <p className="text-xs text-muted-foreground">{exercise.titleEn} — {exercise.scene}</p>
            </div>
            <button
              onClick={playAll}
              className="p-2.5 rounded-sm border-2 border-foreground btn-ink text-background hover:scale-105 transition-transform"
              title="Play full dialogue"
            >
              <Play className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2 pt-2">
            {exercise.lines.map((line, i) => (
              <div key={i} className="p-3 rounded-sm border border-border bg-muted/20">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold serif-jp text-primary">{line.speaker}：</span>
                  <button onClick={() => speakJapanese(line.jp, 0.8)} className="p-1 rounded-sm text-muted-foreground hover:text-primary transition-colors" title="Listen">
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-base japanese-text text-foreground mt-1">{line.jp}</p>
                {showTranslation && <p className="text-xs text-muted-foreground mt-1 italic">{line.en}</p>}
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowTranslation((v) => !v)}
            className="w-full text-xs text-primary hover:underline pt-1"
          >
            {showTranslation ? "Hide translations" : "Show translations"}
          </button>
        </div>

        <button
          onClick={() => setPhase("quiz")}
          className="w-full py-3 rounded-sm border-2 border-foreground font-bold serif-jp text-sm btn-ink text-background transition-colors"
        >
          Continue to comprehension →
        </button>
      </div>
    );
  }

  // QUIZ phase
  const q = exercise.questions[qIdx];
  const isCorrect = selected === q.correct;

  const next = () => {
    if (!isCorrect) setAllCorrect(false);
    if (qIdx + 1 < exercise.questions.length) {
      setQIdx((i) => i + 1);
      setSelected(null);
      setSubmitted(false);
    } else {
      onComplete({ correct: allCorrect && isCorrect });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Question {qIdx + 1} / {exercise.questions.length}</span>
        <button onClick={() => setPhase("read")} className="text-primary hover:underline">← Re-read dialogue</button>
      </div>
      <p className="text-lg font-medium text-foreground serif-jp">{q.question}</p>
      <div className="grid grid-cols-1 gap-2">
        {q.options.map((opt, i) => (
          <button
            key={i}
            disabled={submitted}
            onClick={() => setSelected(i)}
            className={cn(
              "w-full text-left px-4 py-3 rounded-sm border-2 text-sm transition-all",
              !submitted && selected === i && "border-foreground bg-foreground/5",
              !submitted && selected !== i && "border-border hover:border-foreground/30",
              submitted && i === q.correct && "border-success bg-success/10",
              submitted && selected === i && i !== q.correct && "border-destructive bg-destructive/10"
            )}
          >
            <div className="flex items-center justify-between">
              <span>{opt}</span>
              {submitted && i === q.correct && <Check className="w-4 h-4 text-success" />}
              {submitted && selected === i && i !== q.correct && <X className="w-4 h-4 text-destructive" />}
            </div>
          </button>
        ))}
      </div>
      {!submitted ? (
        <button
          onClick={() => setSubmitted(true)}
          disabled={selected === null}
          className={cn(
            "w-full py-3 rounded-sm border-2 font-bold serif-jp text-sm transition-colors",
            selected === null
              ? "border-border text-muted-foreground bg-muted/30 cursor-not-allowed"
              : "btn-ink text-background border-foreground"
          )}
        >Check</button>
      ) : (
        <div className={cn("p-3 rounded-sm border-2 flex items-center justify-between", isCorrect ? "border-success bg-success/10" : "border-destructive bg-destructive/10")}>
          <span className="text-sm font-medium">{isCorrect ? "Correct! ✨" : `Answer: ${q.options[q.correct]}`}</span>
          <button onClick={next} className="flex items-center gap-1 text-sm font-bold hover:underline">
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
