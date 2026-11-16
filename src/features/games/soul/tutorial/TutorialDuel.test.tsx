import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it } from "vitest";
import { ToastProvider } from "@/ui";
import { SoulGame } from "../SoulGame";

const setup = () =>
  render(
    <MemoryRouter>
      <ToastProvider>
        <SoulGame />
      </ToastProvider>
    </MemoryRouter>,
  );

describe("Walka o duszę — tutorial", () => {
  beforeEach(() => localStorage.clear());

  it("is offered with its one-time reward and leads the first moves", async () => {
    setup();
    expect(screen.getByText(/150 talentów za pierwsze ukończenie/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Rozpocznij samouczek" }));
    const duel = within(screen.getByRole("region", { name: /Pojedynek z: Samouczek/ }));
    const coach = within(duel.getByRole("region", { name: "Samouczek" }));
    expect(coach.getByText("Witaj w samouczku!")).toBeInTheDocument();
    // the fixed opening hand, no redraw / coin toss
    expect(duel.getAllByRole("button", { name: /Twoja karta w ręce/ })).toHaveLength(7);
    expect(duel.queryByRole("button", { name: /Gram tymi kartami/ })).not.toBeInTheDocument();
    await userEvent.click(coach.getByRole("button", { name: "Dalej" }));
    await userEvent.click(coach.getByRole("button", { name: "Dalej" }));
    expect(coach.getByText("Wystaw postać do walki")).toBeInTheDocument();

    // a different basic is refused, the Ministrant goes in
    await userEvent.click(duel.getByRole("button", { name: /^Oazowicz — Twoja karta w ręce/ }));
    expect(screen.getByRole("button", { name: "Wystaw do walki" })).toBeDisabled();
    await userEvent.keyboard("{Escape}");
    await userEvent.click(duel.getByRole("button", { name: /^Ministrant — Twoja karta w ręce/ }));
    await userEvent.click(screen.getByRole("button", { name: "Wystaw do walki" }));
    expect(await coach.findByText("Twoja pierwsza tura")).toBeInTheDocument();
    expect(coach.getByText(/do walki staje Pyszałek/)).toBeInTheDocument();
    // explanations block the end of the turn
    expect(duel.getByRole("button", { name: "Zakończ turę" })).toBeDisabled();
  });
});
