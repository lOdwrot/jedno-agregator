import { describe, expect, it } from "vitest";
import {
  buildMonthMatrix,
  countThisWeek,
  dayAriaLabel,
  eventStatus,
  formatCountdown,
  mapsUrl,
  pluralPl,
  shiftDayKey,
  shiftMonth,
  statusText,
} from "./utils";

const ev = (start: string, end: string | null = null) => ({ start, end });

describe("buildMonthMatrix", () => {
  it("is Monday-first and covers full weeks", () => {
    const weeks = buildMonthMatrix(2026, 10); // November 2026 starts on Sunday
    expect(weeks[0]![0]!.key).toBe("2026-10-26");
    expect(weeks[0]![6]).toMatchObject({ key: "2026-11-01", inMonth: true });
    expect(weeks.every((w) => w.length === 7)).toBe(true);
    expect(weeks.flat().filter((c) => c.inMonth)).toHaveLength(30);
  });
  it("handles February of a leap year", () => {
    expect(buildMonthMatrix(2028, 1).flat().filter((c) => c.inMonth)).toHaveLength(29);
  });
});

describe("shifting", () => {
  it("shifts months across years", () => {
    expect(shiftMonth(2026, 11, 1)).toEqual({ year: 2027, month: 0 });
    expect(shiftMonth(2026, 0, -1)).toEqual({ year: 2025, month: 11 });
  });
  it("shifts day keys", () => {
    expect(shiftDayKey("2026-11-30", 1)).toBe("2026-12-01");
    expect(shiftDayKey("2026-03-01", -1)).toBe("2026-02-28");
  });
});

describe("labels", () => {
  it("pluralises Polish", () => {
    expect(pluralPl(1, "a", "b", "c")).toBe("a");
    expect(pluralPl(3, "a", "b", "c")).toBe("b");
    expect(pluralPl(12, "a", "b", "c")).toBe("c");
    expect(pluralPl(22, "a", "b", "c")).toBe("b");
  });
  it("builds day aria labels", () => {
    expect(dayAriaLabel("2026-11-13", 2)).toBe("13 listopada, 2 wydarzenia");
    expect(dayAriaLabel("2026-11-13", 0)).toBe("13 listopada");
  });
});

describe("countdown & status", () => {
  const now = new Date("2026-11-12T12:00:00+01:00");
  it("formats", () => {
    expect(formatCountdown(3 * 86400_000 + 4 * 3600_000)).toBe("3 dni 4 godz.");
    expect(formatCountdown(90 * 60_000)).toBe("1 godz. 30 min");
    expect(formatCountdown(5 * 60_000)).toBe("5 min");
    expect(formatCountdown(10_000)).toBe("mniej niż minutę");
  });
  it("detects status", () => {
    expect(eventStatus(ev("2026-11-13T19:30:00+01:00"), now)).toBe("upcoming");
    expect(eventStatus(ev("2026-11-12T11:00:00+01:00"), now)).toBe("live");
    expect(eventStatus(ev("2026-11-12T08:00:00+01:00", "2026-11-12T10:00:00+01:00"), now)).toBe("ended");
    expect(statusText(ev("2026-11-12T11:00:00+01:00"), now)).toBe("Trwa teraz");
    expect(statusText(ev("2026-11-13T12:00:00+01:00"), now)).toBe("Zaczyna się za 1 dzień");
  });
  it("counts the week", () => {
    const events = [ev("2026-11-13T19:30:00+01:00"), ev("2026-11-30T10:00:00+01:00")] as never[];
    expect(countThisWeek(events, now)).toBe(1);
  });
});

describe("mapsUrl", () => {
  it("prefers mapsLink, falls back to search", () => {
    expect(mapsUrl({ mapsLink: "https://x.y", location: "A" })).toBe("https://x.y");
    expect(mapsUrl({ mapsLink: null, location: "Aula | Gdańsk" })).toContain("query=Aula%2C%20Gda");
    expect(mapsUrl({ mapsLink: null, location: "" })).toBeNull();
  });
});
