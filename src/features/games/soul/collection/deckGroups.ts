import { getCard } from "../data/cards";
import type { CardDef } from "../data/types";
import { parseKey, type CardKey } from "./profile";

export type DeckGroupId = "popes" | "characters" | "supporters" | "items" | "places";

export interface DeckGroup {
  id: DeckGroupId;
  label: string;
  /** Each entry is a stack of keys shown one under another (an evolution line, or a single card). */
  stacks: CardKey[][];
}

const LABELS: Record<DeckGroupId, string> = {
  popes: "Papieże",
  characters: "Postacie",
  supporters: "Pomocnicy",
  items: "Przedmioty",
  places: "Miejsca",
};
const GROUP_ORDER: DeckGroupId[] = ["popes", "characters", "supporters", "items", "places"];
const RANK = { common: 0, uncommon: 1, rare: 2, legendary: 3 } as const;
const FINISH_RANK = { plain: 0, gilded: 1, stained: 2 } as const;

export const isPope = (c: CardDef) => c.kind === "character" && /papież/i.test(c.subtitle ?? "");

function groupOf(c: CardDef): DeckGroupId | null {
  switch (c.kind) {
    case "character":
      return isPope(c) ? "popes" : "characters";
    case "supporter":
      return "supporters";
    case "item":
      return "items";
    case "place":
      return "places";
    default:
      return null;
  }
}

const byCard = (a: CardDef, b: CardDef) =>
  RANK[b.rarity] - RANK[a.rarity] || a.name.localeCompare(b.name, "pl");

/**
 * Split owned card keys into deck-builder sections. Characters that evolve are kept together:
 * a stack starts at the lowest owned stage and lists each next stage below it.
 */
export function groupDeckKeys(keys: readonly CardKey[]): DeckGroup[] {
  // Card id → its owned keys (plain first, then rarer finishes).
  const byId = new Map<string, CardKey[]>();
  for (const k of keys) {
    const id = parseKey(k).cardId;
    byId.set(id, [...(byId.get(id) ?? []), k]);
  }
  for (const list of byId.values())
    list.sort((a, b) => FINISH_RANK[parseKey(a).finish] - FINISH_RANK[parseKey(b).finish]);

  const cards = [...byId.keys()].map(getCard);
  const children = new Map<string, CardDef[]>();
  for (const c of cards) {
    if (c.kind === "character" && c.evolvesFrom && byId.has(c.evolvesFrom))
      children.set(c.evolvesFrom, [...(children.get(c.evolvesFrom) ?? []), c]);
  }

  const chain = (c: CardDef): CardKey[] => [
    ...(byId.get(c.id) ?? []),
    ...(children.get(c.id) ?? []).sort(byCard).flatMap(chain),
  ];

  const groups = new Map<DeckGroupId, { root: CardDef; keys: CardKey[] }[]>();
  for (const c of cards) {
    const g = groupOf(c);
    if (!g) continue;
    const isRoot = !(c.kind === "character" && c.evolvesFrom && byId.has(c.evolvesFrom));
    if (!isRoot) continue;
    groups.set(g, [...(groups.get(g) ?? []), { root: c, keys: chain(c) }]);
  }

  return GROUP_ORDER.filter((id) => groups.has(id)).map((id) => ({
    id,
    label: LABELS[id],
    stacks: groups
      .get(id)!
      .sort((a, b) => {
        // Evolution lines first, then single cards.
        const la = a.keys.length > 1 && new Set(a.keys.map((k) => parseKey(k).cardId)).size > 1;
        const lb = b.keys.length > 1 && new Set(b.keys.map((k) => parseKey(k).cardId)).size > 1;
        return Number(lb) - Number(la) || byCard(a.root, b.root);
      })
      .map((s) => s.keys),
  }));
}
