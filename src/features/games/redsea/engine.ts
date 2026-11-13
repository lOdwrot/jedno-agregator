/** Pure logic of "Przez Morze Czerwone": a 3-lane escape run, then closing the sea. */
import { clamp, createRng } from "../useGameLoop";

export const RW = 360;
export const RH = 640;
export const LANES = [120, 180, 240] as const;
export const WALL_L = 88;
export const WALL_R = 272;
export const PLAYER_Y = 470;
/** Distance to the far shore (world units). */
export const GOAL = 4200;
/** Screen y of the shore line when the player arrives. */
export const SHORE_Y = 150;
export const MAX_GAP = 240;
const HIT_RANGE = 24;
const STUN = 0.7;

export type ItemKind = "crab" | "rock" | "octopus" | "fish" | "sheep";
export const OBSTACLES: ItemKind[] = ["crab", "rock", "octopus", "fish"];
export const ITEM_EMOJI: Record<ItemKind, string> = {
  crab: "🦀",
  rock: "🪨",
  octopus: "🐙",
  fish: "🐟",
  sheep: "🐑",
};
const HIT_LINES: Record<Exclude<ItemKind, "sheep">, string> = {
  crab: "Au! Krab uszczypnął cię w sandał!",
  rock: "Potknięcie o kamień. Faraon chichocze.",
  octopus: "Ośmiornica chce się przytulić. Ośmioma rękami.",
  fish: "Ryba trzepocze: „Gdzie moja woda?!”",
};

export interface Item {
  id: number;
  lane: number;
  /** World distance where it lies. */
  at: number;
  kind: ItemKind;
  taken: boolean;
}

export type Phase = "intro" | "running" | "shore" | "flood" | "won" | "lost";

export interface RedSeaState {
  phase: Phase;
  d: number;
  lane: number;
  /** Rendered x (eases towards the lane). */
  px: number;
  playerY: number;
  /** Distance between the chariots and the player. 0 = caught. */
  gap: number;
  stun: number;
  items: Item[];
  sheep: number;
  hits: number;
  time: number;
  phaseT: number;
  feedback: { text: string; at: number; good: boolean } | null;
}

export function createLevel(seed: number): Item[] {
  const rng = createRng(seed);
  const items: Item[] = [];
  let id = 0;
  for (let at = 520; at < GOAL - 260; at += 150 + rng() * 90) {
    const progress = at / GOAL;
    const count = rng() < 0.2 + progress * 0.35 ? 2 : 1;
    const lanes = [0, 1, 2].sort(() => rng() - 0.5);
    for (let i = 0; i < count; i++) {
      const kind = OBSTACLES[Math.floor(rng() * OBSTACLES.length)]!;
      items.push({ id: id++, lane: lanes[i]!, at, kind, taken: false });
    }
    if (rng() < 0.35) items.push({ id: id++, lane: lanes[2]!, at, kind: "sheep", taken: false });
  }
  return items;
}

export function createRedSea(seed = 7): RedSeaState {
  return {
    phase: "intro",
    d: 0,
    lane: 1,
    px: LANES[1],
    playerY: PLAYER_Y,
    gap: 200,
    stun: 0,
    items: createLevel(seed),
    sheep: 0,
    hits: 0,
    time: 0,
    phaseT: 0,
    feedback: null,
  };
}

export const startRedSea = (seed = Date.now() % 100000): RedSeaState => ({
  ...createRedSea(seed),
  phase: "running",
});

export function moveLane(s: RedSeaState, dir: -1 | 1): RedSeaState {
  if (s.phase !== "running") return s;
  return { ...s, lane: clamp(s.lane + dir, 0, LANES.length - 1) };
}

/** Moses stretches out his hand over the sea (Ex 14,26). Only on the far shore. */
export function stretchHand(s: RedSeaState): RedSeaState {
  if (s.phase !== "shore") return s;
  return { ...s, phase: "flood", phaseT: 0, feedback: { text: "Plusk!", at: s.time, good: true } };
}

export const playerSpeed = (s: RedSeaState) => (s.stun > 0 ? 120 : 232 + Math.min(60, s.d * 0.012));
export const chaseSpeed = (s: RedSeaState) => 198 + Math.min(50, s.d * 0.009);
/** Screen y of something lying at world distance `at`. */
export const screenY = (s: RedSeaState, at: number) => PLAYER_Y - (at - s.d);

function lost(s: RedSeaState): RedSeaState {
  return {
    ...s,
    phase: "lost",
    gap: 0,
    feedback: { text: "Stać! Wracajcie do lepienia cegieł!", at: s.time, good: false },
  };
}

export function stepRedSea(s: RedSeaState, dt: number): RedSeaState {
  const time = s.time + dt;
  const phaseT = s.phaseT + dt;
  if (s.phase === "flood") {
    return phaseT >= 2.6 ? { ...s, time, phaseT, phase: "won" } : { ...s, time, phaseT };
  }
  if (s.phase === "shore") {
    const playerY = Math.max(SHORE_Y - 40, s.playerY - 420 * dt);
    const gap = s.gap - 95 * dt;
    const next = { ...s, time, phaseT, playerY, gap };
    return gap <= 0 ? lost(next) : next;
  }
  if (s.phase !== "running") return s;

  const v = playerSpeed(s);
  const d = s.d + v * dt;
  const target = LANES[s.lane]!;
  const step = 760 * dt;
  const px = Math.abs(target - s.px) <= step ? target : s.px + Math.sign(target - s.px) * step;
  let next: RedSeaState = {
    ...s,
    time,
    phaseT,
    d,
    px,
    stun: Math.max(0, s.stun - dt),
    gap: Math.min(MAX_GAP, s.gap + (v - chaseSpeed(s)) * dt),
  };

  let items = next.items;
  for (const it of next.items) {
    if (it.taken || it.lane !== next.lane || Math.abs(it.at - d) > HIT_RANGE) continue;
    items = items.map((x) => (x.id === it.id ? { ...x, taken: true } : x));
    if (it.kind === "sheep") {
      next = {
        ...next,
        sheep: next.sheep + 1,
        feedback: { text: "Zabłąkana owca dołącza do ludu! 🐑", at: time, good: true },
      };
    } else {
      next = {
        ...next,
        stun: STUN,
        hits: next.hits + 1,
        feedback: { text: HIT_LINES[it.kind], at: time, good: false },
      };
    }
  }
  next = { ...next, items };

  if (next.gap <= 0) return lost(next);
  if (d >= GOAL) {
    return {
      ...next,
      d: GOAL,
      phase: "shore",
      phaseT: 0,
      feedback: { text: "Brzeg! Szybko — wyciągnij rękę nad morze!", at: time, good: true },
    };
  }
  return next;
}

/** Screen y of the far shore line (sand above it). */
export const shoreLineY = (s: RedSeaState) => screenY(s, GOAL + (PLAYER_Y - SHORE_Y));
