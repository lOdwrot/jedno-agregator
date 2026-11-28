import { palette } from "../board/palette";
import type { Finish } from "../data/types";
import { particleAlpha, project, type Particle } from "./glassParticles";

/** Colours of the particles: stained = the glass panes, gilded = gold dust. */
function colors(finish: Finish): string[] {
  const p = palette();
  return finish === "stained"
    ? [p["logo-blue"], p["logo-red"], p["logo-yellow"], p.success, p.surface]
    : [p["gold-100"], p["gold-300"], p["gold-500"]];
}

/** Draws the particles on a canvas whose centre is the card centre (canvas px = CSS px × dpr). */
export function drawParticles(
  ctx: CanvasRenderingContext2D,
  list: readonly Particle[],
  finish: Finish,
  perspective: number,
  dpr: number,
) {
  const { width, height } = ctx.canvas;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, width, height);
  if (!list.length) return;
  const pal = colors(finish);
  ctx.setTransform(dpr, 0, 0, dpr, width / 2, height / 2);
  // far ones first, so the near ones are drawn on top
  const sorted = [...list].sort((a, b) => a.p.z - b.p.z);
  for (const q of sorted) {
    const { x, y, s } = project(q.p, perspective);
    const a = particleAlpha(q);
    if (a <= 0.01) continue;
    const r = q.size * s;
    ctx.globalAlpha = a;
    const col = pal[q.color % pal.length] ?? "white";
    ctx.fillStyle = col;
    // a soft glow of the same colour (cheap enough for a few hundred particles)
    ctx.shadowColor = col;
    ctx.shadowBlur = 6 * s * dpr;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(q.angle);
    ctx.beginPath();
    if (q.shape === "shard") {
      // a sliver of coloured glass
      ctx.moveTo(0, -r * 1.3);
      ctx.lineTo(r * 0.8, r * 0.6);
      ctx.lineTo(-r * 0.6, r * 0.9);
    } else {
      // four-pointed sparkle
      const k = r * 0.28;
      ctx.moveTo(0, -r);
      ctx.lineTo(k, -k);
      ctx.lineTo(r, 0);
      ctx.lineTo(k, k);
      ctx.lineTo(0, r);
      ctx.lineTo(-k, k);
      ctx.lineTo(-r, 0);
      ctx.lineTo(-k, -k);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
}
