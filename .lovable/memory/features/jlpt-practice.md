---
name: JLPT Practice
description: Mock JLPT exam mode at /jlpt-practice with N5–N1 level select, mixed/vocab/grammar/reading modes, AI-generated questions cached in DB
type: feature
---
- Route: /jlpt-practice (linked from /practice hub card)
- Levels: N5, N4, N3, N2, N1
- Modes: mixed (15Q split across vocab/grammar/reading), or single-section (15Q)
- Question source: AI-generated via edge function `generate-jlpt-questions` (google/gemini-2.5-flash, tool calling for structured output), cached in `jlpt_questions` table (shared pool, RLS allows authenticated SELECT only — INSERT only via service role inside edge function). Cache pulls up to 50 then random-shuffles; only generates the deficit.
- Sessions logged in `jlpt_sessions` (per-user, RLS-protected): level, mode, total, correct, xp_earned (5 XP per correct).
- Reading section requires `passage_jp`; vocab/grammar must have null passage.
- 4 options per question; explanation in English shown after submit.
- Errors surfaced from edge function: 429 rate limit, 402 credits exhausted.
