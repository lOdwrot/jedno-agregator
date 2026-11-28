/**
 * Particles flung off a rotating prestige card (album viewer) — pure 3D math, no DOM.
 * Coordinates: px from the card centre, y down, z toward the viewer (like CSS 3D transforms).
 * Particles live in WORLD space: they start on the card's face and keep flying while the card
 * turns on, so a spin leaves a glittering trail with real depth (perspective projection).
 */
import type { Finish } from "../data/types";

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Particle {
  p: Vec3;
  v: Vec3;
  /** Seconds lived / to live. */
  age: number;
  life: number;
  size: number;
  /** Index into the palette of the finish. */
  color: number;
  shape: "spark" | "shard";
  angle: number;
  spin: number;
}

const rad = (deg: number) => (deg * Math.PI) / 180;

/** The point after CSS `rotateX(ax) rotateY(ay)` (degrees): rotateY first, then rotateX. */
export function rotate(pt: Vec3, ax: number, ay: number): Vec3 {
  const cy = Math.cos(rad(ay));
  const sy = Math.sin(rad(ay));
  const x1 = pt.x * cy + pt.z * sy;
  const z1 = -pt.x * sy + pt.z * cy;
  const cx = Math.cos(rad(ax));
  const sx = Math.sin(rad(ax));
  return { x: x1, y: pt.y * cx - z1 * sx, z: pt.y * sx + z1 * cx };
}

/** Screen offset from the centre and scale of a world point seen through `perspective` px. */
export function project(pt: Vec3, perspective: number): { x: number; y: number; s: number } {
  const s = perspective / Math.max(perspective - pt.z, 1);
  return { x: pt.x * s, y: pt.y * s, s };
}

/** How many particles a finish emits: per second at rest and per (degree / second) of rotation. */
export const EMISSION: Record<Finish, { idle: number; perDeg: number; colors: number } | null> = {
  plain: null,
  gilded: { idle: 4, perDeg: 0.1, colors: 3 },
  stained: { idle: 12, perDeg: 0.32, colors: 5 },
};
export const MAX_PARTICLES = 320;

export interface Pose {
  ax: number;
  ay: number;
}

/** New particles for one frame (`dt` s) of the card moving from `prev` to `pose`. */
export function emit(
  finish: Finish,
  prev: Pose,
  pose: Pose,
  dt: number,
  size: { w: number; h: number },
  carry: number,
  rnd: () => number = Math.random,
): { born: Particle[]; carry: number } {
  const e = EMISSION[finish];
  if (!e || dt <= 0) return { born: [], carry: 0 };
  const normal = rotate({ x: 0, y: 0, z: 1 }, pose.ax, pose.ay);
  // the face looks away: nothing comes off the back of the card
  if (normal.z < 0.15) return { born: [], carry: 0 };
  const speed = Math.hypot(pose.ax - prev.ax, pose.ay - prev.ay) / dt;
  let budget = carry + (e.idle + speed * e.perDeg) * dt;
  const born: Particle[] = [];
  while (budget >= 1) {
    budget -= 1;
    const local = { x: (rnd() - 0.5) * size.w, y: (rnd() - 0.5) * size.h, z: 1 };
    const now = rotate(local, pose.ax, pose.ay);
    const before = rotate(local, prev.ax, prev.ay);
    // flung by the spin (tangential speed) and lifted off the glass along the face normal
    const fling = 0.35;
    const lift = 30 + rnd() * 90 + speed * 0.12;
    born.push({
      p: now,
      v: {
        x: ((now.x - before.x) / dt) * fling + normal.x * lift + (rnd() - 0.5) * 30,
        y: ((now.y - before.y) / dt) * fling + normal.y * lift + (rnd() - 0.5) * 30 - 15,
        z: ((now.z - before.z) / dt) * fling + normal.z * lift,
      },
      age: 0,
      life: 0.7 + rnd() * 0.9,
      size: 3 + rnd() * (finish === "stained" ? 6 : 3.5),
      color: Math.floor(rnd() * e.colors),
      shape: finish === "stained" && rnd() < 0.45 ? "shard" : "spark",
      angle: rnd() * Math.PI * 2,
      spin: (rnd() - 0.5) * 10,
    });
  }
  return { born, carry: budget };
}

/** Moves the particles `dt` seconds on (air drag, a gentle float upward); drops the dead ones. */
export function stepParticles(list: readonly Particle[], dt: number): Particle[] {
  const drag = Math.pow(0.12, dt);
  const out: Particle[] = [];
  for (const q of list) {
    const age = q.age + dt;
    if (age >= q.life) continue;
    out.push({
      ...q,
      age,
      angle: q.angle + q.spin * dt,
      p: { x: q.p.x + q.v.x * dt, y: q.p.y + q.v.y * dt, z: q.p.z + q.v.z * dt },
      v: { x: q.v.x * drag, y: q.v.y * drag - 25 * dt, z: q.v.z * drag },
    });
  }
  return out.length > MAX_PARTICLES ? out.slice(out.length - MAX_PARTICLES) : out;
}

/** 0 → 1 → 0 over the particle's life, with a twinkle. */
export function particleAlpha(q: Particle): number {
  const t = q.age / q.life;
  const env = t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85;
  return Math.max(0, env * (0.75 + 0.25 * Math.sin(q.age * 22 + q.angle * 3)));
}
