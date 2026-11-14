import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it } from "vitest";
import { ToastProvider } from "@/ui";
import { SoulGame } from "./SoulGame";

const setup = () =>
  render(
    <MemoryRouter>
      <ToastProvider>
        <SoulGame />
      </ToastProvider>
    </MemoryRouter>,
  );

describe("SoulGame", () => {
  beforeEach(() => localStorage.clear());

  it("shows the hub with a starter deck and a welcome booster", () => {
    setup();
    expect(screen.getByRole("tab", { name: /Boostery \(1\)/ })).toBeInTheDocument();
    expect(screen.getByText(/Talenty: 100/)).toBeInTheDocument();
    expect(screen.getByText("Mój drogi Smołku,")).toBeInTheDocument();
  });

  it("starts a full-screen duel and asks for the first character", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: /Stań do walki/ }));
    const duel = screen.getByRole("region", { name: /Pojedynek z: Chochliki z kanapy/ });
    expect(duel).toBeInTheDocument();
    expect(screen.getByText(/postać podstawową z ręki/)).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Twoja karta w ręce/ })).toHaveLength(5);
    expect(screen.getByRole("button", { name: "Muzyka w tle" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("opens the welcome booster and saves the cards", async () => {
    setup();
    await userEvent.click(screen.getByRole("tab", { name: /Boostery/ }));
    await userEvent.click(screen.getByRole("button", { name: /Otwórz \(100 talentów\)/ }));
    await userEvent.click(screen.getByRole("button", { name: "Odkryj wszystkie" }));
    expect(screen.getAllByRole("button", { name: /Pokaż kartę/ })).toHaveLength(5);
    const saved = JSON.parse(localStorage.getItem("jedno-walka-o-dusze:v1")!);
    expect(saved.packs).toBe(0);
    expect(saved.talents).toBe(0);
  });
});
