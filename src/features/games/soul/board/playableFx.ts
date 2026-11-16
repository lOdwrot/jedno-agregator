/** "You can play me now": a hand card bobs gently and sheds golden sparkles (static under reduced motion). */
import { Container, Graphics } from "pixi.js";
import { CARD_H, CARD_W } from "./layout";
import { palette } from "./palette";

interface Spark {
  g: Graphics;
  vx: number;
  vy: number;
  life: number;
  max: number;
}

const W = CARD_W;
const H = CARD_H;

export class PlayableFx {
  readonly layer = new Container();
  private sparks: Spark[] = [];
  private acc = 0;

  /** `body` is bobbed while `on`; returns it to rest otherwise. */
  tick(dt: number, t: number, reduced: boolean, on: boolean, body: Container) {
    const s = dt / 1000;
    body.y = on && !reduced ? -6 - 6 * Math.sin(t * 3.2) : on ? -6 : 0;
    if (on && !reduced) {
      this.acc += s * 9;
      while (this.acc >= 1) {
        this.acc -= 1;
        this.spawn();
      }
    }
    for (const sp of this.sparks) {
      sp.life += s;
      sp.g.x += sp.vx * s;
      sp.g.y += sp.vy * s;
      const k = sp.life / sp.max;
      sp.g.alpha = k < 0.2 ? k * 5 : 1 - (k - 0.2) / 0.8;
      sp.g.scale.set(1 - 0.5 * k);
    }
    this.sparks = this.sparks.filter((sp) => {
      if (sp.life < sp.max) return true;
      sp.g.destroy();
      return false;
    });
  }

  private spawn() {
    const p = palette();
    const edge = Math.random();
    // Mostly from the left/right edges, some from the top.
    const x = edge < 0.4 ? -W / 2 - 4 : edge < 0.8 ? W / 2 + 4 : (Math.random() - 0.5) * (W - 20);
    const y = edge < 0.8 ? (Math.random() - 0.3) * H * 0.8 : -H / 2 - 4;
    const r = 6 + Math.random() * 7;
    const g = new Graphics()
      .star(0, 0, 4, r * 1.8, r * 0.5)
      .fill(Math.random() < 0.5 ? p["logo-yellow"] : p.surface);
    g.position.set(x, y);
    g.rotation = Math.random();
    this.layer.addChild(g);
    this.sparks.push({
      g,
      vx: (edge < 0.4 ? -1 : edge < 0.8 ? 1 : 0) * (8 + Math.random() * 16),
      vy: -40 - Math.random() * 50,
      life: 0,
      max: 0.7 + Math.random() * 0.6,
    });
  }

  destroy() {
    this.layer.destroy({ children: true });
  }
}
