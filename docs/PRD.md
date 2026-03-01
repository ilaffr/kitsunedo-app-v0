# 狐道 Kitsune-dō — Product Requirements Document

**Product Name:** Kitsune-dō (狐道 — Path of the Fox)
**Version:** 1.0
**Last Updated:** 2026-03-01
**Stack:** React 18 · Vite · Tailwind CSS · TypeScript · Lovable Cloud (Supabase)

---

## 1. Product Vision

A Japanese language learning web app with a striking **sumi-e (墨絵) ink brush aesthetic** inspired by Ghost of Yotei. The app gamifies learning through yokai spirits, myth-inspired achievements, and AI-generated personalized badges. It teaches vocabulary, grammar, and kanji using humor-driven radical mnemonics (e.g., 遅 = dead sheep on a road → "late").

**Tagline:** *Let the kitsune spirit guide your brush through the way of Japanese.*

---

## 2. Design System

### 2.1 Visual Identity

| Element | Specification |
|---------|---------------|
| **Aesthetic** | Sumi-e ink wash calligraphy on aged washi paper |
| **Light Theme** | Warm rice paper (#F5F2ED), ink black foreground, vermillion red (#C52A1A) accents |
| **Dark Theme** | Deep ink paper (#171311), warm off-white text, brighter vermillion (#D94040) |
| **Typography** | Noto Serif JP (headings/brush), Outfit (body), Noto Sans JP (Japanese text) |
| **Shadows** | Ink-style: `2px 2px 0 ink`, vermillion glow: `0 4px 16px vermillion/0.3` |
| **Card Style** | "card-paper" with SVG noise texture overlay simulating washi |
| **Animations** | `brush-in` (slide+blur), `fade-up`, `stamp` (hanko seal spring), `float` |

### 2.2 Design Tokens (index.css)

```
Colors:         --primary (vermillion), --success (bamboo green), --warning (autumn gold)
                --accent (deep ink), --muted (paper tone)
Gradients:      --gradient-ink, --gradient-vermillion, --gradient-paper, --gradient-wash
Shadows:        --shadow-sm/md/lg, --shadow-ink, --shadow-vermillion
```

### 2.3 Component Classes

| Class | Purpose |
|-------|---------|
| `.card-paper` | Washi-textured card with noise overlay |
| `.card-interactive` | Hover-lift card with vermillion border glow |
| `.btn-vermillion` | Primary CTA — vermillion gradient + glow on hover |
| `.btn-ink` | Secondary CTA — ink black gradient |
| `.hanko-badge` | Rotated stamp-style badge with border |
| `.ink-divider` | Gradient brush-stroke horizontal rule |
| `.brush-underline` | Skewed vermillion underline |
| `.serif-jp` / `.japanese-text` | Font utilities for JP text |

### 2.4 Design Prompts for New Components

> **General rule:** Every new component should feel like it was painted with a brush on rice paper. Use `card-paper` for containers, `serif-jp` for headers, `ink-divider` for separators, and vermillion (`text-primary`) for accents. Avoid rounded corners larger than `rounded-sm`. Prefer `border-2` over `border`. Use the hanko stamp motif for badges and status indicators.

---

## 3. Architecture

### 3.1 Routing

| Route | Page | Auth |
|-------|------|------|
| `/auth` | Sign In / Sign Up | Public only |
| `/` | Dashboard (Index) | Protected |
| `/lesson/1` | Lesson 1 — Self Introduction | Protected |
| `/daily-practice` | Mixed Daily Practice | Protected |
| `*` | 404 Not Found | Public |

### 3.2 Authentication

- Email + password via Lovable Cloud Auth
- Email verification required (no auto-confirm)
- `AuthContext` provides `user`, `session`, `loading`, `signOut`
- `ProtectedRoute` / `PublicRoute` wrappers for route guarding
- Auth page UI: kitsune fox logo, ink-wash card, mode toggle (入門 Sign In / 入学 Sign Up)

### 3.3 Database Schema

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `profiles` | User display info | `id` (uuid, FK auth), `display_name`, `created_at` |
| `user_streaks` | Daily study streaks | `user_id`, `current_streak`, `longest_streak`, `last_study_date` |
| `lesson_progress` | Per-lesson completion | `user_id`, `lesson_id`, `completed`, `best_score`, `section` |
| `user_achievements` | Static achievement unlocks | `user_id`, `achievement_id`, `unlocked_at` |
| `mistake_log` | Per-word mistake tracking | `user_id`, `lesson_id`, `word`, `mistake_count` |
| `personal_badges` | AI-generated spirit badges | `user_id`, `trigger_type`, `trigger_detail`, `tier`, `title`, `title_jp`, `description`, `myth`, `image_url`, `rarity` |

**Storage Bucket:** `badge-images` — AI-generated sumi-e badge PNGs.

**RPC:** `record_study_session(p_user_id)` — Updates streak data.

### 3.4 Edge Functions

| Function | Purpose |
|----------|---------|
| `generate-badge` | AI badge generation (text via Gemini Flash, image via Gemini Pro Image) |

---

## 4. Features

---

### Feature 4.1: Dashboard (Index Page)

**Description:** The main hub after login. Shows hero banner, stats, daily goal, lesson list, study categories, and achievement bestiary.

**Design Prompt:**
> Full-width ink wash landscape hero image with gradient overlays for readability. Stats in a 2×2/4-column grid using `card-paper`. Each stat has a lucide icon, a value in Japanese style (e.g., "7日"), and a sublabel. The daily goal card features a `ProgressRing` with vermillion stroke, fox mascot with speech bubble, and a `btn-vermillion` CTA. Lesson cards show status as colored dots (completed=green, in-progress=vermillion, locked=grey). Study categories use `card-interactive` with kanji labels and progress bars.

**Components:**
- `HeroBanner` — Hero image with 狐道 title, brush-underline, hanko stamp
- `StatsCard` — Icon + value + sublabel, variants: vermillion/ink
- `DailyGoalCard` — Progress ring, streak hanko badge, fox mascot, practice CTA
- `QuickReviewCard` — Items-to-review counter
- `LessonCard` — Title, status dot, XP reward, difficulty badge
- `StudyCategoryCard` — Category with progress bar, locked state
- `AchievementsPanel` — Spirit Bestiary (see Feature 4.5)
- `Navigation` — Bottom bar (mobile) / sidebar (desktop), kanji labels: 道/学/練/績/栄

**Data (currently static):**
- 5 study categories: Hiragana (85%), Katakana (60%), Kanji (25%), Vocabulary (40%), Grammar (15% locked)
- 5 recent lessons with status progression
- Stats: streak (live from DB), spirit points (2,450 static), scrolls (45), training time (24時)

---

### Feature 4.2: Lesson 1 — わたしは がくせいです

**Description:** Minna no Nihongo Lesson 1 covering self-introduction patterns. Three tabbed sections: Vocabulary, Grammar, Practice.

**Design Prompt:**
> Top: back-to-dōjō link, lesson card with 第一課 hanko badge and ink divider. Three tab buttons with kanji labels (語彙/文法/練習) that invert on active state (dark bg, light text). Vocabulary section: numbered list with hover highlight. Grammar section: each point in a `card-paper` with hanko-numbered header, code block for pattern rule, explanation paragraph, tip callout (vermillion ✦ icon + primary bg), and example sentences in `bg-muted/30` blocks. Practice section: multiple-choice questions with `border-2` option buttons that fill on selection.

**Content:**
- **Vocabulary (18 words):** わたし, あなた, あの ひと, せんせい, がくせい, かいしゃいん, いしゃ, エンジニア, だいがく, びょういん, でんき, にほん, アメリカ, ～さい, はい, いいえ, はじめまして, どうぞ よろしく
- **Grammar (5 points):** ～は～です, ～は～じゃ ありません, ～は～ですか, ～も, Noun の Noun
- **Practice (6 questions):** Particle fill-in, negative form, も usage, question formation, の usage, はじめまして meaning

**Behavior:**
- Answers tracked per question; submit reveals results with ✓/✗
- Wrong answers logged to `mistake_log` via `usePersonalBadges.trackMistake()`
- After submit: checks mistake thresholds (5/10/15) → triggers `generate-badge` edge function
- Achievements: `first_lesson` (on submit), `perfect_practice` (6/6), `vocabulary_master` (view vocab tab), `all_grammar` (view grammar tab)
- Records study session for streak, saves progress to DB

---

### Feature 4.3: Daily Practice — Mixed Training

**Description:** A shuffled set of 10 exercises mixing kanji radicals, kanji mnemonics, vocabulary recall, and grammar fill-in.

**Design Prompt:**
> Header card with 修行 hanko badge. Progress bar showing answered/total. Single exercise card shown at a time with `animate-fade-up` transition. Each exercise type has a colored badge label (Kanji Radicals=vermillion PenTool, Kanji Story=accent Sparkles, Vocabulary=green BookOpen, Grammar=vermillion MessageSquare). Kanji exercises show large kanji character (text-5xl) with radical breakdown chips (`bg-muted/50` or `bg-primary/5`). Options in 2-column grid. Navigation: Previous/Next buttons + quick-jump dots at bottom. Results screen: score card, then each question reviewed with ✓/✗, mnemonic tips shown for kanji.

**Exercise Types:**

| Type | Count in Pool | Description |
|------|---------------|-------------|
| `kanji_radical` | 4 | Given kanji + meaning, pick the correct radical breakdown |
| `kanji_mnemonic` | 3 | Given kanji + radicals, pick the correct funny story |
| `vocab_recall` | 3 | Given Japanese word, pick the English meaning |
| `grammar_fill` | 3 | Fill in the correct particle |

**Kanji Library (10 entries):**

| Kanji | Reading | Meaning | Radicals | Mnemonic |
|-------|---------|---------|----------|----------|
| 遅 | おそい | late/slow | road + corpse + sheep | Dead sheep on the road — you're LATE! |
| 休 | やすむ | to rest | person + tree | Person leaning on a tree — taking a REST |
| 森 | もり | forest | tree + tree + tree | Three trees = a FOREST party! |
| 明 | あかるい | bright | sun + moon | Sun AND moon — BRIGHT 24/7! |
| 男 | おとこ | man | rice field + power | Power in the rice field = being a MAN |
| 好 | すき | to like | woman + child | Woman holding child = pure LOVE |
| 岩 | いわ | rock | mountain + stone | Stone on a mountain = dramatic ROCK |
| 困 | こまる | troubled | enclosure + tree | Tree stuck in a box — TROUBLED! |
| 炎 | ほのお | flame | fire + fire | Fire on fire = BLAZE! |
| 雷 | かみなり | thunder | rain + rice field | Rain hammering field = THUNDER! |

**Behavior:**
- `getDailyExercises(10)` shuffles and picks from the pool
- Navigate between exercises; submit only when all answered
- Results screen shows score tier messages: 完璧 / 素晴らしい / もう少し / 頑張って
- "もう一度 — New Set" reloads for a fresh shuffle

---

### Feature 4.4: Study Streak System

**Description:** Tracks consecutive study days with a database-backed streak counter.

**Design Prompt:**
> Streak displayed as a hanko badge stamp (`hanko-badge animate-stamp`) showing `{n}日`. Shown on dashboard StatsCard (Flame icon, vermillion variant) and in DailyGoalCard header.

**Behavior:**
- `useStreak()` hook: fetches from `user_streaks`, provides `recordStudy()`
- `recordStudy()` calls `record_study_session` RPC which updates current/longest streak
- Streak triggers `streak_3` achievement at 3+ days

---

### Feature 4.5: Spirit Bestiary — Static Achievements

**Description:** A collection of 5 yokai spirits unlocked through learning milestones.

**Design Prompt:**
> Section header with vermillion accent bar. Progress bar showing unlocked/total. Achievement cards: `card-paper border-2` with rarity-colored borders (common=border, uncommon=green, rare=vermillion, legendary=gold). Each card shows: 64×64 sumi-e illustration, title (serif-jp), Japanese subtitle, description, rarity pill badge, lock status. Click to expand myth panel: larger image (112×112), italic myth quote, source attribution (e.g., "狐の伝説 — Fox Legends of Edo"). Locked cards are `opacity-50 grayscale` with "???" myth placeholder.

**Achievements:**

| ID | Spirit | Japanese | Trigger | Rarity | Image |
|----|--------|----------|---------|--------|-------|
| `first_lesson` | First Scroll | 最初の巻物 | Complete any lesson | Common | Kitsune |
| `perfect_practice` | Iron Discipline | 鉄の修行 | Score 6/6 on practice | Rare | Tengu |
| `vocabulary_master` | Word Weaver | 言葉の織り手 | View all Lesson 1 vocab | Uncommon | Tanuki |
| `all_grammar` | Pattern Seeker | 型の探求者 | Read all 5 grammar points | Uncommon | Ryūjin |
| `streak_3` | Demon's Resolve | 鬼の覚悟 | Study 3 days in a row | Legendary | Oni |

**Persistence:**
- `localStorage` for guests (`kitsune_achievements` key)
- `user_achievements` table for authenticated users
- `useAchievement()` hook with `unlock(id)` + `useAchievementEffect(id, condition)`

---

### Feature 4.6: Personal Spirits — AI-Generated Badges

**Description:** Unique, AI-generated yokai badges earned by struggling with specific words. Three escalating tiers with increasingly absurd humor.

**Design Prompt:**
> Section titled "Personal Spirits" (個人の霊獣) below Spirit Bestiary with ink divider. Cards use same layout as achievements but with tiered borders: Bronze=uncommon/green, Silver=rare/vermillion, Gold=legendary/gold + glow shadows (`shadow-[0_0_24px_hsl(var(--warning)/0.35)]`). Expanded panel shows AI-generated sumi-e image (112×112), italic myth text, "個人の霊獣伝 · Personal Spirit Legend" attribution. Loading state: pulsing "A new spirit is materializing…" with Loader2 spinner.

**Tier System:**

| Tier | Name | Threshold | Rarity | Humor Tone |
|------|------|-----------|--------|------------|
| 1 | Bronze Stumble | 5 mistakes | Uncommon | Gentle teasing, playful tanuki nudge |
| 2 | Silver Spiral | 10 mistakes | Rare | Comedic, spirits are involved and cheering |
| 3 | Golden Obsession | 15 mistakes | Legendary | Absurdist legend, word is sentient, scholars write about it |

**AI Generation Pipeline (Edge Function: `generate-badge`):**
1. **Text generation** (Gemini 3 Flash Preview): Takes word, meaning, mistake count, tier → outputs JSON `{ title, title_jp, description, myth }`
2. **Image generation** (Gemini 3 Pro Image Preview): Creates minimalist sumi-e yokai illustration matching the badge title and tier intensity
3. **Storage upload**: PNG to `badge-images/{user_id}/{type}_{detail}_tier{n}_{timestamp}.png`
4. **Database insert**: Row in `personal_badges` with unique constraint on (user_id, trigger_type, trigger_detail, tier)

**Idempotency:** Checks DB before generating; handles race conditions via unique constraint + duplicate fetch fallback.

**Hook:** `usePersonalBadges()` — provides `badges`, `loading`, `generating`, `trackMistake(lessonId, word)`, `checkAndGenerate(lessonId, mistakesMap)`

---

### Feature 4.7: Fox Mascot

**Description:** An animated fox character that provides encouragement messages throughout the app.

**Design Prompt:**
> Small ink-brush fox illustration with a speech bubble. The fox floats gently (`animate-float`). Speech bubble uses `card-paper` styling with a small triangle pointer. Messages are in serif-jp italic. Size variants: sm/md/lg.

**Messages:**
- Goal complete: "素晴らしい! Your spirit grows stronger."
- In progress: "The path reveals itself to those who walk it."

---

## 5. Planned Features (Not Yet Implemented)

### 5.1 Additional Badge Categories

| Category | Trigger | Tiers |
|----------|---------|-------|
| Speed Demons | Quiz under 30s | Quick Fox → Lightning Tanuki → Time-Bending Kitsune |
| Night Owl / Early Bird | Study midnight-6am | Owl spirit watches approvingly |
| Comeback Kid | Return after 7+ days | Even sleeping dragons must wake |
| Perfectionist Streak | 3/5/10 perfect quizzes | Disciplined → Obsessive |
| Section Hopper | Switch sections 10+ times | Indecisive tanuki |
| Retry Champion | Retake quiz 5/10/15 times | Mountain doesn't move, neither does student |

### 5.2 Additional Lessons

- Lesson 2+: Following Minna no Nihongo curriculum
- More kanji entries with radical breakdowns
- Expanded exercise pool per lesson

### 5.3 Kanji Writing Practice

- Stroke-order canvas/trace exercises
- Grade kanji stroke accuracy

### 5.4 Progress Persistence for Daily Practice

- Save daily practice scores to DB
- Update real XP on Daily Goal card
- Track kanji mastery separately

### 5.5 Spaced Repetition

- SRS algorithm for vocabulary review scheduling
- Quick Review card powered by due items

---

## 6. File Map

| File | Purpose |
|------|---------|
| `src/App.tsx` | Root: routing, auth wrappers, providers |
| `src/main.tsx` | Entry point |
| `src/index.css` | Design system tokens + component classes |
| `tailwind.config.ts` | Extended theme (fonts, colors, shadows) |
| `src/context/AuthContext.tsx` | Auth state provider |
| `src/pages/Index.tsx` | Dashboard page |
| `src/pages/Auth.tsx` | Sign in / sign up |
| `src/pages/Lesson1.tsx` | Lesson 1 content + practice |
| `src/pages/DailyPractice.tsx` | Mixed daily practice session |
| `src/pages/NotFound.tsx` | 404 page |
| `src/data/daily-practice-data.ts` | Kanji entries, exercise pool, types |
| `src/components/header.tsx` | App header |
| `src/components/navigation.tsx` | Bottom/side nav with kanji labels |
| `src/components/hero-banner.tsx` | Dashboard hero image |
| `src/components/daily-goal-card.tsx` | XP goal with progress ring + fox |
| `src/components/fox-mascot.tsx` | Fox character with speech bubble |
| `src/components/stats-card.tsx` | Stats display card |
| `src/components/lesson-card.tsx` | Lesson list item |
| `src/components/study-category-card.tsx` | Category with progress |
| `src/components/quick-review-card.tsx` | Review items counter |
| `src/components/achievements-panel.tsx` | Spirit Bestiary + static achievements |
| `src/components/personal-badges-section.tsx` | AI-generated personal spirits |
| `src/components/ui/*` | shadcn/ui component library |
| `src/hooks/use-achievement.ts` | Achievement unlock logic |
| `src/hooks/use-personal-badges.ts` | AI badge tracking + generation |
| `src/hooks/use-user-data.ts` | Streak + lesson progress hooks |
| `src/hooks/use-mobile.tsx` | Mobile breakpoint detection |
| `src/lib/achievements.ts` | Achievement persistence helpers |
| `src/lib/utils.ts` | cn() utility |
| `supabase/functions/generate-badge/index.ts` | AI badge generation edge function |

---

## 7. Assets

| Asset | File | Usage |
|-------|------|-------|
| Fox mascot | `src/assets/fox-mascot.png` | Fox mascot component |
| Fox brush | `src/assets/fox-brush.png` | Auth page logo |
| Hero brush | `src/assets/hero-brush.jpg` | Dashboard hero banner |
| Hero landscape | `src/assets/hero-landscape.jpg` | Alternative hero |
| Kitsune achievement | `src/assets/achievement-kitsune.png` | First Scroll spirit |
| Tanuki achievement | `src/assets/achievement-tanuki.png` | Word Weaver spirit |
| Tengu achievement | `src/assets/achievement-tengu.png` | Iron Discipline spirit |
| Ryūjin achievement | `src/assets/achievement-ryujin.png` | Pattern Seeker spirit |
| Oni achievement | `src/assets/achievement-oni.png` | Demon's Resolve spirit |
