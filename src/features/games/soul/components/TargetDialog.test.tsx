import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { give, myTurn } from "../board/mainTurn.fixture";
import { TargetDialog } from "./TargetDialog";

describe("TargetDialog — choosing the card to play on", () => {
  it("shows the choices as cards and plays the tapped one", () => {
    const g = myTurn();
    const sobor = give(g, "sobor");
    give(g, "laska");
    give(g, "jp2");
    const piotr = give(g, "piotr");
    const onAction = vi.fn();
    const onClose = vi.fn();
    render(<TargetDialog g={g} uid={sobor.uid} onAction={onAction} onClose={onClose} />);
    const tiles = screen.getAllByRole("button", { name: /^Zagraj .* na:/ });
    expect(tiles).toHaveLength(2);
    fireEvent.click(tiles[1]!);
    expect(onClose).toHaveBeenCalled();
    expect(onAction).toHaveBeenCalledWith({ type: "support", uid: sobor.uid, target: piotr.uid });
  });

  it("greys out moves the tutorial does not allow", () => {
    const g = myTurn();
    const grace = give(g, "laska");
    render(
      <TargetDialog
        g={g}
        uid={grace.uid}
        onAction={vi.fn()}
        onClose={vi.fn()}
        allowed={() => false}
      />,
    );
    expect(screen.getByRole("button", { name: /^Zagraj .* na:/ })).toHaveProperty("disabled", true);
  });
});
