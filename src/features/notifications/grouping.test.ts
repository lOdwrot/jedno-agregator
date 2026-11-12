import { describe, expect, it } from "vitest";
import type { Notification } from "@/data/schemas";
import { groupNotifications, notificationPath } from "./grouping";

const n = (
  id: number,
  publishDate: string,
  target: Notification["target"] = null,
): Notification => ({ id, title: "t", description: null, publishDate, target });

describe("notifications grouping", () => {
  it("builds target paths", () => {
    expect(notificationPath(n(1, "2026-11-10T10:00:00Z", { kind: "news", id: 5 }))).toBe(
      "/aktualnosci/5",
    );
    expect(notificationPath(n(1, "2026-11-10T10:00:00Z", { kind: "event", id: 7 }))).toBe(
      "/wydarzenia/7",
    );
    expect(notificationPath(n(1, "2026-11-10T10:00:00Z"))).toBeNull();
  });

  it("groups consecutive items by relative day", () => {
    const now = new Date("2026-11-12T12:00:00+01:00");
    const groups = groupNotifications(
      [
        n(1, "2026-11-12T08:00:00+01:00"),
        n(2, "2026-11-12T07:00:00+01:00"),
        n(3, "2026-11-11T09:00:00+01:00"),
      ],
      now,
    );
    expect(groups.map((g) => [g.label, g.items.length])).toEqual([
      ["Dzisiaj", 2],
      ["Wczoraj", 1],
    ]);
  });
});
