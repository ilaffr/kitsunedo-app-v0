import { useState } from "react";
import { Sparkles, Volume2, Check, X, RefreshCw, BookmarkPlus, BookmarkCheck, Scroll } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { speakJapanese } from "@/lib/japanese-tts";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { FuriganaText } from "@/components/furigana-text";
import { useFlashcards } from "@/hooks/use-flashcards";

export interface TaleData {
  id: string;
  title: string | null;
  theme: string | null;
  cultural_note: string | null;
  story_jp: string;
  story_furigana: string | null;
  translation: string;
  question: string;
  options: string[];
  correct_index: number;
  vocab_used: string[] | null;
  completed: boolean;
  xp_awarded: number;
  tale_date: string;
}

const THEME_LABEL: Record<string, string> = {
  yokai_folklore: "Yokai folklore · 妖怪",
  festival: "Festival · 祭",
  history: "History · 歴史",
  mystery: "Mystery · 怪談",
  shrine_lore: "Shrine lore · 神社",
  everyday_culture: "Everyday culture · 日常",
  tea_arts: "Traditional arts · 芸道",
  nature_seasons: "Nature & seasons · 季節",
};

interface TaleCardProps {
  tale: TaleData;
  /** When true, the comprehension question is interactive and submits XP. */
  interactive?: boolean;
  /** Hide the header chrome (used in archive expanded view). */
  compactHeader?: boolean;
  /** Called after a successful submission so parent can refresh state. */
  onSubmitted?: () => void;
}

const TALE_XP = 15;

export function TaleCard({ tale, interactive = true, compactHeader = false, onSubmitted }: TaleCardProps) {
  const { user } = useAuth();
  const { savedSet, addCard, fetchCards } = useFlashcards();
  const [showFurigana, setShowFurigana] = useState(true);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showCulturalNote, setShowCulturalNote] = useState(true);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(tale.completed);
  const [savingWord, setSavingWord] = useState<string | null>(null);

  // Lazy-load saved set the first time a card mounts that needs it
  const ensureSavedSet = async () => {
    if (savedSet.size === 0) await fetchCards();
  };

  const handleSubmit = async () => {
    if (!interactive || selectedIdx === null || !user) return;
    const correct = selectedIdx === tale.correct_index;
    setSubmitted(true);

    if (correct) toast.success(`+${TALE_XP} XP — the kitsune nods approvingly`);
    else toast("The kitsune flicks its tail — try again tomorrow", { icon: "🦊" });

    const xp = correct ? TALE_XP : 0;
    await supabase.from("kitsune_tales").update({ completed: true, xp_awarded: xp }).eq("id", tale.id);

    if (xp > 0) {
      await supabase.from("practice_sessions").insert({
        user_id: user.id,
        practice_type: "kitsune_tale",
        score_perfect: correct ? 1 : 0,
        score_close: 0,
        score_missed: correct ? 0 : 1,
        total_items: 1,
        xp_earned: xp,
      });
      await supabase.rpc("record_study_session", { p_user_id: user.id });
    }

    onSubmitted?.();
  };

  // Sentence mining: add a tale word to flashcards. We look up reading + meaning
  // from the user's existing pool (since vocab_used items came from there) and
  // fall back to using the word as both reading and meaning if missing.
  const handleSaveWord = async (japanese: string) => {
    if (!user || savedSet.has(japanese)) return;
    setSavingWord(japanese);
    try {
      // Try to reuse data from existing flashcards if the user already had it
      const { data: existing } = await supabase
        .from("flashcards")
        .select("japanese, reading, meaning")
        .eq("user_id", user.id)
        .eq("japanese", japanese)
        .maybeSingle();

      let reading = existing?.reading;
      let meaning = existing?.meaning;

      // Otherwise pull furigana reading from the story annotation
      if (!reading && tale.story_furigana) {
        const escaped = japanese.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const re = new RegExp(`${escaped}[\\{\\(]([\\u3040-\\u309Fー]+)[\\}\\)]`);
        const m = tale.story_furigana.match(re);
        if (m) reading = m[1];
      }

      await addCard({
        japanese,
        reading: reading || japanese,
        meaning: meaning || "(tap to edit meaning)",
        lessonId: `tale-${tale.tale_date}`,
      });
      toast.success(`「${japanese}」 saved to flashcards`);
    } catch (e) {
      toast.error("Could not save word");
    } finally {
      setSavingWord(null);
    }
  };

  return (
    <div className="card-paper border-2 p-5 md:p-6">
      {!compactHeader && (
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-sm bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="font-brush font-bold text-foreground truncate">
                {tale.title || "Daily Kitsune Tale"}
              </h3>
              <p className="text-xs text-muted-foreground serif-jp italic">
                {tale.theme && THEME_LABEL[tale.theme] ? THEME_LABEL[tale.theme] : "狐の昔話"}
              </p>
            </div>
          </div>
          <button
            onClick={() => speakJapanese(tale.story_jp, 0.8)}
            className="p-2 rounded-sm border-2 border-border hover:border-primary hover:text-primary transition-colors shrink-0"
            aria-label="Listen"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Story */}
      <div className="bg-muted/30 border-l-2 border-primary/40 p-4 mb-3">
        <p
          className="serif-jp text-foreground japanese-text whitespace-pre-line"
          style={{ fontSize: "1.15rem", lineHeight: showFurigana ? 2.4 : 1.9 }}
        >
          <FuriganaText text={tale.story_furigana || tale.story_jp} showFurigana={showFurigana} />
        </p>
      </div>

      {/* Toggles */}
      <div className="flex flex-wrap gap-2 mb-4 text-xs">
        <button
          onClick={() => setShowFurigana((v) => !v)}
          className={cn(
            "px-2 py-1 border rounded-sm transition-colors",
            showFurigana ? "border-primary text-primary bg-primary/5" : "border-border text-muted-foreground hover:border-foreground"
          )}
        >
          ふりがな {showFurigana ? "ON" : "OFF"}
        </button>
        <button
          onClick={() => setShowTranslation((v) => !v)}
          className={cn(
            "px-2 py-1 border rounded-sm transition-colors",
            showTranslation ? "border-primary text-primary bg-primary/5" : "border-border text-muted-foreground hover:border-foreground"
          )}
        >
          {showTranslation ? "Hide translation" : "Show translation"}
        </button>
        {tale.cultural_note && (
          <button
            onClick={() => setShowCulturalNote((v) => !v)}
            className={cn(
              "px-2 py-1 border rounded-sm transition-colors flex items-center gap-1",
              showCulturalNote ? "border-accent text-accent bg-accent/5" : "border-border text-muted-foreground hover:border-foreground"
            )}
          >
            <Scroll className="w-3 h-3" />
            {showCulturalNote ? "Hide note" : "Cultural note"}
          </button>
        )}
      </div>

      {showTranslation && (
        <p className="text-sm text-muted-foreground italic mb-4 px-1">{tale.translation}</p>
      )}

      {tale.cultural_note && showCulturalNote && (
        <div className="mb-4 p-3 border-l-2 border-accent/50 bg-accent/5 rounded-sm">
          <p className="text-[10px] uppercase tracking-widest text-accent mb-1 font-bold">Cultural note</p>
          <p className="text-sm text-foreground/90 leading-relaxed">{tale.cultural_note}</p>
        </div>
      )}

      {/* Vocab used chips with sentence-mining add buttons */}
      {tale.vocab_used && tale.vocab_used.length > 0 && (
        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Words in this tale</p>
          <div className="flex flex-wrap gap-1.5" onMouseEnter={ensureSavedSet}>
            {tale.vocab_used.map((w) => {
              const saved = savedSet.has(w);
              const saving = savingWord === w;
              return (
                <button
                  key={w}
                  onClick={() => handleSaveWord(w)}
                  disabled={saved || saving}
                  className={cn(
                    "text-xs px-2 py-1 border rounded-sm serif-jp inline-flex items-center gap-1 transition-colors",
                    saved
                      ? "bg-success/10 border-success/30 text-success cursor-default"
                      : "bg-accent/5 border-accent/30 text-accent hover:bg-accent hover:text-accent-foreground"
                  )}
                  title={saved ? "Already in your flashcards" : "Add to flashcards"}
                >
                  {saved ? <BookmarkCheck className="w-3 h-3" /> : <BookmarkPlus className="w-3 h-3" />}
                  {w}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Question */}
      {interactive && (
        <div className="border-t-2 border-dashed border-border pt-4">
          <p className="text-sm font-bold text-foreground mb-3">{tale.question}</p>
          <div className="space-y-2">
            {tale.options.map((opt, idx) => {
              const isSelected = selectedIdx === idx;
              const isCorrect = idx === tale.correct_index;
              const showCorrect = submitted && isCorrect;
              const showWrong = submitted && isSelected && !isCorrect;
              return (
                <button
                  key={idx}
                  disabled={submitted}
                  onClick={() => setSelectedIdx(idx)}
                  className={cn(
                    "w-full text-left px-3 py-2 border-2 rounded-sm text-sm transition-colors flex items-center gap-2",
                    !submitted && isSelected && "border-primary bg-primary/5",
                    !submitted && !isSelected && "border-border hover:border-foreground/40",
                    showCorrect && "border-success bg-success/10 text-foreground",
                    showWrong && "border-destructive bg-destructive/10 text-foreground",
                    submitted && !isSelected && !isCorrect && "border-border opacity-60"
                  )}
                >
                  {showCorrect && <Check className="w-4 h-4 text-success shrink-0" />}
                  {showWrong && <X className="w-4 h-4 text-destructive shrink-0" />}
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>

          {!submitted ? (
            <button
              onClick={handleSubmit}
              disabled={selectedIdx === null}
              className="btn-vermillion mt-4 px-4 py-2 text-sm font-brush disabled:opacity-50"
            >
              Submit answer
            </button>
          ) : (
            <div className="mt-4 flex items-center justify-between gap-3 text-xs text-muted-foreground">
              <span className="serif-jp italic">
                {selectedIdx === tale.correct_index || tale.completed
                  ? "見事! Come back tomorrow for a new tale."
                  : "明日また — Tomorrow brings a new tale."}
              </span>
              <button
                onClick={() => speakJapanese(tale.story_jp, 0.7)}
                className="flex items-center gap-1 hover:text-primary transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Replay slowly
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
