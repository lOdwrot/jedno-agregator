/** Visual effects layer: particles, floating numbers, rings, banners, coin flip, flying icons. */
import { Container, Graphics, type Ticker } from "pixi.js";
import { text } from "./CardSprite";
import { FONT_DISPLAY, palette } from "./palette";
import { ease, type Tweener } from "./tween";

interface Particle {
  g: Container;
  vx: number;
  vy: number;
  life: number;
  max: number;
  gravity: number;
  spin: number;
}

export class Fx {
  readonly layer = new Container();
  private parts: Particle[] = [];
  reduced = false;

  constructor(
    private tw: Tweener,
    ticker: Ticker,
  ) {
    ticker.add((t) => this.update(t.deltaMS / 1000));
  }

  private update(dt: number) {
    for (const p of this.parts) {
      p.life -= dt;
      p.vy += p.gravity * dt;
      p.g.x += p.vx * dt;
      p.g.y += p.vy * dt;
      p.g.rotation += p.spin * dt;
      p.g.alpha = Math.max(0, p.life / p.max);
    }
    const dead = this.parts.filter((p) => p.life <= 0);
    if (dead.length) {
      for (const p of dead) p.g.destroy({ children: true });
      this.parts = this.parts.filter((p) => p.life > 0);
    }
  }

  /** Coloured sparks bursting from a point. */
  burst(x: number, y: number, colors: string[], n = 22, speed = 320, gravity = 500) {
    if (this.reduced) return;
    for (let i = 0; i < n; i++) {
      const g = new Graphics().circle(0, 0, 3 + Math.random() * 4).fill(colors[i % colors.length]!);
      g.position.set(x, y);
      const a = Math.random() * Math.PI * 2;
      const v = speed * (0.4 + Math.random() * 0.8);
      this.layer.addChild(g);
      this.parts.push({
        g,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v - speed * 0.3,
        life: 0.9,
        max: 0.9,
        gravity,
        spin: 0,
      });
    }
  }

  /** Emoji confetti (doves, sparkles, smoke). */
  emojis(x: number, y: number, emoji: string, n = 8, rise = true, size = 26) {
    if (this.reduced) return;
    for (let i = 0; i < n; i++) {
      const t = text(emoji, { fontSize: size * (0.7 + Math.random() * 0.6) });
      t.anchor.set(0.5);
      t.position.set(x + (Math.random() - 0.5) * 60, y + (Math.random() - 0.5) * 40);
      this.layer.addChild(t);
      const vy = rise ? -80 - Math.random() * 120 : (Math.random() - 0.5) * 200;
      this.parts.push({
        g: t,
        vx: (Math.random() - 0.5) * 160,
        vy,
        life: 1.4,
        max: 1.4,
        gravity: rise ? -30 : 300,
        spin: (Math.random() - 0.5) * 3,
      });
    }
  }

  /** "-40", "+30", "SŁABOŚĆ ×2!" … rising and fading. */
  async float(x: number, y: number, s: string, color: string, size = 44) {
    const p = palette();
    const t = text(s, {
      fontFamily: FONT_DISPLAY,
      fontSize: size,
      fontWeight: "800",
      fill: color,
      stroke: { color: p.navy, width: 6 },
    });
    t.anchor.set(0.5);
    t.position.set(x, y);
    t.scale.set(0.3);
    this.layer.addChild(t);
    await this.tw.to(t.scale, { x: 1, y: 1 }, 260, ease.back);
    await this.tw.to(t, { y: y - 50, alpha: 0 }, 700, ease.in, 350);
    t.destroy();
  }

  /** Expanding ring (landing dust, cleanse, shield). */
  async ring(x: number, y: number, color: string, r = 90, width = 8) {
    const g = new Graphics().circle(0, 0, r).stroke({ width, color });
    g.position.set(x, y);
    g.scale.set(0.2);
    this.layer.addChild(g);
    await this.tw.to(g.scale, { x: 1, y: 1 }, 450, ease.out);
    await this.tw.to(g, { alpha: 0 }, 200);
    g.destroy();
  }

  /** Light rays rotating behind a point (evolution, ability). */
  async rays(x: number, y: number, color: string, ms = 1100) {
    const g = new Graphics();
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      g.moveTo(0, 0)
        .lineTo(Math.cos(a - 0.08) * 220, Math.sin(a - 0.08) * 220)
        .lineTo(Math.cos(a + 0.08) * 220, Math.sin(a + 0.08) * 220)
        .fill({ color, alpha: 0.35 });
    }
    g.position.set(x, y);
    g.scale.set(0.1);
    this.layer.addChildAt(g, 0);
    void this.tw.to(g, { rotation: 1.2 }, ms, ease.linear);
    await this.tw.to(g.scale, { x: 1, y: 1 }, ms * 0.4, ease.out);
    await this.tw.to(g, { alpha: 0 }, ms * 0.6);
    g.destroy();
  }

  /** Emoji flying along an arc from one point to another (energy orb, dove of a soul). */
  async fly(
    from: { x: number; y: number },
    to: { x: number; y: number },
    emoji: string,
    size = 40,
    ms = 650,
  ) {
    const t = text(emoji, { fontSize: size });
    t.anchor.set(0.5);
    t.position.set(from.x, from.y);
    this.layer.addChild(t);
    const arc = { k: 0 };
    const lift = Math.min(160, Math.hypot(to.x - from.x, to.y - from.y) * 0.4);
    const update = () => {
      t.x = from.x + (to.x - from.x) * arc.k;
      t.y = from.y + (to.y - from.y) * arc.k - Math.sin(arc.k * Math.PI) * lift;
      t.scale.set(1 + Math.sin(arc.k * Math.PI) * 0.4);
    };
    const tick = setInterval(update, 16);
    await this.tw.to(arc, { k: 1 }, ms, ease.inOut);
    clearInterval(tick);
    update();
    this.burst(to.x, to.y, [palette()["logo-yellow"], palette().surface], 12, 200, 200);
    t.destroy();
  }

  /** Big banner sliding through the middle line ("Twoja tura!"). */
  async banner(y: number, w: number, title: string, sub: string, color: string) {
    const p = palette();
    const c = new Container();
    const bg = new Graphics()
      .rect(-w, -42, w * 2, 84)
      .fill({ color: p.navy, alpha: 0.88 })
      .rect(-w, -42, w * 2, 5)
      .fill(color)
      .rect(-w, 37, w * 2, 5)
      .fill(color);
    const t = text(title, {
      fontFamily: FONT_DISPLAY,
      fontSize: 38,
      fontWeight: "800",
      fill: color,
    });
    t.anchor.set(0.5);
    t.y = sub ? -10 : 0;
    c.addChild(bg, t);
    if (sub) {
      const s = text(sub, { fontSize: 16, fontWeight: "700", fill: p.surface });
      s.anchor.set(0.5);
      s.y = 22;
      c.addChild(s);
    }
    c.position.set(-w, y);
    this.layer.addChild(c);
    await this.tw.to(c, { x: w / 2 }, 380, ease.out);
    await this.tw.wait(650);
    await this.tw.to(c, { x: w * 2, alpha: 0 }, 320, ease.in);
    c.destroy({ children: true });
  }

  /** Small caption over a card (attack name, ability). */
  async caption(x: number, y: number, s: string, color: string) {
    const p = palette();
    const t = text(s, {
      fontFamily: FONT_DISPLAY,
      fontSize: 22,
      fontWeight: "800",
      fill: color,
      stroke: { color: p.navy, width: 5 },
    });
    t.anchor.set(0.5);
    t.position.set(x, y);
    t.alpha = 0;
    this.layer.addChild(t);
    await this.tw.to(t, { alpha: 1, y: y - 12 }, 200);
    await this.tw.wait(700);
    await this.tw.to(t, { alpha: 0 }, 250);
    t.destroy();
  }

  /** Spinning coin in the middle of the table. */
  async coin(x: number, y: number, heads: boolean) {
    const p = palette();
    const c = new Container();
    const face = new Graphics()
      .circle(0, 0, 40)
      .fill(p["logo-yellow"])
      .circle(0, 0, 40)
      .stroke({ width: 5, color: p["logo-orange"] });
    const t = text("✝", {
      fontFamily: FONT_DISPLAY,
      fontSize: 36,
      fontWeight: "800",
      fill: p.navy,
    });
    t.anchor.set(0.5);
    c.addChild(face, t);
    c.position.set(x, y);
    this.layer.addChild(c);
    const spin = { a: 0 };
    const upd = () => {
      c.scale.x = Math.cos(spin.a);
      c.y = y - Math.sin((spin.a / (Math.PI * 8)) * Math.PI) * 90;
      t.text = Math.cos(spin.a) >= 0 ? "✝" : "★";
    };
    const iv = setInterval(upd, 16);
    await this.tw.to(spin, { a: Math.PI * 8 + (heads ? 0 : Math.PI) }, 900, ease.out);
    clearInterval(iv);
    upd();
    c.scale.x = 1;
    t.text = heads ? "✝" : "★";
    await this.float(x, y - 70, heads ? "Orzeł!" : "Reszka", heads ? p["logo-yellow"] : p.line, 30);
    c.destroy({ children: true });
  }

  /** Whole-screen tinted flash. */
  async flash(w: number, h: number, color: string, alpha = 0.35) {
    if (this.reduced) return;
    const g = new Graphics().rect(0, 0, w, h).fill(color);
    g.alpha = alpha;
    this.layer.addChild(g);
    await this.tw.to(g, { alpha: 0 }, 320);
    g.destroy();
  }
}

/** Shakes a display object around its current position. */
export async function shake(tw: Tweener, o: { x: number; y: number }, power = 10, reduced = false) {
  if (reduced) return;
  const x0 = o.x;
  const y0 = o.y;
  for (let i = 0; i < 6; i++) {
    const k = power * (1 - i / 6);
    await tw.to(
      o,
      { x: x0 + (Math.random() - 0.5) * 2 * k, y: y0 + (Math.random() - 0.5) * 2 * k },
      35,
      ease.linear,
    );
  }
  await tw.to(o, { x: x0, y: y0 }, 40);
}
