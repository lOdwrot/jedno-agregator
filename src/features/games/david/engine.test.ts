import { describe, expect, it } from "vitest";
import {
  CATCH_X,
  GRAVITY,
  SLING,
  STONES,
  goliathZones,
  setAim,
  startDavid,
  stepDavid,
  swingAngle,
  tap,
  throwStone,
  type DavidState,
} from "./engine";

function run(s: DavidState, seconds: number) {
  let x = s;
  for (let t = 0; t < seconds; t += 1 / 60) x = stepDavid(x, 1 / 60);
  return x;
}

/** Brute-force an aim that hits the face of a standing Goliath (speed 0). */
function findWinningAim(s: DavidState) {
  for (let angle = 5; angle <= 80; angle += 1)
    for (let p = 0; p <= 1; p += 0.01) {
      const r = run(throwStone(setAim(s, angle, p)), 3);
      if (r.phase === "won") return { angle, p };
    }
  return null;
}

describe("David engine", () => {
  it("throwing uses a stone and only one can fly at a time", () => {
    const s = throwStone(startDavid());
    expect(s.stonesLeft).toBe(STONES - 1);
    expect(s.stone).not.toBeNull();
    expect(throwStone(s).stonesLeft).toBe(STONES - 1);
  });

  it("two taps: first locks the swinging angle, second locks power and throws", () => {
    let s = run(startDavid(), 0.5);
    expect(s.aimStage).toBe("angle");
    expect(s.aim.angle).toBeCloseTo(swingAngle(s.aimT), 5);
    s = tap(s);
    const locked = s.aim.angle;
    expect(s.aimStage).toBe("power");
    s = run(s, 0.4);
    expect(s.aim.angle).toBe(locked);
    expect(s.aim.power).toBeGreaterThan(0);
    s = tap(s);
    expect(s.stone).not.toBeNull();
    expect(s.stonesLeft).toBe(STONES - 1);
    expect(s.aimStage).toBe("angle");
  });

  it("does nothing before the game starts", () => {
    const s = startDavid();
    expect(throwStone({ ...s, phase: "intro" }).stone).toBeNull();
  });

  it("a face hit wins — and such an aim exists", () => {
    const s = { ...startDavid(), speed: 0 };
    expect(findWinningAim(s)).not.toBeNull();
  });

  it("a stone that falls short is a miss and returns to playing", () => {
    const s = run(throwStone(setAim({ ...startDavid(), speed: 0 }, 10, 0)), 3);
    expect(s.phase).toBe("playing");
    expect(s.stone).toBeNull();
    expect(s.feedback?.kind).toBe("miss");
  });

  it("losing the last stone ends the game", () => {
    const s = run(throwStone(setAim({ ...startDavid(), stonesLeft: 1, speed: 0 }, 10, 0)), 3);
    expect(s.phase).toBe("lost");
    expect(s.lostReason).toBe("stones");
  });

  it("Goliath walking up to David catches him", () => {
    const s = run(startDavid(), 60);
    expect(s.phase).toBe("lost");
    expect(s.lostReason).toBe("caught");
    expect(s.goliathX).toBeLessThanOrEqual(CATCH_X);
  });

  it("face zone sits under the helmet", () => {
    const z = goliathZones(600);
    expect(z.face.y).toBeGreaterThan(z.helmet.y2);
    expect(SLING.y).toBeGreaterThan(z.face.y);
    expect(GRAVITY).toBeGreaterThan(0);
  });
});
