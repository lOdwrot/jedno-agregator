import { describe, expect, it } from "vitest";
import { atRest, settle, type Spin } from "./spring";

const run = (s: Spin) => {
  for (let i = 0; i < 600 && !atRest(s); i++) s = settle(s, 1 / 60);
  return s;
};

describe("album card spring", () => {
  it("a small turn springs back to the front", () => {
    const s = run({ ax: 20, ay: 40, vx: 0, vy: 0 });
    expect(s.ay).toBeCloseTo(0, 0);
    expect(s.ax).toBeCloseTo(0, 0);
  });
  it("a throw past the edge lands on the back", () => {
    expect(run({ ax: 0, ay: 120, vx: 0, vy: 300 }).ay).toBeCloseTo(180, 0);
  });
});
