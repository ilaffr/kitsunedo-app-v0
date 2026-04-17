---
name: JLPT Speedrun Tier
description: Tier-3 'Speedrun' lightning JLPT spirit awarded for 100% on a full 15-question mixed mock test in under 5 minutes; 閃 prefix, Zap icon, legendary rarity
type: feature
---

JLPT Speedrun (tier 3) badge.

**Trigger** (in `src/pages/JlptPractice.tsx`)
- Tracks `quizStartedAt` when entering quiz phase.
- On finish: if `mode === "mixed"`, `questions.length >= 15`, `pct === 100`, and `elapsedMs < 5 * 60 * 1000`, also dispatch `generate-badge` with `tier: 3`.
- Tier 1/2/3 badges awarded together when conditions overlap; idempotent.
- Live ⚡ countdown chip shown in the quiz header while eligible.

**Generate-badge** (in `supabase/functions/generate-badge/index.ts`)
- Tier 3 + `trigger_type === 'jlpt_pass'` → rarity `legendary`, lightning-themed sumi-e prompt with `閃` JP prefix.
- Receives `jlpt_elapsed_ms` from the client to interpolate the actual time into the title/description.

**Strip UI** (in `src/components/jlpt-spirit-strip.tsx`)
- Recognizes tier 3, prefers its portrait > mythic > base.
- Renders ⚡ `Zap` overlay (instead of ✨ Sparkles) and `閃<jp>` label.
- Adds `⚡ N speedrun` tally in header.
