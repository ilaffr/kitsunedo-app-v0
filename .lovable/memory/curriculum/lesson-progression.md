---
name: Lesson progression (Minna-style 2-phase)
description: 50-lesson curriculum, two-phase Learn→Review flow, and Minna no Nihongo-style exercise types per lesson
type: feature
---

## Two-phase flow (per lesson, single sitting)
- **Phase 1 — 学ぶ Learn**: vocab chunks (intro + mini-quiz: MC, type-answer, match) → each grammar point (intro + sentence-builder + translate-compose).
- **Phase 2 — 復習 Review**: Minna 練習A/B/C-style drills, then mixed final quiz, then 会話 dialogue last.
- Phases are separated by a `phase_label` step. No day gating — both phases run in one session.

## Minna-style exercise types (all optional on `LessonData`)
- `particleDrills` → ParticleFillCard (4-particle picker, sentence with `___`).
- `conjugationDrills` → ConjugationCard (base form + target label like "negative" / "question").
- `substitutionDrills` → SubstitutionCard (Q→A using a cue, free-text JP answer).
- `transformDrills` → TransformCard (rewrite source sentence per instruction).
- `dictationDrills` → DictationCard (TTS plays JP, user types romaji or kana; "show text" escape hatch).
- `dialogue` → DialogueCard (scripted 会話 with per-line TTS, "play all", translation toggle, then 2 MC comprehension questions).

## File map
- Schema/types: `src/components/lesson-page.tsx` (interfaces).
- Engine: `src/lib/exercise-engine.ts` (`generateLessonSteps` accepts a `minna` payload).
- Cards: `src/components/exercise-cards.tsx` (legacy) + `src/components/exercise-cards-minna.tsx` (new).
- Renderer: `src/components/interactive-lesson.tsx`.
- Pilot lesson: `src/data/lesson1-data.ts` (full Minna fields + 7-line dialogue 「はじめまして」).

## Rules
- All Minna fields are optional — lessons 2-10 still work unchanged with the legacy flow.
- Dialogue answer matching uses JP-aware normalization (strips `。、！？` and spaces, lowercases).
- Conjugation/substitution/transform `acceptedAnswers[0]` must be the canonical form (used in feedback).
