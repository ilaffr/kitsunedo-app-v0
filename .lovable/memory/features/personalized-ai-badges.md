---
name: Personalized AI Badges
description: Triggers and logic for dynamic AI-generated user badges
type: feature
---

# Personalized AI Badges

Personal badges are AI-generated and stored in `personal_badges` (RLS: own rows). The `generate-badge` edge function creates the text + sumi-e image, then upserts. Idempotent on `(user_id, trigger_type, trigger_detail, tier)`.

## Trigger types

### `word_struggle` (comedic)
- Triggered from `usePersonalBadges.checkAndGenerate` after lesson exercises.
- Tiers map to mistake thresholds: 5→T1 (uncommon), 10→T2 (rare), 15→T3 (legendary).
- Tone: playful, absurdist, escalates with tier.

### `jlpt_pass` (reverent)
- Triggered from `JlptPractice.tsx` when a quiz session ends.
- `trigger_detail = level` (N5..N1).
- **Tier 1** (base): awarded at `pct >= 80`. Reverent, mythic tone. Rarity from level (uncommon/rare/legendary).
- **Tier 2** (perfect-score variant): awarded at `pct === 100`. Always rarity `mythic`. Title prefixed/varied as "Ascended {archetype}". Image prompt is more elaborate — gold leaf, aurora, indigo wash, vermillion hanko, layered brush strokes. JP title prepends 真 (e.g. `真山の神`).
- Level → archetype mapping inside `generate-badge`:
  - N5 → Foothill Spirit (麓の精) · uncommon
  - N4 → Bamboo Grove Sprite (竹林の童) · uncommon
  - N3 → River Sage (川の賢者) · uncommon
  - N2 → Cloud Tengu (雲の天狗) · rare (override)
  - N1 → Mountain Kami (山の神) · legendary (override + gold leaf in image)
- `mythic` rarity is registered in `personal-badges-section.tsx` (label "Mythic ✨", hanko 真) and `recent-spirits-preview.tsx` (primary border + strong primary glow).
- The `JlptSpiritStrip` on /bestiary shows a ✨ Sparkles badge over the silhouette when the mythic form is owned, and uses the mythic image as the portrait.

## Image pipeline
- Model: `google/gemini-3-pro-image-preview`
- Stored in `badge-images` bucket with sanitized filename (`encodeURIComponent` on trigger_detail).
- All badges surface in `/bestiary` via `personal-badges-section.tsx` — no trigger_type filtering, so JLPT spirits sit alongside word-struggle yokai.
