/**
 * Prestige prints on the canvas: a shimmering foil background (gilded + stained), stained-glass panes
 * with lead lines and a glass reflection (stained), and a rainbow aura + rising sparkles while a
 * stained card is active. Everything moving is skipped under reduced motion.
 */
import { Container, FillGradient, Graphics } from "pixi.js";
import type { Finish } from "../data/types";
import { CARD_H, CARD_W } from "./layout";
import { palette } from "./palette";

const W = CARD_W;
const H = CARD_H;
/** Inner panel of the card face (inside the frame). */
const IX = -W / 2 + 7;
const IY = -H / 2 + 7;
const IW = W - 14;
const IH = H - 14;
const MAX_SPARKS = 40;

function lin(stops: string[], diagonal = true) {
  return new FillGradient({
    type: "linear",
    start: { x: 0, y: 0 },
    end: diagonal ? { x: 1, y: 0.35 } : { x: 0, y: 1 },
    colorStops: stops.map((color, i) => ({ offset: i / (stops.length - 1), color })),
    textureSpace: "local",
  });
}

/** Deterministic PRNG so the same card always gets the same pane pattern. */
export function seeded(key: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) h = Math.imul(h ^ key.charCodeAt(i), 16777619);
  return () => {
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Jittered grid of quads covering the panel — the stained-glass panes. */
export function panes(key: string, cols = 4, rows = 6): [number, number][][] {
  const rnd = seeded(key);
  const pts: [number, number][][] = [];
  for (let r = 0; r <= rows; r++) {
    const row: [number, number][] = [];
    for (let c = 0; c <= cols; c++) {
      const edgeX = c === 0 || c === cols;
      const edgeY = r === 0 || r === rows;
      const jx = edgeX ? 0 : (rnd() - 0.5) * (IW / cols) * 0.55;
      const jy = edgeY ? 0 : (rnd() - 0.5) * (IH / rows) * 0.55;
      row.push([IX + (IW * c) / cols + jx, IY + (IH * r) / rows + jy]);
    }
    pts.push(row);
  }
  const at = (r: number, c: number): [number, number] => pts[r]?.[c] ?? [0, 0];
  const quads: [number, number][][] = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      quads.push([at(r, c), at(r, c + 1), at(r + 1, c + 1), at(r + 1, c)]);
  return quads;
}

interface Spark {
  g: Graphics;
  vx: number;
  vy: number;
  life: number;
  max: number;
  spin: number;
}

export class PrestigeFx {
  /** Goes right above the panel fill, below art and text. */
  readonly background = new Container();
  /** Goes on top of the face: glass reflection. */
  readonly glass = new Container();
  /** Goes behind the card body: rainbow halo of an active stained card. */
  readonly aura = new Graphics();
  private band = new Graphics();
  private glints: { g: Graphics; phase: number }[] = [];
  private tiles: { g: Graphics; base: number; phase: number }[] = [];
  private reflex = new Graphics();
  private sparks: Spark[] = [];
  private spawnIn = 0;
  private colors: string[];

  constructor(
    readonly finish: Exclude<Finish, "plain">,
    cardId: string,
    dark: boolean,
    private sparkLayer: Container,
  ) {
    const p = palette();
    const gilded = finish === "gilded";
    this.colors = gilded
      ? [p["logo-yellow"], p.surface, p["logo-orange"]]
      : [p["logo-blue"], p["logo-red"], p["logo-yellow"], p.success, p.surface];

    const mask = new Graphics().roundRect(IX, IY, IW, IH, 12).fill(p.surface);
    this.background.addChild(mask);
    this.background.mask = mask;

    // Foil band, three cards wide, drifting sideways — the shimmer.
    const stops = gilded
      ? [
          p["logo-yellow"],
          p.surface,
          p["logo-yellow"],
          p["logo-orange"],
          p.surface,
          p["logo-yellow"],
          p.surface,
          p["logo-yellow"],
        ]
      : [
          p["logo-blue"],
          p["logo-red"],
          p["logo-yellow"],
          p.success,
          p["logo-blue"],
          p["logo-red"],
          p["logo-yellow"],
          p["logo-blue"],
        ];
    this.band.rect(-W * 1.5, IY, W * 3, IH).fill(lin(stops));
    this.band.alpha = gilded ? (dark ? 0.32 : 0.5) : dark ? 0.3 : 0.24;
    this.background.addChild(this.band);

    if (gilded) {
      const rnd = seeded(`${cardId}:gold`);
      for (let i = 0; i < 14; i++) {
        const r = 1.5 + rnd() * 2.5;
        const g = new Graphics().star(0, 0, 4, r * 2, r * 0.5).fill(p.surface);
        g.position.set(IX + 6 + rnd() * (IW - 12), IY + 6 + rnd() * (IH - 12));
        g.rotation = rnd();
        this.glints.push({ g, phase: rnd() * Math.PI * 2 });
        this.background.addChild(g);
      }
    } else {
      // Stained glass: coloured panes with dark lead lines.
      const cols = [p["logo-blue"], p["logo-red"], p["logo-yellow"], p.success, p["logo-orange"]];
      const rnd = seeded(`${cardId}:glass`);
      const lead = dark ? p["logo-dark"] : p.navy;
      for (const q of panes(cardId)) {
        const base = (dark ? 0.26 : 0.16) + rnd() * 0.1;
        const g = new Graphics()
          .poly(q.flat())
          .fill(cols[Math.floor(rnd() * cols.length)])
          .poly(q.flat())
          .stroke({ width: 2.5, color: lead, alpha: 1, join: "round" });
        g.alpha = base;
        this.tiles.push({ g, base, phase: rnd() * Math.PI * 2 });
        this.background.addChild(g);
      }
      // Glass: soft reflection from the top-left corner plus a bright inner rim.
      const gm = new Graphics().roundRect(IX, IY, IW, IH, 12).fill(p.surface);
      this.reflex
        .poly([IX, IY, IX + IW * 0.85, IY, IX, IY + IH * 0.55])
        .fill({ color: p.surface, alpha: 0.16 })
        .poly([IX + IW, IY + IH * 0.62, IX + IW, IY + IH, IX + IW * 0.45, IY + IH])
        .fill({ color: p.surface, alpha: 0.08 });
      const rim = new Graphics()
        .roundRect(IX + 1.5, IY + 1.5, IW - 3, IH - 3, 11)
        .stroke({ width: 1.5, color: p.surface, alpha: 0.55 });
      this.glass.addChild(gm, this.reflex, rim);
      this.reflex.mask = gm;
    }

    this.aura
      .roundRect(-W / 2 - 12, -H / 2 - 12, W + 24, H + 24, 26)
      .stroke({ width: 8, fill: lin(cols4(p)) });
    this.aura.visible = false;
  }

  tick(dt: number, t: number, reduced: boolean, active: boolean) {
    if (reduced) {
      this.band.x = 0;
      this.aura.visible = active && this.finish === "stained";
      this.aura.alpha = 0.8;
      return;
    }
    this.band.x = Math.sin(t * 0.7) * W * 0.9;
    for (const s of this.glints) s.g.alpha = Math.max(0, Math.sin(t * 2.4 + s.phase)) ** 3;
    for (const s of this.tiles) s.g.alpha = s.base + 0.09 * Math.sin(t * 1.4 + s.phase);
    this.reflex.x = Math.sin(t * 0.5) * 10;

    const stained = this.finish === "stained";
    this.aura.visible = active && stained;
    if (this.aura.visible) this.aura.alpha = 0.55 + 0.35 * Math.sin(t * 3);
    if (active && stained) {
      this.spawnIn -= dt;
      while (this.spawnIn <= 0 && this.sparks.length < MAX_SPARKS) {
        this.spawnIn += 70;
        this.spawn();
      }
    }
    const k = dt / 1000;
    for (const s of this.sparks) {
      s.life -= k;
      s.g.x += s.vx * k;
      s.g.y += s.vy * k;
      s.g.rotation += s.spin * k;
      const f = s.life / s.max;
      s.g.alpha = Math.max(0, Math.min(1, f * 2.5));
      s.g.scale.set(0.4 + 0.6 * f);
    }
    if (this.sparks.some((s) => s.life <= 0)) {
      for (const s of this.sparks) if (s.life <= 0) s.g.destroy();
      this.sparks = this.sparks.filter((s) => s.life > 0);
    }
  }

  /** One sparkle on the card's edge, drifting up and out. */
  private spawn() {
    const edge = Math.random() * 2 * (W + H);
    let x: number;
    let y: number;
    if (edge < W) [x, y] = [edge - W / 2, -H / 2];
    else if (edge < W + H) [x, y] = [W / 2, edge - W - H / 2];
    else if (edge < 2 * W + H) [x, y] = [edge - W - H - W / 2, H / 2];
    else [x, y] = [-W / 2, edge - 2 * W - H - H / 2];
    const color = this.colors[Math.floor(Math.random() * this.colors.length)] ?? palette().surface;
    const r = 3 + Math.random() * 4;
    const g = new Graphics()
      .star(0, 0, 4, r * 1.8, r * 0.45)
      .fill(color)
      .circle(0, 0, r * 0.5)
      .fill(palette().surface);
    g.position.set(x, y);
    this.sparkLayer.addChild(g);
    const life = 0.9 + Math.random() * 0.8;
    this.sparks.push({
      g,
      vx: x * 0.25 + (Math.random() - 0.5) * 30,
      vy: -40 - Math.random() * 70,
      life,
      max: life,
      spin: (Math.random() - 0.5) * 6,
    });
  }

  /** Background and glass are children of the face and die with it; aura and sparkles are not. */
  destroy() {
    this.aura.destroy();
    for (const s of this.sparks) s.g.destroy();
    this.sparks = [];
  }
}

function cols4(p: ReturnType<typeof palette>) {
  return [p["logo-blue"], p["logo-red"], p["logo-yellow"], p.success, p["logo-blue"]];
}
