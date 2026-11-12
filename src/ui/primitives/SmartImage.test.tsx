import { buildSrcSet } from "./srcset";

describe("buildSrcSet", () => {
  it("adds width and drops height for admin.jedno.net", () => {
    const out = buildSrcSet("https://admin.jedno.net/media/a.jpg?width=100&height=50", [320, 640]);
    expect(out).toBe(
      "https://admin.jedno.net/media/a.jpg?width=320 320w, https://admin.jedno.net/media/a.jpg?width=640 640w",
    );
  });

  it("keeps other query params", () => {
    expect(buildSrcSet("https://admin.jedno.net/media/a.jpg?rnd=1", [400])).toBe(
      "https://admin.jedno.net/media/a.jpg?rnd=1&width=400 400w",
    );
  });

  it("returns undefined for other hosts, invalid urls or no widths", () => {
    expect(buildSrcSet("https://example.com/a.jpg", [320])).toBeUndefined();
    expect(buildSrcSet("/relative.jpg", [320])).toBeUndefined();
    expect(buildSrcSet("https://admin.jedno.net/a.jpg", [])).toBeUndefined();
  });
});
