# CLAUDE.md

Guidance for AI agents (and humans) maintaining this repository. **Read fully before changing anything.**

## What this is

**Jedno Agregator** — a static React website aggregating Catholic content of the Archdiocese of Gdańsk:
news, events, communities and info pages from the **Jedno** CMS (`admin.jedno.net`, same backend as the
Jedno mobile app in repo `lOdwrot/festiwal-dla-zycia`), videos from **YouTube @ArchiGdansk** and posts from
**Instagram @archigdansk**. Deployed to GitHub Pages: `https://lodwrot.github.io/jedno-agregator/`.
UI language: **Polish**. Code, comments, identifiers: English.

## Commands

```bash
npm run dev          # Vite dev server (needs public/data — run fetch-data first)
npm run fetch-data   # snapshot all sources into public/data/*.json (needs JEDNO_API_KEY in env or .env)
npm run build        # typecheck + production build to dist/
npm run check        # typecheck + lint + unit tests — must be green before every commit
npm run test         # Vitest (unit + component)
npm run e2e          # Playwright smoke + axe accessibility (against `vite preview`)
```

## Architecture — the one rule that explains everything

**There is no backend and the browser never calls admin.jedno.net.** The Jedno API has no CORS headers and
requires a secret `x-api-key`. So:

1. GitHub Actions (`.github/workflows/deploy.yml`) runs every 30 min + on push to `main`.
2. `scripts/fetch-data.ts` pulls every source (`scripts/sources/*.ts`), normalizes and validates it against
   `src/data/schemas.ts` (zod) and writes `public/data/<name>.json`. A failing source falls back to the last
   published snapshot (downloaded from the live site), so a deploy never breaks because a source is down.
3. Vite builds the SPA; the app reads the JSON files via React Query.

Secrets: `JEDNO_API_KEY` (GitHub repository secret). Never commit keys. Never put keys in `VITE_*` vars.

### Data flow in the app

```
public/data/news.json ──loadSnapshot()──▶ useSnapshot("news") ──▶ features/news/api.ts hooks ──▶ components
                       src/data/source.ts  src/data/useSnapshot.ts   (select/filter/sort here)
```

- `src/data/schemas.ts` — **single source of truth** for data types (shared by script and app). Change a shape
  here first, then the source script, then the UI.
- Features never call `fetch` directly. They expose hooks in `features/<name>/api.ts` built on `useSnapshot`
  with `select` for derived data (filters, grouping, lookups by id).
- Filters live in the URL search params (shareable, back-button friendly).

## Code layout (feature-first)

```
src/
  app/          App, router, routes.ts (path helpers), Layout/shell (header, nav, footer), NotFound
  ui/           OWN COMPONENT LIBRARY (no third-party UI kits). Public API: `import { Button } from "@/ui"`
    primitives/ composites/ effects/ icons/  catalog/ (the /ui demo page)
  styles/       index.css (design tokens in @theme), fonts.css
  data/         schemas.ts, source.ts, useSnapshot.ts, queryClient.ts
  features/<f>/ api.ts (hooks), components/, pages/, *.test.ts(x)
  lib/          pure helpers: cn, dates (pl locale), html (sanitize/transform CMS HTML), ics, slug, seo
scripts/        fetch-data.ts + sources/{jedno,youtube,instagram}.ts (Node 22, run with tsx)
content/        hand-maintained content (instagram/posts.json)
e2e/            Playwright tests
```

Features: `home`, `news`, `events`, `communities`, `media`, `infos`, `notifications`, `games`.

`games` (`/gry`, `/gry/:slug`) are small Bible mini-games with static content in `features/games/catalog.ts`.
Each game has a pure, unit-tested `engine.ts` (state + `step(dt)`) and an SVG view driven by `useGameLoop`.
Every game must stay playable by touch AND keyboard, announce status via `aria-live`, and end with the verse card.
Games: `dawid-i-goliat` (FIFA-penalty style: tap locks the swinging angle, then power), `morze-czerwone` (3-lane run),
`arka-noego` (memory, `?poziom=latwy|sredni|trudny`), `mury-jerycha` (rhythm game, Web Audio synth in `jericho/sound.ts`).
`walka-o-dusze` (`soul/`) is a single-player trading-card game: pure engine in `soul/engine` (every move goes through
`dispatch`; `dispatchFrames` also records one animation frame per event via `emit`), collection/boosters in
`soul/collection` (localStorage), and a full-screen duel drawn with **PixiJS** in `soul/board` (lazy-loaded; tweens in
`tween.ts`, one animation + sound per event in `playFrame.ts`, Web Audio sfx/music in `soul/audio`). The canvas is
`aria-hidden`; an invisible layer of real `<button>`s (from the same pure `layout.ts`) keeps it keyboard/screen-reader
accessible and handles drag & drop.

## Conventions

- **Styling:** Tailwind v4 only, with tokens from `src/styles/index.css` (`bg-navy`, `text-accent-ink`,
  `rounded-card`, `font-display`, `shadow-card`…). No hex colors or arbitrary color values in components.
  Merge classes with `cn()` from `@/lib/cn`. Variants with `tailwind-variants` (`tv`).
- **Colour accessibility:** `accent` (#E8672A) is for decoration, backgrounds and large/bold text only.
  Normal-size orange text uses `text-accent-ink`; solid orange backgrounds with white text use `bg-accent-strong`.
- **Fonts:** `font-display` (Bricolage Grotesque) for headings, `font-sans` (Lato) for body,
  `font-serif` (Instrument Serif, usually italic) for decorative accents.
- **Components:** build UI from `@/ui`. If something is missing, add it to `src/ui` (with a catalog example in
  `src/ui/catalog` and a test), don't inline a one-off in a feature.
- **Animation:** `motion/react` + CSS. Animate only `transform`/`opacity`. Everything must degrade gracefully
  under `prefers-reduced-motion` (App wraps in `<MotionConfig reducedMotion="user">`; hand-written effects
  must check `usePrefersReducedMotion()` from `@/ui`).
- **Accessibility (WCAG 2.2 AA):** semantic HTML, one `<h1>` per page, labelled controls, keyboard support,
  visible focus, `alt` text, touch targets ≥ 44px, `aria-live` for async status. ESLint `jsx-a11y` must pass.
- **CMS HTML:** always render through `<RichText html=… />` (sanitizes with DOMPurify and turns YouTube
  embeds into our player). Never use `dangerouslySetInnerHTML` elsewhere.
- **Dates:** only via `@/lib/dates` (date-fns, `pl` locale, Europe/Warsaw display).
- **Routes:** build links with `paths` from `@/app/routes`.
- **Page titles:** each page calls `usePageTitle("…")` from `@/lib/seo`.
- Strict TS, no `any`. Small files (< ~250 lines); split components when they grow.

## Gotchas (learned from the Jedno API)

- Partner `category` comes with trailing spaces ("Organizacje ") — trimmed by the fetch script.
- News with `tag.toLowerCase() === "wydarzenie"` is an alias of the event with the **same id** (`isEventAlias`).
- `linkedEventPath` / notification `pathToContent` look like `general/events/2035` — parsed into ids by the script.
- CMS HTML contains Umbraco embeds `div.umb-embed-holder[data-embed-url]`, YouTube iframes, relative `<img src>`.
- `/api/events` list items have `description: null`; the script fetches `/api/events/{id}` for each.
- `POST /api/feedback` cannot be called from the browser (no CORS) — contact info page shows a mailto/app link.
- Instagram has no keyless API. Posts are listed by hand in `content/instagram/posts.json`
  (`[{ "url": "https://www.instagram.com/p/…/", "caption": null }]`) and shown with the official embed.
- Media URLs on `admin.jedno.net/media/...` accept `?width=` / `&height=` for responsive sizes.

## Testing & verification

- Unit/component tests live next to the code (`*.test.ts(x)`), Vitest + Testing Library (jsdom; IntersectionObserver
  and matchMedia are stubbed in `src/test/setup.ts`).
- `e2e/pages.spec.ts` visits every route on mobile + desktop, asserts one `<h1>`, no console errors and **zero axe
  WCAG 2.2 AA violations**. When adding a route, add it there. Runs in CI on push (blocks deploy if it fails).
- In the Claude Code cloud sandbox: Node's fetch needs
  `NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt npm run fetch-data`, and Playwright needs
  `PW_CHROMIUM_PATH=/opt/pw-browsers/chromium npm run e2e`.
- Visually check changes with screenshots at 390, 768 and 1440 px widths.
