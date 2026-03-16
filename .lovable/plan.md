

# Personalized Tiered Achievement Badges

## Overview

Add a system that tracks per-word mistakes during practice quizzes and generates AI-powered personalized badges at 3 escalating thresholds (5, 10, 15 mistakes). Higher tiers get funnier titles and wilder myths. Also add several other personalized badge categories beyond word struggles.

## Tiered Mistake Badges

Each word a user struggles with can unlock up to 3 badges, getting progressively more humorous:

| Tier | Threshold | Rarity | Tone |
|------|-----------|--------|------|
| Bronze Stumble | 5 mistakes | uncommon | Gentle teasing -- "The word eludes you like a mischievous tanuki" |
| Silver Spiral | 10 mistakes | rare | Comedic -- "Even the spirits have started cheering you on" |
| Golden Obsession | 15 mistakes | legendary | Absurdist -- "Scholars will write legends about this rivalry" |

Example for the particle "は":
- 5 mistakes: **"The は Whisperer"** -- "A kappa once mistook は for が and fell into its own river."
- 10 mistakes: **"は's Sworn Rival"** -- "The great tengu laughed so hard its nose grew another inch."
- 15 mistakes: **"Eternal Dance with は"** -- "Legend says は itself has become sentient and now actively hides from this student."

## Other Personalized Badge Ideas

Beyond word-struggle badges, several other categories fit naturally:

1. **Speed Demons** -- Complete a quiz in under 30 seconds. Tiers: "Quick Fox" / "Lightning Tanuki" / "Time-Bending Kitsune"

2. **Night Owl / Early Bird** -- Study after midnight or before 6 AM. "The owl spirit watches approvingly."

3. **Comeback Kid** -- Return after 7+ days of inactivity. "Even sleeping dragons must wake."

4. **Perfectionist Streak** -- Get 3 / 5 / 10 perfect quizzes in a row. Escalating from disciplined to obsessive.

5. **Section Hopper** -- Switch between vocab/grammar/practice 10+ times in one session. "The indecisive tanuki who could not choose a path."

6. **Retry Champion** -- Retake the same quiz 5 / 10 / 15 times. "The mountain does not move, but neither does this student."

## Technical Plan

### 1. Database Migration

**New table: `mistake_log`**
- `id` (uuid, PK), `user_id` (uuid), `lesson_id` (text), `word` (text), `mistake_count` (int, default 0)
- Unique constraint on (user_id, lesson_id, word)
- RLS: users read/write only their own rows

**New table: `personal_badges`**
- `id` (uuid, PK), `user_id` (uuid), `trigger_type` (text), `trigger_detail` (text), `tier` (int), `title` (text), `title_jp` (text), `description` (text), `myth` (text), `image_url` (text), `rarity` (text), `created_at` (timestamptz)
- Unique constraint on (user_id, trigger_type, trigger_detail, tier)
- RLS: users read/write only their own rows

**New storage bucket: `badge-images`** for AI-generated sumi-e PNGs.

### 2. Edge Function: `generate-badge`

A backend function that:
- Receives `{ user_id, trigger_type, trigger_detail, word, meaning, mistake_count, tier }`
- Calls Lovable AI (gemini-3-flash-preview) to generate badge text (title, myth, description) with tone escalating by tier
- Calls Lovable AI (gemini-3-pro-image-preview) to generate a sumi-e badge illustration
- Uploads image to storage, saves badge to `personal_badges` table
- Returns the badge data to the client

The text prompt instructs the AI to be funnier at higher tiers:
- Tier 1 (5 mistakes): Gentle, encouraging humor
- Tier 2 (10 mistakes): Openly comedic, the spirits are involved
- Tier 3 (15 mistakes): Absurdist legend-level humor, the word itself has become a character

### 3. Frontend: Track Mistakes in Lesson1.tsx

- On each wrong answer in practice, upsert to `mistake_log` incrementing the count for that specific word/particle
- After quiz submission, check if any words crossed a threshold (5/10/15) without an existing badge at that tier
- If so, call the `generate-badge` edge function
- Show a special toast: "A new spirit has appeared!" with the generated badge

### 4. Frontend: Display in Achievements Panel

- Add a "Personal Spirits" (個人の霊獣) section below the existing Spirit Bestiary
- Show AI-generated badges with their unique myths, tiered rarity borders, and generated images
- Badges at higher tiers get more ornate borders and glow effects

### 5. New Hook: `usePersonalBadges`

- Fetches from `personal_badges` table for the current user
- Provides `trackMistake(lessonId, word)` to increment and check thresholds
- Provides `generateIfNeeded(word, meaning, count)` to trigger badge creation
- Handles loading states during AI generation

### File Changes Summary

| File | Change |
|------|--------|
| DB migration | Create `mistake_log`, `personal_badges` tables + storage bucket |
| `supabase/functions/generate-badge/index.ts` | New edge function for AI badge generation |
| `supabase/config.toml` | Register the new edge function |
| `src/hooks/use-personal-badges.ts` | New hook for mistake tracking and badge management |
| `src/pages/Lesson1.tsx` | Track wrong answers per word, trigger badge generation post-quiz |
| `src/components/achievements-panel.tsx` | Add "Personal Spirits" section with AI-generated badges |

