import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { hapticsOn, setHaptics } from "../audio/haptics";
import { isMuted, setMuted } from "../../audio/mute";
import { cardArtOn, setCardArt } from "../data/artPref";
import { artSrc } from "../data/art";
import { CardArt } from "./CardArt";
import { Settings } from "./Settings";

describe("Settings", () => {
  afterEach(() => {
    setHaptics(true);
    setMuted(false);
    setCardArt(true);
  });

  it("vibrations are on by default and switch off and on; sound follows the shared mute", async () => {
    render(<Settings />);
    const vib = screen.getByRole("switch", { name: /Wibracje/ });
    expect(vib).toHaveAttribute("aria-checked", "true");
    await userEvent.click(vib);
    expect(vib).toHaveAttribute("aria-checked", "false");
    expect(hapticsOn()).toBe(false);
    await userEvent.click(screen.getByRole("switch", { name: /Efekty dźwiękowe/ }));
    expect(isMuted()).toBe(true);
  });

  it("card pictures are on by default; switched off, drawn cards show their emoji (Commons pictures stay)", async () => {
    render(<Settings />);
    render(<CardArt cardId="ministrant" />);
    const art = screen.getByRole("switch", { name: /Ilustracje kart/ });
    expect(art).toHaveAttribute("aria-checked", "true");
    expect(document.querySelector('img[src$="ministrant.webp"]')).not.toBeNull();
    await userEvent.click(art);
    expect(cardArtOn()).toBe(false);
    expect(localStorage.getItem("jedno-walka-o-dusze:card-art")).toBe("0");
    expect(document.querySelector('img[src$="ministrant.webp"]')).toBeNull();
    expect(screen.getByText("🔔")).toBeInTheDocument();
    expect(artSrc("ministrant")).toBeNull();
    expect(artSrc("jp2")).not.toBeNull();
  });
});
