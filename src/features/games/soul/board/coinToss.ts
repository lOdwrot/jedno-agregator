/** The coin toss animation: flick, spinning flight with perspective, bounce, sparks and the result. */
import { coinLand, coinToss as coinTossSound } from "../audio/coinSfx";
import { buzz } from "../audio/haptics";
import { Coin3D, coinGlow, coinShadow } from "./coin3d";
import type { Fx } from "./fx";
import { palette } from "./palette";
import { ease, type Tweener } from "./tween";

export interface TossOpts {
  /** Coin radius (the opening toss uses a bigger coin). */
  r?: number;
  /** How high it flies. */
  height?: number;
  /** Text shown under the coin after landing ("Orzeł!" / "Reszka" by default). */
  label?: string;
}

/** Animates a coin toss on `fx.layer` and resolves when the coin is gone again. */
export async function tossCoin(
  fx: Fx,
  tw: Tweener,
  x: number,
  ground: number,
  heads: boolean,
  o: TossOpts = {},
) {
  const p = palette();
  const r = o.r ?? 42;
  const height = o.height ?? 170;
  const shadow = coinShadow(r);
  shadow.position.set(x, ground + r * 0.95);
  const glow = coinGlow(r, heads ? p["gold-300"] : p["silver-100"]);
  glow.position.set(x, ground);
  glow.alpha = 0;
  const coin = new Coin3D(r);
  coin.position.set(x, ground);
  fx.layer.addChild(shadow, glow, coin);
  const spins = 6;
  const end = spins * Math.PI * 2 + (heads ? 0 : Math.PI);

  coinTossSound();
  buzz(18);
  if (fx.reduced) {
    // no flight: the coin appears with its result
    coin.setAngle(end);
    coin.alpha = 0;
    await tw.to(coin, { alpha: 1 }, 200);
  } else {
    const k = { v: 0 };
    const update = () => {
      const t = k.v;
      const arc = 4 * t * (1 - t);
      coin.setAngle(end * (1 - (1 - t) ** 2));
      coin.y = ground - height * arc;
      // closer to the camera at the top of the flight
      coin.scale.set(1 + 0.4 * arc);
      coin.rotation = 0.35 * Math.sin(t * Math.PI * 3) * (1 - t);
      shadow.scale.set(1 - 0.55 * arc);
      shadow.alpha = 1 - 0.6 * arc;
    };
    const iv = setInterval(update, 16);
    await tw.to(k, { v: 1 }, 1250, ease.linear);
    clearInterval(iv);
    k.v = 1;
    update();
    // a small bounce and a wobble that settles on the face
    coinLand(heads);
    buzz([28, 40, 14]);
    void fx.ring(x, ground + r * 0.9, p.surface, r * 1.6, 3);
    const b = { v: 0 };
    const bounce = () => {
      const t = b.v;
      coin.y = ground - 18 * 4 * t * (1 - t);
      coin.setAngle(end + 0.5 * Math.sin(t * Math.PI * 2) * (1 - t));
      coin.rotation = 0.08 * Math.sin(t * Math.PI * 4) * (1 - t);
    };
    const iv2 = setInterval(bounce, 16);
    await tw.to(b, { v: 1 }, 380, ease.linear);
    clearInterval(iv2);
    coin.position.y = ground;
    coin.rotation = 0;
    coin.setAngle(end);
  }
  fx.burst(x, ground, [p["gold-300"], p["gold-100"], p.surface], 26, 300, 380);
  void tw.to(glow, { alpha: 1 }, 220);
  const k2 = coin.scale.x;
  await tw.to(coin.scale, { x: k2 * 1.15, y: k2 * 1.15 }, 160, ease.out);
  await tw.to(coin.scale, { x: k2, y: k2 }, 260, ease.back);
  await fx.float(
    x,
    ground - r * 1.9,
    o.label ?? (heads ? "Orzeł!" : "Reszka"),
    heads ? p["gold-300"] : p["silver-100"],
    Math.round(r * 0.75),
  );
  await Promise.all([
    tw.to(coin, { alpha: 0 }, 260),
    tw.to(glow, { alpha: 0 }, 260),
    tw.to(shadow, { alpha: 0 }, 260),
  ]);
  for (const g of [coin, glow, shadow]) g.destroy({ children: true });
}
