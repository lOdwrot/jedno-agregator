import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BESTIARY_CARDS, RECOGNIZE_AT } from "../collection/bestiary";
import { newProfile } from "../collection/profile";
import { Bestiary } from "./Bestiary";

describe("Bestiary", () => {
  const [a, b, c] = BESTIARY_CARDS.filter((x) => x.kind === "character");

  it("hides unmet cards, greys out met ones and shows recognized ones in full", () => {
    const profile = { ...newProfile(), bestiary: { [a!.id]: 1, [b!.id]: RECOGNIZE_AT } };
    render(<Bestiary profile={profile} />);
    const total = BESTIARY_CARDS.length;
    expect(screen.getByText(`👁️ Spotkane: 2 / ${total}`)).toBeInTheDocument();
    expect(screen.getByText(`📖 Rozpoznane: 1 / ${total}`)).toBeInTheDocument();
    expect(screen.getByLabelText(`Karta jeszcze nierozpoznana: ${a!.name}`)).toBeInTheDocument();
    expect(screen.getByLabelText(`Karta: ${b!.name}`)).toBeInTheDocument();
    expect(screen.queryByText(c!.name)).not.toBeInTheDocument();
    expect(screen.getAllByText("Jak kusi:")).toHaveLength(1);
  });

  it("tells a new player to go fight first", () => {
    render(<Bestiary profile={newProfile()} />);
    expect(screen.getByText(/Nie spotkałeś jeszcze żadnej pokusy/)).toBeInTheDocument();
  });
});

describe("DuelDiscoveries", () => {
  it("lists recognized and first-met cards, and nothing when the duel brought nothing", async () => {
    const { DuelDiscoveries } = await import("./DuelDiscoveries");
    const [a, b] = BESTIARY_CARDS;
    const { container, rerender } = render(
      <DuelDiscoveries found={{ recognized: [a!.id], met: [b!.id] }} />,
    );
    expect(screen.getByText("📖 Rozpoznane pokusy: 1")).toBeInTheDocument();
    expect(screen.getByText("👁️ Spotkane po raz pierwszy: 1")).toBeInTheDocument();
    expect(screen.getByText(a!.name)).toBeInTheDocument();
    rerender(<DuelDiscoveries found={{ recognized: [], met: [] }} />);
    expect(container).toBeEmptyDOMElement();
  });
});
