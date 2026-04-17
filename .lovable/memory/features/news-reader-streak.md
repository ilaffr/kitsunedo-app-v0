---
name: NHK Reader Streak
description: Daily NHK headline opens are logged in nhk_reading_log; consecutive-day streaks unlock 'News Reader' personal badges (7d rare, 30d legendary)
type: feature
---

NHK Reader Streak system.

**Tracking**
- Table: `public.nhk_reading_log` (user_id, read_date UNIQUE, level)
- Insert happens in `NhkHeadlineTeaser` whenever an article successfully renders for the user (idempotent on conflict).
- Streak = count of consecutive distinct `read_date`s ending today (no grace day).

**Badges**
- `trigger_type = 'news_streak'`, `trigger_detail = '7-day' | '30-day'`, tier 1 / 2.
- Generated via existing `generate-badge` edge function (new branch).
- Theme: sumi-e sparrow/crow on a folded newspaper, ink-stained beak — "messenger of current events".
- Rarity: rare (7d) / legendary (30d). Idempotent — same user/trigger_detail/tier won't regenerate.

**UI**
- A small flame chip `{N}d` shows on the headline teaser once streak ≥ 2 for visual feedback.
- Toast announces the badge with title + description on award.
