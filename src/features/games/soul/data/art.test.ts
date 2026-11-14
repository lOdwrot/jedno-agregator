import { describe, expect, it } from "vitest";
import { ART } from "./art";
import { getCard } from "./cards";
import { PACKS } from "../collection/packs";

const files = new Set(
  Object.keys(import.meta.glob("/public/soul/art/*.webp")).map((f) =>
    f.replace(/^.*\//, "").replace(".webp", ""),
  ),
);

describe("card art", () => {
  it("every credited picture exists and belongs to a card or a pack", () => {
    expect(files.size).toBeGreaterThan(0);
    const packArt = new Set(PACKS.map((p) => p.art));
    for (const [key, c] of Object.entries(ART)) {
      expect(files.has(key), key).toBe(true);
      expect(c.url).toMatch(/^https:\/\/commons\.wikimedia\.org\//);
      expect(c.license.length).toBeGreaterThan(2);
      if (!packArt.has(key)) expect(() => getCard(key)).not.toThrow();
    }
  });
});
