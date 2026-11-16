import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { hapticsOn, setHaptics } from "../audio/haptics";
import { isMuted, setMuted } from "../../audio/mute";
import { Settings } from "./Settings";

describe("Settings", () => {
  afterEach(() => {
    setHaptics(true);
    setMuted(false);
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
});
