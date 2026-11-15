/**
 * The meadow of saved souls: with every soul the player saves, grass and flowers spread further up
 * from the player's edge; with the last one the whole board turns green, a river flows along the
 * middle and sheep run in to graze. Static (no sway, no running) under reduced motion.
 */
import { Container, Graphics, type Text, type Ticker } from "pixi.js";
import { text } from "./CardSprite";
import type { Anchors } from "./layout";
import { coverage, pastures, rng, riverY, tufts, type Tuft } from "./meadowPlan";
import { palette } from "./palette";

const SHEEP = 6;
/** Coverage per second while the meadow spreads. */
const SPEED = 0.8;
const RUN_MS = 1400;

interface Sheep {
  body: Container;
  face: Text;
  from: { x: number; y: number };
  to: { x: number; y: number };
  /** ms since it set off; ≥ RUN_MS = grazing. */
  t: number;
  delay: number;
  phase: number;
}

export class Meadow {
  readonly layer = new Container();
  private nearGround = new Graphics();
  private farGround = new Graphics();
  private baseGround = new Graphics();
  private feather = new Graphics();
  private grass = new Container();
  private river = new Graphics();
  private shimmer = new Graphics();
  private riverMask = new Graphics();
  private flock = new Container();
  private items: { g: Graphics; t: Tuft }[] = [];
  private sheep: Sheep[] = [];
  private cov = 0;
  private target = 0;
  private time = 0;
  private w = 0;
  private h = 0;
  private mid = 0;
  /** Where the meadow starts: the player's edge, or the middle of their hand if it covers the edge. */
  private base = 0;
  private a: Anchors | null = null;
  private done: (() => void)[] = [];

  constructor(
    ticker: Ticker,
    private reduced: boolean,
  ) {
    this.river.mask = this.riverMask;
    this.shimmer.mask = this.riverMask;
    this.layer.addChild(
      this.farGround,
      this.baseGround,
      this.nearGround,
      this.feather,
      this.river,
      this.shimmer,
      this.riverMask,
      this.grass,
      this.flock,
    );
    ticker.add((t) => this.tick(Math.min(0.1, t.deltaMS / 1000)));
  }

  resize(w: number, h: number, a: Anchors) {
    this.w = w;
    this.h = h;
    this.mid = a.mid;
    this.a = a;
    const p = palette();
    this.base = Math.min(h, a.hand.me.y);
    const mine = this.base - a.mid;
    // ground: anchored at its own edge, scaled towards the middle (near) / the far edge (far)
    this.nearGround.clear().rect(0, -mine, w, mine).fill({ color: p["meadow-600"], alpha: 0.5 });
    this.nearGround.position.set(0, this.base);
    this.baseGround
      .clear()
      .rect(0, this.base, w, h - this.base)
      .fill({ color: p["meadow-600"], alpha: 0.5 });
    this.farGround.clear().rect(0, -a.mid, w, a.mid).fill({ color: p["meadow-600"], alpha: 0.5 });
    this.farGround.position.set(0, a.mid);
    // soft growing front of the meadow
    const f = this.feather.clear();
    const fh = Math.min(48, mine * 0.2);
    for (let i = 0; i < 8; i++)
      f.rect(0, -fh + (fh * i) / 8, w, fh / 8).fill({
        color: p["meadow-600"],
        alpha: (0.5 * (i + 1)) / 9,
      });
    this.drawRiver(0);
    this.grass.removeChildren().forEach((c) => c.destroy());
    this.items = tufts(w, h, a.mid, this.base).map((t) => {
      const g = this.tuft(t);
      this.grass.addChild(g);
      return { g, t };
    });
    const spots = pastures(a, w, h, SHEEP);
    this.sheep.forEach((s, i) => {
      s.to = spots[i]!;
      if (s.t >= RUN_MS || this.reduced) s.body.position.set(s.to.x, s.to.y);
    });
    this.apply();
  }

  /** Sets how many souls the player has saved; returns when the meadow (and the flock) is in place. */
  set(souls: number): Promise<void> {
    this.target = coverage(souls);
    if (this.reduced) this.cov = this.target;
    if (this.cov >= 1.95 && !this.sheep.length) this.release();
    this.apply();
    return this.settled() ? Promise.resolve() : new Promise((ok) => this.done.push(ok));
  }

  private settled() {
    return (
      this.cov === this.target &&
      (this.target < 2 || (this.sheep.length > 0 && this.sheep.every((s) => s.t >= RUN_MS)))
    );
  }

  private tuft(t: Tuft): Graphics {
    const p = palette();
    const r = rng(Math.round(t.x * 31 + t.y * 17));
    const g = new Graphics();
    g.ellipse(0, 0, t.size * 0.7, t.size * 0.18).fill({ color: p["meadow-800"], alpha: 0.35 });
    for (let i = 0; i < t.blades; i++) {
      const dx = (i - (t.blades - 1) / 2) * t.size * 0.22;
      const tip = dx * 1.6 + (r() - 0.5) * t.size * 0.3;
      const hh = t.size * (0.8 + r() * 0.7);
      g.moveTo(dx - t.size * 0.09, 0)
        .quadraticCurveTo(dx, -hh * 0.5, tip, -hh)
        .quadraticCurveTo(dx + t.size * 0.02, -hh * 0.45, dx + t.size * 0.09, 0)
        .closePath()
        .fill(i % 2 ? p["meadow-400"] : p["meadow-600"]);
    }
    if (t.flower) {
      const petals = [p.surface, p["logo-yellow"], p["accent-soft"]][Math.floor(r() * 3)]!;
      const fy = -t.size * 1.15;
      for (let k = 0; k < 5; k++) {
        const an = (k / 5) * Math.PI * 2;
        g.circle(Math.cos(an) * 2.4, fy + Math.sin(an) * 2.4, 2).fill(petals);
      }
      g.circle(0, fy, 1.5).fill(p["logo-orange"]);
    }
    g.position.set(t.x, t.y);
    g.scale.set(0);
    return g;
  }

  private drawRiver(t: number) {
    const p = palette();
    const w = this.w;
    const half = Math.max(12, this.h * 0.03);
    const amp = half * 0.9;
    const steps = Math.max(12, Math.round(w / 24));
    const y = (x: number) => riverY(x, w, this.mid, amp);
    const line = (off: number, dir: 1 | -1, g: Graphics) => {
      for (let i = 0; i <= steps; i++) {
        const x = dir === 1 ? (w * i) / steps : w - (w * i) / steps;
        if (i === 0 && dir === 1) g.moveTo(x, y(x) + off);
        else g.lineTo(x, y(x) + off);
      }
    };
    const r = this.river.clear();
    // muddy banks, then the water
    line(-half - 5, 1, r);
    line(half + 5, -1, r);
    r.closePath().fill({ color: p["meadow-800"], alpha: 0.8 });
    line(-half, 1, r);
    line(half, -1, r);
    r.closePath().fill(p.river);
    const s = this.shimmer.clear();
    const rnd = rng(5);
    for (let i = 0; i < Math.round(w / 40); i++) {
      const x0 = ((rnd() * w + t * (30 + rnd() * 25)) % (w + 60)) - 30;
      const off = (rnd() - 0.5) * half * 1.3;
      const len = 14 + rnd() * 22;
      s.moveTo(x0, y(x0) + off)
        .lineTo(x0 + len, y(x0 + len) + off)
        .stroke({ width: 2, color: p["river-light"], alpha: 0.35 + rnd() * 0.4, cap: "round" });
    }
  }

  /** The flock runs in from both sides. */
  private release() {
    if (!this.a) return;
    const spots = pastures(this.a, this.w, this.h, SHEEP);
    const p = palette();
    const size = Math.max(22, Math.min(34, this.w / 26));
    spots.forEach((to, i) => {
      const left = to.x < this.w / 2;
      const from = { x: left ? -40 : this.w + 40, y: to.y + (i % 2 ? 20 : -20) };
      const body = new Container();
      const shadow = new Graphics()
        .ellipse(0, size * 0.42, size * 0.45, size * 0.12)
        .fill({ color: p["meadow-800"], alpha: 0.45 });
      const face = text("🐑", { fontSize: size });
      face.anchor.set(0.5);
      body.addChild(shadow, face);
      body.position.set(this.reduced ? to.x : from.x, this.reduced ? to.y : from.y);
      // the emoji faces left: mirror the ones running to the right
      face.scale.x = left ? -1 : 1;
      this.flock.addChild(body);
      this.sheep.push({
        body,
        face,
        from,
        to,
        t: this.reduced ? RUN_MS : 0,
        delay: i * 90,
        phase: i * 1.7,
      });
    });
  }

  private apply() {
    const c = this.cov;
    this.nearGround.scale.y = Math.min(1, c);
    this.farGround.scale.y = Math.max(0, Math.min(1, c - 1));
    this.nearGround.visible = c > 0;
    this.farGround.visible = c > 1;
    this.feather.visible = c > 0 && c < 2;
    this.baseGround.visible = c > 0;
    this.feather.y = c <= 1 ? this.base - (this.base - this.mid) * c : this.mid * (2 - c);
    for (const { g, t } of this.items) {
      const k = Math.max(0, Math.min(1, (c - t.at) / 0.12));
      g.scale.set(k);
      g.visible = k > 0;
    }
    const flow = Math.max(0, Math.min(1, (c - 1.4) / 0.5));
    this.riverMask.clear();
    if (flow > 0) this.riverMask.rect(0, 0, this.w * flow, this.h).fill(0xffffff);
    this.river.visible = this.shimmer.visible = flow > 0;
  }

  private tick(dt: number) {
    if (!this.w) return;
    this.time += dt;
    if (this.cov !== this.target) {
      const d = this.target - this.cov;
      const step = SPEED * dt * (d > 0 ? 1 : 3);
      this.cov = Math.abs(d) <= step ? this.target : this.cov + Math.sign(d) * step;
      if (this.cov >= 1.95 && !this.sheep.length) this.release();
      this.apply();
    }
    if (!this.reduced) {
      for (const { g, t } of this.items)
        if (g.visible) g.skew.x = Math.sin(this.time * 1.6 + t.phase + t.x * 0.01) * 0.12;
      if (this.river.visible) this.drawRiver(this.time);
      for (const s of this.sheep) this.move(s, dt * 1000);
    }
    if (this.done.length && this.settled()) this.done.splice(0).forEach((ok) => ok());
  }

  private move(s: Sheep, ms: number) {
    if (s.t < RUN_MS + s.delay) {
      s.t += ms;
      const k = Math.max(0, Math.min(1, (s.t - s.delay) / RUN_MS));
      const e = 1 - (1 - k) ** 2;
      s.body.x = s.from.x + (s.to.x - s.from.x) * e;
      s.body.y =
        s.from.y + (s.to.y - s.from.y) * e - Math.abs(Math.sin(k * Math.PI * 7)) * 8 * (1 - k);
      if (s.t >= RUN_MS + s.delay) s.t = RUN_MS + s.delay;
      return;
    }
    // grazing: head down now and then, a tiny shuffle forward
    const g = Math.sin(this.time * 0.9 + s.phase);
    s.face.rotation = g > 0.55 ? -0.18 * Math.sign(s.face.scale.x) : 0;
    s.body.y = s.to.y + (g > 0.55 ? 2 : 0);
    s.body.x = s.to.x + Math.sin(this.time * 0.15 + s.phase) * 6;
  }
}
