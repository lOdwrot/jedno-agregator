import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { deckList, newProfile } from "../collection/profile";
import { DeckForge } from "./DeckForge";
import type { ForgeState } from "./useForge";

const state: ForgeState = { progress: null, result: null };
vi.mock("./useForge", () => ({ useForge: () => state }));

describe("DeckForge (loading screen of the experimental opponent)", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    state.progress = null;
    state.result = null;
  });

  it("shows the progress and a joke, then offers the fight once the deck is ready", () => {
    state.progress = {
      phase: "climb",
      games: 321,
      fraction: 0.5,
      best: 0.9,
      spotlight: ["legion"],
      kept: 4,
      tried: 9,
    };
    const onReady = vi.fn();
    const onCancel = vi.fn();
    const { rerender } = render(
      <DeckForge deck={deckList(newProfile())} onReady={onReady} onCancel={onCancel} />,
    );
    expect(screen.getByRole("dialog", { name: /składa talię/ })).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "49");
    expect(screen.getByText("321")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Do walki!" })).toBeNull();

    state.result = {
      deck: { legion: 2, kajdany: 2, raz: 3, belzebub: 2 },
      winRate: 0.95,
      games: 1900,
    };
    rerender(<DeckForge deck={deckList(newProfile())} onReady={onReady} onCancel={onCancel} />);
    // the screen stays a few seconds, so the jokes can be read
    expect(screen.queryByRole("button", { name: "Do walki!" })).toBeNull();
    act(() => vi.advanceTimersByTime(5000));
    expect(screen.getByText("95%", { selector: "strong" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Do walki!" }));
    expect(onReady).toHaveBeenCalledWith(state.result);
    fireEvent.click(screen.getByRole("button", { name: "Wycofaj się" }));
    expect(onCancel).toHaveBeenCalled();
  });
});
