import { describe, expect, it } from "vitest";
import { excerpt, extractYouTubeId, sanitizeHtml, splitRichContent, stripHtml } from "./html";

describe("extractYouTubeId", () => {
  it.each([
    ["https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=3", "dQw4w9WgXcQ"],
    ["https://youtu.be/dQw4w9WgXcQ?si=x", "dQw4w9WgXcQ"],
    ["https://www.youtube.com/embed/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://www.youtube.com/shorts/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
  ])("%s", (url, id) => expect(extractYouTubeId(url)).toBe(id));
  it("rejects others", () => {
    expect(extractYouTubeId("https://vimeo.com/123")).toBeNull();
    expect(extractYouTubeId("https://evil.com/watch?v=dQw4w9WgXcQ")).toBeNull();
    expect(extractYouTubeId("")).toBeNull();
  });
});

describe("sanitizeHtml", () => {
  it("strips scripts, handlers and unknown iframes", () => {
    const out = sanitizeHtml(
      `<p onclick="x()">a<script>alert(1)</script></p><iframe src="https://evil.com/x"></iframe>`,
    );
    expect(out).toBe("<p>a</p>");
  });
  it("keeps youtube iframes", () => {
    expect(sanitizeHtml(`<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ"></iframe>`)).toContain("<iframe");
  });
  it("keeps only text-align in style", () => {
    const out = sanitizeHtml(`<p style="color:red; text-align: center">x</p><p style="color:red">y</p>`);
    expect(out).toContain(`style="text-align:center"`);
    expect(out).not.toContain("color");
  });
  it("adds rel/target to external links", () => {
    const out = sanitizeHtml(`<a href="https://example.com">x</a><a href="/local">y</a>`);
    expect(out).toContain(`target="_blank"`);
    expect(out).toContain("noopener");
    expect(out.match(/target=/g)).toHaveLength(1);
  });
});

describe("splitRichContent", () => {
  it("splits umb embed holders, iframes and bare links", () => {
    const html = [
      "<p>Intro</p>",
      `<div class="umb-embed-holder" data-embed-url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" data-embed-width="360"></div>`,
      "<p>Middle</p>",
      `<p><iframe src="https://www.youtube-nocookie.com/embed/aaaaaaaaaaa" title="Foo"></iframe></p>`,
      `<p><a href="https://youtu.be/bbbbbbbbbbb">https://youtu.be/bbbbbbbbbbb</a></p>`,
      `<p>Text with <a href="https://youtu.be/ccccccccccc">link</a> inline</p>`,
    ].join("");
    const segs = splitRichContent(html);
    expect(segs.map((s) => s.type)).toEqual(["html", "youtube", "html", "youtube", "youtube", "html"]);
    expect(segs[1]).toMatchObject({ videoId: "dQw4w9WgXcQ" });
    expect(segs[3]).toMatchObject({ videoId: "aaaaaaaaaaa", title: "Foo" });
    expect(segs[4]).toMatchObject({ videoId: "bbbbbbbbbbb" });
  });
  it("handles the real Umbraco holder that wraps an iframe", () => {
    const html = `<div class="umb-embed-holder" data-embed-url="https://www.youtube.com/watch?v=rKaWjbg6Zvw" data-embed-width="360"><iframe width="360" height="203" src="https://www.youtube.com/embed/rKaWjbg6Zvw?feature=oembed" title="Diakonia" allowfullscreen></iframe></div>`;
    expect(splitRichContent(html)).toEqual([{ type: "youtube", videoId: "rKaWjbg6Zvw", title: "Diakonia" }]);
  });
  it("handles empty", () => {
    expect(splitRichContent("")).toEqual([]);
  });
});

describe("stripHtml / excerpt", () => {
  it("keeps paragraph breaks", () => {
    expect(stripHtml("<p>One&nbsp;two</p><p>Three<br>four</p>")).toBe("One two\nThree\nfour");
  });
  it("cuts at word boundary", () => {
    const out = excerpt("<p>Lorem ipsum dolor sit amet, consectetur adipiscing</p>", 30);
    expect(out.endsWith("…")).toBe(true);
    expect(out.length).toBeLessThanOrEqual(30);
    expect(excerpt("<p>short</p>", 30)).toBe("short");
  });
});
