import { Fragment } from "react";

/**
 * Renders Japanese text with furigana using HTML <ruby> tags.
 *
 * Supports two annotation formats produced by our AI / legacy data:
 *   1. Curly-brace (preferred):  漢字{かんじ}
 *   2. Parentheses (legacy):     漢字(かんじ)
 *
 * If `showFurigana` is false, the readings are hidden but base text remains.
 */
interface FuriganaTextProps {
  /** Annotated source string, e.g. "狐{きつね}は森{もり}を歩{ある}いた。" */
  text: string;
  /** When false, only the base kanji/kana is shown (no ruby). */
  showFurigana?: boolean;
  className?: string;
}

// Match a run of CJK/kanji chars followed by a reading in {…} or (…).
// Hiragana-only readings only — avoid matching English parens accidentally.
const TOKEN_RE = /([\u3400-\u9FFF\u3005々]+)[\{\(]([\u3040-\u309Fー]+)[\}\)]/g;

export function FuriganaText({ text, showFurigana = true, className }: FuriganaTextProps) {
  if (!text) return null;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  // Reset regex state for each render
  TOKEN_RE.lastIndex = 0;

  while ((match = TOKEN_RE.exec(text)) !== null) {
    const [full, base, reading] = match;
    if (match.index > lastIndex) {
      parts.push(<Fragment key={`t-${key++}`}>{text.slice(lastIndex, match.index)}</Fragment>);
    }
    parts.push(
      <ruby key={`r-${key++}`}>
        {base}
        <rt className={showFurigana ? "text-[0.55em] text-muted-foreground font-normal" : "hidden"}>
          {reading}
        </rt>
      </ruby>
    );
    lastIndex = match.index + full.length;
  }

  if (lastIndex < text.length) {
    parts.push(<Fragment key={`t-${key++}`}>{text.slice(lastIndex)}</Fragment>);
  }

  return <span className={className}>{parts}</span>;
}
