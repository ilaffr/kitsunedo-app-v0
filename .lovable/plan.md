
The user wants to embed NHK news per JLPT level into the practice section. Let me think about this.

NHK has "News Web Easy" (NEWS WEB EASY / やさしい日本語) which is graded news for learners — perfect for N5/N4. Regular NHK News is appropriate for N2/N1, with N3 sitting in between.

**Sources available:**
- NHK News Web Easy: https://www3.nhk.or.jp/news/easy/ — has furigana, simple vocab, audio. Best for N5–N4.
- NHK News Web (regular): https://www3.nhk.or.jp/news/ — native-level, best for N2–N1.

**Embedding constraints:** NHK pages set `X-Frame-Options: SAMEORIGIN`, so a direct `<iframe>` of nhk.or.jp will be blocked by the browser. We cannot iframe them.

**Workable approach:** Fetch NHK's RSS feeds / News Web Easy JSON index server-side via an edge function, cache, then render natively in our sumi-e UI. This also lets us add per-word click-to-flashcard (sentence mining), TTS playback, and a comprehension question.

NHK News Web Easy exposes a public JSON list: `https://www3.nhk.or.jp/news/easy/news-list.json` and per-article HTML at `https://www3.nhk.or.jp/news/easy/{news_id}/{news_id}.html` plus audio at `.../{news_id}.mp3`. Regular NHK has RSS at `https://www3.nhk.or.jp/rss/news/cat0.xml` (titles + links only — full body needs scraping).

Plan: simplest, legal-safe path = link out + show preview cards (title, date, summary). For Easy News we can also render the cleaned HTML inline since it's designed for learners. Per-level mapping: N5/N4 → Easy News, N3 → Easy News + selected regular headlines, N2/N1 → regular NHK headlines (link out, no full body to avoid copyright). Cache fetched lists in DB for 1 hour.

I'll ask one clarifying question about copyright comfort level, then present a tight plan.

---

# Plan: NHK News Per JLPT Level

## What we'll build
A new "NHK News" tab on `/jlpt-practice` (and a card on `/practice`) that surfaces real Japanese news matched to the selected JLPT level.

## Per-level mapping
| Level | Source | Render |
|---|---|---|
| N5, N4 | NHK News Web Easy (graded, with furigana + audio) | Inline reader with TTS, tap-word → flashcard |
| N3 | News Web Easy + selected short regular headlines | Inline reader |
| N2, N1 | NHK News Web (native level) | Headline + 2-line summary card → "Read on NHK" link out |

## How it works
1. **Edge function `fetch-nhk-news`** runs server-side:
   - Pulls `news-list.json` from NHK Easy + RSS `cat0.xml` from regular NHK.
   - Caches results in a new `nhk_news_cache` table (1-hour TTL) so we don't hammer NHK on every visit.
   - Returns 10 articles tagged with a level.
2. **Frontend reader** (`NhkNewsReader.tsx`):
   - Sumi-e washi-card list of articles (date, title, mini-summary).
   - Click an Easy article → opens an in-app reader: title, body (with furigana ruby tags preserved), play-audio button (NHK mp3 or our Web Speech TTS fallback), and a "+ flashcard" on each word (reusing the sentence-mining pattern from `/tales`).
   - For N2/N1: card opens the article on NHK in a new tab (avoids copyright/iframe issues).
3. **DB table `nhk_news_cache`**: `news_id, level, title, summary, body_html, audio_url, published_at, fetched_at`. Public read RLS (no user data), service-role write.

## Why not iframe?
NHK sends `X-Frame-Options: SAMEORIGIN`, so embedding nhk.or.jp directly is blocked by browsers. We fetch + render server-side instead.

## Files
- **New**: `supabase/functions/fetch-nhk-news/index.ts`, `src/components/nhk-news-reader.tsx`, migration for `nhk_news_cache`.
- **Edited**: `src/pages/JlptPractice.tsx` (add "News" mode tab), `.lovable/memory/features/jlpt-practice.md`.

## Out of scope (for this round)
- Auto-generated comprehension questions on the news (can be a follow-up using the same Gemini setup).
- Storing full body text for regular NHK (link-out only — respects copyright).
