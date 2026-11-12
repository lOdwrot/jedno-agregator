import { describe, expect, it } from "vitest";
import { formatReadingTime, newsCountLabel, readingMinutes, visibleSlice } from "./utils";

describe("news utils", () => {
  it("estimates reading time, at least 1 minute", () => {
    expect(readingMinutes("<p>krótko</p>")).toBe(1);
    const long = `<p>${"słowo ".repeat(600)}</p>`;
    expect(formatReadingTime(long)).toBe("3 min czytania");
  });
  it("builds the result count label", () => {
    expect(newsCountLabel(0)).toBe("Nie znaleziono aktualności");
    expect(newsCountLabel(1)).toBe("Znaleziono 1 aktualność");
    expect(newsCountLabel(7)).toBe("Znaleziono 7 aktualności");
  });
  it("slices visible items", () => {
    expect(visibleSlice([1, 2, 3], 2)).toEqual([1, 2]);
    expect(visibleSlice([1, 2, 3], 0)).toEqual([]);
  });
});
