/** Data hooks for communities ("Społeczności" = API partners). Source: public/data/partners.json. */
import { useSnapshot } from "@/data/useSnapshot";
import type { Partner } from "@/data/schemas";

export function filterPartners(items: Partner[], category?: string | null): Partner[] {
  return category ? items.filter((p) => p.category === category) : items;
}

export function usePartners(category?: string | null) {
  return useSnapshot("partners", { select: (items) => filterPartners(items, category) });
}

/** Sorted unique categories, e.g. ["Organizacje", "Wspólnoty"] — dynamic, never hardcode. */
export function usePartnerCategories() {
  return useSnapshot("partners", {
    select: (items) =>
      [...new Set(items.map((p) => p.category).filter((c): c is string => !!c))].sort((a, b) =>
        a.localeCompare(b, "pl"),
      ),
  });
}
