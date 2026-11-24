import { afterEach, describe, expect, it, vi } from "vitest";
import { initAnalytics, NEW_VISITOR_EVENT, track } from "./analytics";
import { readVisitorId, resetConsent, setConsent } from "./consent";

afterEach(() => {
  document.head.querySelectorAll("script").forEach((s) => s.remove());
  delete window.umami;
  resetConsent();
  localStorage.clear();
});

const script = () => document.head.querySelector("script")!;

describe("analytics", () => {
  it("does nothing without a website id", () => {
    initAnalytics(undefined);
    expect(document.head.querySelector("script")).toBeNull();
  });

  it("loads the Umami script once, limited to the live domain, without an id by default", () => {
    initAnalytics("abc");
    initAnalytics("abc");
    const scripts = document.head.querySelectorAll("script");
    expect(scripts).toHaveLength(1);
    expect(scripts[0]!.dataset.websiteId).toBe("abc");
    expect(scripts[0]!.dataset.domains).toBe("lodwrot.github.io");
    expect(scripts[0]!.dataset.distinctId).toBeUndefined();
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

  it("on consent creates an id, identifies and announces a new visitor once the script loads", () => {
    initAnalytics("abc");
    setConsent("granted");
    const id = readVisitorId();
    expect(id).toMatch(/^[0-9a-f]{32}$/);
    const trackSpy = vi.fn();
    const identifySpy = vi.fn();
    window.umami = { track: trackSpy, identify: identifySpy };
    script().dispatchEvent(new Event("load"));
    expect(identifySpy).toHaveBeenCalledWith(id);
    expect(trackSpy).toHaveBeenCalledWith(NEW_VISITOR_EVENT, undefined);
  });

  it("a returning visitor sends the stored id with the first pageview and is not new again", () => {
    setConsent("granted");
    localStorage.setItem("jedno-visitor-id", "abc123");
    const trackSpy = vi.fn();
    window.umami = { track: trackSpy };
    initAnalytics("abc");
    expect(script().dataset.distinctId).toBe("abc123");
    expect(trackSpy).not.toHaveBeenCalled();
  });

  it("refusing stores no id", () => {
    initAnalytics("abc");
    setConsent("denied");
    expect(readVisitorId()).toBeNull();
    expect(script().dataset.distinctId).toBeUndefined();
  });
});
