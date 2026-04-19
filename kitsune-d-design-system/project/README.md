# Kitsune-dō 狐道 — Design System

> *Let the kitsune spirit guide your brush through the way of Japanese.*

A sumi-e (墨絵) ink-brush design system for **Kitsune-dō**, a Japanese language learning web app inspired by the cinematic restraint of *Ghost of Yōtei*. Every new component should feel painted with a brush on rice paper.

---

## Source of truth

All tokens, components and assets were extracted from the Kitsune-dō codebase.

- **Repo:** `ilaffr/kitsudo` (default branch `main`) — private, imported via GitHub.
- **Design token definition:** `src/index.css`, `tailwind.config.ts`
- **Style memory / rules:** `.lovable/memory/style/ghost-of-yotei.md`
- **Product requirements:** `docs/PRD.md`
- **Component library:** `src/components/` (shadcn/ui primitives in `src/components/ui/`)
- **Mascot & achievement art:** `src/assets/*.png` (binary — see `assets/README.md`)

---

## Product context

Kitsune-dō (狐道 — *Path of the Fox*) teaches English speakers Japanese from JLPT N5 → N1 through a **Minna no Nihongo**-style 50-lesson curriculum, mapped across five legendary regions of Japan (Edo, Kyōto, Kyūshū, Tōhoku, Hokkaidō), each ruled by a yōkai boss.

**Core pillars**

- **Curriculum** — 50-lesson roadmap (Minna no Nihongo structure).
- **Interleaving** — Vocab → mini-quiz → grammar → mini-quiz → final quiz (Duolingo-style).
- **Memory** — SRS-powered flashcards (SM-2) with AI-generated kawaii illustrations.
- **Calligraphy** — Kanji writing canvas with stroke-order guides and self-grading.
- **Delight** — Sumi-e visual identity, fox mascot (Kitsune), yōkai bestiary, AI-generated Personal Spirit badges earned by struggling with specific words. Humor-driven radical mnemonics (e.g. 遅 = dead sheep on a road → "late").

**Target user**

- English speakers learning Japanese (JLPT N5 → N1).
- Self-directed learners wanting a structured daily progression.
- Visual learners drawn to a distinctive aesthetic over generic gamified UIs.

**Surfaces**

- Single React 18 + Vite web app (desktop-first, mobile-responsive). No separate marketing site in-repo.

---

## Content fundamentals

The voice balances **cinematic restraint** with **gentle, fox-spirit mischief**. The app speaks as a patient teacher who has seen a thousand students pass through the gate.

### Tone

- **Reverent but not stiff.** Copy often reads like a quiet line of calligraphy: short, measured, weighted.
- **Dualingual phrasing.** Most CTAs and titles pair a Japanese phrase with an em-dashed English gloss:
  - `試す — Try the kana primer free`
  - `入る — Enter the Dojo`
  - `始める — Begin Your Path`
  - `送信 — Send Recovery Scroll`
- **Metaphor-rich.** Vocabulary is drawn from the sumi-e / martial world: *scrolls, spirits, seals, the path, the dojo, training, honor*. "Lessons" are "scrolls." "Achievements" are "spirits." "Streaks" are "days of honor."
- **Kitsune as voice.** The fox mascot delivers encouragement in bilingual micro-copy: `素晴らしい. Your spirit grows stronger.` / `The path reveals itself to those who walk it.`

### Pronouns, casing, punctuation

- Prefer **implied "you"**, rarely "we" / "I". The app is a guide, not a cheerleader.
- **Eyebrow labels** are ALL-CAPS with very wide tracking (`letter-spacing: 0.25em–0.32em`). e.g. `DAILY PRACTICE`, `CONTINUE PATH`.
- **Section titles** use the `.yotei-title` pattern: small-caps serif with a thin centered ink underline ("SETTINGS" in the *Yōtei* UI).
- **Body prose** uses sentence case, restrained punctuation, occasional italics for atmosphere.
- **No exclamation marks.** Enthusiasm is expressed through Japanese phrasing and visual ceremony, not typography.

### Emoji

- **Avoid.** One or two Unicode glyphs appear in legacy dashboard modules (⛩️ placement test CTA, ✍️ kana primer CTA), but they are being phased out in favour of hanko seals + kanji watermarks. **Do not introduce new emoji.** Use vermillion `.ginkgo-seal` or a Lucide icon instead.

### Examples

- Hero tagline: *Let the kitsune spirit guide your brush through the way of Japanese.*
- Dashboard state: `本日完了 — Today's training is complete`
- Streak seal: `{n}日` inside a round vermillion ginkgo seal.
- Rarity labels: `Common / Uncommon / Rare / Legendary` — never "Epic", never "Ultra".
- Locked state: `???` (full-width question mark) with 50% grayscale.

---

## Visual foundations

### Background / paper

- **Pale warm washi** (`hsl(36 22% 94%)`) — NOT pure white. Cards are a half-shade lighter and cooler (`hsl(38 30% 97%)`).
- **Body has a layered atmosphere:** two radial-gradient ink-wash shadows (top-center + bottom-right) plus a **fractal-noise SVG paper grain** at ~4% opacity via `background-image`. `background-attachment: fixed`.
- Every card repeats this grain at `opacity: 0.04` — the whole UI is subtly textured.
- **Never use pure white, pure black, or saturated fills** for surfaces. Ink black (`hsl(30 8% 12%)`) only appears as CTA fills, borders, or active-nav swipes.

### Color

- **Paper + ink + vermillion.** That's the palette.
- **Vermillion red** (`hsl(5 78% 42%)`) is used **only** as a hanko seal, ginkgo dot, in-progress marker, or celebratory CTA. Not as a background fill. Not as an alert.
- **Bamboo green** (`hsl(150 35% 35%)`) for success states; **autumn gold** (`hsl(35 80% 50%)`) for warnings. Used sparingly.
- Foreground text is warm ink, never `#000`. All colors are HSL with semantic tokens — **never hardcoded hex**.

### Typography

- **Noto Serif JP** — headings, kanji, ceremonial display.
- **Outfit** — body text and UI.
- **Noto Sans JP** — inline Japanese running text.
- Generous letter-spacing on titles (`0.18em` → `0.32em` for eyebrows). Titles are **rarely bold** — Yōtei restraint prefers `font-weight: 500` / `400` with wide tracking.
- Decorative **vertical kanji watermarks** (`writing-mode: vertical-rl`, 8% opacity, huge) drift behind hero sections and cards.

### Backgrounds, imagery

- **Sumi-e ink-wash imagery only.** Mountains, brush marks, ink splashes, cartoon-cute yōkai painted in brush strokes. No photography. No 3D renders.
- Hero images use **full-bleed sumi-e landscapes** with heavy gradient overlays (`background/85 → transparent`) so that text sits on paper, not pixels.
- Repeating pattern: **fractal-noise SVG paper grain** layered at 4–5% opacity.
- Cartoon kawaii flashcard illustrations are AI-generated but rendered with a consistent sumi-e / watercolor treatment.

### Spacing

Loose and cinematic. Padding scales typical of a restrained desktop app:
- Cards: `p-5` (1.25rem) → `p-8` (2rem).
- Section gap: `mb-6 md:mb-8`.
- Uses tailwind's default 4px spacing scale; container padding is `2rem` with `max-w-6xl` containers.

### Corner radii

- **Sharp.** Base radius is `0.125rem` (2px) — barely rounded.
- `rounded-sm` is the default; `rounded-md` is the max for containers. `rounded-full` only for the ginkgo seal and progress rings.
- **Never** use `rounded-xl` or `rounded-2xl` for cards. The Yōtei aesthetic wants crisp edges that feel cut with a blade.

### Cards

- **`.washi-card`** is the canonical container. It combines:
  - `bg-card` (luminous paper).
  - A radial shadow in the top-left corner (`hsl(30 8% 10% / 0.04)`).
  - Fractal-noise SVG paper grain at 4% opacity.
  - `box-shadow: var(--shadow-md), inset 0 0 0 1px hsl(30 12% 82% / 0.6)` — soft drop + inset hairline.
  - `border-radius: var(--radius)` (2px).
- **Avoid `.card-paper`** (legacy — still present but deprecated for new work).
- **No left-accent colored borders.** No thick 2px borders. Use hairlines + shadow.

### Borders & dividers

- **Hairlines only.** `border-foreground/10` or inset `0 0 0 1px` rings.
- **Ink dividers** are gradient rules that taper at both ends (`.ink-divider`).
- Active nav items use a `brush-active` sumi-e swipe behind the text instead of a solid background.

### Shadows

- **Elevation:** `--shadow-sm` → `--shadow-md` → `--shadow-lg` (all soft, low-alpha).
- **Ink shadow:** `1px 1px 0 ink` for crisp stamped edges (buttons, hanko).
- **Vermillion glow:** `0 4px 16px hsl(vermillion / 0.22)` — only on celebratory CTAs.

### Hover / press states

- **Buttons:** hover darkens foreground CTAs to `foreground/88`; vermillion CTAs gain the vermillion glow.
- **Cards:** interactive cards lift 2px on hover and darken the inset hairline.
- **Nav items:** a thin tapered **sumi-e brush swipe** fades in behind inactive nav labels (`.brush-hover`). Active items get a bolder **ink swipe** (`.brush-active`).
- **Press:** slight scale-down (`scale-[0.98]`) or `opacity-90`. No bounce.

### Animation

- **Four house animations:** `float` (4s ease-in-out infinite, for the fox mascot), `brush-in` (0.8s, for entering titles — blur + skew resolving to crisp), `fade-up` (0.6s), `stamp` (0.4s cubic-bezier spring, for hanko seals landing).
- **Easing:** default is `ease-out`; seals use `cubic-bezier(0.34, 1.56, 0.64, 1)` for a slight overshoot.
- **NEVER animate lesson page content** — lessons remain static sumi-e by design rule.
- Transitions run 200–300ms; brush-hover is 300–450ms.

### Transparency & blur

- Sticky header + mobile nav use `bg-background/80 backdrop-blur-md`.
- Modal overlays use `bg-background/80 backdrop-blur-sm`.
- Hero overlays stack **multiple translucent gradients** to fade imagery into paper.

### Imagery mood

- **Warm, muted, ink-on-paper.** Never cool/cyan. Never glossy. Grain is always present.
- Color palette of imagery skews toward ivory, warm gray, deep ink black, with **vermillion as the single accent** (ginkgo leaves, seals, lantern stems).

### Layout rules

- **Desktop:** fixed 96px left sidebar (vertical nav with kanji labels 道/学/練/績/栄) + sticky top header. Content container `max-w-6xl`.
- **Mobile:** bottom pill nav (fixed, backdrop-blurred) + sticky header.
- Content is **left-aligned** by default. Ceremonial moments (auth, mascot states) center everything around a massive kanji.

### Decorative motifs

- **Hanko 印 seal** — vermillion ginkgo circle or square with a single kanji (`.ginkgo-seal`, `.hanko-badge`). Used for: streak count, rarity stamps, in-progress markers, corner signatures.
- **Kanji watermark** — faint huge vertical kanji (`writing-mode: vertical-rl`, 8% opacity) drifting behind hero content.
- **Ink-ribbon** — black brush-stroke banner with clip-path tapered edges, for tooltip / hint bars.
- **Brush underline** — 1px hairline with 8% inset, sits 6px below the title.

---

## Iconography

### Icon system

- **Lucide React** (`lucide-react` package) is the codebase's only icon source. Icons are used at `w-4 h-4` → `w-6 h-6`, **always at `strokeWidth={1.5}`** (never default 2) — the thinner line matches the sumi-e hairline aesthetic.
- Common icons in use: `BookOpen, Languages, PenTool, BookText, MessageSquare, Flame, Star, Clock, ChevronRight, Check, Lock, Play, Home, GraduationCap, Trophy, BarChart3, Search, LogOut, User, Target, Scroll, ArrowRight, X, Sparkles, Palette, Brain, Feather, Hourglass, Calendar`.
- **CDN:** Lucide icons in this design system are loaded via `https://unpkg.com/lucide@latest` (see `ui_kits/kitsune-do-app/index.html`).

### Kanji as icons

- Single kanji glyphs often **replace icons** for mobile nav and hanko seals — rendered in Noto Serif JP at the expected icon size. Examples:
  - Nav: `道 / 学 / 練 / 績 / 栄`
  - Rarity hanko: `初 / 中 / 上 / 極`
  - Signature hanko: `幸 / 学 / 道`
- When using kanji-as-icon, set `letter-spacing: 0` and `line-height: 1`.

### SVG & illustrations

- **Brand/mascot illustrations** (fox, yōkai, hero ink-wash landscapes) are **PNGs** stored in `src/assets/` of the original repo. They are painted sumi-e / watercolor art. See `assets/README.md` for the full list.
- **No inline decorative SVG in component code.** SVG is limited to the fractal-noise background filters and the progress-ring stroke circles.

### Emoji

- Emoji appear only in two legacy CTAs (⛩️, ✍️) and are being phased out. **Do not introduce new emoji.** Use a Lucide icon or `.ginkgo-seal` instead.

### Placeholders in this design system

- The original repo's mascot and yōkai PNGs are **binary and not directly importable via the GitHub text-import API.** We've documented each filename in `assets/README.md` with a one-line description, and created simple PNG placeholders at matching sizes so the UI kit renders without broken images. **To finalize, replace placeholders with the real files from `src/assets/` of the `ilaffr/kitsudo` repo** (see "Ask" at end).

---

## Index — manifest of this design system

### Root files

- **`README.md`** — this file.
- **`colors_and_type.css`** — CSS variables for colors, gradients, shadows, radii, typography.
- **`SKILL.md`** — Agent Skills / Claude Code entry point for this design system.

### `fonts/`

- All three typefaces (Noto Serif JP, Noto Sans JP, Outfit) are loaded from **Google Fonts at runtime**; no `.ttf` files are bundled. See `colors_and_type.css` for the `@import` URL. If offline use is required, host the `.woff2` files in `fonts/` and mirror the `@font-face` blocks.

### `assets/`

- PNG mascot + yōkai art + hero backdrops. See `assets/README.md` for the catalog.

### `preview/`

- Small HTML cards (~700×150) populating the Design System tab: color palette, typography specimens, spacing tokens, shadow system, components (buttons, cards, hanko seal, nav, progress ring, lesson card, stats card, fox mascot, kanji watermark).

### `ui_kits/kitsune-do-app/`

- Interactive recreation of the Kitsune-dō web app.
- `index.html` — clickable prototype of Dashboard ⇄ Lessons ⇄ Kana Primer ⇄ Bestiary ⇄ Auth.
- JSX components for Header, Sidebar, HeroBanner, DailyGoalCard, StatsCard, StudyCategoryCard, LessonCard, WashiCard, GinkgoSeal, FoxMascot, ProgressRing, YokaiScrollCard, Button, KanjiGlyph.
- See `ui_kits/kitsune-do-app/README.md` for the component inventory.

---

## Caveats

- **Binary assets could not be imported** from the `ilaffr/kitsudo` repo via the text-only GitHub import API. `assets/` contains lightweight placeholders plus a documented catalog. Replace with real files from `src/assets/` for production fidelity.
- **Dark theme** is defined in tokens but not previewed — the app is light-first.
- **No slide deck** was provided by the repo — slides are not included in this design system.
- **Fonts** are loaded from Google Fonts; no local `.woff2` bundling.
