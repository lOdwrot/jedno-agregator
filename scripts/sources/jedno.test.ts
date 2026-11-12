import { describe, expect, it } from "vitest";
import { EventSchema, InfoSchema, NewsSchema, NotificationSchema, PartnerSchema } from "../../src/data/schemas.ts";
import {
  absolutizeHtml,
  fetchEvents,
  fetchNews,
  normalizeEvent,
  normalizeInfos,
  normalizeNews,
  normalizeNotification,
  normalizePartner,
  parseLinkedEventId,
  parseNotificationTarget,
  withWarsawOffset,
  type GetJson,
} from "./jedno.ts";

const BASE = "https://admin.jedno.net";

describe("absolutizeHtml", () => {
  it("makes relative urls absolute and null -> ''", () => {
    expect(absolutizeHtml(null, BASE)).toBe("");
    const out = absolutizeHtml(
      `<img src="/media/a.jpg"><a href='docs/x.pdf'>x</a><a href="https://e.com/a">e</a><a href="mailto:a@b.pl">m</a><a href="#top">t</a><img src="//cdn.x/y.png">`,
      BASE,
    );
    expect(out).toContain(`src="https://admin.jedno.net/media/a.jpg"`);
    expect(out).toContain(`href='https://admin.jedno.net/docs/x.pdf'`);
    expect(out).toContain(`href="https://e.com/a"`);
    expect(out).toContain(`href="mailto:a@b.pl"`);
    expect(out).toContain(`href="#top"`);
    expect(out).toContain(`src="https://cdn.x/y.png"`);
  });
  it("handles srcset", () => {
    expect(absolutizeHtml(`<img srcset="/a.jpg 1x, /b.jpg 2x">`, BASE)).toContain(
      `srcset="https://admin.jedno.net/a.jpg 1x, https://admin.jedno.net/b.jpg 2x"`,
    );
  });
  it("handles umbraco embed url", () => {
    const html = `<div class="umb-embed-holder" data-embed-url="https://www.youtube.com/watch?v=x"></div>`;
    expect(absolutizeHtml(html, BASE)).toBe(html);
  });
});

describe("withWarsawOffset", () => {
  it("keeps explicit offsets", () => {
    expect(withWarsawOffset("2026-11-13T19:30:00+01:00")).toBe("2026-11-13T19:30:00+01:00");
    expect(withWarsawOffset("2026-11-13T18:30:00Z")).toBe("2026-11-13T18:30:00Z");
    expect(withWarsawOffset(null)).toBeNull();
  });
  it("adds CET/CEST offsets to naive datetimes", () => {
    expect(withWarsawOffset("2026-11-13T19:30:00")).toBe("2026-11-13T19:30:00+01:00");
    expect(withWarsawOffset("2026-05-29T18:00:00.000")).toBe("2026-05-29T18:00:00+02:00");
    expect(withWarsawOffset("2026-07-01 08:15")).toBe("2026-07-01T08:15:00+02:00");
  });
});

describe("news", () => {
  it("parses linked event and alias", () => {
    expect(parseLinkedEventId("general/events/2035")).toBe(2035);
    expect(parseLinkedEventId("")).toBeNull();
    expect(parseLinkedEventId(null)).toBeNull();
    expect(parseLinkedEventId("general/events/abc")).toBeNull();
    const n = normalizeNews(
      { id: 1, title: " T ", subtitle: null, date: "2026-11-10T10:00:00+01:00", text: null, imageUrl: "/m/i.jpg", author: "  ", tag: " Wydarzenie ", linkedEventPath: "general/events/9" },
      { id: 1, date: "2026-11-10T10:00:00+01:00", text: '<p><img src="/m/x.png"></p>' },
      BASE,
    );
    expect(NewsSchema.parse(n)).toEqual({
      id: 1,
      title: "T",
      subtitle: "",
      date: "2026-11-10T10:00:00+01:00",
      html: '<p><img src="https://admin.jedno.net/m/x.png"></p>',
      imageUrl: "https://admin.jedno.net/m/i.jpg",
      author: null,
      tag: "Wydarzenie",
      linkedEventId: 9,
      isEventAlias: true,
    });
  });
});

describe("events/partners/infos/notifications", () => {
  it("normalizes event", () => {
    const e = normalizeEvent(
      { id: 5, title: "E", start: "2026-11-13T19:30:00", end: null, location: " Kościół ", mapsLink: "", tag: " Koncert ", imageUrl: null, thumbnailUrl: null, publishDate: "2026-11-01T00:00:00Z", author: "Jan" },
      { id: 5, start: "x", description: "<p>d</p>" },
      BASE,
    );
    expect(EventSchema.parse(e)).toMatchObject({
      start: "2026-11-13T19:30:00+01:00",
      end: null,
      location: "Kościół",
      mapsLink: null,
      tag: "Koncert",
      html: "<p>d</p>",
    });
  });
  it("trims partner category", () => {
    const p = normalizePartner({ id: 1, name: "A", category: "Wspólnoty  ", description: null }, BASE);
    expect(PartnerSchema.parse(p).category).toBe("Wspólnoty");
    expect(p.html).toBe("");
  });
  it("builds unique slugs", () => {
    const infos = normalizeInfos(
      [
        { id: 1, title: "O aplikacji", text: "<p>x</p>", hasForm: false },
        { id: 2, title: "Dołącz jako Autor", text: null, hasForm: true, formTitle: "F", formPlaceholder: null, formButtonLabel: "Wyślij" },
        { id: 3, title: "O aplikacji", text: "", hasForm: false },
      ],
      BASE,
    );
    expect(infos.map((i) => i.slug)).toEqual(["o-aplikacji", "dolacz-jako-autor", "o-aplikacji-3"]);
    infos.forEach((i) => InfoSchema.parse(i));
  });
  it("parses notification targets", () => {
    expect(parseNotificationTarget("general/news/12")).toEqual({ kind: "news", id: 12 });
    expect(parseNotificationTarget("general/events/2035")).toEqual({ kind: "event", id: 2035 });
    expect(parseNotificationTarget("festival/agenda/1/2")).toBeNull();
    expect(parseNotificationTarget(undefined)).toBeNull();
    const n = normalizeNotification({ id: 1, title: "t", publishDate: "2026-11-01T10:00:00Z", pathToContent: "general/news/3" });
    expect(NotificationSchema.parse(n).target).toEqual({ kind: "news", id: 3 });
  });
});

describe("fetchers (fake API)", () => {
  const calls: string[] = [];
  const fake: GetJson = async <T>(path: string) => {
    calls.push(path);
    if (path.startsWith("/api/news?")) {
      const page = Number(/pageNumber=(\d+)/.exec(path)![1]);
      const n = page === 1 ? 50 : 3;
      return Array.from({ length: n }, (_, i) => ({ id: (page - 1) * 100 + i + 1, date: `2026-10-${String((i % 28) + 1).padStart(2, "0")}T10:00:00+02:00`, title: "n", text: null })) as T;
    }
    if (path.startsWith("/api/news/")) return { id: Number(path.split("/").pop()), date: "2026-10-01T10:00:00+02:00", text: "<p>body</p>" } as T;
    if (path.startsWith("/api/events?")) return [
      { id: 2, start: "2026-12-01T10:00:00+01:00", title: "later" },
      { id: 1, start: "2026-11-01T10:00:00+01:00", title: "sooner" },
    ] as T;
    if (path.startsWith("/api/events/")) return { id: Number(path.split("/").pop()), start: "2026-11-01T10:00:00+01:00", description: "<p>d</p>" } as T;
    throw new Error("unexpected " + path);
  };
  it("paginates until a short page and fetches details", async () => {
    const news = await fetchNews(fake, BASE);
    expect(news).toHaveLength(53);
    expect(news.every((n) => n.html === "<p>body</p>")).toBe(true);
    expect(calls.filter((c) => c.startsWith("/api/news?"))).toHaveLength(2);
    for (let i = 1; i < news.length; i++) expect(news[i - 1]!.date >= news[i]!.date).toBe(true);
  });
  it("sorts events ascending by start", async () => {
    const events = await fetchEvents(fake, BASE);
    expect(events.map((e) => e.id)).toEqual([1, 2]);
  });
});
