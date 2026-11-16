import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { CardInst } from "../engine/state";
import { DiscardDialog } from "./DiscardDialog";

const c = (uid: number, cardId: string): CardInst => ({ uid, cardId, finish: "plain" });

describe("DiscardDialog — looking through a discard pile", () => {
  it("lists merged cards with their count and opens one for details", async () => {
    const pile = [c(1, "ministrant"), c(2, "kandydat"), c(3, "ministrant"), c(4, "ministrant")];
    render(<DiscardDialog open pile={pile} title="Twoje odrzucone karty" onClose={vi.fn()} />);
    const tiles = screen.getAllByRole("button", { name: /^Szczegóły karty:/ });
    expect(tiles).toHaveLength(2);
    expect(tiles[0]!.getAttribute("aria-label")).toMatch(/3 sztuki$/);
    expect(screen.getByText("×3")).toBeTruthy();
    fireEvent.click(tiles[1]!);
    fireEvent.click(await screen.findByRole("button", { name: "Wróć do stosu" }));
    expect(screen.getAllByRole("button", { name: /^Szczegóły karty:/ })).toHaveLength(2);
  });

  it("says when the pile is empty", () => {
    render(<DiscardDialog open pile={[]} title="Stos" onClose={vi.fn()} />);
    expect(screen.getByText("Stos odrzuconych jest pusty.")).toBeTruthy();
  });
});
