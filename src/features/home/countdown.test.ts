import { describe, expect, it } from "vitest";
import { formatCountdown } from "./countdown";

const now = Date.UTC(2026, 10, 12, 12, 0, 0);
const at = (min: number) => now + min * 60_000;

describe("formatCountdown", () => {
  it("formats days with hours and pluralises", () => {
    expect(formatCountdown(at(1440 + 4 * 60 + 5), now)).toBe("Za 1 dzień 4 godz.");
    expect(formatCountdown(at(5 * 1440), now)).toBe("Za 5 dni");
  });
  it("formats hours and minutes", () => {
    expect(formatCountdown(at(200), now)).toBe("Za 3 godz. 20 min");
    expect(formatCountdown(at(120), now)).toBe("Za 2 godz.");
  });
  it("formats minutes and the started state", () => {
    expect(formatCountdown(at(12), now)).toBe("Za 12 min");
    expect(formatCountdown(now + 5_000, now)).toBe("Za 1 min");
    expect(formatCountdown(now - 1, now)).toBe("Trwa teraz");
  });
});
