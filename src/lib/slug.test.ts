import { describe, expect, it } from "vitest";
import { slugify } from "./slug";

describe("slugify", () => {
  it("transliterates Polish diacritics", () => {
    expect(slugify("Dołącz jako Autor")).toBe("dolacz-jako-autor");
    expect(slugify("Żółć gęślą jaźń")).toBe("zolc-gesla-jazn");
  });
  it("kebab-cases and trims", () => {
    expect(slugify("  O aplikacji!  ")).toBe("o-aplikacji");
    expect(slugify("A -- B / C")).toBe("a-b-c");
  });
});
