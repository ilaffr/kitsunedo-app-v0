---
name: JLPT Practice
description: Mock JLPT exam mode at /jlpt-practice with N5–N1 level select, mixed/vocab/grammar/reading modes plus NHK News mode, AI-generated questions cached in DB
type: feature
---
- Route: /jlpt-practice (linked from /practice hub card)
- Levels: N5, N4, N3, N2, N1
- Quiz Modes: mixed (15Q split across vocab/grammar/reading), or single-section (15Q vocab/grammar/reading)
- News Mode (`mode === "news"`): renders `<NhkNewsReader level={level} />` instead of starting a quiz. N5/N4/N3 → NHK News Web Easy (inline reader with audio + per-sentence "Add to deck" sentence-mining). N2/N1 → regular NHK headlines that open NHK in a new tab (no body stored, copyright-safe).
- Quiz question source: AI-generated via edge function `generate-jlpt-questions` (google/gemini-2.5-flash, tool calling for structured output), cached in `jlpt_questions` table (shared pool, RLS allows authenticated SELECT only — INSERT only via service role inside edge function). Cache pulls up to 50 then random-shuffles; only generates the deficit.
- News source: edge function `fetch-nhk-news` pulls `news-list.json` (Easy) or `cat0.xml` RSS (regular) server-side, caches in `nhk_news_cache` table (1h TTL, public read RLS, service-role write). Easy article HTML is sanitized to keep `<ruby>/<rt>` for furigana display.
- Sessions logged in `jlpt_sessions` (per-user, RLS-protected): level, mode, total, correct, xp_earned (5 XP per correct). News mode does not create sessions.
- Reading section requires `passage_jp`; vocab/grammar must have null passage.
- 4 options per question; explanation in English shown after submit.
- Errors surfaced from edge function: 429 rate limit, 402 credits exhausted.
