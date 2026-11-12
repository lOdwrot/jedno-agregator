# Jedno Agregator — plan

Webowa witryna (React SPA, GitHub Pages, bez własnego backendu) agregująca treści z **Jedno** (admin.jedno.net), **YouTube @ArchiGdansk** i **Instagram @archigdansk**. Wizualnie nawiązuje do aplikacji mobilnej Jedno.

---

## 1. Ustalenia z researchu (stan na 2026-11-12)

### API Jedno (`https://admin.jedno.net`, nagłówek `x-api-key`)
| Endpoint | Zawartość | Wolumen |
|---|---|---|
| `GET /api/news?pageNumber&pageSize[&author]` | lista aktualności (bez `text`) | ~25 |
| `GET /api/news/{id}` | szczegół z HTML `text` | — |
| `GET /api/news/authors`, `/api/news/tags` | słowniki filtrów | 9 autorów |
| `GET /api/events?pageNumber&pageSize[&tag][&author]` | nadchodzące wydarzenia (`description` = null na liście) | ~11 |
| `GET /api/events/{id}` | szczegół z HTML `description` | — |
| `GET /api/events/tags` | Uwielbienie, Koncert, Rekolekcje… | 6 |
| `GET /api/partners` | Społeczności (`category`: „Organizacje ” — **ze spacją**, „Wspólnoty”) | 9 |
| `GET /api/infos` | O aplikacji / Dołącz jako Autor / Skontaktuj się (hasForm) | 3 |
| `GET /api/notifications?dateFrom&festivalEnabled=false` | ogłoszenia z `pathToContent` (`general/events/{id}`, `general/news/{id}`) | — |
| `POST /api/feedback` | formularz kontaktowy | — |

Szczegóły zachowania aplikacji: news z `tag === "wydarzenie"` otwiera event o tym samym id; `linkedEventPath` → przycisk „Przejdź do wydarzenia”; HTML z Umbraco zawiera `div.umb-embed-holder[data-embed-url]` i iframe YouTube; obrazki w HTML mogą mieć ścieżki względne (prefiks API URL). Obrazy `/media/...` są publiczne (bez klucza).

### ⚠️ Kluczowe ograniczenie: brak CORS
API **nie zwraca nagłówków `Access-Control-Allow-*`**, a preflight `OPTIONS` (wymuszony przez nagłówek `x-api-key`) zwraca **404**. Przeglądarka nie może więc wołać API bezpośrednio. Dodatkowo klucz API w kodzie frontendu byłby publiczny.

### YouTube
Kanał `UCCo78wXTUrPfihoCH7ghT-A`. Publiczny RSS `youtube.com/feeds/videos.xml?channel_id=…` działa (15 najnowszych filmów, tytuł, opis, miniatura, data, wyświetlenia), ale też **bez CORS**.

### Instagram
Brak legalnego publicznego API bez tokenu; scrapowanie profilu jest blokowane przez Instagram (i naruszałoby regulamin) — nie będę go obchodzić.

---

## 2. Architektura danych: „statyczny snapshot” budowany przez GitHub Actions

```
            cron co 30 min / push / ręcznie
GitHub Actions ─────────────────────────────────────────┐
  scripts/fetch-data.ts (Node 22)                       │
   ├─ Jedno API (klucz z sekretu JEDNO_API_KEY)         │
   │    news + szczegóły, events + szczegóły, partners, │
   │    infos, notifications, słowniki                  │
   ├─ YouTube RSS → videos.json                         │
   └─ Instagram → instagram.json (patrz niżej)          │
  → public/data/*.json  → vite build → deploy Pages ────┘

Przeglądarka: React Query → fetch(`${BASE}data/news.json`) …
Obrazy: hotlink admin.jedno.net/media (?width=… do responsywnych srcset) i i.ytimg.com
```

Zalety: zero backendu, klucz API nigdy nie trafia do przeglądarki, strona działa nawet gdy API leży (ostatni snapshot), błyskawiczne ładowanie. Wada: opóźnienie danych do ~30 min (akceptowalne dla aktualności/wydarzeń).

- `src/data/source.ts` — jedna warstwa dostępu; tryb `snapshot` (prod) lub `live` (dev przez proxy Vite, przyszłościowo gdyby backend dodał CORS). Komponenty nie wiedzą skąd są dane.
- Skrypt normalizuje dane (trim kategorii, parsowanie dat, sortowanie, absolutne URL w HTML) i waliduje je schematami **zod** (te same typy w skrypcie i aplikacji). Jeśli źródło zawiedzie — zostaje poprzedni snapshot (pobierany z opublikowanej strony), build nie pada.
- **Formularz „Skontaktuj się”**: `POST /api/feedback` nie zadziała bez CORS → pokazujemy treść info + `mailto:`/link do aplikacji. (Gdyby dodano CORS dla `lodwrot.github.io` — włączamy formularz flagą.)
- **YouTube**: RSS daje 15 ostatnich; skrypt **akumuluje** archiwum (scala z poprzednim snapshotem), więc lista z czasem rośnie. Opcjonalnie później: YouTube Data API v3 (klucz w sekrecie) dla pełnego archiwum i playlist.
- **Instagram** — patrz pytanie na końcu. Rekomendacja: `content/instagram/` w repo (zdjęcia + `posts.json` z podpisem, datą i linkiem do posta) dodawane ręcznie; skrypt umie też w przyszłości czytać **Instagram Graph API** (token konta archigdansk w sekrecie `IG_TOKEN`) — wtedy galeria aktualizuje się sama.

---

## 3. Stack

| Obszar | Wybór |
|---|---|
| Build | **Vite 6 + React 19 + TypeScript strict** |
| Dane | **@tanstack/react-query v5** (+ devtools w dev) |
| Routing | **react-router v7** (BrowserRouter z `basename=/jedno-agregator/` + trik `404.html` dla deep linków na Pages) |
| Style | **Tailwind CSS v4** (`@theme` z tokenami), `clsx` + `tailwind-merge` → `cn()`, warianty przez `tailwind-variants` |
| Animacje | **motion** (Framer Motion) + natywne **View Transitions API** + CSS scroll-driven animations; wszystko wyłączane przy `prefers-reduced-motion` |
| HTML z CMS | **DOMPurify** + własny renderer (embedy YouTube → nasz player) |
| Daty | **date-fns v4** z `pl` (port formatterów z aplikacji: „Jutro, 19:30”, „Jutro – piątek, 13 listopada”) |
| Fonty | self-hosted przez **@fontsource**: **Bricolage Grotesque** (nagłówki, wariabilny), **Lato** (tekst — jak w aplikacji), **Instrument Serif** italic (akcenty/cytaty). Wszystkie z polskimi znakami. |
| Jakość | ESLint (+ `jsx-a11y`), Prettier, **Vitest** + Testing Library (utils, komponenty UI), **Playwright** smoke + **axe-core** w CI |

---

## 4. Design system „Jedno Web”

**Tokeny (z aplikacji):** navy `#0E2335` (primary), pomarańcz `#E8672A` (accent), tło `#F0F2F5`, powierzchnia `#FFFFFF`, tekst `#151E26`, meta `#6B7280`, chip `#F3F4F5`, karty radius 16, pill radius 24, kolory logo (pomarańcz, granat, żółty, czerwony, niebieski) do akcentów/gradientów.
**Dostępność koloru:** `#E8672A` na białym ma kontrast ~3.2:1 → do tekstu wprowadzam `accent-ink #B9501C` (≥4.5:1); jasny pomarańcz tylko na dużych elementach/tle z białym bold tekstem ≥18px lub dekoracjach. Tryb ciemny (navy jako tło) — opcjonalnie w fazie 2.

**Własna biblioteka komponentów `src/ui/`** (od zera, bez gotowych bibliotek UI), każdy komponent: typy, warianty, obsługa klawiatury/ARIA, story-like przykład w `/ui` (ukryta strona „katalog komponentów” do podglądu dla AI i ludzi):

- Prymitywy: `Button` (warianty solid/soft/ghost/link, magnetyczny hover), `IconButton`, `Link`, `Heading`, `Text`, `Badge`, `Chip`/`ChipGroup` (role radio/toggle), `Card` (tilt 3D + glare), `Image` (blur-up, aspect-ratio, srcset dla `?width=`), `Avatar`, `Skeleton` (shimmer), `Divider`, `Icon` (zestaw SVG inline)
- Kompozycje: `Dialog`/`Sheet` (focus trap, Esc, `inert` tła), `Tabs` (roving tabindex, animowany wskaźnik), `Select`/`Combobox` dla filtrów, `Carousel` (scroll-snap + przyciski + klawiatura), `Marquee`, `Tooltip`, `Toast`, `EmptyState`, `ErrorState` (retry), `Section`
- Efekty: `Reveal` (stagger przy wejściu w viewport), `SplitText` (animacja liter nagłówków), `Spotlight` (światło za kursorem), `Parallax`, `ScrollProgress`, `AnimatedBlobs` (płynne „wstęgi” w kolorach logo), `Counter`, `Magnetic`
- Ikony: własny mały zestaw SVG (kalendarz, pinezka, dzwonek, play, filtr, strzałki…) — bez paczki ikon.

**Efekty „niekonwencjonalne ale czytelne”:**
- Hero ze stopniowo „składającym się” logotypem Jedno (5 kolorowych figur z logo animowanych jako SVG) i wstęgami gradientu reagującymi na kursor/scroll.
- Przejście lista → szczegół jako **View Transition** (obrazek karty „morfuje” w nagłówek szczegółu).
- Karty z delikatnym 3D tilt + odblaskiem; obrazy z efektem „ken burns” na hover.
- Nagłówki sekcji z animacją liter i podkreśleniem rysowanym „pędzlem” (SVG stroke).
- Oś czasu wydarzeń: sticky nagłówki dni, linia czasu rysowana scrollem (scroll-driven CSS), odliczanie do najbliższego wydarzenia.
- Marquee autorów/społeczności; licznik „X wydarzeń w tym tygodniu”.
- Media: siatka „bento” filmów, odtwarzacz otwierany w Dialog z animacją layoutu (lite-embed: miniatura → iframe `youtube-nocookie.com` dopiero po kliknięciu); galeria IG w układzie masonry z lightboxem.
- Kursor-spotlight na hero, pasek postępu czytania w artykułach, ziarno (grain) na tłach.
- Wszystko: `prefers-reduced-motion` → statyczne wersje; animujemy tylko `transform`/`opacity`.

**Dostępność (cel WCAG 2.2 AA):** semantyczne landmarki, skip-link, jedna `h1` na stronę, widoczny `:focus-visible`, pełna obsługa klawiatury, `aria-live` dla ładowania/filtrów, alt dla obrazów (tytuł gdy brak), `lang="pl"`, tytuły stron per route + przeniesienie fokusu po nawigacji, cele dotyku ≥44px, kontrast, axe w CI.

---

## 5. Strony (routes) i responsywność

Layout: na mobile — header z logo + dzwonek, **dolna nawigacja jak w aplikacji** (Aktualności / Wydarzenia / Społeczności / Media); na desktopie — górny pasek nawigacji z animowanym wskaźnikiem, szersze siatki (1 → 2 → 3/4 kolumny), max szerokość treści ~1280px, artykuły ~720px.

| Route | Zawartość |
|---|---|
| `/` Start | Hero, **Najbliższe wydarzenia** (karuzela kart jak w aplikacji, chip „Jutro, 19:30”), najnowsze aktualności (bento), najnowsze filmy, pasek Instagram, marquee społeczności |
| `/aktualnosci` | Lista z filtrem autora (Sheet „Filtruj aktualności” na mobile / pasek chipów na desktop), stany filtra w URL (`?autor=`) |
| `/aktualnosci/:id` | Obraz, „dd.MM.yyyy \| autor”, tytuł, podtytuł, HTML, embedy YouTube, CTA „Przejdź do wydarzenia”, udostępnij (Web Share API / kopiuj link) |
| `/wydarzenia` | Grupowanie po dniach („Jutro – piątek, 13 listopada”), filtry Kategoria + Autor (w URL), widok listy / kompaktowy kalendarz miesiąca |
| `/wydarzenia/:id` | Data/zakres, **„Dodaj do kalendarza”** (plik `.ics` generowany w przeglądarce + link Google Calendar), lokalizacja + „Otwórz w mapach”, opis HTML |
| `/spolecznosci` | Chipy kategorii (dynamiczne z danych), karty z logo, rozwijany opis (Dialog ze szczegółem) |
| `/media` | Zakładki **Filmy** (YouTube) / **Instagram**; filmy: wyróżniony najnowszy + siatka, wyszukiwarka po tytule |
| `/info/:slug` | Strony z `/api/infos` (O aplikacji, Dołącz jako Autor, Kontakt) — linki w stopce |
| Panel „Ogłoszenia” | Dzwonek → Sheet z powiadomieniami z ostatnich 30 dni, kropka „nowe” (lastSeen w localStorage), klik → deep link |
| `/ui` | Katalog komponentów (noindex) |
| `*` | 404 z animacją |

Plus: meta OG/Twitter, favicon z logo, `manifest.webmanifest`, linki do pobrania aplikacji Jedno (App Store / Google Play — podasz URL-e albo pominę).

---

## 6. Struktura repo (pod utrzymanie przez AI)

```
jedno-agregator/
├─ CLAUDE.md                 # zasady projektu, komendy, konwencje, gdzie co dodawać
├─ docs/PLAN.md, docs/ARCHITECTURE.md
├─ .github/workflows/deploy.yml   # push main + cron */30 + workflow_dispatch → test → fetch-data → build → Pages
├─ scripts/
│  ├─ fetch-data.ts          # orkiestracja snapshotu
│  └─ sources/{jedno,youtube,instagram}.ts
├─ content/instagram/        # ręcznie dodawane zdjęcia + posts.json
├─ public/                   # favicon, logo, 404.html, data/ (generowane, w .gitignore)
├─ src/
│  ├─ main.tsx, app/         # App, router, providers, Layout, Header, BottomNav, Footer
│  ├─ ui/                    # BIBLIOTEKA KOMPONENTÓW (index.ts eksportuje wszystko)
│  │  ├─ primitives/  composites/  effects/  icons/  README.md
│  ├─ styles/                # tailwind.css (@theme tokens), fonts.css
│  ├─ data/                  # schemas.ts (zod, współdzielone ze skryptem), source.ts, queryClient.ts
│  ├─ features/
│  │  ├─ home/  news/  events/  communities/  media/  infos/  notifications/
│  │  │   └─ każdy: api.ts (hooki React Query), components/, pages/, utils
│  ├─ lib/                   # dates.ts, html.ts (sanitize+render), ics.ts, cn.ts, seo.ts
│  └─ test/                  # setup Vitest
└─ e2e/                      # Playwright smoke + axe
```

Reguły w CLAUDE.md: feature-first; komponenty UI tylko z `src/ui`; dane tylko przez hooki `features/*/api.ts`; brak magicznych kolorów (tylko tokeny); każdy nowy komponent UI → przykład w `/ui` + test.

---

## 7. Wdrożenie

- GitHub Pages ze źródłem **GitHub Actions**, URL: `https://lodwrot.github.io/jedno-agregator/`.
- **Wymagane od Ciebie (jednorazowo):** w repo `jedno-agregator` → Settings → Secrets → Actions dodać `JEDNO_API_KEY` (nie zapisuję klucza w repo), oraz Settings → Pages → Source: „GitHub Actions” (spróbuję ustawić workflowem, ale może wymagać ręcznego kliknięcia).
- Commity bezpośrednio na `main` w jedno-agregator (zgodnie z prośbą).

---

## 8. Plan realizacji agentami (Sonnet 5.5)

| Faza | Agent | Zakres | Równolegle? |
|---|---|---|---|
| 0 | ja | scaffold Vite/TS/Tailwind/ESLint/Vitest, tokeny, fonty, `CLAUDE.md`, szkielet routera z pustymi stronami, `schemas.ts` | — |
| 1a | Sonnet „UI” | cała biblioteka `src/ui` + strona `/ui` + testy | ✔ |
| 1b | Sonnet „Data/CI” | `scripts/fetch-data.ts` + źródła, `source.ts`, workflow Actions, 404.html, lib (dates, html, ics) + testy | ✔ |
| 2a | Sonnet „News+Home” | Start + Aktualności (lista, filtr, szczegół) | ✔ |
| 2b | Sonnet „Events” | Wydarzenia (oś czasu, filtry, szczegół, kalendarz/ICS) | ✔ |
| 2c | Sonnet „Communities+Infos+Ogłoszenia” | Społeczności, Info, panel ogłoszeń | ✔ |
| 2d | Sonnet „Media” | YouTube + Instagram | ✔ |
| 3 | ja | integracja, przegląd kodu, testy, screenshoty Playwright (mobile/tablet/desktop), axe, poprawki, push na `main`, deploy, weryfikacja na żywo | — |

Każdy agent dostaje: ten plan, CLAUDE.md, listę plików, które posiada (unikamy konfliktów), i kryteria akceptacji (`tsc`, `lint`, `test`, `build` zielone).
