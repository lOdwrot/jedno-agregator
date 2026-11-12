import { describe, expect, it } from "vitest";
import {
  dayKey,
  formatDate,
  formatDuration,
  formatEventChip,
  formatEventDayHeader,
  formatEventRange,
  formatRelativeAgo,
  formatRelativeGroup,
  groupByDay,
  isUpcoming,
} from "./dates";

// Friday 13 Nov 2026, 12:00 Warsaw (CET, +01:00)
const now = new Date("2026-11-13T12:00:00+01:00");

describe("dates", () => {
  it("formatEventChip", () => {
    expect(formatEventChip("2026-11-13T18:00:00+01:00", null, now)).toBe("Dziś, 18:00");
    expect(formatEventChip("2026-11-14T19:30:00+01:00", null, now)).toBe("Jutro, 19:30");
    expect(formatEventChip("2026-05-29T18:00:00+02:00", null, new Date("2026-05-01T10:00:00+02:00"))).toBe(
      "29 maj, 18:00",
    );
    expect(formatEventChip("2026-11-14T19:30:00+01:00", "2026-11-14T21:00:00+01:00", now)).toBe(
      "Jutro, 19:30 – 21:00",
    );
  });

  it("formatEventDayHeader", () => {
    expect(formatEventDayHeader("2026-11-13T10:00:00+01:00", now)).toBe("Dzisiaj – piątek, 13 listopada");
    expect(formatEventDayHeader("2026-11-14T10:00:00+01:00", now)).toBe("Jutro – sobota, 14 listopada");
    expect(formatEventDayHeader("2026-11-15T10:00:00+01:00", now)).toBe("Niedziela, 15 listopada");
  });

  it("formatEventRange", () => {
    expect(formatEventRange("2026-05-29T17:00:00+02:00", "2026-05-29T19:00:00+02:00")).toBe(
      "29 maja, 17:00 – 19:00",
    );
    expect(formatEventRange("2026-05-29T17:00:00+02:00", "2026-05-31T15:00:00+02:00")).toBe(
      "29 maja, 17:00 – 31 maja, 15:00",
    );
    expect(formatEventRange("2026-05-29T17:00:00+02:00")).toBe("29 maja, 17:00");
  });

  it("uses Warsaw time regardless of runtime zone", () => {
    expect(dayKey("2026-11-13T23:30:00Z")).toBe("2026-11-14");
    expect(formatDate("2026-11-13T23:30:00Z")).toBe("14.11.2026");
  });

  it("formatRelativeGroup", () => {
    expect(formatRelativeGroup("2026-11-13T08:00:00+01:00", now)).toBe("Dzisiaj");
    expect(formatRelativeGroup("2026-11-12T08:00:00+01:00", now)).toBe("Wczoraj");
    expect(formatRelativeGroup("2026-11-11T08:00:00+01:00", now)).toBe("Przedwczoraj");
    expect(formatRelativeGroup("2026-11-06T08:00:00+01:00", now)).toBe("W zeszłym tygodniu");
    expect(formatRelativeGroup("2026-09-06T08:00:00+02:00", now)).toBe("06.09.2026");
  });

  it("groupByDay", () => {
    const g = groupByDay(
      [{ d: "2026-11-13T10:00:00+01:00" }, { d: "2026-11-13T12:00:00+01:00" }, { d: "2026-11-14T10:00:00+01:00" }],
      (x) => x.d,
    );
    expect(g.map((x) => [x.key, x.items.length])).toEqual([
      ["2026-11-13", 2],
      ["2026-11-14", 1],
    ]);
  });

  it("isUpcoming", () => {
    expect(isUpcoming("2026-11-13T13:00:00+01:00", null, now)).toBe(true);
    expect(isUpcoming("2026-11-13T08:00:00+01:00", null, now)).toBe(false);
    expect(isUpcoming("2026-11-13T08:00:00+01:00", "2026-11-13T14:00:00+01:00", now)).toBe(true);
  });

  it("formatRelativeAgo / formatDuration", () => {
    expect(formatRelativeAgo("2026-11-11T12:00:00+01:00", now)).toBe("2 dni temu");
    expect(formatDuration(65)).toBe("1:05");
    expect(formatDuration(3725)).toBe("1:02:05");
  });
});
