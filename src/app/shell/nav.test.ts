import { describe, expect, it } from "vitest";
import { BOTTOM_NAV_ITEMS, NAV_ITEMS, isNavActive } from "./nav";

describe("isNavActive", () => {
  it("matches home only exactly", () => {
    expect(isNavActive("/", "/")).toBe(true);
    expect(isNavActive("/aktualnosci", "/")).toBe(false);
  });
  it("keeps section active on detail pages", () => {
    expect(isNavActive("/wydarzenia/12", "/wydarzenia")).toBe(true);
    expect(isNavActive("/media/instagram", "/media")).toBe(true);
  });
  it("does not match prefixes of other words and ignores trailing slash", () => {
    expect(isNavActive("/wydarzeniax", "/wydarzenia")).toBe(false);
    expect(isNavActive("/aktualnosci/", "/aktualnosci")).toBe(true);
  });
});

describe("nav items", () => {
  it("keeps the bottom bar at 5 tabs while the header lists games too", () => {
    expect(BOTTOM_NAV_ITEMS).toHaveLength(5);
    expect(NAV_ITEMS.map((i) => i.label)).toContain("Gry");
  });
});
