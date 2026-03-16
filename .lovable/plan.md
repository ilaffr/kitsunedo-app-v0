

## Updated Lesson Flow: Learn → Practice → Learn → Practice → Final Quiz

### Current Problem
The lesson currently follows a flat sequence: all vocab → all grammar → all exercises. This means exercises for grammar rules appear detached from the rule itself, and there's no interleaved reinforcement for vocabulary.

### New Flow (Duolingo-style)

```text
┌─────────────────────────────────────────────┐
│  PHASE 1: VOCABULARY                        │
│  For each chunk of 4 words:                 │
│    ① Vocab intro cards (flip to learn)      │
│    ② Mini quiz (MC + type answer + match)   │
├─────────────────────────────────────────────┤
│  PHASE 2: GRAMMAR (per rule)                │
│  For each grammar point:                    │
│    ① Grammar intro card                     │
│    ② Exercises for THIS rule only           │
│      (sentence builder + translate compose) │
├─────────────────────────────────────────────┤
│  PHASE 3: FINAL QUIZ                        │
│  Mixed exercises covering ALL vocab+grammar │
│    - Random MC from all vocab               │
│    - Random type-answer from all vocab      │
│    - Sentence builders from random grammar  │
│    - Reading comprehension passages         │
│  Higher XP reward (15 XP each)              │
└─────────────────────────────────────────────┘
```

### Technical Changes

**File: `src/lib/exercise-engine.ts`** — Rewrite `generateLessonSteps`:

1. **Phase 1 — Vocab with mini-quizzes**: After each vocab chunk intro, immediately insert the vocab exercises for that chunk (MC, type answer, match pairs). This reinforces words right after learning them.

2. **Phase 2 — Grammar with inline exercises**: For each grammar point, insert the grammar intro followed by its exercises (sentence builder, translate compose). Users practice each rule right after learning it.

3. **Phase 3 — Final quiz**: Add a new `generateFinalQuiz` function that creates a mixed set of exercises pulling from ALL vocabulary and ALL grammar points. Include reading comprehension here too. These get a higher XP reward.

**File: `src/components/interactive-lesson.tsx`** — Add a visual phase separator step:

- Add a new step type `"phase_label"` to show a transition screen between phases (e.g., "Now let's practice!" / "Final Quiz — 総復習"). This gives users a breather and context for what's coming next.

### Step Type Addition

Add a new `PhaseLabelStep` type:
```
{ type: "phase_label", title: string, subtitle: string }
```

Rendered as a simple card with a "Continue" button, used to separate the three phases visually.

