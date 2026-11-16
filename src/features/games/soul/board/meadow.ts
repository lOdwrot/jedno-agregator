/**
 * The meadow of saved souls: with every soul the player saves, grass and flowers spread further up
 * from the player's edge; with the last one the whole board turns green, a river flows along the
 * middle and sheep run in to graze. Tufts pop up with a springy bounce, flowers open after the grass,
 * leaves and pollen whirl up from the growing front and butterflies come with the flock.
 * Static (no bounce, no sway, no running) under reduced motion.
 */
import { Container, Graphics, type Ticker } from "pixi.js";
import type { Anchors } from "./layout";
import { Butterflies, Sprouts } from "./meadowFx";
import { coverage, pastures, rng, riverY, tufts, type Tuft } from "./meadowPlan";
import { palette } from "./palette";
import { SheepSprite } from "./sheep";
import { drawTuft } from "./tuft";
import { ease } from "./tween";

const SHEEP = 6;
/** Slowest coverage per second while the meadow spreads (it starts faster, then eases in). */
const SPEED = 0.45;
const RUN_MS = 1400;
/** Seconds a tuft takes to spring up / a flower to open. */
const POP = 0.6;
const BLOOM = 0.7;

interface Item {
  g: Container;
  bloom: Graphics | null;
  t: Tuft;
  /** Time it sprouted (null = not grown yet). */
  born: number | null;
}

interface Sheep {
  body: SheepSprite;
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
  private front = new Graphics();
  private sprouts = new Sprouts();
  private flies = new Butterflies();
  private items: Item[] = [];
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
      this.front,
      this.river,
      this.shimmer,
      this.riverMask,
      this.grass,
      this.sprouts.layer,
      this.flock,
      this.flies.layer,
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
    // a bright, glowing edge where the grass is growing right now
    this.front.clear();
    for (let i = 0; i < 4; i++)
      this.front
        .rect(0, -3 + i * 1.5, w, 6 - i * 3 + 3)
        .fill({ color: p["meadow-200"], alpha: 0.08 + i * 0.06 });
    this.drawRiver(0);
    this.grass.removeChildren().forEach((c) => c.destroy());
    this.items = tufts(w, h, a.mid, this.base).map((t) => {
      const it: Item = { ...drawTuft(t), t, born: null };
      this.grass.addChild(it.g);
      // already grown before the resize: no new pop
      if (this.cov >= t.at) {
        it.born = -1e3;
        it.g.visible = true;
        this.grown(it);
      }
      return it;
    });
    this.flies.resize(w, h);
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

  /** The flock runs in from both sides, butterflies follow. */
  private release() {
    if (!this.a) return;
    const spots = pastures(this.a, this.w, this.h, SHEEP);
    const size = Math.max(30, Math.min(50, this.w / 20));
    spots.forEach((to, i) => {
      const left = to.x < this.w / 2;
      const from = { x: left ? -50 : this.w + 50, y: to.y + (i % 2 ? 20 : -20) };
      const body = new SheepSprite(size * (0.85 + (i % 3) * 0.1));
      body.position.set(this.reduced ? to.x : from.x, this.reduced ? to.y : from.y);
      // drawn facing right: mirror the ones running in from the right
      body.scale.x = left ? 1 : -1;
      this.flock.addChild(body);
      this.sheep.push({
        body,
        from,
        to,
        t: this.reduced ? RUN_MS : 0,
        delay: i * 110,
        phase: i * 1.7,
      });
    });
    if (!this.reduced) this.flies.release(this.w, this.h);
  }

  private frontY(c: number) {
    return c <= 1 ? this.base - (this.base - this.mid) * c : this.mid * (2 - c);
  }

  private apply() {
    const c = this.cov;
    this.nearGround.scale.y = Math.min(1, c);
    this.farGround.scale.y = Math.max(0, Math.min(1, c - 1));
    this.nearGround.visible = c > 0;
    this.farGround.visible = c > 1;
    this.feather.visible = c > 0 && c < 2;
    this.baseGround.visible = c > 0;
    this.feather.y = this.front.y = this.frontY(c);
    this.front.visible = !this.reduced && this.cov !== this.target && c > 0 && c < 2;
    for (const it of this.items) {
      if (c >= it.t.at) {
        if (it.born === null) {
          it.born = this.reduced ? -1e3 : this.time;
          it.g.visible = true;
          this.grown(it);
        }
      } else if (it.born !== null) {
        it.born = null;
        it.g.visible = false;
      }
    }
    const flow = Math.max(0, Math.min(1, (c - 1.4) / 0.5));
    this.riverMask.clear();
    if (flow > 0) this.riverMask.rect(0, 0, this.w * flow, this.h).fill(0xffffff);
    this.river.visible = this.shimmer.visible = flow > 0;
  }

  /** Springs a sprouted tuft up (overshooting a bit) and opens its flower a moment later. */
  private grown(it: Item) {
    const age = this.time - (it.born ?? 0);
    const k = Math.min(1, age / POP);
    it.g.scale.set(ease.elastic(k) * (0.6 + 0.4 * Math.min(1, k * 3)));
    if (it.bloom) {
      const b = Math.max(0, Math.min(1, (age - POP * 0.6) / BLOOM));
      it.bloom.scale.set(ease.elastic(b));
      it.bloom.rotation = (1 - b) * 2.2;
    }
  }

  private tick(dt: number) {
    if (!this.w) return;
    this.time += dt;
    if (this.cov !== this.target) {
      const d = this.target - this.cov;
      // fast at first, easing in as it reaches the target; shrinking is quicker
      const step = Math.max(SPEED, Math.abs(d) * 2.2) * dt * (d > 0 ? 1 : 3);
      this.cov = Math.abs(d) <= step ? this.target : this.cov + Math.sign(d) * step;
      if (this.cov >= 1.95 && !this.sheep.length) this.release();
      this.apply();
      if (!this.reduced && d > 0) {
        this.sprouts.emit(this.w, this.frontY(this.cov), this.w / 6, dt);
        this.front.alpha = 0.7 + Math.sin(this.time * 12) * 0.3;
      }
    }
    if (!this.reduced) {
      for (const it of this.items) {
        if (!it.g.visible) continue;
        if (it.born !== null && this.time - it.born < POP + BLOOM) this.grown(it);
        it.g.skew.x = Math.sin(this.time * 1.6 + it.t.phase + it.t.x * 0.01) * 0.12;
      }
      if (this.river.visible) this.drawRiver(this.time);
      for (const s of this.sheep) this.move(s, dt * 1000, dt);
      this.sprouts.tick(dt);
      this.flies.tick(this.time);
    }
    if (this.done.length && this.settled()) this.done.splice(0).forEach((ok) => ok());
  }

  private move(s: Sheep, ms: number, dt: number) {
    if (s.t < RUN_MS + s.delay) {
      s.t += ms;
      const k = Math.max(0, Math.min(1, (s.t - s.delay) / RUN_MS));
      const e = 1 - (1 - k) ** 2;
      s.body.x = s.from.x + (s.to.x - s.from.x) * e;
      s.body.y =
        s.from.y + (s.to.y - s.from.y) * e - Math.abs(Math.sin(k * Math.PI * 7)) * 8 * (1 - k);
      s.body.run(k * 40);
      if (s.t >= RUN_MS + s.delay) s.t = RUN_MS + s.delay;
      return;
    }
    // arrived: one happy hop, then grazing with a tiny shuffle forward
    s.t += ms;
    const hop = (s.t - RUN_MS - s.delay) / 450;
    const jump = hop < 1 ? Math.sin(hop * Math.PI) * 14 : 0;
    s.body.graze(this.time, s.phase, dt);
    s.body.y = s.to.y - jump;
    s.body.x = s.to.x + Math.sin(this.time * 0.15 + s.phase) * 6;
  }
}
