import { describe, expect, it } from "vitest";
import { emit, project, rotate, stepParticles } from "./glassParticles";

const seq = () => {
  let i = 0;
  return () => (i = (i * 9301 + 49297) % 233280) / 233280;
};
const size = { w: 300, h: 420 };

describe("glass particles", () => {
  it("rotates like CSS: rotateY(90) turns the face normal to +x", () => {
    const n = rotate({ x: 0, y: 0, z: 1 }, 0, 90);
    expect(n.x).toBeCloseTo(1);
    expect(n.z).toBeCloseTo(0);
    const t = rotate({ x: 0, y: 0, z: 1 }, 90, 0);
    expect(t.y).toBeCloseTo(-1);
  });

  it("closer points look bigger", () => {
    expect(project({ x: 10, y: 0, z: 100 }, 900).s).toBeGreaterThan(1);
    expect(project({ x: 10, y: 0, z: -100 }, 900).s).toBeLessThan(1);
  });

  it("plain prints emit nothing, stained ones more the faster the card turns", () => {
    const pose = { ax: 0, ay: 0 };
    expect(emit("plain", pose, pose, 0.1, size, 0, seq()).born).toHaveLength(0);
    const still = emit("stained", pose, pose, 0.5, size, 0, seq()).born.length;
    const spin = emit("stained", pose, { ax: 0, ay: 40 }, 0.5, size, 0, seq()).born.length;
    expect(spin).toBeGreaterThan(still);
    expect(emit("gilded", pose, { ax: 0, ay: 40 }, 0.5, size, 0, seq()).born.length).toBeLessThan(
      spin,
    );
  });

  it("nothing comes off the back of the card", () => {
    const back = { ax: 0, ay: 180 };
    expect(emit("stained", back, back, 1, size, 0, seq()).born).toHaveLength(0);
  });

  it("particles fly off the face and die", () => {
    const born = emit("stained", { ax: 0, ay: 0 }, { ax: 0, ay: 0 }, 1, size, 0, seq()).born;
    const later = stepParticles(born, 0.3);
    expect(later.every((q, i) => q.p.z > born[i]!.p.z)).toBe(true);
    expect(stepParticles(born, 5)).toHaveLength(0);
  });
});
