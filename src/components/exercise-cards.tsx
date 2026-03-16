import { useState } from "react";
import { Check, X, ArrowRight, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { speakJapanese } from "@/lib/japanese-tts";
import type {
  MultipleChoiceExercise,
  TypeAnswerExercise,
  MatchPairsExercise,
  SentenceBuilderExercise,
  TranslateComposeExercise,
  ReadingComprehensionExercise,
} from "@/lib/exercise-engine";

interface ExerciseResult {
  correct: boolean;
}

// ── Multiple Choice ────────────────────────────────────────────────────────

export function MultipleChoiceCard({
  exercise,
  onComplete,
}: {
  exercise: MultipleChoiceExercise;
  onComplete: (r: ExerciseResult) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (i: number) => {
    if (submitted) return;
    setSelected(i);
  };

  const handleCheck = () => {
    if (selected === null) return;
    setSubmitted(true);
  };

  const isCorrect = selected === exercise.correctIndex;

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium text-foreground serif-jp">{exercise.prompt}</p>
      {exercise.promptJp && (
        <div className="flex items-center justify-center gap-2 py-2">
          <p className="text-3xl japanese-text font-bold text-foreground">{exercise.promptJp}</p>
          <button onClick={() => speakJapanese(exercise.promptJp!)} className="p-1.5 rounded-sm text-muted-foreground hover:text-primary transition-colors" title="Listen">
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 gap-2">
        {exercise.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleSelect(i)}
            className={cn(
              "w-full text-left px-4 py-3 rounded-sm border-2 text-sm transition-all",
              !submitted && selected === i && "border-foreground bg-foreground/5 scale-[1.01]",
              !submitted && selected !== i && "border-border hover:border-foreground/30",
              submitted && i === exercise.correctIndex && "border-success bg-success/10",
              submitted && selected === i && i !== exercise.correctIndex && "border-destructive bg-destructive/10"
            )}
          >
            <div className="flex items-center justify-between">
              <span>{opt}</span>
              {submitted && i === exercise.correctIndex && <Check className="w-4 h-4 text-success" />}
              {submitted && selected === i && i !== exercise.correctIndex && <X className="w-4 h-4 text-destructive" />}
            </div>
          </button>
        ))}
      </div>
      {!submitted ? (
        <button
          onClick={handleCheck}
          disabled={selected === null}
          className={cn(
            "w-full py-3 rounded-sm border-2 font-bold serif-jp text-sm transition-colors",
            selected === null
              ? "border-border text-muted-foreground bg-muted/30 cursor-not-allowed"
              : "btn-ink text-background border-foreground"
          )}
        >
          Check
        </button>
      ) : (
        <div className={cn("p-3 rounded-sm border-2 flex items-center justify-between", isCorrect ? "border-success bg-success/10" : "border-destructive bg-destructive/10")}>
          <span className="text-sm font-medium">{isCorrect ? "Correct! ✨" : `Wrong — answer: ${exercise.options[exercise.correctIndex]}`}</span>
          <button onClick={() => onComplete({ correct: isCorrect })} className="flex items-center gap-1 text-sm font-bold hover:underline">
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Type Answer ────────────────────────────────────────────────────────────

export function TypeAnswerCard({
  exercise,
  onComplete,
}: {
  exercise: TypeAnswerExercise;
  onComplete: (r: ExerciseResult) => void;
}) {
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
  const isCorrect = exercise.acceptedAnswers.some((a) => normalize(a) === normalize(input));

  const handleCheck = () => setSubmitted(true);

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium text-foreground serif-jp">{exercise.prompt}</p>
      {exercise.promptJp && (
        <div className="flex items-center justify-center gap-2 py-2">
          <p className="text-3xl japanese-text font-bold text-foreground">{exercise.promptJp}</p>
          <button onClick={() => speakJapanese(exercise.promptJp!)} className="p-1.5 rounded-sm text-muted-foreground hover:text-primary transition-colors" title="Listen">
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
      )}
      {exercise.hint && <p className="text-xs text-muted-foreground">Hint: {exercise.hint}</p>}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && !submitted && handleCheck()}
        disabled={submitted}
        placeholder="Type your answer…"
        className="w-full px-4 py-3 rounded-sm border-2 border-border bg-background text-foreground text-sm focus:outline-none focus:border-foreground transition-colors"
        autoFocus
      />
      {!submitted ? (
        <button
          onClick={handleCheck}
          disabled={!input.trim()}
          className={cn(
            "w-full py-3 rounded-sm border-2 font-bold serif-jp text-sm transition-colors",
            !input.trim()
              ? "border-border text-muted-foreground bg-muted/30 cursor-not-allowed"
              : "btn-ink text-background border-foreground"
          )}
        >
          Check
        </button>
      ) : (
        <div className={cn("p-3 rounded-sm border-2 flex items-center justify-between", isCorrect ? "border-success bg-success/10" : "border-destructive bg-destructive/10")}>
          <span className="text-sm font-medium">
            {isCorrect ? "Correct! ✨" : `Answer: ${exercise.acceptedAnswers[0]}`}
          </span>
          <button onClick={() => onComplete({ correct: isCorrect })} className="flex items-center gap-1 text-sm font-bold hover:underline">
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Match Pairs ────────────────────────────────────────────────────────────

export function MatchPairsCard({
  exercise,
  onComplete,
}: {
  exercise: MatchPairsExercise;
  onComplete: (r: ExerciseResult) => void;
}) {
  const [shuffledRight] = useState(() => {
    const arr = [...exercise.pairs.map((p) => p.right)];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  });
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matches, setMatches] = useState<Record<number, number>>({});
  const [wrong, setWrong] = useState<{ left: number; right: number } | null>(null);
  const [errors, setErrors] = useState(0);

  const handleLeftClick = (i: number) => {
    if (Object.keys(matches).length === exercise.pairs.length) return;
    if (i in matches) return;
    setSelectedLeft(i);
    setWrong(null);
  };

  const handleRightClick = (ri: number) => {
    if (selectedLeft === null) return;
    if (Object.values(matches).includes(ri)) return;
    const correctRight = exercise.pairs[selectedLeft].right;
    if (shuffledRight[ri] === correctRight) {
      setMatches((prev) => ({ ...prev, [selectedLeft]: ri }));
      setSelectedLeft(null);
      setWrong(null);
    } else {
      setWrong({ left: selectedLeft, right: ri });
      setErrors((e) => e + 1);
      setTimeout(() => setWrong(null), 600);
    }
  };

  const allMatched = Object.keys(matches).length === exercise.pairs.length;

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium text-foreground serif-jp">Match the pairs</p>
      <div className="grid grid-cols-2 gap-3">
        {/* Left column */}
        <div className="space-y-2">
          {exercise.pairs.map((p, i) => (
            <button
              key={i}
              onClick={() => handleLeftClick(i)}
              className={cn(
                "w-full px-3 py-3 rounded-sm border-2 text-sm japanese-text text-left transition-all",
                i in matches && "border-success/40 bg-success/10 opacity-60",
                selectedLeft === i && !(i in matches) && "border-foreground bg-foreground/5 scale-[1.02]",
                !(i in matches) && selectedLeft !== i && "border-border hover:border-foreground/30",
                wrong?.left === i && "border-destructive bg-destructive/10 animate-shake"
              )}
            >
              {p.left}
            </button>
          ))}
        </div>
        {/* Right column */}
        <div className="space-y-2">
          {shuffledRight.map((text, ri) => {
            const isUsed = Object.values(matches).includes(ri);
            return (
              <button
                key={ri}
                onClick={() => handleRightClick(ri)}
                className={cn(
                  "w-full px-3 py-3 rounded-sm border-2 text-sm text-left transition-all",
                  isUsed && "border-success/40 bg-success/10 opacity-60",
                  !isUsed && "border-border hover:border-foreground/30",
                  wrong?.right === ri && "border-destructive bg-destructive/10 animate-shake"
                )}
              >
                {text}
              </button>
            );
          })}
        </div>
      </div>
      {allMatched && (
        <div className="p-3 rounded-sm border-2 border-success bg-success/10 flex items-center justify-between">
          <span className="text-sm font-medium">
            {errors === 0 ? "Perfect match! ✨" : `Matched! (${errors} ${errors === 1 ? "mistake" : "mistakes"})`}
          </span>
          <button onClick={() => onComplete({ correct: errors === 0 })} className="flex items-center gap-1 text-sm font-bold hover:underline">
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Sentence Builder ───────────────────────────────────────────────────────

export function SentenceBuilderCard({
  exercise,
  onComplete,
}: {
  exercise: SentenceBuilderExercise;
  onComplete: (r: ExerciseResult) => void;
}) {
  const [placed, setPlaced] = useState<string[]>([]);
  const [available, setAvailable] = useState([...exercise.tiles]);
  const [submitted, setSubmitted] = useState(false);

  const handleTileClick = (tile: string, idx: number) => {
    if (submitted) return;
    setPlaced((p) => [...p, tile]);
    setAvailable((a) => { const n = [...a]; n.splice(idx, 1); return n; });
  };

  const handleRemovePlaced = (idx: number) => {
    if (submitted) return;
    const tile = placed[idx];
    setPlaced((p) => { const n = [...p]; n.splice(idx, 1); return n; });
    setAvailable((a) => [...a, tile]);
  };

  const handleCheck = () => setSubmitted(true);

  const isCorrect = placed.join(" ") === exercise.correctOrder.join(" ");

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium text-foreground serif-jp">Build the sentence</p>
      <p className="text-sm text-muted-foreground">{exercise.prompt}</p>

      {/* Placed tiles area */}
      <div className="min-h-[52px] p-3 rounded-sm border-2 border-dashed border-border bg-muted/20 flex flex-wrap gap-2">
        {placed.length === 0 && <span className="text-xs text-muted-foreground">Tap tiles below to build…</span>}
        {placed.map((tile, i) => (
          <button
            key={i}
            onClick={() => handleRemovePlaced(i)}
            className={cn(
              "px-3 py-1.5 rounded-sm border-2 text-sm japanese-text font-medium transition-colors",
              !submitted && "border-foreground bg-foreground/5 hover:bg-destructive/10",
              submitted && isCorrect && "border-success bg-success/10",
              submitted && !isCorrect && "border-destructive bg-destructive/10"
            )}
          >
            {tile}
          </button>
        ))}
      </div>

      {/* Available tiles */}
      <div className="flex flex-wrap gap-2">
        {available.map((tile, i) => (
          <button
            key={i}
            onClick={() => handleTileClick(tile, i)}
            className="px-3 py-1.5 rounded-sm border-2 border-border text-sm japanese-text font-medium hover:border-foreground/30 hover:bg-muted/30 transition-colors"
          >
            {tile}
          </button>
        ))}
      </div>

      {!submitted ? (
        <button
          onClick={handleCheck}
          disabled={available.length > 0}
          className={cn(
            "w-full py-3 rounded-sm border-2 font-bold serif-jp text-sm transition-colors",
            available.length > 0
              ? "border-border text-muted-foreground bg-muted/30 cursor-not-allowed"
              : "btn-ink text-background border-foreground"
          )}
        >
          Check
        </button>
      ) : (
        <div className={cn("p-3 rounded-sm border-2 flex items-center justify-between", isCorrect ? "border-success bg-success/10" : "border-destructive bg-destructive/10")}>
          <div className="text-sm">
            <span className="font-medium">{isCorrect ? "Correct! ✨" : "Not quite"}</span>
            {!isCorrect && <p className="text-xs mt-1 japanese-text">Answer: {exercise.correctOrder.join(" ")}</p>}
          </div>
          <button onClick={() => onComplete({ correct: isCorrect })} className="flex items-center gap-1 text-sm font-bold hover:underline shrink-0">
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Translate & Compose ────────────────────────────────────────────────────

export function TranslateComposeCard({
  exercise,
  onComplete,
}: {
  exercise: TranslateComposeExercise;
  onComplete: (r: ExerciseResult) => void;
}) {
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const normalize = (s: string) =>
    s.trim().replace(/\s+/g, " ").replace(/。/g, "").replace(/\./g, "");
  const isCorrect = exercise.acceptedAnswers.some(
    (a) => normalize(a) === normalize(input)
  );

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium text-foreground serif-jp">Write in Japanese</p>
      <div className="p-4 rounded-sm bg-muted/30 border border-border">
        <p className="text-foreground">{exercise.prompt}</p>
      </div>
      {exercise.hint && <p className="text-xs text-muted-foreground">Pattern: {exercise.hint}</p>}
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
        >
          Check
        </button>
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

// ── Reading Comprehension ──────────────────────────────────────────────────

export function ReadingComprehensionCard({
  exercise,
  onComplete,
}: {
  exercise: ReadingComprehensionExercise;
  onComplete: (r: ExerciseResult) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);

  const isCorrect = selected === exercise.correctIndex;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground serif-jp">Reading 読解</p>
        <span className="text-xs text-muted-foreground">{exercise.title}</span>
      </div>

      {/* Reading text */}
      <div className="p-4 rounded-sm bg-muted/20 border-2 border-border">
        <div className="flex items-start justify-between gap-2">
          <p className="text-base japanese-text leading-relaxed text-foreground whitespace-pre-line">{exercise.text}</p>
          <button onClick={() => speakJapanese(exercise.text, 0.75)} className="p-1.5 rounded-sm text-muted-foreground hover:text-primary transition-colors shrink-0 mt-0.5" title="Listen to passage">
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
        <button
          onClick={() => setShowTranslation(!showTranslation)}
          className="text-xs text-primary mt-3 hover:underline serif-jp"
        >
          {showTranslation ? "Hide translation ▲" : "Show translation ▼"}
        </button>
        {showTranslation && (
          <p className="text-sm text-muted-foreground mt-2 italic leading-relaxed">{exercise.translation}</p>
        )}
      </div>

      {/* Question */}
      <p className="text-sm font-medium text-foreground serif-jp">{exercise.question}</p>

      <div className="grid grid-cols-1 gap-2">
        {exercise.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => !submitted && setSelected(i)}
            className={cn(
              "w-full text-left px-4 py-3 rounded-sm border-2 text-sm transition-all",
              !submitted && selected === i && "border-foreground bg-foreground/5 scale-[1.01]",
              !submitted && selected !== i && "border-border hover:border-foreground/30",
              submitted && i === exercise.correctIndex && "border-success bg-success/10",
              submitted && selected === i && i !== exercise.correctIndex && "border-destructive bg-destructive/10"
            )}
          >
            <div className="flex items-center justify-between">
              <span>{opt}</span>
              {submitted && i === exercise.correctIndex && <Check className="w-4 h-4 text-success" />}
              {submitted && selected === i && i !== exercise.correctIndex && <X className="w-4 h-4 text-destructive" />}
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
        >
          Check
        </button>
      ) : (
        <div className={cn("p-3 rounded-sm border-2 flex items-center justify-between", isCorrect ? "border-success bg-success/10" : "border-destructive bg-destructive/10")}>
          <span className="text-sm font-medium">{isCorrect ? "Correct! ✨" : `Answer: ${exercise.options[exercise.correctIndex]}`}</span>
          <button onClick={() => onComplete({ correct: isCorrect })} className="flex items-center gap-1 text-sm font-bold hover:underline">
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
