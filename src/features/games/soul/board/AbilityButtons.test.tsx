import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { deckList, newProfile } from "../collection/profile";
import { OPPONENTS } from "../data/opponents";
import { toInPlay, type DeckList } from "../engine/state";
import { startedGame } from "../engine/testGame";
import { AbilityButtons } from "./AbilityButtons";

const opp: DeckList = Object.entries(OPPONENTS[0]!.deck).flatMap(([cardId, n]) =>
  Array.from({ length: n }, () => ({ cardId, finish: "plain" as const })),
);

function game() {
  const g = startedGame(deckList(newProfile()), opp, 2);
  g.phase = "main";
  g.turn = "me";
  g.players.me.active = toInPlay({ uid: 900, cardId: "ministrant", finish: "plain" }, 0);
  g.players.me.bench = [toInPlay({ uid: 902, cardId: "lektor", finish: "plain" }, 0)]; // drawOnce
  return g;
}

describe("AbilityButtons", () => {
  it("uses an ability straight from the table", () => {
    const g = game();
    const onAction = vi.fn();
    render(<AbilityButtons view={g} live={g} busy={false} w={390} h={700} onAction={onAction} />);
    const btn = screen.getByRole("button", { name: /Użyj mocy: .*Lektor/ });
    fireEvent.click(btn);
    expect(onAction).toHaveBeenCalledWith({ type: "ability", target: 902 });
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });

  it("shows nothing while busy, on the opponent's turn or once the ability was used", () => {
    const g = game();
    const { rerender, container } = render(
      <AbilityButtons view={g} live={g} busy w={390} h={700} onAction={() => undefined} />,
    );
    expect(container).toBeEmptyDOMElement();
    g.turn = "ai";
    rerender(
      <AbilityButtons view={g} live={g} busy={false} w={390} h={700} onAction={() => undefined} />,
    );
    expect(container).toBeEmptyDOMElement();
    g.turn = "me";
    g.players.me.bench[0]!.abilityTurn = g.turnNo;
    rerender(
      <AbilityButtons view={g} live={g} busy={false} w={390} h={700} onAction={() => undefined} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
