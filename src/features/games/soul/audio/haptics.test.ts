import { afterEach, describe, expect, it, vi } from "vitest";
import { buzz, haptic, hapticsOn, setHaptics } from "./haptics";

describe("haptics", () => {
  afterEach(() => {
    setHaptics(true);
    vi.unstubAllGlobals();
  });

  it("is on by default, vibrates and can be switched off (remembered)", () => {
    const vibrate = vi.fn();
    vi.stubGlobal("navigator", { vibrate });
    expect(hapticsOn()).toBe(true);
    haptic.hit(90);
    expect(vibrate).toHaveBeenLastCalledWith([107, 45, 64]);
    setHaptics(false);
    expect(localStorage.getItem("jedno-walka-o-dusze:haptics")).toBe("0");
    vibrate.mockClear();
    buzz(20);
    haptic.place();
    expect(vibrate).not.toHaveBeenCalled();
  });

  it("never throws where vibration is missing", () => {
    vi.stubGlobal("navigator", {});
    expect(() => haptic.ko()).not.toThrow();
  });
});
