---
name: Yokai Boss Quiz
description: Mixed-review boss fight unlocked when all 10 lessons in a journey region are cleared; awards a Spirit Bestiary entry on victory
type: feature
---
- Triggered from RegionDetail's "Challenge the guardian" button on /journey (only enabled when all region lessons are completed).
- BossQuiz component (src/components/boss-quiz.tsx) shows: intro → fight → victory/defeat phases.
- Pulls 5 mixed exercises (multiple_choice, type_answer, sentence_builder) from the region's lessons via getRegionLessonData (src/lib/region-lessons.ts).
- Player has 3 hearts; yokai HP = 5 strikes. Themed dialogue per yokai (intro/taunt/praise/defeat/victory) lives in journey-regions.ts under yokai.dialogue.
- Victory unlocks a region-specific achievement (boss_bakeneko / boss_tengu / boss_kappa / boss_yukionna / boss_kamuy) — added to AchievementId, ACHIEVEMENTS list and ACHIEVEMENT_MAP.
- Each yokai has a sumi-e illustration in src/assets/yokai-{name}.png used in both the boss fight and the bestiary entry.
- Currently only Edo region is fully playable (lessons 1-10 exist); other regions show a "yokai sleeps" message via phase = "no-content".
