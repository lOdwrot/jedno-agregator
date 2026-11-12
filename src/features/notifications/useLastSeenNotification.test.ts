import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import type { Notification } from "@/data/schemas";
import {
  LAST_SEEN_KEY,
  countNew,
  isNewer,
  newestDate,
  readLastSeen,
  useLastSeenNotification,
} from "./useLastSeenNotification";

const n = (id: number, publishDate: string): Notification => ({ id, title: `t${id}`, description: null, publishDate, target: null });

describe("last seen helpers", () => {
  beforeEach(() => localStorage.clear());

  it("treats everything as new when never seen", () => {
    expect(isNewer("2026-01-01T00:00:00Z", null)).toBe(true);
  });

  it("counts only items newer than lastSeen", () => {
    const items = [n(1, "2026-11-10T10:00:00Z"), n(2, "2026-11-08T10:00:00Z")];
    expect(countNew(items, "2026-11-09T00:00:00Z")).toBe(1);
    expect(countNew(items, "2026-11-10T10:00:00Z")).toBe(0);
  });

  it("finds the newest date", () => {
    expect(newestDate([])).toBeNull();
    expect(newestDate([n(1, "2026-11-08T10:00:00Z"), n(2, "2026-11-10T10:00:00Z")])).toBe("2026-11-10T10:00:00Z");
  });

  it("ignores garbage in storage", () => {
    localStorage.setItem(LAST_SEEN_KEY, "nonsense");
    expect(readLastSeen()).toBeNull();
  });
});

describe("useLastSeenNotification", () => {
  beforeEach(() => localStorage.clear());

  it("persists markSeen and never moves backwards", () => {
    const { result } = renderHook(() => useLastSeenNotification());
    expect(result.current.lastSeen).toBeNull();
    act(() => result.current.markSeen("2026-11-10T10:00:00Z"));
    expect(result.current.lastSeen).toBe("2026-11-10T10:00:00Z");
    expect(localStorage.getItem(LAST_SEEN_KEY)).toBe("2026-11-10T10:00:00Z");
    act(() => result.current.markSeen("2026-11-01T10:00:00Z"));
    expect(result.current.lastSeen).toBe("2026-11-10T10:00:00Z");
    act(() => result.current.markSeen(null));
    expect(result.current.lastSeen).toBe("2026-11-10T10:00:00Z");
  });

  it("syncs between hook instances", () => {
    const a = renderHook(() => useLastSeenNotification());
    const b = renderHook(() => useLastSeenNotification());
    act(() => a.result.current.markSeen("2026-11-10T10:00:00Z"));
    expect(b.result.current.lastSeen).toBe("2026-11-10T10:00:00Z");
  });
});
