import { afterEach, describe, expect, it } from "vitest";
import { ensureVisitorId, getConsent, readVisitorId, resetConsent, setConsent } from "./consent";

afterEach(() => {
  resetConsent();
  localStorage.clear();
});

describe("consent", () => {
  it("remembers the choice", () => {
    expect(getConsent()).toBeNull();
    setConsent("granted");
    expect(getConsent()).toBe("granted");
    expect(localStorage.getItem("jedno-stats-consent")).toBe("granted");
  });

  it("creates the visitor id once and deletes it when consent is withdrawn", () => {
    const first = ensureVisitorId();
    expect(first?.created).toBe(true);
    expect(ensureVisitorId()).toEqual({ id: first!.id, created: false });
    setConsent("denied");
    expect(readVisitorId()).toBeNull();
  });
});
