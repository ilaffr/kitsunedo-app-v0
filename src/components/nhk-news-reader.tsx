import { useEffect, useMemo, useState } from "react";
import { Loader2, ExternalLink, Volume2, ArrowLeft, Newspaper, Plus, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { speakJapanese } from "@/lib/japanese-tts";
import { useFlashcards } from "@/hooks/use-flashcards";
import { NhkComprehensionQuiz } from "@/components/nhk-comprehension-quiz";

type Level = "N5" | "N4" | "N3" | "N2" | "N1";
type Category = "top" | "politics" | "sports" | "tech" | "world" | "business" | "society";

interface NhkArticle {
  id: string;
  news_id: string;
  level: Level;
  category?: Category;
  source: "easy" | "regular";
  title: string;
  summary: string | null;
  body_html: string | null;
  audio_url: string | null;
  source_url: string;
  published_at: string | null;
}

interface Props {
  level: Level;
}

const CATEGORIES: { id: Category; label: string; jp: string }[] = [
  { id: "top", label: "Top", jp: "主要" },
  { id: "politics", label: "Politics", jp: "政治" },
  { id: "world", label: "World", jp: "国際" },
  { id: "business", label: "Business", jp: "経済" },
  { id: "tech", label: "Tech / Science", jp: "科学" },
  { id: "sports", label: "Sports", jp: "スポーツ" },
  { id: "society", label: "Society", jp: "社会" },
];

function formatDate(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
    " · " +
    d.toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
}

// Strip <ruby> tags down to base kanji for TTS / flashcard saving
function rubyStripBase(html: string): string {
  // Remove <rt>...</rt> and <rp>...</rp>; keep base text inside <ruby>
  return html
    .replace(/<rp>[\s\S]*?<\/rp>/g, "")
    .replace(/<rt>[\s\S]*?<\/rt>/g, "")
    .replace(/<\/?ruby>/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Extract reading from <ruby>kanji<rt>reading</rt></ruby>
function extractRubyReading(html: string): string {
  const reading = html
    .replace(/<ruby>([^<]*?)<rt>([^<]*?)<\/rt><\/ruby>/g, "$2")
    .replace(/<rp>[\s\S]*?<\/rp>/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return reading;
}

export function NhkNewsReader({ level }: Props) {
  const [articles, setArticles] = useState<NhkArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<NhkArticle | null>(null);
  const [category, setCategory] = useState<Category>("top");
  const { addCard, savedSet } = useFlashcards();
  const savedKeys = savedSet;
  const [savingWord, setSavingWord] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setSelected(null);
      try {
        const { data, error } = await supabase.functions.invoke("fetch-nhk-news", {
          body: { level, category },
        });
        if (cancelled) return;
        if (error) {
          toast.error("Couldn't load NHK news.");
          setArticles([]);
        } else {
          setArticles((data?.articles ?? []) as NhkArticle[]);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) toast.error("Couldn't load NHK news.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [level, category]);

  const isEasyLevel = level === "N5" || level === "N4" || level === "N3";

  const sentences = useMemo(() => {
    if (!selected?.body_html) return [];
    // Split by </p> while preserving ruby
    const blocks = selected.body_html
      .split(/<\/p>/i)
      .map((b) => b.replace(/<p[^>]*>/i, "").trim())
      .filter(Boolean);
    return blocks;
  }, [selected]);

  const handlePlayAudio = (article: NhkArticle) => {
    if (article.audio_url && !article.audio_url.endsWith(".m3u8")) {
      const audio = new Audio(article.audio_url);
      audio.play().catch(() => {
        // Fallback to TTS
        speakJapanese(rubyStripBase(article.body_html ?? article.title), 0.7);
      });
    } else {
      speakJapanese(rubyStripBase(article.body_html ?? article.title), 0.7);
    }
  };

  const handleSaveWord = async (japanese: string, reading: string) => {
    if (!japanese.trim()) return;
    if (savedKeys.has(japanese)) {
      toast.info("Already in your deck");
      return;
    }
    setSavingWord(japanese);
    try {
      await addCard({
        japanese,
        reading: reading || japanese,
        meaning: "(NHK news — add meaning later)",
        lessonId: `nhk-${level}`,
      });
      toast.success(`Saved 「${japanese}」`);
    } catch {
      toast.error("Couldn't save");
    } finally {
      setSavingWord(null);
    }
  };

  // ---------- LIST VIEW ----------
  if (!selected) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Newspaper className="w-4 h-4 text-foreground" />
          <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
            NHK News · {level} · {isEasyLevel ? "やさしい日本語" : "通常ニュース"}
          </p>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {CATEGORIES.map((c) => {
            const active = c.id === category;
            return (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-[11px] tracking-wide whitespace-nowrap transition-all border",
                  active
                    ? "bg-foreground text-background border-foreground"
                    : "bg-transparent text-muted-foreground border-border hover:text-foreground hover:border-foreground/40",
                )}
              >
                <span className="serif-jp mr-1.5">{c.jp}</span>
                <span className="uppercase tracking-[0.18em]">{c.label}</span>
              </button>
            );
          })}
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-foreground mb-4" />
            <p className="serif-jp text-sm text-muted-foreground">読み込み中…</p>
          </div>
        )}

        {!loading && articles.length === 0 && (
          <div className="washi-card p-8 text-center">
            <p className="serif-jp text-foreground text-base mb-2">記事なし</p>
            <p className="text-xs text-muted-foreground italic">
              No articles available right now. Try again later.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {articles.map((a) => (
            <button
              key={a.id}
              onClick={() => {
                if (a.source === "regular") {
                  window.open(a.source_url, "_blank", "noopener,noreferrer");
                } else {
                  setSelected(a);
                }
              }}
              className="washi-card w-full text-left p-4 hover:translate-y-[-1px] transition-all group"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                  {formatDate(a.published_at)}
                </p>
                {a.source === "regular" && (
                  <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
                )}
              </div>
              <p
                className="japanese-text text-foreground text-base leading-snug mb-1"
                dangerouslySetInnerHTML={{ __html: a.title }}
              />
              {a.summary && (
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mt-1">
                  {a.summary}
                </p>
              )}
            </button>
          ))}
        </div>

        {!loading && articles.length > 0 && (
          <p className="text-[10px] text-center text-muted-foreground mt-6 italic tracking-wide">
            Source: NHK · Updated hourly
          </p>
        )}
      </div>
    );
  }

  // ---------- DETAIL VIEW (easy only) ----------
  return (
    <div>
      <button
        onClick={() => setSelected(null)}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-xs"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span className="serif-jp">Back to articles</span>
      </button>

      <div className="washi-card p-6 md:p-8">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
            {formatDate(selected.published_at)}
          </p>
          <button
            onClick={() => handlePlayAudio(selected)}
            className="flex items-center gap-1.5 text-xs serif-jp text-foreground hover:text-primary transition-colors"
            aria-label="Play audio"
          >
            <Volume2 className="w-4 h-4" />
            <span>聴く</span>
          </button>
        </div>

        <h2
          className="japanese-text text-foreground text-xl md:text-2xl leading-snug font-medium mb-6 pb-5 border-b border-border"
          dangerouslySetInnerHTML={{ __html: selected.title }}
        />

        {sentences.length > 0 ? (
          <div className="space-y-5">
            {sentences.map((s, i) => {
              const plain = rubyStripBase(s);
              const reading = extractRubyReading(s);
              const isSaved = savedKeys.has(plain);
              return (
                <div key={i} className="group">
                  <p
                    className="japanese-text text-foreground text-base leading-loose"
                    dangerouslySetInnerHTML={{ __html: s }}
                  />
                  <div className="flex items-center gap-3 mt-2 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => speakJapanese(plain, 0.7)}
                      className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      <Volume2 className="w-3 h-3" /> Play
                    </button>
                    <button
                      onClick={() => handleSaveWord(plain, reading)}
                      disabled={isSaved || savingWord === plain}
                      className={cn(
                        "text-[10px] uppercase tracking-[0.2em] flex items-center gap-1",
                        isSaved
                          ? "text-success"
                          : "text-muted-foreground hover:text-primary",
                      )}
                    >
                      {savingWord === plain ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : isSaved ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Plus className="w-3 h-3" />
                      )}
                      {isSaved ? "Saved" : "Add to deck"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            Body unavailable. Read on NHK below.
          </p>
        )}

        <a
          href={selected.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-2 text-xs serif-jp text-muted-foreground hover:text-foreground"
        >
          Read on NHK <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {selected.body_html && (
        <NhkComprehensionQuiz
          articleId={selected.id}
          title={selected.title}
          bodyHtml={selected.body_html}
          level={selected.level}
        />
      )}
    </div>
  );
}
