/** One grass tuft of the meadow; flower tufts get a stem with leaves and a blossom that opens later. */
import { Container, Graphics } from "pixi.js";
import { rng, type Tuft } from "./meadowPlan";
import { palette } from "./palette";

export function drawTuft(t: Tuft): { g: Container; bloom: Graphics | null } {
  const p = palette();
  const r = rng(Math.round(t.x * 31 + t.y * 17));
  const g = new Graphics();
  g.ellipse(0, 0, t.size * 0.7, t.size * 0.18).fill({ color: p["meadow-800"], alpha: 0.35 });
  let bloom: Graphics | null = null;
  if (t.flower) {
    // a stem with two leaves, the blossom opens on top of it later
    const fy = -t.size * 1.5;
    g.moveTo(0, 0)
      .quadraticCurveTo(t.size * 0.15, fy * 0.5, 0, fy)
      .stroke({ width: 1.4, color: p["meadow-600"] });
    for (const d of [-1, 1])
      g.ellipse(d * t.size * 0.18, fy * 0.45, t.size * 0.18, t.size * 0.07).fill(p["meadow-400"]);
    const petals = [p.surface, p["logo-yellow"], p["accent-soft"], p["logo-blue"]][
      Math.floor(r() * 4)
    ]!;
    const big = 1 + r() * 0.6;
    bloom = new Graphics();
    for (let k = 0; k < 6; k++) {
      const an = (k / 6) * Math.PI * 2;
      bloom
        .ellipse(Math.cos(an) * 2.8 * big, Math.sin(an) * 2.8 * big, 2.3 * big, 1.5 * big)
        .fill(petals);
    }
    bloom.circle(0, 0, 1.7 * big).fill(p["logo-orange"]);
    bloom.position.set(0, fy);
    bloom.scale.set(0);
  }
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
  const c = new Container();
  c.addChild(g);
  if (bloom) c.addChild(bloom);
  c.position.set(t.x, t.y);
  c.scale.set(0);
  c.visible = false;
  return { g: c, bloom };
}
