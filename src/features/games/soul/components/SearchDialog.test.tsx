import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { deckList, newProfile } from "../collection/profile";
import { OPPONENTS } from "../data/opponents";
import type { DeckList } from "../engine/state";
import { startedGame } from "../engine/testGame";
import { SearchDialog } from "./SearchDialog";

const ai: DeckList = Object.entries(OPPONENTS[0]!.deck).flatMap(([cardId, n]) =>
  Array.from({ length: n }, () => ({ cardId, finish: "plain" as const })),
);

function game() {
  const g = startedGame(deckList(newProfile()), ai, 1);
  g.search = { pid: "me", discard: 2 };
  return g;
}

describe("SearchDialog — looking at cards before choosing", () => {
  it("opens the details of a card from its info badge without choosing it", async () => {
    const onAction = vi.fn();
    render(<SearchDialog g={game()} open onAction={onAction} />);
    const infos = screen.getAllByRole("button", { name: /^Szczegóły karty:/ });
    expect(infos.length).toBeGreaterThan(0);
    fireEvent.click(infos[0]!);
    const back = await screen.findByRole("button", { name: "Wróć do wyboru" });
    expect(onAction).not.toHaveBeenCalled();
    expect(
      screen
        .getAllByRole("button", { name: /^(Odrzuć|Weź):/ })
        .every((b) => b.getAttribute("aria-pressed") === "false"),
    ).toBe(true);
    fireEvent.click(back);
  });

  it("shows the hand on demand", async () => {
    const g = game();
    render(<SearchDialog g={g} open onAction={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /^Spójrz na rękę/ }));
    const hand = await screen.findByRole("dialog", { name: "Twoja ręka" });
    expect(within(hand).getAllByRole("listitem")).toHaveLength(g.players.me.hand.length);
  });
});
