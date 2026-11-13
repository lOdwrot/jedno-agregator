import { describe, expect, it } from "vitest";
import {
  GOAL,
  LANES,
  SHORE_Y,
  createLevel,
  moveLane,
  shoreLineY,
  startRedSea,
  stepRedSea,
  stretchHand,
  type RedSeaState,
} from "./engine";

const run = (s: RedSeaState, seconds: number) => {
  let x = s;
  for (let t = 0; t < seconds; t += 1 / 60) x = stepRedSea(x, 1 / 60);
  return x;
};

const toShore = (s: RedSeaState) => {
  let x = s;
  for (let i = 0; i < 60 * 60 && x.phase === "running"; i++) x = stepRedSea(x, 1 / 60);
  return x;
};

/** A level with no items lets us test the chase/shore logic in isolation. */
const empty = () => ({ ...startRedSea(1), items: [] });

describe("Red Sea engine", () => {
  it("every row of the level leaves at least one free lane", () => {
    const items = createLevel(42);
    const rows = new Map<number, number>();
    for (const it of items) if (it.kind !== "sheep") rows.set(it.at, (rows.get(it.at) ?? 0) + 1);
    expect(items.length).toBeGreaterThan(10);
    for (const n of rows.values()) expect(n).toBeLessThan(LANES.length);
  });

  it("lanes are clamped", () => {
    let s = startRedSea(1);
    s = moveLane(moveLane(moveLane(s, -1), -1), -1);
    expect(s.lane).toBe(0);
    s = moveLane(moveLane(moveLane(s, 1), 1), 1);
    expect(s.lane).toBe(2);
  });

  it("hitting an obstacle stuns and lets the chariots close in", () => {
    const s = {
      ...empty(),
      items: [{ id: 1, lane: 1, at: 100, kind: "crab" as const, taken: false }],
    };
    const after = run(s, 0.6);
    expect(after.hits).toBe(1);
    expect(after.stun).toBeGreaterThan(0);
    expect(after.gap).toBeLessThan(s.gap);
  });

  it("sheep are collected", () => {
    const s = {
      ...empty(),
      items: [{ id: 1, lane: 1, at: 100, kind: "sheep" as const, taken: false }],
    };
    expect(run(s, 0.6).sheep).toBe(1);
  });

  it("reaching the far shore, then stretching the hand, wins", () => {
    const shore = toShore(empty());
    expect(shore.phase).toBe("shore");
    expect(Math.round(shoreLineY(shore))).toBe(SHORE_Y);
    expect(shore.d).toBe(GOAL);
    expect(moveLane(shore, 1).lane).toBe(shore.lane);
    const won = run(stretchHand(shore), 3);
    expect(won.phase).toBe("won");
  });

  it("waiting on the shore lets the Egyptians catch you", () => {
    const shore = toShore(empty());
    expect(run(shore, 5).phase).toBe("lost");
  });

  it("standing in a fully blocked lane repeatedly gets you caught", () => {
    const items = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      lane: 1,
      at: 80 + i * 60,
      kind: "rock" as const,
      taken: false,
    }));
    expect(run({ ...empty(), items }, 12).phase).toBe("lost");
  });
});
