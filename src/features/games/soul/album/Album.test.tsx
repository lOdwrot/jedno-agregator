import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { keyOf, newProfile } from "../collection/profile";
import { ALBUM_SIZE, cardNumber, formatNumber } from "../data/numbers";
import { Album } from "./Album";

describe("Album", () => {
  const profile = newProfile();
  profile.collection[keyOf("lektor", "stained")] = 1;
  const lektor = formatNumber(cardNumber("lektor")!);

  it("shows owned cards by number and empty numbered slots for the rest", () => {
    render(<Album profile={profile} />);
    expect(screen.getByText(new RegExp(`Zebrane: \\d+ / ${ALBUM_SIZE}`))).toBeInTheDocument();
    expect(screen.getByText("❖ Witrażowe: 1")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: new RegExp(`^Nr ${lektor}: Lektor — witrażowa, zwykła`) }),
    ).toBeInTheDocument();
    const bern = formatNumber(cardNumber("bernadetta")!);
    expect(screen.getByText(`Nr ${bern} — tej karty jeszcze nie masz`)).toBeInTheDocument();
  });

  it("opens a card in hand with its owned prints, the rarest first", async () => {
    const user = userEvent.setup();
    render(<Album profile={profile} />);
    await user.click(screen.getByRole("button", { name: new RegExp(`^Nr ${lektor}:`) }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByRole("slider", { name: "Obróć kartę: Lektor" })).toBeInTheDocument();
    const prints = within(dialog).getByRole("radiogroup", { name: "Wersja karty" });
    expect(within(prints).getByRole("radio", { name: /witrażowa ×1/ })).toBeChecked();
    expect(within(dialog).getByText(/Masz: 1× witrażowa, 3× zwykła/)).toBeInTheDocument();
  });
});
