# Posty z Instagrama (@archigdansk)

Instagram nie ma publicznego API bez tokenu, więc posty wybieramy ręcznie. Edytuj `content/instagram/posts.json`
i zrób commit na `main` — strona zbuduje się automatycznie i pokaże posty w zakładce **Media → Instagram**.

## Jak dodać post

1. Otwórz post na instagram.com i skopiuj jego adres (menu `…` → „Kopiuj link”).
2. Dodaj obiekt do tablicy w `posts.json` (najnowsze na górze):

```json
[
  {
    "url": "https://www.instagram.com/p/ABCDEFGHIJK/",
    "caption": "Krótki opis wyświetlany pod osadzeniem (opcjonalnie)"
  },
  {
    "url": "https://www.instagram.com/reel/LMNOPQRSTUV/",
    "caption": null
  }
]
```

- `url` — pełny permalink posta (`/p/…/` lub `/reel/…/`); musi być publiczny.
- `caption` — tekst dodatkowy albo `null`.
- Pusta tablica `[]` oznacza komunikat „Wkrótce pojawią się tu wybrane posty”.
