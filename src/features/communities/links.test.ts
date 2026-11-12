import { describe, expect, it } from "vitest";
import { extractLinks, pluralCommunities } from "./links";

describe("extractLinks", () => {
  it("returns unique safe links with labels", () => {
    const html =
      '<p><a href="https://a.pl/">Strona</a> <a href="https://a.pl/">dup</a> <a href="javascript:alert(1)">x</a> <a href="mailto:x@y.pl"></a> <a href="/rel">r</a></p>';
    expect(extractLinks(html)).toEqual([
      { href: "https://a.pl/", label: "Strona" },
      { href: "mailto:x@y.pl", label: "x@y.pl" },
    ]);
  });
  it("handles empty html", () => {
    expect(extractLinks("")).toEqual([]);
  });
});

describe("pluralCommunities", () => {
  it("pluralizes", () => {
    expect(pluralCommunities(1)).toBe("społeczność");
    expect(pluralCommunities(9)).toBe("społeczności");
  });
});
