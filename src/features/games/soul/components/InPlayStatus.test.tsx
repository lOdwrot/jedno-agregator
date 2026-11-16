import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { deckList, newProfile } from "../collection/profile";
import { OPPONENTS } from "../data/opponents";
import type { DeckList, InPlay } from "../engine/state";
import { startedGame } from "../engine/testGame";
import { InPlayStatus } from "./InPlayStatus";

const ai: DeckList = Object.entries(OPPONENTS[0]!.deck).flatMap(([cardId, n]) =>
  Array.from({ length: n }, () => ({ cardId, finish: "plain" as const })),
);

const lektor: InPlay = {
  uid: 999,
  cardId: "lektor",
  finish: "plain",
  damage: 30,
  energy: 3,
  statuses: ["asleep"],
  paralyzedUntil: 0,
  playedTurn: 0,
  under: [{ uid: 998, cardId: "ministrant", finish: "plain" }],
  shield: 0,
  abilityTurn: -1,
};

describe("InPlayStatus", () => {
  it("shows attached energy, HP left, statuses and the card underneath", () => {
    const g = startedGame(deckList(newProfile()), ai, 1);
    render(<InPlayStatus g={g} c={lektor} />);
    expect(screen.getByText("3 Łaski")).toBeInTheDocument();
    expect(screen.getByText("50 / 80")).toBeInTheDocument();
    expect(screen.getByText("Uśpiony")).toBeInTheDocument();
    expect(screen.getByText("Ministrant")).toBeInTheDocument();
  });

  it("says when no energy is attached", () => {
    const g = startedGame(deckList(newProfile()), ai, 1);
    render(<InPlayStatus g={g} c={{ ...lektor, energy: 0, statuses: [], under: [] }} />);
    expect(screen.getByText("Brak dołączonej energii")).toBeInTheDocument();
  });
});
