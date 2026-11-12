# Jedno Agregator

Statyczna strona agregująca treści Archidiecezji Gdańskiej: **aktualności, wydarzenia i społeczności** z systemu Jedno
(ten sam backend co aplikacja mobilna Jedno), **filmy z YouTube @ArchiGdansk** oraz **posty z Instagrama @archigdansk**.

🌐 **https://lodwrot.github.io/jedno-agregator/**

## Jak to działa

Brak własnego backendu. GitHub Actions co 30 minut (i przy każdym pushu na `main`) pobiera dane
z API Jedno i kanału RSS YouTube, zapisuje je jako pliki JSON i publikuje stronę na GitHub Pages.
Przeglądarka czyta tylko te pliki — klucz API nigdy nie trafia do klienta.

| Co | Gdzie |
| --- | --- |
| Klucz API Jedno | sekret repozytorium `JEDNO_API_KEY` |
| Posty z Instagrama | `content/instagram/posts.json` (instrukcja: `content/instagram/README.md`) |
| Kolory, fonty, promienie | `src/styles/index.css` (`@theme`) |
| Biblioteka komponentów | `src/ui` (+ podgląd na stronie `/ui`) |

## Praca lokalna

```bash
npm ci
cp .env.example .env    # uzupełnij JEDNO_API_KEY
npm run fetch-data      # pobierz dane do public/data
npm run dev
```

Kontrola jakości: `npm run check` (TypeScript + ESLint + Vitest), `npm run build && npm run e2e` (Playwright + axe).

Szczegóły architektury i konwencji: [CLAUDE.md](CLAUDE.md), plan: [docs/PLAN.md](docs/PLAN.md).
