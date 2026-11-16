import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { BESTIARY_CARDS, RECOGNIZE_AT } from "../collection/bestiary";
import { newProfile } from "../collection/profile";
import { Bestiary } from "./Bestiary";
import { DuelDiscoveries } from "./DuelDiscoveries";

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
  const [a, b] = BESTIARY_CARDS;
  const found = { recognized: [a!.id], met: [b!.id], seen: { [a!.id]: 4, [b!.id]: 1 } };

  it("lists recognized and first-met cards, and nothing when the duel brought nothing", () => {
    const { container, rerender } = render(<DuelDiscoveries found={found} />);
    expect(screen.getByText("📖 Rozpoznane pokusy: 1")).toBeInTheDocument();
    expect(screen.getByText("👁️ Spotkane po raz pierwszy: 1")).toBeInTheDocument();
    rerender(<DuelDiscoveries found={{ recognized: [], met: [], seen: {} }} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("unfolds the lesson of a recognized card and the teaser of a first-met one", async () => {
    render(<DuelDiscoveries found={found} />);
    const read = screen.getByRole("button", { name: new RegExp(`${a!.name}.*Czytaj`) });
    await userEvent.click(read);
    expect(read).toHaveAttribute("aria-expanded", "true");
    const card = screen.getByLabelText(`Karta: ${a!.name}`);
    expect(screen.getByText("Jak kusi:")).toBeInTheDocument();
    // the card unfolds directly under its own badge
    expect(read.closest("li")!.nextElementSibling).toContainElement(card);
    await userEvent.click(
      screen.getByRole("button", { name: new RegExp(`${b!.name}.*Podejrzyj`) }),
    );
    expect(screen.getByLabelText(`Karta jeszcze nierozpoznana: ${b!.name}`)).toBeInTheDocument();
    expect(screen.queryByText("Jak kusi:")).not.toBeInTheDocument();
  });
});
