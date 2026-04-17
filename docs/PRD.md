# 狐道 Kitsune-dō — Product Requirements Document

**Product Name:** Kitsune-dō (狐道 — Path of the Fox)
**Version:** 2.0
**Last Updated:** 2026-04-17
**Stack:** React 18 · Vite 5 · TypeScript · Tailwind CSS · shadcn/ui · React Router · Lovable Cloud (Supabase Auth/Postgres/Edge Functions/Storage) · Lovable AI Gateway (Gemini 2.5 Flash · 2.5 Pro · 3 Image Preview) · Vitest

---

## 1. Product Vision

A Japanese language learning web app with a striking **sumi-e (墨絵) ink brush aesthetic** inspired by Ghost of Yōtei. The app gamifies learning through yōkai spirits, myth-inspired achievements, AI-generated personal badges, AI-generated daily mini-stories, and a 50-lesson journey map across five legendary regions of Japan. It teaches vocabulary, grammar, reading and kanji through humor-driven radical mnemonics (e.g. 遅 = dead sheep on a road → "late") and culturally rooted content.

**Tagline:** *Let the kitsune spirit guide your brush through the way of Japanese.*

---

## 2. Design System

### 2.1 Visual Identity

| Element | Specification |
|---------|---------------|
| **Aesthetic** | Sumi-e ink wash calligraphy on aged washi paper — "Ghost of Yōtei" cinematic restraint |
| **Light Theme** | Warm rice paper (#F5F2ED), ink black foreground, vermillion red (#C52A1A) accents |
| **Dark Theme** | Deep ink paper (#171311), warm off-white text, brighter vermillion (#D94040) |
| **Typography** | Noto Serif JP (headings/brush), Outfit (body), Noto Sans JP (Japanese text) |
| **Shadows** | Ink-style: `2px 2px 0 ink`, vermillion glow: `0 4px 16px vermillion/0.3` |
| **Card Style** | `card-paper` / `washi-card` with SVG noise texture overlay simulating washi |
| **Animations** | `brush-in`, `fade-up`, `stamp` (hanko spring), `float`. **Never on lesson pages** — they remain static sumi-e. |

### 2.2 Design Tokens (`src/index.css`)

```
Colors:    --primary (vermillion), --success (bamboo green), --warning (autumn gold)
           --accent (deep ink), --muted (paper tone), --destructive
Gradients: --gradient-ink, --gradient-vermillion, --gradient-paper, --gradient-wash
Shadows:   --shadow-sm/md/lg, --shadow-ink, --shadow-vermillion
```

All colors are HSL. Components MUST use semantic tokens — never hardcoded hex/Tailwind palette colors.

### 2.3 Component Classes

| Class | Purpose |
|-------|---------|
| `.card-paper` / `.washi-card` | Washi-textured container with noise overlay |
| `.card-interactive` | Hover-lift card with vermillion border glow |
| `.btn-vermillion` | Primary CTA — vermillion gradient + glow on hover |
| `.btn-ink` | Secondary CTA — ink black gradient |
| `.hanko-badge` | Rotated stamp-style badge with border |
| `.ink-divider` | Gradient brush-stroke horizontal rule |
| `.brush-underline` | Skewed vermillion underline |
| `.ginkgo-seal` | Vermillion circular kanji seal accent |
| `.kanji-watermark` | Faint oversized kanji backdrop |
| `.serif-jp` / `.japanese-text` | Font utilities for JP text |

### 2.4 Design Rule

> Every new component should feel painted with a brush on rice paper. Use `card-paper` for containers, `serif-jp` for headers, `ink-divider` for separators, vermillion (`text-primary`) for accents. Avoid `rounded-*` larger than `rounded-sm`. Prefer `border-2` over `border`. Use the hanko stamp motif for badges and status indicators. **Never animate lesson page content.**

---

## 3. Architecture

### 3.1 Routing

| Route | Page | Auth |
|-------|------|------|
| `/auth` | Sign In / Sign Up + "Try kana primer free" CTA | Public only |
| `/reset-password` | Password recovery form | Public |
| `/lesson/kana` | Kana Primer (Hiragana + Katakana + quiz) | **Public** (guest-friendly) |
| `/` | Dashboard (Index) | Protected |
| `/lessons` | Lesson list (Minna no Nihongo 1–50) | Protected |
| `/lesson/1` … `/lesson/10` | Individual lessons (interactive sections) | Protected |
| `/journey` | Yōkai Journey Map (50 lessons across 5 regions) | Protected |
| `/practice` | Practice Hub (SRS · kanji writing · mixed training) | Protected |
| `/daily-practice` | Mixed daily exercise set | Protected |
| `/flashcards` | SRS flashcard reviews (SM-2) | Protected |
| `/kanji-writing` | Stroke-order canvas practice | Protected |
| `/jlpt-practice` | JLPT N5–N1 question generator + NHK news reader | Protected |
| `/placement-test` | Initial JLPT-style placement assessment | Protected |
| `/tales` | Archive of past Daily Kitsune Tales (filterable, sentence-mining) | Protected |
| `/bestiary` | Spirit Bestiary + personal AI badges gallery | Protected |
| `/stats` | XP, streaks, weekly chart, JLPT history | Protected |
| `*` | 404 Not Found | Public |

### 3.2 Authentication

- Email + password via Lovable Cloud Auth
- Email verification required (no auto-confirm)
- Password recovery via `/reset-password` (handles `type=recovery` hash)
- `AuthContext` provides `user`, `session`, `loading`, `signOut`
- `ProtectedRoute` / `PublicRoute` wrappers; `/lesson/kana` is intentionally outside both so guests can preview
- Auth page UI: massive ceremonial kanji (入門/入学/再開), washi card with mode toggle, vermillion ginkgo seal, kitsune watermark, prominent "試す — Try the kana primer free" CTA below the form

### 3.3 Database Schema (public)

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `profiles` | User display info | `id` (FK auth), `display_name`, `created_at` |
| `user_streaks` | Daily study streaks | `user_id`, `current_streak`, `longest_streak`, `last_study_date` |
| `lesson_progress` | Per-lesson completion | `user_id`, `lesson_id`, `section`, `completed`, `best_score` |
| `practice_sessions` | XP-earning practice runs | `user_id`, `practice_type`, `score_perfect/close/missed`, `total_items`, `xp_earned` |
| `mistake_log` | Per-word mistake tracking | `user_id`, `lesson_id`, `word`, `mistake_count` |
| `flashcards` | SRS vocabulary cards | `user_id`, `lesson_id`, `japanese`, `reading`, `meaning`, `image_url`, `ease_factor`, `interval_days`, `repetitions`, `next_review_at`, `last_reviewed_at` |
| `placement_results` | Placement test outcomes | `user_id`, `level`, `score`, `vocab/grammar/reading/listening_score`, `unlocked_up_to` |
| `jlpt_questions` | Cached AI-generated JLPT items | `level`, `section`, `question_jp`, `passage_jp`, `options`, `correct_index`, `explanation` |
| `jlpt_sessions` | JLPT practice runs | `user_id`, `level`, `mode`, `correct_count`, `total_questions`, `xp_earned` |
| `kitsune_tales` | Daily AI mini-stories | `user_id`, `tale_date`, `theme`, `title`, `story_jp`, `story_furigana`, `translation`, `vocab_used`, `question`, `options`, `correct_index`, `cultural_note`, `completed`, `xp_awarded` |
| `nhk_news_cache` | Cached NHK articles by JLPT level | `news_id`, `level`, `category`, `source`, `title`, `summary`, `body_html`, `audio_url`, `source_url`, `fetched_at` |
| `nhk_reading_log` | News-reading streak data | `user_id`, `level`, `read_date` |
| `user_achievements` | Static achievement unlocks | `user_id`, `achievement_id`, `unlocked_at` |
| `personal_badges` | AI-generated spirit badges | `user_id`, `trigger_type`, `trigger_detail`, `tier`, `title`, `title_jp`, `description`, `myth`, `image_url`, `rarity` |

**Storage Buckets:** `badge-images` (sumi-e badge PNGs), `flashcard-images` (kawaii vocabulary illustrations).

**RPC:** `record_study_session(p_user_id)` — updates streak data atomically.

**RLS:** every user-owned table is restricted to `auth.uid() = user_id`. Read-only caches (`jlpt_questions`, `nhk_news_cache`) are public-read.

### 3.4 Edge Functions

| Function | Purpose |
|----------|---------|
| `generate-badge` | AI personal badge: text (Gemini 2.5 Flash) + sumi-e image (Gemini 3 Pro Image Preview) → Storage → DB |
| `generate-flashcard-image` | Kawaii illustration for an SRS flashcard (Gemini 3 Pro Image Preview) |
| `generate-jlpt-questions` | Generates JLPT N5–N1 questions on demand, cached in `jlpt_questions` |
| `generate-kitsune-tale` | Daily 3-sentence mini-story rooted in real Japanese culture/lore + comprehension MCQ + cultural note |
| `generate-nhk-quiz` | Comprehension MCQ for an NHK article |
| `fetch-nhk-news` | Server-side fetch + cache of NHK News Web Easy / NHK News by JLPT level |

All AI calls go through the **Lovable AI Gateway** — no user-supplied API keys. Generation pipelines are idempotent (DB check before generating; unique constraints + duplicate-fetch fallback for race conditions).

### 3.5 Tooling & CI

- **Repo:** GitHub `kitsunedo` (bidirectional sync with Lovable)
- **CI:** `.github/workflows/ci.yml` — Node 20, runs `npm ci → lint → vitest --run → vite build` on push/PR to `main`
- **Tests:** Vitest + jsdom (`src/test/`)
- **Hosting:** Lovable preview + Publish

---

## 4. Features

### 4.1 Dashboard (`/`)

The main hub after login. Hero banner, daily goal card with XP ring + fox mascot, weekly XP chart, streak + lesson + spirit stats, daily kitsune tale teaser, NHK headline teaser, quick review counter, recent spirits preview, and shortcuts to Lessons / Journey / Practice / JLPT.

### 4.2 Kana Primer (`/lesson/kana` — **public**)

- Three phases: Overview → Hiragana table → Katakana table → Knowledge check (quiz)
- Tap any kana to hear pronunciation (Web Speech API) and reveal mnemonic
- Quiz: short MCQ; **80% pass threshold** unlocks Lesson 1
- **Guest mode:** unauthenticated visitors see a "You're trying Kitsune-dō as a guest" banner with a sign-up link; progress is not persisted; result screen offers "Sign up to continue →" instead of "Start Lesson 1"
- Auth page links here via "試す — Try the kana primer free / No signup required"

### 4.3 Lessons 1–10 (Minna no Nihongo)

- 50-lesson curriculum planned; lessons 1–10 implemented with full vocab + grammar + practice
- Each lesson: Vocabulary list (audio), Grammar points with patterns/tips/examples, Practice MCQs
- Wrong answers feed `mistake_log`; thresholds (5 / 10 / 15) trigger `generate-badge`
- Achievements: `first_lesson`, `perfect_practice`, `vocabulary_master`, `all_grammar`, `streak_3`
- **No animations** — lesson pages are intentionally static sumi-e
- Lessons 11–50 stubbed in `minna-lessons.ts` for the Journey map

### 4.4 Yōkai Journey Map (`/journey`)

Sumi-e SVG map grouping the 50 Minna no Nihongo lessons into **5 regions**, each ruled by a yōkai boss:

| Region | Lessons | Boss |
|--------|---------|------|
| Edo (江戸) | 1–10 | Kitsune |
| Kyōto (京都) | 11–20 | Tanuki |
| Kyūshū (九州) | 21–30 | Tengu |
| Tōhoku (東北) | 31–40 | Oni |
| Hokkaidō (北海道) | 41–50 | Ryūjin |

Completing a region's lessons triggers a boss quiz. Map is purely static sumi-e — no parallax, no animation.

### 4.5 Practice Hub (`/practice`)

Unified hub linking to:
- **SRS Flashcards** (`/flashcards`) — SM-2 spaced repetition, manual grading (Again/Hard/Good/Easy), Gemini-generated kawaii illustrations per card
- **Kanji Writing** (`/kanji-writing`) — interactive canvas with KanjiVG stroke-order overlay, self-grading
- **Mixed Daily Training** (`/daily-practice`) — shuffled set of 10 exercises across kanji radicals, kanji mnemonics, vocab recall, grammar fill-in

### 4.6 JLPT Practice (`/jlpt-practice`)

- Tabs for N5 → N1 levels and sections (vocab / grammar / reading / listening)
- Questions generated on demand by `generate-jlpt-questions` and cached in `jlpt_questions`
- "Speedrun" tier mode for time-pressure practice
- JLPT history chart on `/stats`
- Embedded **NHK News Reader**: `fetch-nhk-news` caches articles per level; N5/N4 use NHK News Web Easy inline; N3–N1 link out to native NHK; per-article AI comprehension quiz via `generate-nhk-quiz`; `nhk_reading_log` powers a reading streak

### 4.7 Placement Test (`/placement-test`)

- One-time JLPT-style assessment across vocab / grammar / reading / listening
- Result writes to `placement_results.unlocked_up_to`, unlocking lesson content
- Once completed, the dashboard prompt is hidden

### 4.8 Daily Kitsune Tale

A daily AI-generated 3-sentence mini-story:

- Generated by `generate-kitsune-tale` using the user's recent vocab
- **Must be rooted in real Japanese culture / folklore / history**, with a `cultural_note` teaching the actual fact
- TTS playback at slower-than-default rate; furigana toggle; comprehension MCQ for XP
- Dashboard widget shows today's tale; `/tales` archive lists past tales filterable by theme
- Tale archive supports **sentence mining** — per-word "+ flashcard" buttons add vocab to SRS

### 4.9 Spirit Bestiary (`/bestiary`)

Static yōkai-themed achievement collection (5 spirits) plus the AI personal badges gallery. Locked spirits show `???` with grayscale + opacity-50.

| ID | Spirit | Trigger | Rarity |
|----|--------|---------|--------|
| `first_lesson` | First Scroll · 最初の巻物 | Complete any lesson | Common |
| `perfect_practice` | Iron Discipline · 鉄の修行 | 6/6 on practice | Rare |
| `vocabulary_master` | Word Weaver · 言葉の織り手 | View all Lesson 1 vocab | Uncommon |
| `all_grammar` | Pattern Seeker · 型の探求者 | Read all grammar points | Uncommon |
| `streak_3` | Demon's Resolve · 鬼の覚悟 | 3-day study streak | Legendary |

### 4.10 Personal AI Badges

Unique yōkai badges generated by struggling with specific words. Three escalating tiers:

| Tier | Name | Threshold | Rarity | Tone |
|------|------|-----------|--------|------|
| 1 | Bronze Stumble | 5 mistakes | Uncommon | Gentle teasing |
| 2 | Silver Spiral | 10 mistakes | Rare | Comedic, spirits cheering |
| 3 | Golden Obsession | 15 mistakes | Legendary | Absurdist legend |

Pipeline: text (Gemini 2.5 Flash) → image (Gemini 3 Pro Image Preview) → upload to `badge-images` (Japanese chars in filenames must be sanitized/encoded) → insert into `personal_badges` (unique on `user_id, trigger_type, trigger_detail, tier`).

### 4.11 SRS Flashcards (`/flashcards`)

- SM-2 algorithm (`ease_factor`, `interval_days`, `repetitions`, `next_review_at`)
- Manual grading: Again (0d) / Hard (×0.5) / Good (standard) / Easy (×1.3)
- Cards seeded from completed lessons; per-card kawaii illustration via `generate-flashcard-image`
- Sentence mining from Daily Kitsune Tales feeds new cards

### 4.12 Stats (`/stats`)

Total XP, sessions, completed lessons, current/longest streak, weekly XP bar chart, JLPT performance history chart.

### 4.13 Fox Mascot (Kitsune)

Ink-painted fox guide with speech bubbles. Floats gently (`animate-float`). Provides encouragement messages on dashboard, daily goal card, and primer/practice hubs. **The mascot is the in-app voice of the brand.**

---

## 5. Cross-Cutting Rules (Memory)

- **Style:** Slick sumi-e, rice paper bg, Noto Serif JP + Outfit, ink black + vermillion
- **Layout:** Pill-nav (mobile), sidebar (desktop) — kanji nav labels: 道 / 学 / 練 / 績 / 栄
- **Never** animate lesson page content (must remain static sumi-e)
- **Sanitize / encode** Japanese characters in storage filenames
- **Kitsune mascot** acts as the guide via speech bubbles
- **Daily Kitsune Tales** must always be rooted in real Japanese culture / lore / history and include a `cultural_note`
- All authenticated DB writes require `user.id`; RLS enforces ownership

---

## 6. Planned / Backlog

- Lessons 11–50 full content (currently stubbed for Journey map)
- Boss quizzes per region (Kitsune / Tanuki / Tengu / Oni / Ryūjin)
- Additional badge categories (Speed Demon, Night Owl, Comeback Kid, Perfectionist Streak, Section Hopper, Retry Champion)
- Public preview of Yōkai Journey for unauthenticated visitors
- Migrate guest kana-primer score into DB on signup
- Auto-grading kanji stroke accuracy
- Quick Review card powered by SRS due-counts

---

## 7. File Map (high level)

| Path | Purpose |
|------|---------|
| `src/App.tsx` | Routing, auth wrappers, providers |
| `src/main.tsx` | Entry point |
| `src/index.css` | Design tokens + sumi-e component classes |
| `tailwind.config.ts` | Extended theme (fonts, colors, shadows, animations) |
| `src/context/AuthContext.tsx` | Auth state provider |
| `src/integrations/supabase/client.ts` | Auto-generated Supabase client (do not edit) |
| `src/pages/` | All route pages (Index, Auth, Lessons, Lesson1–10, Journey, Practice, Flashcards, KanjiWritingPractice, JlptPractice, PlacementTest, Tales, Bestiary, Stats, KanaPrimer, ResetPassword, NotFound) |
| `src/data/` | Lesson content, kana data, journey regions, placement test, daily-practice pool, minna-lessons |
| `src/components/` | Sumi-e UI building blocks (header, navigation, fox-mascot, lesson-card, hero-banner, daily-goal-card, daily-kitsune-tale, nhk-news-reader, jlpt-spirit-strip, achievements-panel, personal-badges-section, kanji-canvas, stroke-order-diagram, furigana-text, etc.) |
| `src/components/ui/` | shadcn/ui primitives |
| `src/hooks/` | `use-user-data`, `use-flashcards`, `use-personal-badges`, `use-achievement`, `use-mobile`, `use-toast` |
| `src/lib/` | `achievements`, `exercise-engine`, `japanese-tts`, `region-lessons`, `utils` |
| `supabase/functions/` | Edge functions: `generate-badge`, `generate-flashcard-image`, `generate-jlpt-questions`, `generate-kitsune-tale`, `generate-nhk-quiz`, `fetch-nhk-news` |
| `.github/workflows/ci.yml` | CI: lint + test + build on push/PR to `main` |
| `.lovable/memory/` | Persistent project memory (style, features, curriculum, tech) |

---

## 8. Assets

| Asset | File | Usage |
|-------|------|-------|
| Fox mascot | `src/assets/fox-mascot.png` | FoxMascot component |
| Fox brush | `src/assets/fox-brush.png` | Header logo, Auth page |
| Hero brush | `src/assets/hero-brush.jpg` | Auth backdrop, hero banner |
| Hero landscape | `src/assets/hero-landscape.jpg` | Alternative hero |
| Kitsune achievement | `src/assets/achievement-kitsune.png` | First Scroll spirit |
| Tanuki achievement | `src/assets/achievement-tanuki.png` | Word Weaver spirit |
| Tengu achievement | `src/assets/achievement-tengu.png` | Iron Discipline spirit |
| Ryūjin achievement | `src/assets/achievement-ryujin.png` | Pattern Seeker spirit |
| Oni achievement | `src/assets/achievement-oni.png` | Demon's Resolve spirit |
