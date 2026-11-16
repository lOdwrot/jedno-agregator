/**
 * A 3D-looking coin for the canvas: two embossed faces (gold heads with a cross, bimetal tails with a
 * star), a reeded edge whose thickness shows while it spins, a moving glint and a shadow on the table.
 * It flips around the horizontal axis — `setAngle` projects the faces as ellipses and draws the edge
 * band between them, so no real 3D renderer is needed.
 */
import { Container, FillGradient, Graphics } from "pixi.js";
import { text } from "./CardSprite";
import { FONT_DISPLAY, palette } from "./palette";

const metal = (stops: string[], diagonal = true) =>
  new FillGradient({
    type: "linear",
    start: { x: 0, y: 0 },
    end: diagonal ? { x: 0.6, y: 1 } : { x: 0, y: 1 },
    colorStops: stops.map((color, i) => ({ offset: i / (stops.length - 1), color })),
  });

/** Latin cross (heads) or a five-pointed star (tails), centred on (dx, dy). */
function symbol(g: Graphics, r: number, heads: boolean, dx: number, dy: number) {
  if (!heads) return g.star(dx, dy, 5, r * 0.42, r * 0.18, 0);
  const w = r * 0.15;
  return g
    .roundRect(dx - w / 2, dy - r * 0.48, w, r * 0.92, w * 0.25)
    .roundRect(dx - r * 0.3, dy - r * 0.24, r * 0.6, w, w * 0.25);
}

/** One embossed face, drawn at full size around (0, 0); squashed by `scale.y` while spinning. */
function face(r: number, heads: boolean): Container {
  const p = palette();
  const c = new Container();
  const rim = metal([p["gold-100"], p["gold-300"], p["gold-500"], p["gold-700"]]);
  // the field is sunk into the coin: lit from the bottom-right edge, shaded at the top
  const field = heads
    ? metal([p["gold-500"], p["gold-300"], p["gold-100"]], false)
    : metal([p["silver-500"], p["silver-300"], p["silver-100"]], false);
  const ink = heads ? p["gold-700"] : p["silver-700"];
  const light = heads ? p["gold-100"] : p["silver-100"];
  const g = new Graphics()
    .circle(0, 0, r)
    .fill(rim)
    .circle(0, 0, r)
    .stroke({ width: Math.max(1, r * 0.03), color: p["gold-700"] })
    .circle(0, 0, r * 0.76)
    .fill(field)
    .circle(0, 0, r * 0.76)
    .stroke({ width: Math.max(1.5, r * 0.035), color: heads ? p["gold-700"] : p["silver-700"] });
  // beaded border on the rim
  for (let i = 0; i < 30; i++) {
    const a = (i / 30) * Math.PI * 2;
    g.circle(Math.cos(a) * r * 0.88, Math.sin(a) * r * 0.88, r * 0.032).fill(p["gold-100"]);
  }
  // embossed symbol: shadow below-right, light edge above-left, relief on top
  symbol(g, r, heads, r * 0.035, r * 0.045).fill({ color: ink, alpha: 0.55 });
  symbol(g, r, heads, -r * 0.025, -r * 0.03).fill({ color: light, alpha: 0.9 });
  symbol(g, r, heads, 0, 0).fill(
    metal(heads ? [p["gold-300"], p["gold-500"]] : [p["silver-300"], p["silver-500"]]),
  );
  // soft top-left light
  g.ellipse(-r * 0.22, -r * 0.4, r * 0.5, r * 0.26).fill({ color: p.surface, alpha: 0.18 });
  c.addChild(g);
  const label = text(heads ? "ORZEŁ" : "RESZKA", {
    fontFamily: FONT_DISPLAY,
    fontSize: Math.max(7, r * 0.13),
    fontWeight: "800",
    fill: ink,
    letterSpacing: r * 0.02,
  });
  label.anchor.set(0.5);
  label.y = r * 0.6;
  c.addChild(label);
  return c;
}

export class Coin3D extends Container {
  private edge = new Graphics();
  private heads: Container;
  private tails: Container;
  private shine = new Graphics();
  private shineMask = new Graphics();
  private shade = new Graphics();

  constructor(
    readonly r: number,
    private thick = r * 0.16,
  ) {
    super();
    const p = palette();
    this.heads = face(r, true);
    this.tails = face(r, false);
    // a diagonal glint band, clipped to the face
    this.shine
      .rect(-r * 0.16, -r * 1.6, r * 0.32, r * 3.2)
      .fill({ color: p.surface, alpha: 0.55 })
      .rect(r * 0.24, -r * 1.6, r * 0.08, r * 3.2)
      .fill({ color: p.surface, alpha: 0.35 });
    this.shine.rotation = 0.6;
    this.shine.mask = this.shineMask;
    this.addChild(this.edge, this.heads, this.tails, this.shade, this.shine, this.shineMask);
    this.setAngle(0);
  }

  /** `a`: flip angle (0 = heads up, π = tails up). */
  setAngle(a: number) {
    const p = palette();
    const { r, thick } = this;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const ry = Math.max(r * 0.03, r * Math.abs(c));
    const front = -(thick / 2) * s * Math.sign(c || 1);
    const back = -front;
    const shown = c >= 0 ? this.heads : this.tails;
    const hidden = c >= 0 ? this.tails : this.heads;
    hidden.visible = false;
    shown.visible = true;
    shown.scale.set(1, ry / r);
    shown.y = front;
    // the edge: the far face outline + the band between both faces, with reeding on the near side
    const e = this.edge.clear();
    e.ellipse(0, back, r, ry).fill(p["gold-700"]);
    e.rect(-r, Math.min(front, back), r * 2, Math.abs(back - front)).fill(p["gold-500"]);
    const side = Math.sign(back - front);
    if (Math.abs(back - front) > 1.5) {
      for (let i = 1; i < 36; i++) {
        const x = -r + (i / 36) * r * 2;
        const k = ry * Math.sqrt(Math.max(0, 1 - (x / r) ** 2)) * side;
        e.moveTo(x, front + k)
          .lineTo(x, back + k)
          .stroke({ width: 1, color: i % 2 ? p["gold-700"] : p["gold-100"], alpha: 0.5 });
      }
    }
    // darker when seen edge-on, a glint sweeping across while it turns
    this.shade
      .clear()
      .ellipse(0, front, r, ry)
      .fill({ color: p["logo-dark"], alpha: 0.35 * (1 - Math.abs(c)) });
    this.shineMask
      .clear()
      .ellipse(0, front, r * 0.98, ry * 0.98)
      .fill(p.surface);
    this.shine.position.set(r * 1.4 * Math.sin(a * 1.5), front);
    this.shine.scale.y = Math.max(0.05, Math.abs(c));
    this.shine.alpha = 0.25 + 0.6 * Math.abs(Math.sin(a * 0.75));
  }
}

/** Soft elliptic shadow on the table under the coin. */
export function coinShadow(r: number): Graphics {
  const p = palette();
  const g = new Graphics();
  for (let i = 0; i < 4; i++)
    g.ellipse(0, 0, r * (1.1 - i * 0.18), r * (0.32 - i * 0.05)).fill({
      color: p["logo-dark"],
      alpha: 0.12,
    });
  return g;
}

/** Warm halo behind the coin after landing. */
export function coinGlow(r: number, color: string): Graphics {
  const g = new Graphics();
  for (let i = 0; i < 14; i++) g.circle(0, 0, r * (2.2 - i * 0.1)).fill({ color, alpha: 0.035 });
  return g;
}
