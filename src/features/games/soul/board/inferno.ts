/** Infernal backdrop of the "Niepokonany" duel: lava cracks, a breathing red glow and rising embers. */
import { Container, FillGradient, Graphics, type Ticker } from "pixi.js";
import { palette } from "./palette";

export type BoardTheme = "default" | "infernal";

interface Ember {
  g: Graphics;
  vx: number;
  vy: number;
  life: number;
  max: number;
  phase: number;
}

/** Deterministic pseudo-random numbers, so the cracks don't jump on every resize. */
function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class Inferno {
  readonly layer = new Container();
  private glow = new Graphics();
  private cracks = new Graphics();
  private sparks = new Container();
  private embers: Ember[] = [];
  private t = 0;
  private w = 0;
  private h = 0;

  constructor(
    ticker: Ticker,
    private reduced: boolean,
  ) {
    this.layer.addChild(this.glow, this.cracks, this.sparks);
    if (!reduced) ticker.add((t) => this.update(t.deltaMS / 1000));
  }

  resize(w: number, h: number, mid: number) {
    this.w = w;
    this.h = h;
    const p = palette();
    const r = Math.max(w, h) * 0.75;
    this.glow
      .clear()
      .rect(0, 0, w, h)
      .fill(
        new FillGradient({
          type: "radial",
          center: { x: 0.5, y: mid / h },
          innerRadius: 0,
          outerCenter: { x: 0.5, y: mid / h },
          outerRadius: 0.75,
          colorStops: [
            { offset: 0, color: p["hell-600"] },
            { offset: 1, color: p["hell-950"] },
          ],
          textureSpace: "local",
        }),
      );
    this.glow.alpha = 0.55;
    // jagged lava cracks running out of the middle line
    const rnd = seeded(666);
    this.cracks.clear();
    for (let i = 0; i < 9; i++) {
      let x = (w * (i + 0.5)) / 9 + (rnd() - 0.5) * 40;
      let y = mid;
      const dir = i % 2 ? 1 : -1;
      this.cracks.moveTo(x, y);
      const steps = 4 + Math.floor(rnd() * 4);
      for (let k = 0; k < steps; k++) {
        x += (rnd() - 0.5) * 70;
        y += dir * (20 + rnd() * (r / 14));
        this.cracks.lineTo(x, y);
      }
    }
    this.cracks.stroke({ width: 5, color: p.ember, alpha: 0.12 });
    this.cracks.stroke({ width: 1.6, color: p.ember, alpha: 0.5 });
    if (this.reduced && !this.embers.length) for (let i = 0; i < 24; i++) this.spawn(true);
  }

  private spawn(still = false) {
    const p = palette();
    const size = 1 + Math.random() * 2.4;
    const g = new Graphics()
      .circle(0, 0, size * 2.4)
      .fill({ color: p.ember, alpha: 0.18 })
      .circle(0, 0, size)
      .fill({ color: Math.random() < 0.3 ? p["logo-yellow"] : p.ember });
    g.position.set(Math.random() * this.w, still ? Math.random() * this.h : this.h + 10);
    const max = 4 + Math.random() * 5;
    this.embers.push({
      g,
      vx: (Math.random() - 0.5) * 24,
      vy: -(30 + Math.random() * 60),
      life: max,
      max,
      phase: Math.random() * 6.28,
    });
    this.sparks.addChild(g);
  }

  private update(dt: number) {
    if (!this.w) return;
    this.t += dt;
    this.glow.alpha = 0.5 + Math.sin(this.t * 1.3) * 0.12;
    this.cracks.alpha = 0.75 + Math.sin(this.t * 2.1) * 0.25;
    if (this.embers.length < 46 && Math.random() < dt * 14) this.spawn();
    for (const e of this.embers) {
      e.life -= dt;
      e.g.x += (e.vx + Math.sin(this.t * 2 + e.phase) * 14) * dt;
      e.g.y += e.vy * dt;
      e.g.alpha = Math.min(1, e.life / e.max + 0.2) * (0.6 + Math.sin(this.t * 9 + e.phase) * 0.4);
    }
    const dead = this.embers.filter((e) => e.life <= 0 || e.g.y < -10);
    if (!dead.length) return;
    for (const e of dead) e.g.destroy();
    this.embers = this.embers.filter((e) => !dead.includes(e));
  }
}
