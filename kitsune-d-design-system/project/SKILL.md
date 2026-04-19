---
name: kitsune-do-design
description: Use this skill to generate well-branded interfaces and assets for Kitsune-dō, a Japanese language learning web app with a sumi-e (墨絵) ink-brush aesthetic inspired by Ghost of Yōtei. Use for production UI, prototypes, mocks, slides, marketing pages, or any visual artifact that should feel painted with a brush on rice paper. Contains essential design guidelines, colors, type, fonts, assets, and a complete UI kit.
user-invocable: true
---

# Kitsune-dō 狐道 — Design Skill

Read `README.md` first — it contains the full system: product context, content fundamentals, visual foundations (colors, type, spacing, shadows, radii, animation, hover/press states), iconography, and a manifest of every file.

## Key files

- **`README.md`** — the canonical guide. Start here.
- **`colors_and_type.css`** — CSS variables for colors, gradients, shadows, radii, typography. Import this at the top of any new page.
- **`assets/`** — mascot and yōkai PNG art. `assets/README.md` catalogs each file. Placeholders — swap in the real assets from `ilaffr/kitsudo` `src/assets/` when possible.
- **`preview/`** — tiny HTML specimen cards per design token / component.
- **`ui_kits/kitsune-do-app/`** — interactive recreation of the web app. `index.html` is the clickable prototype; JSX components are modular and copyable.

## If creating visual artifacts (slides, mocks, prototypes)

- Copy the assets you need out of this skill's `assets/` folder into your output project.
- Link `colors_and_type.css` and `ui_kits/kitsune-do-app/kit.css` for tokens + component styles.
- Reuse the JSX components in `ui_kits/kitsune-do-app/` — they are intentionally simple and cosmetic.
- Output static HTML files for the user to view.

## If working on production code

- Read `README.md` for tone, casing, motif rules, iconography choices.
- Match the source repo's tokens (`src/index.css`, `tailwind.config.ts`) — they align with `colors_and_type.css` here.
- Use Lucide icons at `strokeWidth={1.5}`.
- Never introduce new emoji. Use `.ginkgo-seal`, `.hanko-sq`, or a Lucide icon.
- Radii ≤ 2 px. Never `rounded-xl` / `rounded-2xl` for cards.
- Pair Japanese + em-dash English glosses on ceremonial copy: `入る — Enter the Dojo`.

## If invoked without other guidance

Ask the user what they want to build. Clarify: prototype vs production? Which screen(s)? Any existing copy or flow? Then design as an expert, outputting HTML artifacts or production code per their need.
