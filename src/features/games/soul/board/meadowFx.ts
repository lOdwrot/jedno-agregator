/**
 * Life of the meadow: leaves and pollen whirling up from the growing front, and butterflies
 * fluttering over the green board once every soul is saved. Nothing of it runs under reduced motion.
 */
import { Container, Graphics } from "pixi.js";
import { palette } from "./palette";

interface Bit {
  g: Graphics;
  vx: number;
  vy: number;
  spin: number;
  life: number;
  max: number;
}

/** Leaves and golden pollen flying up from the line where the meadow is growing. */
export class Sprouts {
  readonly layer = new Container();
  private bits: Bit[] = [];

  /** Spawns about `rate` bits a second along the front at height `y` (call every frame). */
  emit(w: number, y: number, rate: number, dt: number) {
    const p = palette();
    let n = rate * dt;
    while (n > 0 && this.bits.length < 140) {
      if (Math.random() > n) break;
      n -= 1;
      const leaf = Math.random() < 0.6;
      const g = new Graphics();
      if (leaf)
        g.ellipse(0, 0, 4 + Math.random() * 3, 1.8 + Math.random())
          .fill(Math.random() < 0.5 ? p["meadow-400"] : p["meadow-200"])
          .moveTo(-4, 0)
          .lineTo(4, 0)
          .stroke({ width: 0.6, color: p["meadow-600"] });
      else
        g.circle(0, 0, 4)
          .fill({ color: p["logo-yellow"], alpha: 0.25 })
          .circle(0, 0, 1.6)
          .fill(p["logo-yellow"]);
      g.position.set(Math.random() * w, y + (Math.random() - 0.3) * 18);
      g.rotation = Math.random() * 6.28;
      const max = 0.9 + Math.random() * 0.9;
      this.bits.push({
        g,
        vx: (Math.random() - 0.5) * 70,
        vy: -(50 + Math.random() * 110),
        spin: (Math.random() - 0.5) * 9,
        life: max,
        max,
      });
      this.layer.addChild(g);
    }
  }

  tick(dt: number) {
    for (const b of this.bits) {
      b.life -= dt;
      b.vy += 60 * dt;
      b.vx *= 1 - dt;
      b.g.x += b.vx * dt;
      b.g.y += b.vy * dt;
      b.g.rotation += b.spin * dt;
      const k = b.life / b.max;
      b.g.alpha = Math.min(1, k * 2);
      b.g.scale.set(0.6 + (1 - k) * 0.6);
    }
    if (!this.bits.some((b) => b.life <= 0)) return;
    this.bits = this.bits.filter((b) => (b.life > 0 ? true : (b.g.destroy(), false)));
  }
}

interface Fly {
  g: Container;
  left: Graphics;
  right: Graphics;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  speed: number;
  phase: number;
}

/** A few butterflies drifting in loose loops over the whole meadow. */
export class Butterflies {
  readonly layer = new Container();
  private flies: Fly[] = [];

  release(w: number, h: number, n = 4) {
    if (this.flies.length) return;
    const p = palette();
    const colours = [p["logo-yellow"], p.surface, p["accent-soft"], p["logo-blue"]];
    for (let i = 0; i < n; i++) {
      const g = new Container();
      const wing = (dir: 1 | -1) =>
        new Graphics()
          .ellipse(dir * 4, -2, 4.5, 3.6)
          .fill(colours[i % colours.length]!)
          .ellipse(dir * 3, 3, 3, 2.4)
          .fill(colours[(i + 2) % colours.length]!)
          .circle(dir * 4.5, -2.5, 1)
          .fill(p.navy);
      const left = wing(-1);
      const right = wing(1);
      const body = new Graphics().roundRect(-0.8, -4, 1.6, 8, 0.8).fill(p.navy);
      g.addChild(left, right, body);
      this.layer.addChild(g);
      this.flies.push({
        g,
        left,
        right,
        cx: w * (0.2 + 0.6 * Math.random()),
        cy: h * (0.2 + 0.6 * Math.random()),
        rx: w * (0.12 + Math.random() * 0.2),
        ry: h * (0.08 + Math.random() * 0.12),
        speed: 0.25 + Math.random() * 0.25,
        phase: Math.random() * 6.28,
      });
    }
  }

  resize(w: number, h: number) {
    for (const f of this.flies) {
      f.cx = Math.min(w * 0.8, Math.max(w * 0.2, f.cx));
      f.cy = Math.min(h * 0.8, Math.max(h * 0.2, f.cy));
    }
  }

  tick(t: number) {
    for (const f of this.flies) {
      const a = t * f.speed + f.phase;
      const x = f.cx + Math.sin(a) * f.rx + Math.sin(a * 3.1) * 10;
      const y = f.cy + Math.sin(a * 2) * f.ry + Math.cos(a * 4.3) * 8;
      f.g.rotation = Math.atan2(y - f.g.y, x - f.g.x) * 0.15;
      f.g.position.set(x, y);
      const flap = 0.25 + Math.abs(Math.sin(t * 16 + f.phase)) * 0.75;
      f.left.scale.x = f.right.scale.x = flap;
    }
  }
}
