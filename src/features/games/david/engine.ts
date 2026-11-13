/** Pure game logic of "Dawid i Goliat" (SVG world units, y grows downwards). */
import { clamp } from "../useGameLoop";

export const W = 800;
export const H = 450;
export const GROUND = 400;
export const SLING = { x: 122, y: 318 } as const;
export const GRAVITY = 700;
export const STONES = 5;
/** Goliath reaching this x has caught David. */
export const CATCH_X = 215;
export const START_X = 690;
export const MIN_ANGLE = 12;
export const MAX_ANGLE = 78;
/** Seconds for a full swing of the angle / power indicators (FIFA-penalty style). */
export const ANGLE_PERIOD = 2.2;
export const POWER_PERIOD = 2.4;
const STONE_R = 7;

export const speedFromPower = (power: number) => 470 + clamp(power, 0, 1) * 400;

export type Phase = "intro" | "playing" | "won" | "lost";
export type FeedbackKind = "body" | "helmet" | "miss" | "win" | "lose";
export interface Feedback {
  text: string;
  kind: FeedbackKind;
  /** Game time when it happened (bubbles fade after ~1.8 s). */
  at: number;
}
export interface Stone {
  x: number;
  y: number;
  vx: number;
  vy: number;
}
export interface DavidState {
  phase: Phase;
  goliathX: number;
  speed: number;
  stonesLeft: number;
  stone: Stone | null;
  /** Angle in degrees above the horizon, power 0..1. */
  aim: { angle: number; power: number };
  /** Which indicator swings now: first the angle, then the power. */
  aimStage: "angle" | "power";
  /** Time since the current indicator started swinging. */
  aimT: number;
  time: number;
  throws: number;
  feedback: Feedback | null;
  /** 0..1 fall animation after the winning hit. */
  fall: number;
  lostReason: "caught" | "stones" | null;
}

export const TAUNTS = [
  "Hej, mały! Mama wie, że tu jesteś?",
  "Mam trzy metry wzrostu i zero kompleksów!",
  "Moja zbroja waży więcej niż wszystkie twoje owce!",
  "Proca? Serio? Ja mam dzidę jak belka tkacka!",
  "Pasterzu, wracaj do owiec, póki możesz!",
];
const BODY_LINES = [
  "Ha! Łaskocze!",
  "To był komar?",
  "Moja zbroja ziewa z nudów.",
  "Au… to znaczy: wcale nie bolało!",
];
const HELMET_LINES = ["DZYŃ! Dobry hełm, co?", "DZYŃ! Kowal da mi gwarancję."];
const MISS_LINES = [
  "Pudło! Owce celują lepiej.",
  "Hahaha! Spróbuj jeszcze!",
  "Ten kamień poleciał do Betlejem.",
];
export const WIN_LINE =
  "BUM! Goliat leży. Filistyni nagle przypomnieli sobie, że zostawili żelazko.";

export function createDavid(): DavidState {
  return {
    phase: "intro",
    goliathX: START_X,
    speed: 14,
    stonesLeft: STONES,
    stone: null,
    aim: { angle: MIN_ANGLE, power: 0 },
    aimStage: "angle",
    aimT: 0,
    time: 0,
    throws: 0,
    feedback: null,
    fall: 0,
    lostReason: null,
  };
}

export const startDavid = (): DavidState => ({ ...createDavid(), phase: "playing" });

export function setAim(s: DavidState, angle: number, power: number): DavidState {
  return {
    ...s,
    aim: { angle: clamp(angle, MIN_ANGLE, MAX_ANGLE), power: clamp(power, 0, 1) },
  };
}

export function launchVelocity(aim: DavidState["aim"]) {
  const v = speedFromPower(aim.power);
  const rad = (aim.angle * Math.PI) / 180;
  return { vx: Math.cos(rad) * v, vy: -Math.sin(rad) * v };
}

export function throwStone(s: DavidState): DavidState {
  if (s.phase !== "playing" || s.stone || s.stonesLeft <= 0) return s;
  return {
    ...s,
    stone: { x: SLING.x, y: SLING.y, ...launchVelocity(s.aim) },
    stonesLeft: s.stonesLeft - 1,
    throws: s.throws + 1,
    aimStage: "angle",
    aimT: 0,
  };
}

/** 0 → 1 → 0 ping-pong over `period` seconds (starts at 0). */
export const swing = (t: number, period: number) =>
  0.5 - 0.5 * Math.cos((2 * Math.PI * t) / period);

export const swingAngle = (t: number) =>
  MIN_ANGLE + (MAX_ANGLE - MIN_ANGLE) * swing(t, ANGLE_PERIOD);
export const swingPower = (t: number) => swing(t, POWER_PERIOD);

/** One tap: first locks the swinging angle, the second locks the power and throws. */
export function tap(s: DavidState): DavidState {
  if (s.phase !== "playing" || s.stone || s.stonesLeft <= 0) return s;
  if (s.aimStage === "angle")
    return { ...s, aimStage: "power", aimT: 0, aim: { ...s.aim, power: 0 } };
  return throwStone(s);
}

function swingAim(s: DavidState, dt: number): DavidState {
  if (s.stone) return s;
  const aimT = s.aimT + dt;
  return s.aimStage === "angle"
    ? { ...s, aimT, aim: { ...s.aim, angle: swingAngle(aimT) } }
    : { ...s, aimT, aim: { ...s.aim, power: swingPower(aimT) } };
}

/** Points of the first part of the flight, for the aiming guide. */
export function previewPath(aim: DavidState["aim"], seconds = 0.38, steps = 9) {
  const { vx, vy } = launchVelocity(aim);
  return Array.from({ length: steps }, (_, i) => {
    const t = ((i + 1) / steps) * seconds;
    return { x: SLING.x + vx * t, y: SLING.y + vy * t + 0.5 * GRAVITY * t * t };
  });
}

/** Hit zones relative to Goliath's feet. The face (under the helmet) is the only weak spot. */
export function goliathZones(gx: number) {
  return {
    face: { x: gx - 6, y: GROUND - 192, r: 25 },
    helmet: { x1: gx - 34, x2: gx + 30, y1: GROUND - 252, y2: GROUND - 215 },
    body: { x1: gx - 46, x2: gx + 44, y1: GROUND - 176, y2: GROUND },
  };
}

type Hit = "face" | "helmet" | "body" | "out" | null;

function collide(st: Stone, gx: number): Hit {
  const z = goliathZones(gx);
  if (Math.hypot(st.x - z.face.x, st.y - z.face.y) <= z.face.r + STONE_R) return "face";
  const inRect = (r: { x1: number; x2: number; y1: number; y2: number }) =>
    st.x + STONE_R >= r.x1 &&
    st.x - STONE_R <= r.x2 &&
    st.y + STONE_R >= r.y1 &&
    st.y - STONE_R <= r.y2;
  if (inRect(z.helmet)) return "helmet";
  if (inRect(z.body)) return "body";
  if (st.y >= GROUND || st.x > W + 30 || st.x < -30) return "out";
  return null;
}

const pick = (lines: string[], n: number) => lines[n % lines.length]!;

export function stepDavid(s: DavidState, dt: number): DavidState {
  if (s.phase === "won") return { ...s, time: s.time + dt, fall: Math.min(1, s.fall + dt * 1.6) };
  if (s.phase !== "playing") return s;

  let next: DavidState = swingAim(
    { ...s, time: s.time + dt, goliathX: s.goliathX - s.speed * dt },
    dt,
  );
  if (next.goliathX <= CATCH_X) {
    return {
      ...next,
      phase: "lost",
      lostReason: "caught",
      stone: null,
      feedback: { text: "Mam cię, pasterzyku!", kind: "lose", at: next.time },
    };
  }
  if (!next.stone) return next;

  // Sub-steps so a fast stone cannot tunnel through the face.
  let st = next.stone;
  const steps = Math.max(1, Math.ceil((Math.hypot(st.vx, st.vy) * dt) / 6));
  const h = dt / steps;
  let hit: Hit = null;
  for (let i = 0; i < steps && !hit; i++) {
    const vy = st.vy + GRAVITY * h;
    st = { x: st.x + st.vx * h, y: st.y + vy * h, vx: st.vx, vy };
    hit = collide(st, next.goliathX);
  }
  if (!hit) return { ...next, stone: st };

  const at = next.time;
  if (hit === "face") {
    return { ...next, stone: null, phase: "won", feedback: { text: WIN_LINE, kind: "win", at } };
  }
  if (hit === "helmet") {
    next = { ...next, feedback: { text: pick(HELMET_LINES, s.throws), kind: "helmet", at } };
  } else if (hit === "body") {
    next = {
      ...next,
      speed: next.speed + 4,
      feedback: { text: pick(BODY_LINES, s.throws), kind: "body", at },
    };
  } else {
    next = { ...next, feedback: { text: pick(MISS_LINES, s.throws), kind: "miss", at } };
  }
  next = { ...next, stone: null };
  if (next.stonesLeft === 0) {
    return {
      ...next,
      phase: "lost",
      lostReason: "stones",
      feedback: { text: "Koniec kamieni? To teraz moja kolej!", kind: "lose", at },
    };
  }
  return next;
}

/** "Steps" between Goliath and David, for the HUD. */
export const distanceSteps = (s: DavidState) =>
  Math.max(0, Math.round((s.goliathX - CATCH_X) / 10));
