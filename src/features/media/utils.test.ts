import { describe, expect, it } from "vitest";
import { deriveSeries, excerpt, filterVideos, formatViews, linkify, parseSeries } from "./utils";

describe("parseSeries", () => {
  it("parses pipe, hash and spaced-hash prefixes", () => {
    expect(parseSeries("ŻycioRYSY Świętych | św. Franciszek #2")).toBe("ŻycioRYSY Świętych");
    expect(parseSeries("100NA100 #063 ŚWIADEK: HANNA")).toBe("100NA100");
    expect(parseSeries("EKG#46 - Ekspres")).toBe("EKG");
    expect(parseSeries("SPOTKAJMY SIĘ #10 | WSPÓLNOTA")).toBe("SPOTKAJMY SIĘ");
  });
  it("returns null without a prefix", () => {
    expect(parseSeries("Ostatnia prosta. Psycholog i ksiądz o umieraniu")).toBeNull();
  });
});

describe("deriveSeries / filterVideos", () => {
  const vids = [
    { title: "A | 1" },
    { title: "A | 2" },
    { title: "B | 1" },
    { title: "Zażółć gęślą jaźń" },
  ];
  it("keeps only series with >= 2 videos", () => {
    expect(deriveSeries(vids)).toEqual([{ name: "A", count: 2 }]);
  });
  it("filters by series and diacritics-insensitive query", () => {
    expect(filterVideos(vids, "", "A")).toHaveLength(2);
    expect(filterVideos(vids, "zazolc gesla", null)).toHaveLength(1);
  });
});

describe("formatViews", () => {
  it("formats counts in Polish", () => {
    expect(formatViews(null)).toBeNull();
    expect(formatViews(1)).toBe("1 wyświetlenie");
    expect(formatViews(3)).toBe("3 wyświetlenia");
    expect(formatViews(128)).toBe("128 wyświetleń");
    expect(formatViews(1234)).toMatch(/^1,2\stys\.\swyświetleń$/);
  });
});

describe("linkify", () => {
  it("extracts links and strips trailing punctuation", () => {
    expect(linkify("Zobacz https://a.pl/x, a potem koniec.")).toEqual([
      { type: "text", text: "Zobacz " },
      { type: "link", text: "https://a.pl/x", href: "https://a.pl/x" },
      { type: "text", text: ", a potem koniec." },
    ]);
  });
  it("never links javascript: urls", () => {
    expect(linkify("javascript:alert(1)").every((p) => p.type === "text")).toBe(true);
  });
});

describe("excerpt", () => {
  it("truncates at a word boundary", () => {
    expect(excerpt("słowo ".repeat(100), 20).endsWith("…")).toBe(true);
    expect(excerpt("krótki\n\ndrugi")).toBe("krótki");
  });
});
