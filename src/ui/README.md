# `@/ui` — Jedno Web component library

Import everything from `@/ui` (`import { Button, Card, Section } from "@/ui"`). The barrel also imports `ui.css` (keyframes).
Tokens only (no hex). All user-facing strings are Polish. Animations respect `prefers-reduced-motion` automatically.
`ToastProvider` must wrap any tree that uses `useToast()` / `ShareButton` (the app shell should mount it once).
Components that link use react-router, so render them inside the router.

## Icons / logo

- `<Icon name="calendar" size={24} title? strokeWidth? className? />` — `currentColor`, aria-hidden unless `title` is given (then role=img).
  Names (`IconName`, list in `iconNames`): calendar calendarPlus mapPin bell menu close filter chevronLeft chevronRight chevronDown arrowRight arrowUpRight externalLink play search share copy check clock users newspaper video instagram youtube info mail home sparkle grid list.
- `<JednoLogo variant="full"|"mark" animated? size={40} className? title? />` — SVG mark (5 figures) + "Jedno" wordmark; `animated` = spring assemble on mount. Raster: `${import.meta.env.BASE_URL}logo.png`.

## Primitives

- `Button` — `variant: solid|navy|soft|outline|ghost|link`, `size: sm|md|lg`, `fullWidth`, `leftIcon`, `rightIcon`, `loading`, `magnetic`, `as`.
  `to="/path"` → router Link; `href="https://…"` → `<a>` (external ⇒ `target=_blank rel=noopener` + sr-only "(otwiera się w nowej karcie)"); otherwise `<button type="button">`.
  `<Button to={paths.events} variant="soft" rightIcon={<Icon name="arrowRight" size={20}/>}>Wydarzenia</Button>`
  (Note: `solid` = white bold text on orange; use `size="lg"` or bold large text for AA.) `buttonStyles({variant,size})` gives the class string.
- `IconButton` — `label` (required, aria-label), `variant: ghost|soft|solid|navy|glass`, `size: md|lg`, `badge` (accent dot), `to`, plus button props. `<IconButton label="Powiadomienia" badge><Icon name="bell"/></IconButton>`
- `Heading` — `level 1-4` (semantic) + `size: sm|md|lg|xl|2xl|hero` (visual, defaults by level) + `tone: default|light|accent`. `<Heading level={1} size="2xl">`
- `Text` — `variant: body|lead|meta|caption`, `as`. `Eyebrow` — small uppercase accent label.
- `Badge` — `tone: neutral|accent|navy|success|danger`.
- `Chip` — toggle: `pressed`, `onPressedChange`, `leftIcon` (aria-pressed).
- `ChipGroup` — single-select radiogroup: `label` (required), `options: {value,label,ariaLabel?}[]`, `value`/`defaultValue` (`string|null`), `onChange(value|null)`, `allowClear` (click active again → null). Arrow keys/Home/End move+select.
  `<ChipGroup label="Autor" options={opts} value={author} onChange={setAuthor} allowClear />`
- `DatePill` — `<DatePill>Jutro, 19:30</DatePill>` (calendar icon + text).
- `Card` — `interactive` (hover lift), `tilt` (3D + glare, fine pointer only), `to` (whole card is a Link; `linkLabel` for aria-label), `style` (e.g. `{ viewTransitionName: "card-12" }`), `as: div|li|article`, `className`.
  Content is clipped to the radius when `to` is set. `<Card to={paths.eventDetail(1)} tilt><SmartImage …/><div className="p-4">…</div></Card>`
- `SmartImage` — `src`, `alt` (required; "" if decorative), `aspect` ("16/9"), `srcSetWidths` ([320,640,960]; only admin.jedno.net: sets `width=`, drops `height=`), `sizes`, `priority` (eager), `zoomOnHover` (ken-burns when an ancestor has `group`), `className`, `imgClassName`, `style`. Fades/blur-up on load, gray placeholder, branded fallback on error/missing src. Helper `buildSrcSet(src, widths)`.
- `Avatar` — `name`, `src?`, `size` (px). Initials fallback.
- `Skeleton` (shimmer, aria-hidden; give size via className), `SkeletonCard`, `Spinner`.
- `Divider`, `VisuallyHidden` (sr-only span).
- Layout: `Container` (max-w-7xl, responsive padding; `narrow` = ~720px reading width; `as`), `Stack` (`gap` 1|2|3|4|6|8|12), `Cluster` (wrapping row; `gap`, `align: start|center|end|between`).
- `Link` — `to` (internal path, `mailto:`/`tel:`, or absolute URL → new tab + hint + arrow icon), `quiet`.

## Composites

- `Dialog` — `open`, `onClose`, `title` (required, aria-labelledby), `hideTitle`, `description`, `size: sm|md|lg|xl`, children. Native `<dialog>`; focus trap, Esc/backdrop/X closes, focus restored, body scroll locked.
  `<Dialog open={o} onClose={() => setO(false)} title="Zespół">…</Dialog>` — control it with state; render always, it mounts content only when open.
- `Sheet` — same props + `side: right|left` (desktop). Bottom sheet on mobile with #D2D9DF drag handle look, side panel from `md`.
- `Tabs` — `label` (required), `items: {value,label,content?,to?,icon?}[]`, `value`/`defaultValue`/`onChange`. Button mode renders tabpanels from `content`; if items have `to`, renders a `<nav>` of router links (control `value` from the route) with `aria-current="page"`. Animated sliding indicator.
- `Select` — styled native select: `label` (required), `hideLabel`, `options: {value,label}[]`, `value`, `onChange(value)`, `placeholder` (adds empty "all" option with value "").
- `Carousel` — `label` (required, region "karuzela"), `slideClassName` (width classes, default `w-[80%] sm:w-[45%] lg:w-[30%]`), children = slides. Scroll-snap, prev/next (md+), arrow keys, edge fades.
- `Marquee` — `label`, `duration` (s), children (chips/logos). Pause on hover/focus + pause button; static wrapped list under reduced motion.
- `ToastProvider` + `useToast()` → `toast(message, { tone?: default|success|danger, duration? })`.
- `EmptyState` (`title`, `description`, `icon`, `action`), `ErrorState` (`title?`, `message?`, `onRetry` → "Spróbuj ponownie" button, role=alert), `LoadingState` (`label` default "Ładowanie…", children = skeleton layout; role=status).
- `Section` — `title`, `eyebrow`, `action: {label,to}` (right-side link), `level 2|3`, `reveal` (default true). Renders `<section aria-labelledby>`.
  `<Section title="Najbliższe wydarzenia" action={{ label: "Wszystkie wydarzenia", to: paths.events }}>…</Section>`
- `PageHeader` — `title` (the page's single `<h1>`, SplitText), `accent` (serif italic word after title), `eyebrow`, `description`, `actions` (right slot, e.g. filter IconButton with `badge`).
- `YouTubeEmbed` — `{ videoId, title, className?, autoplay? }`. Facade → iframe (youtube-nocookie) on click. 16:9.
- `InstagramEmbed` — `{ url, caption?, className? }`; loads embed.js once and calls `instgrm.Embeds.process()`; placeholder card with "Zobacz post na Instagramie" link until the embed renders.
- `ShareButton` — `title`, `text?`, `url?` (default current URL) + Button props (`variant` default soft, `size`). Web Share API else clipboard + toast. Needs `ToastProvider`.
- `RichText` — `{ html, className? }` for CMS HTML (implemented separately in composites/RichText.tsx).

## Effects

- `Reveal` — `delay`, `y`, `once`, `as`, `className`: fade/slide-up in viewport. `RevealGroup` (`stagger`, `as`) + `RevealItem` (`as`) for staggered children.
- `SplitText` — `text` (string), `by: word|letter`, `stagger`, `delay`, `trigger: mount|inView`. Accessible (aria-label on wrapper). Inline element: put inside a Heading.
- `Spotlight` — wrapper `div` with cursor-following light (`size`), children above it.
- `Parallax` — `distance` px, wraps content.
- `ScrollProgress` — fixed top reading bar (decorative); mount once on article pages.
- `AnimatedBlobs` — absolute `-z-10` decorative blobs; parent needs `relative isolate overflow-hidden`.
- `Magnetic` — `strength`; wrap any inline-block content.
- `Counter` — `value`, `duration`; counts up on view, final number always in DOM (sr-only).
- `BrushUnderline` — wraps a word, draws SVG stroke on view (`strokeClassName`, e.g. `text-logo-yellow`).
- `Grain` — noise overlay (`opacity`), put inside a `relative` parent.
- Hooks: `usePrefersReducedMotion()`, `useMediaQuery(query)`, `useFinePointer()`.

Demo of everything: route `/ui` (`src/ui/catalog`).
