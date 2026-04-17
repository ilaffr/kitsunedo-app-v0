# Changelog

All notable changes to **Kitsune-dō (狐道)** are documented here.
Versions track the [Product Requirements Document](./docs/PRD.md) and major feature rollouts.

The format is loosely based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows a date-tagged, PRD-aligned versioning scheme.

---

## [Unreleased]

### Infrastructure
- GitHub bidirectional sync to `kitsunedo` repo.
- GitHub Actions CI workflow (`.github/workflows/ci.yml`) running lint, vitest, and Vite build on every push and PR to `main`.
- README.md with project description, tech stack, and local setup instructions.

### Added
- Public guest preview of the Kana Primer (`/lesson/kana` accessible without auth).
- "Try the kana primer free" CTA on the auth page.
- `GuestPreviewBanner` on the kana primer encouraging signup after the quiz.

---

## [2.0.0] — 2026-04-17 — *The Path Expands*

Major content + feature expansion. PRD rewritten end-to-end to reflect the
50-lesson curriculum, AI-driven storytelling, news immersion, and SRS systems.

### Added — Curriculum
- **Yōkai Journey Map** (`/journey`): sumi-e SVG world map grouping the 50
  Minna no Nihongo lessons into 5 regions (Edo, Kyōto, Kyūshū, Tōhoku,
  Hokkaidō), each guarded by a yokai boss.
- **Lessons 2–10** following Minna no Nihongo, with shared interactive
  lesson scaffolding.
- **Kana Primer** (`/lesson/kana`): hiragana + katakana introduction with
  tap-to-hear charts and a knowledge-check quiz that unlocks Lesson 1.
- **Placement Test** (`/placement-test`): JLPT-style assessment that
  unlocks lesson ranges and hides itself once cleared.

### Added — Practice
- **Practice Hub** (`/practice`): unified entry point for SRS flashcards,
  kanji writing, and mixed training.
- **SRS Flashcards** (`/flashcards`): SM-2 spaced repetition with manual
  Again/Hard/Good/Easy grading.
- **AI Flashcard Illustrations**: Gemini-generated kawaii sumi-e art for
  vocabulary cards (`generate-flashcard-image` edge function).
- **Kanji Writing Practice** (`/kanji-writing`): canvas drawing with
  KanjiVG stroke-order diagrams and self-grading.
- **Daily Practice** (`/daily-practice`): mixed training across kanji
  radicals, mnemonics, vocab recall, and grammar fill-in.

### Added — JLPT & News
- **JLPT Practice** (`/jlpt-practice`): N5–N1 across vocab, grammar,
  reading, and mixed modes; AI-generated questions cached in
  `jlpt_questions` (`generate-jlpt-questions` edge function).
- **JLPT Speedrun Tier**: time-tracked sessions award speedrun-themed
  personal badges in addition to standard pass badges.
- **NHK News Reader**: real Japanese news fetched and cached per JLPT
  level (`fetch-nhk-news` edge function), with AI-generated English
  comprehension quizzes (`generate-nhk-quiz`).
- **News Reader Streak**: tracked in `nhk_reading_log`, drives a
  dedicated badge family.

### Added — AI Storytelling
- **Daily Kitsune Tale** (dashboard + `/tales` archive): AI-generated
  3-sentence mini-story rooted in real Japanese culture/lore, using the
  user's own vocabulary, with TTS, MCQ, and a mandatory `cultural_note`
  teaching a real fact (`generate-kitsune-tale` edge function).
- **Tale Archive & Sentence Mining**: per-word "+ flashcard" buttons on
  past tales for sentence mining into the SRS deck.

### Added — Gamification
- **XP system** with weekly XP chart on the Stats page.
- **Stats page** (`/stats`) with JLPT history chart and JLPT spirit strip.
- **Personal Badges** expanded to multiple trigger families:
  `word_struggle`, `jlpt_pass` (with perfect-score and speedrun
  variants), `news_streak`. All rendered in the Bestiary alongside
  static achievements.
- **Daily Goal Card** with progress ring and fox mascot encouragement.
- **Yokai Boss Quizzes** at the end of each Journey region.

### Added — Database
- New tables: `flashcards`, `jlpt_questions`, `jlpt_sessions`,
  `kitsune_tales`, `nhk_news_cache`, `nhk_reading_log`,
  `placement_results`, `practice_sessions`.

### Added — Edge Functions
- `generate-flashcard-image`, `generate-jlpt-questions`,
  `generate-kitsune-tale`, `fetch-nhk-news`, `generate-nhk-quiz`
  (joining the existing `generate-badge`).

### Changed
- PRD rewritten to v2.0 covering the full system: design tokens, routing
  tree, 14-table schema, 6 edge functions, and cross-cutting rules.
- Navigation extended with kanji labels: 道 / 学 / 練 / 績 / 栄.
- "No animations on lesson pages" rule formalized — lesson surfaces
  remain static sumi-e.

---

## [1.0.0] — 2026-03-01 — *First Brush Stroke*

Initial PRD and MVP release.

### Added
- **Design system**: sumi-e ink-wash aesthetic on washi paper, vermillion
  accents, Noto Serif JP + Outfit + Noto Sans JP typography, hanko stamp
  badges, ink-divider separators.
- **Authentication**: email + password via Lovable Cloud, email
  verification required, `AuthContext` + Protected/Public route guards.
- **Dashboard** (`/`): hero banner, stats grid, daily goal card with
  progress ring + fox mascot, lesson list, study category cards, and
  the Spirit Bestiary panel.
- **Lesson 1 — わたしは がくせいです**: vocabulary (18 words), grammar
  (5 points), and a 6-question practice quiz with mistake logging.
- **Daily Practice**: 10-exercise mixed set across kanji radicals,
  kanji mnemonics, vocab recall, and grammar fill-in, drawn from a
  10-kanji library with absurdist mnemonics (e.g., 遅 = dead sheep on a
  road → "late").
- **Study Streak System**: `user_streaks` table + `record_study_session`
  RPC, displayed as a hanko stamp.
- **Spirit Bestiary**: 5 static yokai achievements (First Scroll,
  Iron Discipline, Word Weaver, Pattern Seeker, Demon's Resolve) with
  rarity tiers and expandable myth panels.
- **Personal Spirits — AI Badges**: 3-tier comedic badge system
  (Bronze/Silver/Gold) triggered by per-word mistake thresholds,
  generated via the `generate-badge` edge function (Gemini Flash for
  text + Gemini Pro Image for sumi-e art) and stored in
  `personal_badges` + the `badge-images` storage bucket.
- **Fox Mascot**: animated kitsune guide with contextual speech bubbles.

### Database
- `profiles`, `user_streaks`, `lesson_progress`, `user_achievements`,
  `mistake_log`, `personal_badges`.

### Edge Functions
- `generate-badge` (AI text + image pipeline with idempotency).

---

## Versioning Policy

- **Major** (`x.0.0`) — PRD rewrite or significant scope expansion.
- **Minor** (`0.x.0`) — New features that extend the PRD without
  rewriting it.
- **Patch** (`0.0.x`) — Bug fixes, copy tweaks, small UI polish.

The `[Unreleased]` section accumulates changes between tagged versions
and graduates into a new section when the PRD is next revised.
