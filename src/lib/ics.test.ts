import { describe, expect, it } from "vitest";
import type { Event } from "@/data/schemas";
import { buildIcs, foldLine, googleCalendarUrl } from "./ics";

const base: Event = {
  id: 7,
  title: "Msza; z, przecinkiem",
  subtitle: "",
  start: "2026-11-13T19:30:00+01:00",
  end: null,
  location: "Bazylika Mariacka, Gdańsk",
  mapsLink: null,
  tag: null,
  html: "<p>Linia pierwsza</p><p>Druga</p>",
  imageUrl: null,
  thumbnailUrl: null,
  publishDate: null,
  author: null,
};
const SITE = "https://lodwrot.github.io/jedno-agregator/";

describe("buildIcs", () => {
  const ics = buildIcs(base, SITE);
  it("is a CRLF VEVENT in UTC with default 2h duration", () => {
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
    expect(ics).toContain("DTSTART:20261113T183000Z");
    expect(ics).toContain("DTEND:20261113T203000Z");
    expect(ics).toContain("UID:event-7@lodwrot.github.io");
  });
  it("escapes text", () => {
    expect(ics).toContain("SUMMARY:Msza\\; z\\, przecinkiem");
    expect(ics).toContain("LOCATION:Bazylika Mariacka\\, Gdańsk");
    expect(ics).toContain("Linia pierwsza\\nDruga");
    expect(ics).toContain("https://lodwrot.github.io/jedno-agregator/wydarzenia/7");
  });
  it("uses explicit end", () => {
    expect(buildIcs({ ...base, end: "2026-11-13T21:00:00+01:00" }, SITE)).toContain(
      "DTEND:20261113T200000Z",
    );
  });
  it("folds long lines at 75 octets", () => {
    const long = buildIcs({ ...base, html: `<p>${"zażółć gęślą jaźń ".repeat(30)}</p>` }, SITE);
    const enc = new TextEncoder();
    for (const l of long.split("\r\n")) expect(enc.encode(l).length).toBeLessThanOrEqual(75);
    expect(long.replace(/\r\n /g, "")).toContain("zażółć gęślą jaźń zażółć");
  });
  it("foldLine leaves short lines alone", () => {
    expect(foldLine("abc")).toBe("abc");
  });
});

describe("googleCalendarUrl", () => {
  it("builds a template link", () => {
    const url = new URL(googleCalendarUrl(base, SITE));
    expect(url.searchParams.get("dates")).toBe("20261113T183000Z/20261113T203000Z");
    expect(url.searchParams.get("text")).toBe(base.title);
    expect(url.searchParams.get("location")).toBe(base.location);
  });
});
