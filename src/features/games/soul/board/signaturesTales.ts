/** Signature attacks of the saints from the saints' tales (`data/tales.ts`). */
import type { signatureSound } from "../audio/signatures";
import { impact, pillar, rain, stream, sweep } from "./attackFx";
import { shake } from "./fx";
import { palette } from "./palette";
import type { Play } from "./signatures";

const P = () => palette();
const both = (...jobs: Promise<unknown>[]) => Promise.all(jobs).then(() => undefined);

export const TALES_SIG: Record<string, { sound: keyof typeof signatureSound; play: Play }> = {
  "Jestem Niepokalane Poczęcie": {
    sound: "spring",
    play: async ({ r, from, to }) => {
      await both(pillar(r.fx, r.tw, from, P().surface, 150), rain(r.fx, r.tw, from, "💧", 8, 28));
      await stream(r.fx, r.tw, from, to, "🌹", 3, 44, 900);
      await impact(r.fx, r.tw, to, P()["logo-blue"], 1.7);
    },
  },
  "Brat wilk z Gubbio": {
    sound: "howl",
    play: async ({ r, to }) => {
      await sweep(r.fx, r.tw, r.w, to.y, "🐺", 90, true, 1000);
      r.fx.emojis(to.x, to.y, "🕊️", 5, true, 36);
      await both(
        impact(r.fx, r.tw, to, P()["logo-yellow"], 1.6),
        shake(r.tw, r.stage, 10, r.reduced),
      );
    },
  },
  "Źródło z ościenia": {
    sound: "plough",
    play: async ({ r, from, to }) => {
      await both(
        stream(r.fx, r.tw, from, to, "💧", 4, 36, 800),
        sweep(r.fx, r.tw, r.w, to.y, "🐂", 80, true, 900),
        r.tw.wait(200).then(() => rain(r.fx, r.tw, to, "🌾", 10, 28)),
      );
      await both(
        impact(r.fx, r.tw, to, P()["logo-blue"], 1.8),
        shake(r.tw, r.stage, 12, r.reduced),
      );
    },
  },
};
