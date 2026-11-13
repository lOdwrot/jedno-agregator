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

  it("starts a duel and asks for the first character", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: /Stań do walki/ }));
    expect(screen.getByText(/Wybierz z ręki postać podstawową/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Twoja ręka \(5\)/ })).toBeInTheDocument();
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
