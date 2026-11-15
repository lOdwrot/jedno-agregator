import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "@/ui";
import { SoulGame } from "./SoulGame";
import { PACKS } from "./collection/packs";

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
    expect(screen.getAllByRole("button", { name: /Twoja karta w ręce/ })).toHaveLength(7);
    expect(screen.getByRole("button", { name: "Muzyka w tle" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("scrolls back to the rank after leaving a duel", async () => {
    const scroll = vi.fn();
    Element.prototype.scrollIntoView = scroll;
    setup();
    await userEvent.click(screen.getByRole("button", { name: /Stań do walki/ }));
    scroll.mockClear();
    await userEvent.click(screen.getByRole("button", { name: /Poddaj się i wyjdź/ }));
    await waitFor(() => expect(scroll).toHaveBeenCalled());
    const target = scroll.mock.contexts.at(-1) as Element;
    expect(target.textContent).toMatch(/Ranga|ranga/);
    expect(screen.getByRole("tab", { name: "Pojedynek" })).toHaveAttribute("aria-selected", "true");
  });

  it("opens the welcome booster with the animation and saves the cards", async () => {
    setup();
    await userEvent.click(screen.getByRole("tab", { name: /Boostery/ }));
    expect(screen.getAllByRole("button", { name: /^Otwórz paczkę/ })).toHaveLength(PACKS.length);
    await userEvent.click(screen.getByRole("button", { name: /Otwórz paczkę Wspólnota/ }));
    expect(
      screen.getByRole("dialog", { name: /Otwieranie boostera: Wspólnota/ }),
    ).toBeInTheDocument();
    const saved = JSON.parse(localStorage.getItem("jedno-walka-o-dusze:v1")!);
    expect(saved.packs).toBe(0);
    expect(saved.talents).toBe(0);
    await userEvent.click(screen.getByRole("button", { name: "Pomiń" }));
    await userEvent.click(screen.getByRole("button", { name: "Odkryj wszystkie" }));
    await waitFor(
      () => expect(screen.getAllByRole("button", { name: /Pokaż kartę/ })).toHaveLength(5),
      {
        timeout: 4000,
      },
    );
  });

  it("charges the entry fee when challenging a harder opponent", async () => {
    const { newProfile } = await import("./collection/profile");
    const save = (talents: number) =>
      localStorage.setItem("jedno-walka-o-dusze:v1", JSON.stringify({ ...newProfile(), talents }));
    save(10);
    const { unmount } = setup();
    await userEvent.click(screen.getByRole("button", { name: /Smocze Zastępy/ }));
    expect(screen.getByText(/Brakuje 20 talentów na wpisowe/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Stań do walki/ })).not.toBeInTheDocument();
    unmount();

    save(100);
    setup();
    await userEvent.click(screen.getByRole("button", { name: /Smocze Zastępy/ }));
    expect(
      screen.getByRole("list", { name: "Szanse na booster: Smocze Zastępy" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Wpisowe: 30 talentów")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Stań do walki \(−30 talentów\)/ }));
    expect(
      screen.getByRole("dialog", { name: /Wpisowe za wyzwanie: Smocze Zastępy/ }),
    ).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("jedno-walka-o-dusze:v1")!).talents).toBe(100);
    await userEvent.click(screen.getByRole("button", { name: "Do walki!" }));
    expect(screen.getByRole("region", { name: /Pojedynek z: Smocze Zastępy/ })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("jedno-walka-o-dusze:v1")!).talents).toBe(70);
  });

  it("offers a free practice duel against opponents with an entry fee", async () => {
    const { newProfile } = await import("./collection/profile");
    localStorage.setItem(
      "jedno-walka-o-dusze:v1",
      JSON.stringify({ ...newProfile(), talents: 10 }),
    );
    setup();
    expect(screen.queryByRole("button", { name: /Trenuj/ })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Tron Bestii/ }));
    expect(screen.getByText(/Brakuje 90 talentów na wpisowe/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Trenuj \(za darmo\)/ }));
    expect(
      screen.getByRole("region", { name: "Pojedynek z: Tron Bestii (trening)" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Zakończ trening" })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("jedno-walka-o-dusze:v1")!).talents).toBe(10);
  });
});
