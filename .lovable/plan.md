
The user is asking which features from my prior research should be prioritized next. This is a planning/prioritization question, not implementation. I'll present a focused, ranked roadmap mapping research findings → concrete features that fit Kitsune-dō's existing architecture (Supabase, Lovable AI, sumi-e theme, kitsune mascot).

Already shipped recently: Daily Kitsune Tale, FuriganaText component, Placement Test, SRS flashcards, Kanji writing, Practice Hub, AI badges.

Remaining high-value gaps from the research, ranked by impact × fit × effort.

# Recommended Next Features for Kitsune-dō

Grouped into 4 tiers. Pick a tier and I'll build it.

---

## Tier 1 — Retention fixes (quick wins, high ROI)

These tackle the #1 churn driver in competitor apps: streak anxiety + SRS pile-ups.

1. **Streak Freeze Scrolls (お守り)**
   - Earn 1 freeze per 7-day streak, max 2 stored. Auto-consumed on missed day.
   - New table `streak_freezes`, integrate with existing `user_streaks` logic.
   - Shown as paper charm icons next to the flame counter.

2. **Soft-fail SRS (forgiving typos)**
   - Levenshtein distance ≤1 on romaji/kana = "almost" prompt instead of "wrong."
   - User can self-correct without losing the card's interval.
   - Lives in `use-flashcards.ts` and exercise-engine type-answer logic.

3. **Global Furigana Toggle**
   - Header switch persists in `profiles.show_furigana`.
   - Reuse the new `FuriganaText` component across lesson pages, flashcards, tales.

---

## Tier 2 — Production skills (close the "recognition-only" gap)

Competitors fail here. Biggest differentiator opportunity.

4. **Kitsune AI Tutor Chat**
   - Short text conversation in Japanese with the fox mascot via Lovable AI Gateway (`gemini-2.5-flash`).
   - Inline corrections, romaji hints on hover, suggested replies.
   - New page `/tutor`, new table `tutor_conversations`.

5. **Shadowing Mode for Tales & Lessons**
   - Sentence-by-sentence TTS playback with a record button.
   - Web Audio API records mic, plays back side-by-side. No grading — just self-comparison.
   - Add to existing `DailyKitsuneTale` and reading passages.

6. **Sentence Mining from Tales**
   - "+ Add to flashcards" button next to each new word in a Kitsune Tale.
   - Auto-fills japanese/reading/meaning from the tale's metadata, triggers existing image generation.

---

## Tier 3 — Narrative moat (the sumi-e identity)

Turn the aesthetic into a real progression system.

7. **Yokai Journey Map**
   - Replace flat lesson list with a sumi-e map of feudal Japan: 5 regions (Edo, Kyoto, Hokkaido, Kyushu, Okinawa), each unlocking 10 lessons + a yokai boss.
   - Boss = mixed review quiz; clearing it unlocks a Spirit Bestiary entry.
   - SVG map with ink-painted region overlays.

8. **Weakness Dōjō**
   - Pulls from existing `mistake_log` to generate a 5-min targeted drill of the user's worst items.
   - Surfaces as a daily card on the dashboard when ≥10 mistakes are pending.

---

## Tier 4 — Personalization & infra

9. **Item-level Test-Out**
   - Long-press any vocab card → "I know this" → marks as mature, skips intro exercises.
   - Addresses WaniKani's "can't skip known kanji" complaint.

10. **PWA + Offline Mode**
    - Service worker caches lessons, flashcards due today, and last 7 tales.
    - Manifest + install prompt with kitsune icon.

11. **Tale Archive (`/tales`)**
    - Simple list view of past Kitsune Tales — re-listen, re-quiz, save story words.
    - Cheap follow-up to the feature we just shipped.

---

## My Recommendation

Build **Tier 1 in one sprint** (Streak Freeze + Soft-fail SRS + Furigana Toggle). They're small, ship together cleanly, and directly fix the most-cited pain points from the research. After that, **Kitsune AI Tutor** (Tier 2 #4) is the single highest-leverage feature — no competitor combines a mascot-driven conversational tutor with this aesthetic.

Tell me which tier (or specific items) to build and I'll start.
