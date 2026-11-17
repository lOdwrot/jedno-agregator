import { afterEach, describe, expect, it, vi } from "vitest";
import { initAnalytics, track } from "./analytics";

afterEach(() => {
  document.head.querySelectorAll("script").forEach((s) => s.remove());
  delete window.umami;
});

describe("analytics", () => {
  it("does nothing without a website id", () => {
    initAnalytics(undefined);
    expect(document.head.querySelector("script")).toBeNull();
  });

  it("loads the Umami script once, limited to the live domain", () => {
    initAnalytics("abc");
    initAnalytics("abc");
    const scripts = document.head.querySelectorAll("script");
    expect(scripts).toHaveLength(1);
    expect(scripts[0]!.dataset.websiteId).toBe("abc");
    expect(scripts[0]!.dataset.domains).toBe("lodwrot.github.io");
  });

  it("forwards events and swallows errors", () => {
    expect(() => track("x")).not.toThrow();
    const spy = vi.fn();
    window.umami = { track: spy };
    track("duel_start", { difficulty: "łatwy" });
    expect(spy).toHaveBeenCalledWith("duel_start", { difficulty: "łatwy" });
    window.umami = {
      track: () => {
        throw new Error("blocked");
      },
    };
    expect(() => track("x")).not.toThrow();
  });
});
