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
`arka-noego` (memory, `?poziom=latwy|sredni|trudny`), `mury-jerycha` (rhythm game).
Shared juice: `games/audio` (Web Audio synth + `sfx` library + global persisted mute, `SoundToggle` on the game page),
`games/fx` (`useFx` + `<Particles>` in the SVG world, `shake`/`pop`/`wobble` via WAAPI, `<Confetti>`). Effects react to
state transitions in `use*Reactions` hooks; everything decorative is skipped under reduced motion.
`walka-o-dusze` (`soul/`) is a single-player trading-card game: pure engine in `soul/engine` (every move goes through
`dispatch`; `dispatchFrames` also records one animation frame per event via `emit`), collection/boosters in
`soul/collection` (localStorage), and a full-screen duel drawn with **PixiJS** in `soul/board` (lazy-loaded; tweens in
`tween.ts`, one animation + sound per event in `playFrame.ts`, Web Audio sfx/music in `soul/audio`; the default "church" music is calm and cheerful — D major only, pentatonic bells, no tritones/minor seconds even on the demons' turn (`musicPlan.test.ts` enforces it) — and grows with the score: `musicPlan.ts` maps the leading soul count to 4 intensity levels, the last soul is a fast, bright finale). The canvas is
`aria-hidden`; an invisible layer of real `<button>`s (from the same pure `layout.ts`) keeps it keyboard/screen-reader
accessible and handles drag & drop.
Trainer rules: items never just draw N cards (drawing is for supporters); Różaniec/Powiadomienie are Trekking
Shoes-like `peek` cards — they set `g.peek` and every move except `{ type: "peek", keep }` is rejected until it is answered.
Decks have 50 cards (`DECK_SIZE`); the discard pile is never reshuffled — a player who must draw at the start of
their turn from an empty deck loses. `search` cards (Ogłoszenia parafialne / Algorytm, like Ultra Ball) set `g.search`
and wait for `{ type: "search", discard, pick }` (same blocking rule as `peek`, see `choicePending`); `recoverCharacter` /
`recycle` take cards back from the discard pile. `searchEnergy` attacks take an optional `target` (benched uid) on the
`attack` action — the UI asks via `benchEnergyTargets` when more than one benched character could get the energy.
Every pope (legendary, 2 souls) is a stage 1 evolution of the single common basic `kandydat` (Kandydat na papieża) —
none can be played straight from the hand (`popes.test.ts`); the starter deck holds 2 candidates and profile v4
migration gives them to older saves (in place of grace when the deck already has popes). The "Papieże wieków" booster
always opens with a candidate (`odds.first`: 15% stained, 35% gilded); in other packs it is an ordinary common.
Usable activated abilities get a visible "✦ Moc" button right on the card on the table (`board/AbilityButtons.tsx`,
`readyAbilities` in `engine/abilities.ts`) — no need to open the card details.
Gilded / stained prints look prestigious: a drifting foil background (DOM: `PrestigeLayers` + `.soul-foil*` in
`index.css`; canvas: `board/prestige.ts`), stained prints add lead-lined glass panes, a glass reflection and — while
active (active slot, hovered, dragged; DOM: `active` prop or hover/focus) — a rainbow aura with rising sparkles.
Character faces show the weakness badge (`SŁABOŚĆ <emoji> ×2`) so it is readable on the table without opening the card. Opponents may carry an `AiBoost` (energy on the starting active from the
deck, extra draws per turn) — `zastepy` (Smocze Zastępy, "bardzo trudny": 2 energy on the start, no extra draw) sits between `pycha` and `otchlan`, the extreme level with the arch-demons (Lucyfer, Abaddon, Acedia).
The top level is `niepokonany` (Tron Bestii, "niepokonany": ~10× harder than `otchlan` in AI-vs-AI sims): it plays the
apocalyptic cards from `soul/data/abyss.ts` (Bestia z morza, Fałszywy Prorok, Legion, Jeździec na rudym koniu — `energyOnce`, Duch tego świata — the `noWeakness`
ability: works from the bench, none of the owner's characters has a weakness —, Babilon Wielki, Ojciec kłamstwa, Złoty
kielich — a supporter, like Fałszywa obietnica). The extreme helpers are evolutions of weak base forms (`soul/data/abyssBasics.ts`:
Wilk w owczej skórze → Prorok, Iskra niezgody → Jeździec, Owczy pęd → Duch tego świata; Bies Wygody → Belfegor in `sloth.ts`;
three-stage: Fala z otchłani → Mały róg → Bestia z morza, Tylko ten jeden raz → Kajdany nałogu → Legion;
`abyss.test.ts` enforces it, every evolution in a deck comes with its base form). Rebalance with AI-vs-AI sims so the
win rate keeps falling monotonically from `kanapa` to `niepokonany`; its whole deck is printed `stained` (`Opponent.finish`), it starts with 3 energy and draws 1 extra card a turn.
The court of sloth (`soul/data/sloth.ts`: Duszek Marazmu → Bies Obojętności → Letarg, Duch Letniości, Belfegor) is
played only by the harder opponents (`zastepy`, `otchlan`, `niepokonany`; `sloth.test.ts` enforces it). The AI benches team helpers first (`bestBenchBasic` / `benchValue` in `engine/state.ts`). `Opponent.theme: "infernal"` switches
the duel to the hellish look and sound: `board/inferno.ts` (lava cracks, red glow, rising embers — static under reduced
motion; colours `hell-*`/`ember` in a `@theme static` block so the canvas can read them) and `audio/musicInfernal.ts`
(detuned tritone clusters, drone, heartbeat, cracked bell; no bright finale).
**Multiplayer** (tab "Multiplayer", `soul/pvp/`): two people, each with their own deck, over WebRTC (PeerJS —
the free broker `0.peerjs.com` only introduces the browsers; `VITE_PEER_SERVER` points to another one, e.g. a local
`peer` server for tests). The host registers `jedno-wod-<4 digits>`, the guest types the code. Lock-step sync
(`pvp/sync.ts`): the host orders every move and sends `apply` + a state checksum, the guest replays it on the same
deterministic engine (resync with the full state on mismatch). The engine always calls the host `"me"` and the
guest `"ai"` (`g.pvp` set: no AI, both sides `parish`, both pick their first character, chained promotes); the guest's
screen shows `flipGame(g)`. Log lines about a player's move go through `say(g, pid, mine, solo, rival)` so each
person reads them from their side (`g.pvp.log` / `g.pvp.reason` hold the guest's copy). No talents for PvP.
Bump `PROTOCOL` in `pvp/protocol.ts` whenever the engine or messages change.
**Rank** (`soul/rank/`): `Profile.xp` points shown at the top of the hub (`RankMeter`: patron portrait above the progress
bar; tapping the patron opens `PatronDialog` with the story + the ladder). 11 ranks in `ranks.ts`, each with a patron
whose picture is a card art key. `xp.ts`: every step costs more (`stepCost`), a win gives `WIN_XP[difficulty]`, a defeat or
forfeit costs `lossXp` (depends only on the rank, never below 0 — ranks can drop). `DuelResult` animates `from → to`
through every crossed boundary (`rankStops`) with a flip/burst on promotion and a sinking swap on demotion. PvP doesn't count.
Card pictures: `public/soul/art/<key>.webp` (Wikimedia Commons, PD/CC — every file needs a credit entry in
`soul/data/art.ts`, shown under "Źródła ilustracji"; `art.test.ts` enforces it). Booster editions + odds live in
`soul/collection/packs.ts`; harder opponents carry `Opponent.fee` (paid with the `FeePayment` animation before the duel) and
`Opponent.prize` (edition odds of a free booster opened right after a win, listed in `PrizeTable`); every fee opponent can also be
fought as a free practice duel ("Trenuj", `SoloDuel training`): no fee, no talents/booster/record; signature attacks (unique fx + sound) in `soul/board/signatures.ts` + `soul/audio/signatures.ts`.

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
