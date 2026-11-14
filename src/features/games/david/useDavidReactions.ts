import type { RefObject } from "react";
import { sfx } from "../audio/sfx";
import { shake } from "../fx/shake";
import type { useFx } from "../fx/useFx";
import { GROUND, goliathZones, type DavidState } from "./engine";

/** Returns a function that plays sounds and spawns particles for what changed between two frames. */
export function useDavidReactions(
  stageRef: RefObject<HTMLElement | null>,
  spawn: ReturnType<typeof useFx>["spawn"],
  setHitAt: (t: number) => void,
) {
  return (prev: DavidState, n: DavidState) => {
    if (n.phase === "playing" && Math.floor(n.time / 1.15) !== Math.floor(prev.time / 1.15))
      sfx.stomp();
    if (prev.stone && !n.stone && n.feedback && n.feedback !== prev.feedback) {
      const { x, y } = prev.stone;
      const t = n.time;
      switch (n.feedback.kind) {
        case "helmet":
          sfx.clang();
          spawn("burst", x, y, t);
          spawn("text", x, y - 34, t, { text: "DZYŃ!", tone: "fill-ink-muted" });
          setHitAt(t);
          break;
        case "body":
          sfx.bonk();
          spawn("burst", x, y, t, { tone: "stroke-surface", scale: 0.8 });
          spawn("text", x, y - 30, t, { text: "BONK!" });
          setHitAt(t);
          break;
        case "win": {
          const face = goliathZones(prev.goliathX).face;
          sfx.boom();
          shake(stageRef.current, 10, 500);
          spawn("stars", face.x, face.y, t, { scale: 1.8 });
          spawn("burst", face.x, face.y, t, { scale: 1.6 });
          spawn("text", face.x, face.y - 60, t, {
            text: "BUM!",
            scale: 2,
            tone: "fill-logo-red",
          });
          break;
        }
        default:
          sfx.thud();
          spawn("dust", x, GROUND, t, { tone: "fill-logo-yellow", scale: 0.8 });
      }
    }
    if (n.phase === "won" && n.fall >= 1 && prev.fall < 1) {
      shake(stageRef.current, 14, 600);
      spawn("dust", n.goliathX - 150, GROUND - 10, n.time, {
        scale: 3,
        life: 1.6,
        tone: "fill-logo-yellow",
      });
      sfx.thud();
      sfx.fanfare();
      setTimeout(() => sfx.bleat(), 900);
    }
    if (n.phase === "lost" && prev.phase !== "lost") sfx.sadTrombone();
  };
}
