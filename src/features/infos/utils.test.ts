import { describe, expect, it } from "vitest";
import { findEmail } from "./utils";

describe("findEmail", () => {
  it("finds plain text addresses", () => {
    expect(findEmail("<p>Pisz: kontakt@jedno.net lub dzwoń</p>")).toBe("kontakt@jedno.net");
  });
  it("prefers mailto links", () => {
    expect(findEmail('<a href="mailto:a@b.pl?subject=x">napisz</a> c@d.pl')).toBe("a@b.pl");
  });
  it("returns null when none", () => {
    expect(findEmail("<p>brak</p>")).toBeNull();
  });
});
