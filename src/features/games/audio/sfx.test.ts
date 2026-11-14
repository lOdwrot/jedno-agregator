import { afterEach, describe, expect, it, vi } from "vitest";
import { isMuted, setMuted } from "./mute";
import { sfx } from "./sfx";

afterEach(() => setMuted(false));

describe("game sounds", () => {
  it("every effect is safe to call without Web Audio (jsdom, old browsers)", () => {
    for (const [name, play] of Object.entries(sfx)) {
      expect(() => (play as (...a: unknown[]) => void)(1), name).not.toThrow();
    }
  });

  it("mute is remembered and silences the synth", () => {
    const Ctor = vi.fn(function (this: Record<string, unknown>) {
      this.state = "running";
    });
    vi.stubGlobal("AudioContext", Ctor);
    setMuted(true);
    expect(isMuted()).toBe(true);
    expect(localStorage.getItem("jedno-games-muted")).toBe("1");
    sfx.fanfare();
    expect(Ctor).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
