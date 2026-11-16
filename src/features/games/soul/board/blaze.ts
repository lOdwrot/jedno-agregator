/**
 * The demons' half slowly catching fire: every soul they take spreads a hot glow, scorch marks and
 * small flickering flames further from their edge towards the middle, with a flare-up at the moment
 * the soul is taken. When the player saves every soul the fire goes out in puffs of smoke.
 * Static flames (no flicker, no embers, no flare) under reduced motion.
 */
import { Container, Graphics, type Ticker } from "pixi.js";
import { flames, heat, type Flame } from "./blazePlan";
import type { Anchors } from "./layout";
import { palette } from "./palette";
import { ease } from "./tween";

interface Lit {
  c: Container;
  f: Flame;
  /** Time it caught fire (null = not burning). */
  born: number | null;
}

interface Bit {
  g: Graphics;
  vx: number;
  vy: number;
  life: number;
  max: number;
  smoke: boolean;
}

/** A teardrop flame standing on its base (0, 0), pointing up. */
function tongue(g: Graphics, w: number, h: number, color: string, alpha = 1) {
  g.moveTo(0, -h)
    .bezierCurveTo(w * 0.15, -h * 0.7, w * 0.62, -h * 0.45, w * 0.5, -h * 0.15)
    .bezierCurveTo(w * 0.42, h * 0.05, -w * 0.42, h * 0.05, -w * 0.5, -h * 0.15)
    .bezierCurveTo(-w * 0.62, -h * 0.45, -w * 0.15, -h * 0.7, 0, -h)
    .fill({ color, alpha });
}

export class Blaze {
  readonly layer = new Container();
  private glow = new Graphics();
  private soot = new Graphics();
  private fire = new Container();
  private sparks = new Container();
  private lit: Lit[] = [];
  private bits: Bit[] = [];
  private level = 0;
  private target = 0;
  private flare = 0;
  private time = 0;
  private w = 0;
  private top = 0;

  constructor(
    ticker: Ticker,
    private reduced: boolean,
  ) {
    this.layer.addChild(this.glow, this.soot, this.fire, this.sparks);
    ticker.add((t) => this.tick(Math.min(0.1, t.deltaMS / 1000)));
  }

  resize(w: number, _h: number, a: Anchors) {
    this.w = w;

    this.top = Math.max(0, a.hand.ai.y);
    const p = palette();
    // hot glow from the demons' edge: bands fading towards the middle (scaled with the heat)
    this.glow.clear();
    const bands = 14;
    for (let i = 0; i < bands; i++)
      this.glow
        .rect(0, (a.mid * i) / bands, w, a.mid / bands + 1)
        .fill({ color: i < bands / 2 ? p["hell-600"] : p.ember, alpha: 0.32 * (1 - i / bands) });
    this.fire.removeChildren().forEach((c) => c.destroy());
    this.lit = flames(w, a.mid, this.top).map((f) => {
      const c = new Container();
      const g = new Graphics();
      tongue(g, f.size * 1.6, f.size * 2.6, p.ember, 0.18);
      tongue(g, f.size, f.size * 2, p["logo-red"], 0.85);
      tongue(g, f.size * 0.7, f.size * 1.45, p.ember);
      tongue(g, f.size * 0.38, f.size * 0.8, p["logo-yellow"]);
      c.addChild(g);
      c.position.set(f.x, f.y);
      c.visible = false;
      this.fire.addChild(c);
      return { c, f, born: null };
    });
    this.apply(true);
  }

  /**
   * Sets how many souls the demons have taken (0 puts the fire out). A rise flares the fire up;
   * the promise resolves once the flare has burnt down.
   */
  set(souls: number): Promise<void> {
    const t = heat(souls);
    const rise = t > this.target;
    this.target = t;
    if (this.reduced) {
      this.level = t;
      this.apply();
      return Promise.resolve();
    }
    if (!rise) return Promise.resolve();
    this.flare = 1;
    return new Promise((ok) => setTimeout(ok, 900));
  }

  private apply(resized = false) {
    const k = this.level;
    this.glow.visible = k > 0;
    this.glow.scale.y = Math.min(1, k * 1.15);
    this.soot.clear();
    const p = palette();
    for (const l of this.lit) {
      const on = k > 0 && k >= l.f.at;
      if (on && l.born === null) {
        l.born = this.reduced || resized ? -1e3 : this.time;
        l.c.visible = true;
        if (!this.reduced && !resized) this.burst(l.f.x, l.f.y, 6, false);
      } else if (!on && l.born !== null) {
        l.born = null;
        l.c.visible = false;
        if (!this.reduced) this.burst(l.f.x, l.f.y - l.f.size, 3, true);
      }
      if (on)
        this.soot.ellipse(l.f.x, l.f.y, l.f.size * 1.3, l.f.size * 0.4).fill({
          color: p["logo-dark"],
          alpha: 0.35,
        });
    }
    if (this.reduced) for (const l of this.lit) l.c.scale.set(1);
  }

  private burst(x: number, y: number, n: number, smoke: boolean) {
    const p = palette();
    for (let i = 0; i < n && this.bits.length < 120; i++) {
      const g = new Graphics();
      if (smoke) g.circle(0, 0, 5 + Math.random() * 6).fill({ color: p.line, alpha: 0.35 });
      else
        g.circle(0, 0, 3.2)
          .fill({ color: p.ember, alpha: 0.2 })
          .circle(0, 0, 1 + Math.random() * 1.4)
          .fill(Math.random() < 0.35 ? p["logo-yellow"] : p.ember);
      g.position.set(x + (Math.random() - 0.5) * 14, y - Math.random() * 10);
      const max = smoke ? 1.4 + Math.random() : 0.8 + Math.random() * 1.4;
      this.bits.push({
        g,
        vx: (Math.random() - 0.5) * (smoke ? 20 : 40),
        vy: -(smoke ? 25 + Math.random() * 25 : 40 + Math.random() * 70),
        life: max,
        max,
        smoke,
      });
      this.sparks.addChild(g);
    }
  }

  private tick(dt: number) {
    if (!this.w || this.reduced) return;
    this.time += dt;
    if (this.level !== this.target) {
      const d = this.target - this.level;
      const step = Math.max(0.3, Math.abs(d) * 1.8) * dt;
      this.level = Math.abs(d) <= step ? this.target : this.level + Math.sign(d) * step;
      this.apply();
    }
    this.flare = Math.max(0, this.flare - dt * 1.1);
    const f = ease.out(this.flare);
    this.glow.alpha = 0.75 + Math.sin(this.time * 1.7) * 0.12 + f * 0.6;
    for (const l of this.lit) {
      if (!l.c.visible) continue;
      const age = this.time - (l.born ?? 0);
      const grow = ease.back(Math.min(1, age / 0.5));
      const flick =
        1 +
        Math.sin(this.time * 11 + l.f.phase) * 0.12 +
        Math.sin(this.time * 23 + l.f.phase * 2) * 0.06;
      l.c.scale.set(
        grow * (1 + f * 0.5) * (0.95 + Math.sin(this.time * 7 + l.f.phase) * 0.05),
        grow * flick * (1 + f * 0.7),
      );
      l.c.skew.x = Math.sin(this.time * 3 + l.f.phase) * 0.12;
      l.c.alpha = 0.8 + Math.sin(this.time * 17 + l.f.phase) * 0.15;
    }
    // embers drift up from the burning half; more the hotter it is, a shower on a flare-up
    const burning = this.lit.filter((l) => l.c.visible);
    const rate = (burning.length * 0.25 + f * 40) * dt;
    if (burning.length && Math.random() < rate) {
      const l = burning[Math.floor(Math.random() * burning.length)]!;
      this.burst(l.f.x, l.f.y - l.f.size * 1.4, 1 + Math.floor(f * 3), false);
    }
    for (const b of this.bits) {
      b.life -= dt;
      b.g.x += (b.vx + Math.sin(this.time * 3 + b.max * 9) * 12) * dt;
      b.g.y += b.vy * dt;
      const k = b.life / b.max;
      b.g.alpha = b.smoke
        ? k * 0.8
        : Math.min(1, k * 1.5) * (0.6 + Math.sin(this.time * 14 + b.max * 7) * 0.4);
      if (b.smoke) b.g.scale.set(1 + (1 - k) * 1.5);
    }
    if (!this.bits.some((b) => b.life <= 0)) return;
    this.bits = this.bits.filter((b) => (b.life > 0 ? true : (b.g.destroy(), false)));
  }
}
