/** Particle building blocks for attacks: projectiles with trails, streams, rains, pillars, shards. */
import { Container, Graphics } from "pixi.js";
import type { Element } from "../data/types";
import { text } from "./CardSprite";
import type { Fx } from "./fx";
import { palette } from "./palette";
import { ease, type Tweener } from "./tween";

export interface Pt {
  x: number;
  y: number;
}

/** Look of an element's attack: colours of sparks and the emoji riding along. */
export function elementStyle(e: Element) {
  const p = palette();
  const styles: Record<Element, { colors: string[]; emoji: string; core: string }> = {
    modlitwa: { colors: [p["logo-yellow"], p.surface], emoji: "✨", core: p["logo-yellow"] },
    slowo: { colors: [p.surface, p["logo-yellow"]], emoji: "📜", core: p.surface },
    sluzba: { colors: [p["logo-orange"], p["logo-yellow"]], emoji: "🤍", core: p["logo-orange"] },
    pycha: { colors: [p["logo-red"], p["logo-blue"]], emoji: "💎", core: p["logo-red"] },
    gniew: { colors: [p.danger, p["logo-orange"]], emoji: "🔥", core: p.danger },
    lenistwo: { colors: [p["logo-blue"], p.line], emoji: "💤", core: p["logo-blue"] },
  };
  return styles[e];
}

function dot(color: string, r: number) {
  return new Graphics().circle(0, 0, r).fill(color);
}

/** A glowing orb flying from A to B, shedding sparks and emoji on the way. */
export async function projectile(fx: Fx, tw: Tweener, from: Pt, to: Pt, e: Element, big = false) {
  const st = elementStyle(e);
  const orb = new Container();
  const glow = new Graphics().circle(0, 0, big ? 34 : 24).fill({ color: st.core, alpha: 0.35 });
  orb.addChild(glow, dot(st.core, big ? 16 : 11), dot(palette().surface, big ? 7 : 5));
  orb.position.set(from.x, from.y);
  fx.layer.addChild(orb);
  const k = { t: 0 };
  const curve = (from.x < to.x ? -1 : 1) * 60;
  const iv = setInterval(() => {
    const t = k.t;
    orb.x = from.x + (to.x - from.x) * t + Math.sin(t * Math.PI) * curve;
    orb.y = from.y + (to.y - from.y) * t;
    orb.scale.set(1 + Math.sin(t * Math.PI) * 0.4);
    if (fx.reduced) return;
    for (let i = 0; i < (big ? 3 : 2); i++)
      fx.spawn(dot(st.colors[i % st.colors.length]!, 2 + Math.random() * 3), {
        vx: (Math.random() - 0.5) * 120,
        vy: (Math.random() - 0.5) * 120,
        life: 0.5,
      });
    if (Math.random() < 0.35) {
      const t2 = text(st.emoji, { fontSize: big ? 26 : 18 });
      t2.anchor.set(0.5);
      t2.position.set(orb.x, orb.y);
      fx.spawn(t2, {
        vx: (Math.random() - 0.5) * 80,
        vy: -40 - Math.random() * 60,
        life: 0.7,
        spin: (Math.random() - 0.5) * 4,
      });
    }
  }, 16);
  await tw.to(k, { t: 1 }, big ? 520 : 420, ease.in);
  clearInterval(iv);
  orb.destroy({ children: true });
}

/** Emoji shot one after another from A to B (keys, notes, flies, coins…). */
export async function stream(
  fx: Fx,
  tw: Tweener,
  from: Pt,
  to: Pt,
  emoji: string,
  n = 8,
  size = 34,
  ms = 900,
) {
  const jobs: Promise<void>[] = [];
  for (let i = 0; i < n; i++) {
    const t = text(emoji, { fontSize: size });
    t.anchor.set(0.5);
    t.position.set(from.x + (Math.random() - 0.5) * 40, from.y + (Math.random() - 0.5) * 40);
    t.alpha = 0;
    fx.layer.addChild(t);
    const d = (i / n) * ms * 0.6;
    jobs.push(
      tw
        .to(
          t,
          {
            alpha: 1,
            x: to.x + (Math.random() - 0.5) * 80,
            y: to.y + (Math.random() - 0.5) * 60,
            rotation: (Math.random() - 0.5) * 2,
          },
          ms * 0.5,
          ease.inOut,
          d,
        )
        .then(() => tw.to(t, { alpha: 0 }, 160))
        .then(() => t.destroy()),
    );
  }
  await Promise.all(jobs);
}

/** Emoji falling from above onto a point (bricks, coins, crowns). */
export async function rain(fx: Fx, tw: Tweener, at: Pt, emoji: string, n = 10, size = 32) {
  const jobs: Promise<void>[] = [];
  for (let i = 0; i < n; i++) {
    const t = text(emoji, { fontSize: size * (0.8 + Math.random() * 0.5) });
    t.anchor.set(0.5);
    const x = at.x + (Math.random() - 0.5) * 140;
    t.position.set(x, at.y - 260 - Math.random() * 120);
    fx.layer.addChild(t);
    jobs.push(
      tw
        .to(
          t,
          { y: at.y + (Math.random() - 0.5) * 50, rotation: (Math.random() - 0.5) * 3 },
          420 + Math.random() * 200,
          ease.in,
          i * 45,
        )
        .then(() => tw.to(t, { alpha: 0 }, 220))
        .then(() => t.destroy()),
    );
  }
  await Promise.all(jobs);
}

/** A vertical column of light falling onto a point. */
export async function pillar(fx: Fx, tw: Tweener, at: Pt, color: string, width = 120) {
  const g = new Graphics()
    .rect(-width / 2, -2000, width, 2000 + 40)
    .fill({ color, alpha: 0.32 })
    .rect(-width / 6, -2000, width / 3, 2000 + 40)
    .fill({ color: palette().surface, alpha: 0.45 });
  g.position.set(at.x, at.y);
  g.scale.x = 0.05;
  fx.layer.addChildAt(g, 0);
  await tw.to(g.scale, { x: 1 }, 220, ease.out);
  await tw.wait(260);
  await tw.to(g, { alpha: 0 }, 380);
  g.destroy();
}

/** A big emoji crossing the whole board (hussars, a boat, a dragon). */
export async function sweep(
  fx: Fx,
  tw: Tweener,
  w: number,
  y: number,
  emoji: string,
  size = 90,
  ltr = true,
  ms = 900,
) {
  const t = text(emoji, { fontSize: size });
  t.anchor.set(0.5);
  t.scale.x = ltr ? -1 : 1;
  t.position.set(ltr ? -size : w + size, y);
  fx.layer.addChild(t);
  const k = { t: 0 };
  const iv = setInterval(() => {
    t.y = y + Math.sin(k.t * Math.PI * 6) * 10;
    if (!fx.reduced && Math.random() < 0.6)
      fx.burst(t.x, t.y + size * 0.3, [palette().line, palette().surface], 2, 90, 100);
  }, 16);
  await tw.to(t, { x: ltr ? w + size : -size }, ms, ease.linear);
  await tw.to(k, { t: 1 }, 1);
  clearInterval(iv);
  t.destroy();
}

/** Card fragments flying off a hit card. */
export function shards(fx: Fx, at: Pt, color: string, n = 14, power = 1) {
  if (fx.reduced) return;
  for (let i = 0; i < n; i++) {
    const s = 4 + Math.random() * 9;
    const g = new Graphics().poly([0, 0, s, s * 0.3, s * 0.4, s]).fill(color);
    g.position.set(at.x + (Math.random() - 0.5) * 60, at.y + (Math.random() - 0.5) * 80);
    const a = Math.random() * Math.PI * 2;
    const v = (150 + Math.random() * 260) * power;
    fx.spawn(g, {
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v - 120,
      life: 0.9,
      gravity: 700,
      spin: (Math.random() - 0.5) * 12,
    });
  }
}

/** Expanding filled shockwave + bright core flash at the impact point. */
export async function impact(fx: Fx, tw: Tweener, at: Pt, color: string, power = 1) {
  const g = new Graphics()
    .circle(0, 0, 60)
    .fill({ color, alpha: 0.5 })
    .circle(0, 0, 26)
    .fill({ color: palette().surface, alpha: 0.9 });
  g.position.set(at.x, at.y);
  g.scale.set(0.2);
  fx.layer.addChild(g);
  void fx.ring(at.x, at.y, color, 120 * power, 6);
  await tw.to(g.scale, { x: 1.4 * power, y: 1.4 * power }, 180, ease.out);
  await tw.to(g, { alpha: 0 }, 220);
  g.destroy();
}
