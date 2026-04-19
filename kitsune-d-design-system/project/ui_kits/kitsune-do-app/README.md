# Kitsune-dō — UI kit

Interactive recreation of the Kitsune-dō web app. Light-first, desktop-first, sumi-e restrained.

## Components

| File | Exports |
|------|---------|
| `Primitives.jsx` | `Icon`, `Button`, `GinkgoSeal`, `HankoStamp`, `WashiCard`, `KanjiWatermark`, `ProgressRing` |
| `Shell.jsx` | `Sidebar`, `Header` |
| `Dashboard.jsx` | `HeroBanner`, `DailyGoalCard`, `StatCard`, `StudyCategoryCard`, `LessonRow` |
| `Lesson.jsx` | `VocabFlashcard`, `QuizOption`, `YokaiCard`, `KanaTile` |
| `FoxAndAuth.jsx` | `FoxMascot`, `Auth` |
| `Screens.jsx` | `Dashboard`, `LessonView`, `KanaView`, `BestiaryView` |

## Screens in `index.html`

- **Auth** (bypassed by default; set `authed=false` in App to see it)
- **Dashboard** — hero banner, daily goal, 4 stats, 4 study categories, lesson list, "new spirit" card
- **Lesson** — 3-step flow: flashcard → multiple-choice mini quiz → completion seal
- **Kana** — 46-tile hiragana grid + stroke-order inspector
- **Bestiary** — 4-column yōkai grid with locked states
- **Fox mascot** — floating bottom-right bilingual bubble

## Interaction map

- Sidebar nav items (道/学/練/績/栄) switch top-level view.
- "Continue" on dashboard lesson row → `LessonView` → "Next scroll" returns.
- Quiz picks show correct/wrong state; "A" is the correct answer.
- Kana tiles swap the stroke-order inspector.

## Design conformance

- `strokeWidth={1.5}` on all icons.
- All radii ≤ 2 px (no rounded-xl / 2xl).
- No emoji, no left-accent borders.
- Japanese + em-dash glosses on all CTAs and eyebrows.
- Paper grain + kanji watermarks throughout.
