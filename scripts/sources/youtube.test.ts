import { describe, expect, it } from "vitest";
import { VideoSchema, type Video } from "../../src/data/schemas.ts";
import { mergeVideos, parseYoutubeFeed } from "./youtube.ts";

const XML = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015" xmlns:media="http://search.yahoo.com/mrss/" xmlns="http://www.w3.org/2005/Atom">
 <title>Archidiecezja Gdańska</title>
 <entry>
  <id>yt:video:AAAAAAAAAAA</id>
  <yt:videoId>AAAAAAAAAAA</yt:videoId>
  <title>Film &amp; pierwszy</title>
  <published>2026-11-11T17:10:28+00:00</published>
  <media:group>
   <media:title>Film &amp; pierwszy</media:title>
   <media:thumbnail url="https://i1.ytimg.com/vi/AAAAAAAAAAA/hqdefault.jpg" width="480" height="360"/>
   <media:description>Opis
druga linia</media:description>
   <media:community><media:starRating count="3" average="5.00" min="1" max="5"/><media:statistics views="1234"/></media:community>
  </media:group>
 </entry>
 <entry>
  <yt:videoId>BBBBBBBBBBB</yt:videoId>
  <title>2026</title>
  <published>2026-11-01T10:00:00+00:00</published>
  <media:group><media:description/></media:group>
 </entry>
</feed>`;

describe("youtube", () => {
  it("parses feed", () => {
    const v = parseYoutubeFeed(XML);
    expect(v).toHaveLength(2);
    expect(v[0]).toEqual({
      id: "AAAAAAAAAAA",
      title: "Film & pierwszy",
      description: "Opis\ndruga linia",
      publishedAt: "2026-11-11T17:10:28+00:00",
      thumbnailUrl: "https://i.ytimg.com/vi/AAAAAAAAAAA/hqdefault.jpg",
      views: 1234,
      url: "https://www.youtube.com/watch?v=AAAAAAAAAAA",
    });
    expect(v[1]).toMatchObject({ title: "2026", description: "", views: null });
    v.forEach((x) => VideoSchema.parse(x));
  });
  it("merges, dedupes, sorts and caps", () => {
    const mk = (id: string, publishedAt: string, views: number | null = 1): Video => ({
      id, title: id, description: "", publishedAt, thumbnailUrl: "", views, url: "",
    });
    const prev = [mk("a", "2026-01-01"), mk("b", "2026-02-01"), mk("c", "2026-03-01")];
    const fresh = [mk("d", "2026-04-01"), mk("b", "2026-02-01", 99)];
    const merged = mergeVideos(prev, fresh);
    expect(merged.map((v) => v.id)).toEqual(["d", "c", "b", "a"]);
    expect(merged.find((v) => v.id === "b")!.views).toBe(99);
    expect(mergeVideos(prev, fresh, 2).map((v) => v.id)).toEqual(["d", "c"]);
  });
});
