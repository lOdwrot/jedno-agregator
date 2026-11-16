import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "@/ui";
import { SoulGame } from "../SoulGame";
import { memoryPair, type Link } from "./link";

// WebRTC is replaced by an in-memory pipe: whoever joins "1234" reaches the host
const net = vi.hoisted(() => ({ onGuest: null as ((l: Link) => void) | null }));
vi.mock("./peerLink", async (orig) => ({
  ...(await orig<typeof import("./peerLink")>()),
  hostGame: async (onGuest: (l: Link) => void) => {
    net.onGuest = onGuest;
    return { code: "1234", cancel: () => (net.onGuest = null) };
  },
  joinGame: async (code: string) => {
    if (code !== "1234" || !net.onGuest) throw new Error("Nie ma gry o takim kodzie.");
    const [h, g] = memoryPair();
    net.onGuest(h);
    return g;
  },
}));

const app = (label: string) => (
  <div aria-label={label} role="group">
    <MemoryRouter>
      <ToastProvider>
        <SoulGame />
      </ToastProvider>
    </MemoryRouter>
  </div>
);

describe("multiplayer", () => {
  beforeEach(() => localStorage.clear());

  it("refuses a wrong code", async () => {
    render(app("gość"));
    await userEvent.click(screen.getByRole("tab", { name: "Multiplayer" }));
    await userEvent.type(screen.getByRole("textbox", { name: "Kod gry" }), "99x99");
    expect(screen.getByRole("textbox", { name: "Kod gry" })).toHaveValue("9999");
    await userEvent.click(screen.getByRole("button", { name: "Dołącz" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Nie ma gry o takim kodzie.");
  });

  it("connects host and guest with a code and both set up their own deck", async () => {
    render(
      <>
        {app("gospodarz")}
        {app("gość")}
      </>,
    );
    const [hostApp, guestApp] = [
      within(screen.getByRole("group", { name: "gospodarz" })),
      within(screen.getByRole("group", { name: "gość" })),
    ];
    for (const [a, name] of [
      [hostApp, "Ania"],
      [guestApp, "Bartek"],
    ] as const) {
      await userEvent.click(a.getByRole("tab", { name: "Multiplayer" }));
      await userEvent.type(a.getByRole("textbox", { name: /Twoje imię/ }), name);
    }
    await userEvent.click(hostApp.getByRole("button", { name: "Załóż grę" }));
    expect(await hostApp.findByLabelText("Kod gry: 1 2 3 4")).toBeInTheDocument();
    await userEvent.type(guestApp.getByRole("textbox", { name: "Kod gry" }), "1234");
    await userEvent.click(guestApp.getByRole("button", { name: "Dołącz" }));

    const hostDuel = within(await hostApp.findByRole("region", { name: "Pojedynek z: Bartek" }));
    const guestDuel = within(await guestApp.findByRole("region", { name: "Pojedynek z: Ania" }));
    // each one sees their own 7 cards and only the backs of the other hand
    expect(hostDuel.getAllByRole("button", { name: /Twoja karta w ręce/ })).toHaveLength(7);
    expect(guestDuel.getAllByRole("button", { name: /Twoja karta w ręce/ })).toHaveLength(7);
    // both keep their hands; the coin decides who sets up first
    await userEvent.click(guestDuel.getByRole("button", { name: /Gram tymi kartami/ }));
    expect(await guestDuel.findByText(/Czekaj, aż rywal zdecyduje/)).toBeInTheDocument();
    await userEvent.click(hostDuel.getByRole("button", { name: /Gram tymi kartami/ }));
    expect(
      await hostDuel.findByText(/Idziesz (pierwszy|drugi)|Rywal wygrał rzut/),
    ).toBeInTheDocument();
    const first = hostDuel.queryByText(/Idziesz pierwszy/) ? hostDuel : guestDuel;
    const second = first === hostDuel ? guestDuel : hostDuel;
    expect(await second.findByText(/Rywal wygrał rzut monetą/)).toBeInTheDocument();

    // the winner of the toss picks a first character: tap a basic card → "Wystaw do walki"
    for (const b of first.getAllByRole("button", { name: /Twoja karta w ręce/ })) {
      await userEvent.click(b);
      const put = screen.queryByRole("button", { name: "Wystaw do walki" });
      if (put) {
        await userEvent.click(put);
        break;
      }
      await userEvent.keyboard("{Escape}");
    }
    expect(await first.findByText("Czekaj, aż rywal wystawi postać…")).toBeInTheDocument();
    expect(await second.findByRole("button", { name: /Karta rywala aktywna/ })).toBeInTheDocument();
    expect(await second.findByText(/Idziesz drugi — wystaw postać/)).toBeInTheDocument();
  });
});
