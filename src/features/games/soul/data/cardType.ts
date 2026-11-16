import { getCard } from "./cards";
import { ENERGY_LABEL, type CardDef } from "./types";

/** What a card is, at a glance: basic character, evolution stage, item, supporter, place or energy. */
export type CardType = "basic" | "stage1" | "stage2" | "item" | "supporter" | "place" | "energy";

export const CARD_TYPE_INFO: Record<CardType, { icon: string; label: string }> = {
  basic: { icon: "🌱", label: "Postać podstawowa" },
  stage1: { icon: "🌿", label: "Rozwój I" },
  stage2: { icon: "🌳", label: "Rozwój II" },
  item: { icon: "🎒", label: "Przedmiot" },
  supporter: { icon: "🤝", label: "Pomocnik" },
  place: { icon: "🏛️", label: "Miejsce" },
  energy: { icon: "✨", label: "Energia" },
};

/** Evolution depth of a character: 0 basic, 1 stage 1, 2 stage 2. */
export function evolutionStage(c: CardDef): number {
  let n = 0;
  for (let d = c; d.kind === "character" && d.evolvesFrom; d = getCard(d.evolvesFrom)) n++;
  return n;
}

export function cardType(c: CardDef): CardType {
  if (c.kind !== "character") return c.kind;
  const s = evolutionStage(c);
  return s === 0 ? "basic" : s === 1 ? "stage1" : "stage2";
}

/** Icon + label of the card's type (energy shows its side's own symbol: ✨ grace, 🔥 temptation). */
export function cardTypeBadge(c: CardDef): { type: CardType; icon: string; label: string } {
  const type = cardType(c);
  const info = CARD_TYPE_INFO[type];
  return {
    type,
    icon: type === "energy" ? ENERGY_LABEL[c.side].emoji : info.icon,
    label: type === "energy" ? `Energia: ${ENERGY_LABEL[c.side].name}` : info.label,
  };
}
