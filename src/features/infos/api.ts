/** Data hooks for info pages (O aplikacji, Dołącz jako Autor, Kontakt). Source: public/data/infos.json. */
import { useSnapshot } from "@/data/useSnapshot";

export function useInfos() {
  return useSnapshot("infos");
}

export function useInfo(slug: string) {
  return useSnapshot("infos", { select: (items) => items.find((i) => i.slug === slug) ?? null });
}
