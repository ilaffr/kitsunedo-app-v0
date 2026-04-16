---
name: Ghost of Yōtei Aesthetic
description: Global cinematic sumi-e visual language inspired by Ghost of Yōtei — pale washi, brush-stroke active states, thin ink underlines, vermillion ginkgo seals.
type: design
---

The whole app uses a Ghost of Yōtei-inspired sumi-e aesthetic.

## Background
- Pale washi rice paper: `--background: 36 22% 94%`.
- `body` has layered atmospheric mist + paper-grain SVG noise via background-image (do not remove).

## Typography
- Page/section titles use `.yotei-title`: small uppercase Noto Serif JP, letter-spacing `0.18em`, with a thin centered underline (mimics "SETTINGS" in Yōtei UI).
- Body kanji titles use `serif-jp font-medium` (NOT `font-bold` — Yōtei is restrained).
- Generous letter-spacing (`tracking-wide` / `tracking-[0.25em]`) is the rule, not the exception.

## Components / utilities
- `.washi-card` — soft paper card with grain + inset hairline. Use INSTEAD of `card-paper` going forward.
- `.brush-active` — bold ink-swipe behind active nav items (the "AUDIO" effect). Used in Navigation.
- `.ink-ribbon` — black brush-stroke banner with clip-path edges (for tooltip/hint text, like the Yōtei subtitle bar).
- `.ginkgo-seal` — small round vermillion seal with a kanji inside, the gold ginkgo-leaf marker equivalent.
- `.kanji-watermark` — vertical-rl, 8% opacity, large decorative kanji on hero/cards.

## Rules
- AVOID heavy 2px borders. Use `border-foreground/10` hairlines or shadow + inset-hairline (washi-card).
- AVOID `card-paper` for new components — prefer `.washi-card`.
- AVOID bright/saturated bg fills (`bg-primary/10` etc.) — keep paper pale, use vermillion only as a small accent (seals, dots, primary CTAs).
- Buttons prefer `bg-foreground text-background` for the "ink" CTA; reserve `btn-vermillion` for celebratory moments.
- Section titles MUST use `.yotei-title`, not `font-brush font-bold` colored bars.
