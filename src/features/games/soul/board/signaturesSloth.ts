/** Signature attacks of the court of sloth (`data/sloth.ts`). */
import type { signatureSound } from "../audio/signatures";
import { impact, rain, stream, sweep } from "./attackFx";
import { shake } from "./fx";
import { palette } from "./palette";
import type { Play } from "./signatures";

const P = () => palette();
const both = (...jobs: Promise<unknown>[]) => Promise.all(jobs).then(() => undefined);

export const SLOTH_SIG: Record<string, { sound: keyof typeof signatureSound; play: Play }> = {
  "Wzruszenie ramion": {
    sound: "shrug",
    play: async ({ r, from, to }) => {
      r.fx.emojis(from.x, from.y, "🤷", 1, false, 90);
      await stream(r.fx, r.tw, from, to, "💨", 4, 40, 800);
      await impact(r.fx, r.tw, to, P()["logo-blue"], 1.6);
    },
  },
  "Sen zimowy duszy": {
    sound: "lullaby",
    play: async ({ r, from, to }) => {
      await both(
        rain(r.fx, r.tw, to, "❄️", 12, 30),
        stream(r.fx, r.tw, from, to, "🌙", 3, 48, 1000),
      );
      await both(impact(r.fx, r.tw, to, P()["logo-blue"], 2.2), shake(r.tw, r.stage, 14, r.reduced));
    },
  },
  "Świat bez wysiłku": {
    sound: "yawn",
    play: async ({ r, to }) => {
      await sweep(r.fx, r.tw, r.w, to.y, "🛋️", 90, false, 1000);
      r.fx.emojis(to.x, to.y, "💤", 8, true, 40);
      await both(impact(r.fx, r.tw, to, P()["logo-dark"], 2.2), shake(r.tw, r.stage, 16, r.reduced));
    },
  },
};
