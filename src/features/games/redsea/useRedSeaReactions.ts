import { useRef, type RefObject } from "react";
import { sfx } from "../audio/sfx";
import { shake } from "../fx/shake";
import type { useFx } from "../fx/useFx";
import { LANES, RH, WALL_L, WALL_R, shoreLineY, type ItemKind, type RedSeaState } from "./engine";

const HIT_SOUND: Record<Exclude<ItemKind, "sheep">, () => void> = {
  crab: () => {
    sfx.pinch();
    sfx.bonk();
  },
  rock: () => {
    sfx.thud();
    sfx.bonk();
  },
  octopus: () => sfx.blub(),
  fish: () => {
    sfx.flip();
    sfx.boing();
  },
};

/** Sounds and particles for what changed between two frames of the Red Sea run. */
export function useRedSeaReactions(
  stageRef: RefObject<HTMLElement | null>,
  spawn: ReturnType<typeof useFx>["spawn"],
) {
  const nextGallop = useRef(0);

  return (prev: RedSeaState, n: RedSeaState) => {
    const t = n.time;
    const taken = n.items.find((it, i) => it.taken && !prev.items[i]?.taken);
    if (taken) {
      if (taken.kind === "sheep") {
        sfx.bleat();
        sfx.chime(n.sheep);
        spawn("sparkle", n.px, n.playerY, t, { scale: 1.2 });
        spawn("text", n.px, n.playerY - 40, t, { text: "+1 🐑", tone: "fill-success" });
      } else {
        HIT_SOUND[taken.kind]();
        shake(stageRef.current, 5, 300);
        spawn("stars", n.px, n.playerY - 10, t, { scale: 0.8 });
        spawn("dust", n.px, n.playerY + 18, t, { tone: "fill-logo-yellow", scale: 0.7 });
      }
    }

    // hooves: faster and faster as the chariots close in
    if ((n.phase === "running" || n.phase === "shore") && n.gap < 170 && t >= nextGallop.current) {
      sfx.gallop();
      nextGallop.current = t + 0.22 + Math.max(0, n.gap) / 380;
    }

    if (n.phase === "shore" && prev.phase !== "shore") {
      sfx.chime(2);
      sfx.chime(4);
    }
    if (n.phase === "flood" && prev.phase !== "flood") {
      sfx.wave();
      shake(stageRef.current, 9, 900);
      const top = Math.max(0, shoreLineY(n));
      for (let k = 0; k < 4; k++) {
        const y = top + 60 + ((RH - top - 80) * k) / 3;
        spawn("splash", WALL_L, y, t + k * 0.05, { scale: 1.6 });
        spawn("splash", WALL_R, y, t + k * 0.05, { scale: 1.6 });
      }
    }
    if (n.phase === "flood" && prev.phaseT < 1.3 && n.phaseT >= 1.3) {
      sfx.blub();
      for (const x of LANES) spawn("splash", x, n.playerY + 120, t, { scale: 2 });
      spawn("text", 180, n.playerY + 90, t, { text: "PLUSK!", scale: 1.8, tone: "fill-surface" });
    }
    if (n.phase === "won" && prev.phase !== "won") {
      sfx.fanfare();
      setTimeout(() => sfx.bleat(), 800);
    }
    if (n.phase === "lost" && prev.phase !== "lost") {
      shake(stageRef.current, 8, 500);
      sfx.sadTrombone();
    }
  };
}
