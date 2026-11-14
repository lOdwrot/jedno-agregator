/** Signature attacks of the apocalyptic cards (the "Niepokonany" deck). */
import type { signatureSound } from "../audio/signatures";
import { impact, pillar, rain, shards, stream, sweep } from "./attackFx";
import { shake } from "./fx";
import { palette } from "./palette";
import type { Play } from "./signatures";

const P = () => palette();
const both = (...jobs: Promise<unknown>[]) => Promise.all(jobs).then(() => undefined);

export const ABYSS_SIG: Record<string, { sound: keyof typeof signatureSound; play: Play }> = {
  "Władza nad narodami": {
    sound: "beast",
    play: async ({ r, from, to }) => {
      void pillar(r.fx, r.tw, from, P()["logo-dark"], 240);
      await sweep(r.fx, r.tw, r.w, to.y, "🌊", 120, false, 900);
      await both(
        rain(r.fx, r.tw, to, "👑", 7, 36),
        impact(r.fx, r.tw, to, P().danger, 2.6),
        shake(r.tw, r.stage, 26, r.reduced),
      );
    },
  },
  "Ogień z nieba": {
    sound: "skyfire",
    play: async ({ r, to }) => {
      await rain(r.fx, r.tw, to, "☄️", 9, 40);
      await both(
        pillar(r.fx, r.tw, to, P()["logo-red"], 180),
        rain(r.fx, r.tw, to, "🔥", 12, 30),
        shake(r.tw, r.stage, 18, r.reduced),
      );
    },
  },
  "Stado w przepaść": {
    sound: "stampede",
    play: async ({ r, to }) => {
      await sweep(r.fx, r.tw, r.w, to.y, "🐗", 84, true, 800);
      shards(r.fx, to, P()["logo-red"], 20, 1.5);
      await both(
        stream(r.fx, r.tw, { x: to.x, y: to.y - 120 }, to, "⛓️", 4, 40, 500),
        shake(r.tw, r.stage, 20, r.reduced),
      );
    },
  },
};
