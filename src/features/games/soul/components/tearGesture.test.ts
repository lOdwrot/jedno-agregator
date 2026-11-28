import { describe, expect, it } from "vitest";
import { cutDir, cutDone, cutProgress, extendCut, type Cut } from "./tearGesture";

const box = { left: 100, top: 200, width: 200, height: 320 };
const swipe = (points: [number, number][]) =>
  points.reduce<Cut | null>((c, [x, y]) => extendCut(c, box, x, y), null);

describe("tear gesture", () => {
  it("tears after sweeping most of the pack's width across its top", () => {
    const cut = swipe([
      [20, 230],
      [150, 235],
      [260, 240],
    ]);
    expect(cutProgress(cut)).toBeCloseTo(0.8);
    expect(cutDone(cut)).toBe(true);
    expect(cutDir(cut)).toBe(1);
  });

  it("counts a swipe across the whole screen, either way", () => {
    const cut = swipe([
      [500, 210],
      [0, 220],
    ]);
    expect(cutProgress(cut)).toBe(1);
    expect(cutDir(cut)).toBe(-1);
  });

  it("ignores moves far from the top of the pack", () => {
    expect(
      swipe([
        [100, 450],
        [300, 450],
      ]),
    ).toBeNull();
    expect(
      cutDone(
        swipe([
          [100, 230],
          [140, 230],
          [300, 480],
        ]),
      ),
    ).toBe(false);
  });

  it("a short swipe is not enough", () => {
    expect(
      cutDone(
        swipe([
          [150, 220],
          [230, 220],
        ]),
      ),
    ).toBe(false);
  });
});
