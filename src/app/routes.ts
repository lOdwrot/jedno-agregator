/** Central route paths. Always build links with these helpers, never hand-written strings. */
export const paths = {
  home: "/",
  news: "/aktualnosci",
  newsDetail: (id: number | string) => `/aktualnosci/${id}`,
  events: "/wydarzenia",
  eventDetail: (id: number | string) => `/wydarzenia/${id}`,
  communities: "/spolecznosci",
  media: "/media",
  mediaInstagram: "/media/instagram",
  info: (slug: string) => `/info/${slug}`,
  games: "/gry",
  game: (slug: string) => `/gry/${slug}`,
  uiCatalog: "/ui",
} as const;
