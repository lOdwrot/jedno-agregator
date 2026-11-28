/** The card album: every numbered card, the owned prints stacked under the rarest one. */
import type { Finish } from "../data/types";
import { ALBUM_ORDER } from "../data/numbers";
import { keyOf, type Profile } from "./profile";

/** Rarest first — the album shows the top owned print of a card. */
export const FINISH_ORDER: readonly Finish[] = ["stained", "gilded", "plain"];

export interface AlbumEntry {
  cardId: string;
  /** 1-based album number. */
  number: number;
  /** Copies owned of each print. */
  copies: Record<Finish, number>;
  /** All copies of the card, every print. */
  total: number;
  /** The rarest print owned (shown in the album), null = missing slot. */
  best: Finish | null;
  /** Owned prints, rarest first. */
  finishes: Finish[];
}

export function albumEntries(p: Profile): AlbumEntry[] {
  return ALBUM_ORDER.map((cardId, i) => {
    const copies = {} as Record<Finish, number>;
    for (const f of FINISH_ORDER) copies[f] = p.collection[keyOf(cardId, f)] ?? 0;
    const finishes = FINISH_ORDER.filter((f) => copies[f] > 0);
    return {
      cardId,
      number: i + 1,
      copies,
      total: finishes.reduce((s, f) => s + copies[f], 0),
      best: finishes[0] ?? null,
      finishes,
    };
  });
}

export interface AlbumTally {
  /** Different cards owned. */
  owned: number;
  total: number;
  /** Different cards owned in a gilded / stained print. */
  gilded: number;
  stained: number;
}

export function albumTally(entries: readonly AlbumEntry[]): AlbumTally {
  return {
    owned: entries.filter((e) => e.best).length,
    total: entries.length,
    gilded: entries.filter((e) => e.copies.gilded > 0).length,
    stained: entries.filter((e) => e.copies.stained > 0).length,
  };
}
