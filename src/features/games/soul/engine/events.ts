/**
 * Animation frames: while `dispatchFrames` runs, every `emit` records what happened together with
 * a snapshot of the state right after it. The board replays them one by one (move by move).
 */
import type { Status } from "../data/types";
import type { Game, PlayerId } from "./state";

export type GameEvent =
  | { t: "turn"; pid: PlayerId }
  | { t: "draw"; pid: PlayerId; n: number }
  | { t: "shuffle"; pid: PlayerId }
  | { t: "toActive"; pid: PlayerId; uid: number }
  | { t: "bench"; pid: PlayerId; uid: number }
  | { t: "evolve"; pid: PlayerId; uid: number }
  | { t: "attach"; pid: PlayerId; uid: number; n: number }
  | { t: "support"; pid: PlayerId; cardId: string; uid: number }
  | { t: "place"; pid: PlayerId; cardId: string }
  | { t: "attack"; pid: PlayerId; uid: number; target: number; name: string }
  | { t: "damage"; uid: number; amount: number; weak: boolean }
  | { t: "benchDamage"; uids: number[]; amount: number }
  | { t: "heal"; uids: number[]; amount: number }
  | { t: "status"; uid: number; s: Status }
  | { t: "cleanse"; uids: number[] }
  | { t: "shield"; uid: number }
  | { t: "coin"; heads: boolean }
  | { t: "peek"; pid: PlayerId; uid: number; kept: boolean | null }
  | { t: "ko"; pid: PlayerId; uid: number }
  | { t: "souls"; pid: PlayerId; n: number }
  | { t: "swap"; pid: PlayerId }
  | { t: "discardEnergy"; uid: number; n: number }
  | { t: "ability"; pid: PlayerId; uid: number }
  | { t: "over"; winner: PlayerId };

export interface Frame {
  ev: GameEvent;
  state: Game;
}

let recorder: Frame[] | null = null;

export function emit(g: Game, ev: GameEvent) {
  recorder?.push({ ev, state: structuredClone(g) });
}

/** Runs `fn` while recording frames. */
export function recordFrames<T>(fn: () => T): { result: T; frames: Frame[] } {
  const prev = recorder;
  recorder = [];
  try {
    const result = fn();
    return { result, frames: recorder };
  } finally {
    recorder = prev;
  }
}
