/**
 * A drawn sheep for the meadow of saved souls: fluffy wool, a dark face with ears, four legs that
 * trot while it runs, a head that dips to graze and chews, a wagging tail. Faces right (mirror with
 * `scale.x = -1`).
 */
import { Container, Graphics } from "pixi.js";
import { palette } from "./palette";

export class SheepSprite extends Container {
  private legs: Graphics[] = [];
  private wool = new Container();
  private head = new Container();
  private jaw = new Graphics();
  private ears: Graphics[] = [];
  private tail = new Graphics();
  /** 0 = head up, 1 = head down grazing. */
  private dip = 0;

  constructor(private size: number) {
    super();
    const p = palette();
    const s = size;
    const shadow = new Graphics()
      .ellipse(0, s * 0.42, s * 0.5, s * 0.11)
      .fill({ color: p["meadow-800"], alpha: 0.45 });
    this.addChild(shadow);
    // legs: front pair and back pair, pivoted at the hip
    for (const [x, back] of [
      [-0.28, true],
      [-0.16, false],
      [0.16, true],
      [0.28, false],
    ] as const) {
      const leg = new Graphics()
        .roundRect(-s * 0.035, 0, s * 0.07, s * 0.3, s * 0.03)
        .fill(back ? p["navy-800"] : p["logo-dark"])
        .roundRect(-s * 0.045, s * 0.26, s * 0.09, s * 0.06, s * 0.02)
        .fill(p.navy);
      leg.position.set(x * s, s * 0.12);
      this.legs.push(leg);
      this.addChild(leg);
    }
    this.tail.circle(0, 0, s * 0.1).fill(p["surface-muted"]);
    this.tail.position.set(-s * 0.44, -s * 0.06);
    this.addChild(this.tail);
    // wool: a cloud of overlapping puffs, a shade behind and a light rim on top
    const puffs: [number, number, number][] = [
      [-0.3, -0.02, 0.17],
      [-0.15, -0.14, 0.19],
      [0.04, -0.16, 0.19],
      [0.22, -0.1, 0.17],
      [0.27, 0.06, 0.15],
      [-0.27, 0.1, 0.15],
      [-0.08, 0.1, 0.18],
      [0.12, 0.1, 0.17],
      [-0.04, -0.02, 0.2],
    ];
    const shade = new Graphics();
    for (const [x, y, r] of puffs) shade.circle(x * s, y * s + s * 0.03, r * s).fill(p.line);
    const fluff = new Graphics();
    for (const [x, y, r] of puffs) fluff.circle(x * s, y * s, r * s * 0.94).fill(p.surface);
    for (const [x, y, r] of puffs.slice(0, 4))
      fluff.circle(x * s - r * s * 0.3, y * s - r * s * 0.35, r * s * 0.3).fill(p.canvas);
    this.wool.addChild(shade, fluff);
    this.addChild(this.wool);
    // head: dark face, droopy ears, a wool tuft on the forehead, eyes
    const ear = (dir: 1 | -1) => {
      const e = new Graphics()
        .ellipse(0, 0, s * 0.11, s * 0.045)
        .fill(p["logo-dark"])
        .ellipse(s * 0.02, 0, s * 0.06, s * 0.02)
        .fill(p["accent-soft"]);
      e.position.set(-s * 0.02, dir * s * 0.09 - s * 0.04);
      e.rotation = dir * 0.5;
      this.ears.push(e);
      return e;
    };
    const face = new Graphics()
      .ellipse(s * 0.1, s * 0.02, s * 0.15, s * 0.11)
      .fill(p["logo-dark"])
      .circle(s * 0.06, -s * 0.03, s * 0.022)
      .fill(p.surface)
      .circle(s * 0.065, -s * 0.03, s * 0.011)
      .fill(p.navy)
      .circle(-s * 0.02, -s * 0.09, s * 0.08)
      .fill(p.surface)
      .circle(s * 0.05, -s * 0.11, s * 0.06)
      .fill(p.surface);
    this.jaw.ellipse(s * 0.17, s * 0.08, s * 0.06, s * 0.035).fill(p["navy-800"]);
    this.head.addChild(ear(-1), this.jaw, face, ear(1));
    this.head.position.set(s * 0.36, -s * 0.08);
    this.addChild(this.head);
  }

  /** Trotting: legs swing, the body bobs. `k` grows with the distance covered. */
  run(k: number) {
    const sw = Math.sin(k);
    this.legs.forEach((l, i) => (l.rotation = (i % 2 ? sw : -sw) * 0.55));
    this.wool.y = -Math.abs(Math.cos(k)) * this.size * 0.05;
    this.head.y = -this.size * 0.08 + this.wool.y;
    this.head.rotation = -0.15;
    this.tail.rotation = sw * 0.3;
  }

  /** Grazing: now and then the head dips to the grass and chews; ears flick, the tail wags. */
  graze(t: number, phase: number, dt: number) {
    const down = Math.sin(t * 0.7 + phase) > 0.2 ? 1 : 0;
    this.dip += (down - this.dip) * Math.min(1, dt * 4);
    this.legs.forEach((l) => (l.rotation *= 0.85));
    this.wool.y *= 0.85;
    this.head.rotation = this.dip * 0.75;
    this.head.y = -this.size * 0.08 + this.dip * this.size * 0.14;
    this.jaw.y = this.dip * Math.max(0, Math.sin(t * 14 + phase)) * this.size * 0.025;
    const flick = Math.sin(t * 2.3 + phase * 3) > 0.93 ? 0.35 : 0;
    this.ears[0]!.rotation = -0.5 - flick;
    this.ears[1]!.rotation = 0.5 + flick;
    this.tail.rotation = Math.sin(t * 6 + phase) * (Math.sin(t * 0.5 + phase) > 0.6 ? 0.5 : 0.05);
  }
}
