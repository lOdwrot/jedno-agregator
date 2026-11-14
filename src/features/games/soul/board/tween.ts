/** Minimal tween engine on top of the Pixi ticker (promises, easing, global speed for reduced motion). */
import type { Ticker } from "pixi.js";

export type Ease = (t: number) => number;
export const ease = {
  linear: (t: number) => t,
  out: (t: number) => 1 - (1 - t) ** 3,
  in: (t: number) => t ** 3,
  inOut: (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2),
  back: (t: number) => 1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2,
  elastic: (t: number) =>
    t === 0 || t === 1 ? t : 2 ** (-10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1,
};

type Obj = Record<string, unknown>;

interface Tw {
  target: Obj;
  from: Record<string, number>;
  to: Record<string, number>;
  t: number;
  dur: number;
  delay: number;
  ease: Ease;
  done: () => void;
}

export class Tweener {
  private list: Tw[] = [];
  /** Multiplies every duration (reduced motion makes it small). */
  speed = 1;

  constructor(ticker: Ticker) {
    ticker.add((t) => this.update(t.deltaMS));
  }

  to(
    target: object,
    props: Record<string, number>,
    ms = 300,
    e: Ease = ease.out,
    delay = 0,
  ): Promise<void> {
    const obj = target as unknown as Obj;
    // a new tween on the same props replaces the old one
    const replaced = this.list.filter(
      (tw) => tw.target === obj && Object.keys(props).some((k) => k in tw.to),
    );
    if (replaced.length) {
      this.list = this.list.filter((tw) => !replaced.includes(tw));
      for (const tw of replaced) tw.done();
    }
    return new Promise((done) => {
      const to = props as Record<string, number>;
      const from: Record<string, number> = {};
      for (const k of Object.keys(to)) from[k] = obj[k] as number;
      const dur = ms * this.speed;
      if (dur <= 1 && delay * this.speed <= 1) {
        Object.assign(obj, to);
        done();
        return;
      }
      this.list.push({
        target: obj,
        from,
        to,
        t: 0,
        dur: Math.max(1, dur),
        delay: delay * this.speed,
        ease: e,
        done,
      });
    });
  }

  wait(ms: number): Promise<void> {
    const holder = { v: 0 };
    return this.to(holder, { v: 1 }, ms, ease.linear);
  }

  /** Stops tweens of a target (their promises resolve, so nothing waits forever). */
  kill(target: object) {
    const gone = this.list.filter((tw) => tw.target === (target as unknown as Obj));
    this.list = this.list.filter((tw) => !gone.includes(tw));
    for (const tw of gone) tw.done();
  }

  private update(dt: number) {
    if (!this.list.length) return;
    const finished: Tw[] = [];
    for (const tw of this.list) {
      if (tw.delay > 0) {
        tw.delay -= dt;
        continue;
      }
      tw.t = Math.min(1, tw.t + dt / tw.dur);
      const k = tw.ease(tw.t);
      for (const key of Object.keys(tw.to))
        tw.target[key] = tw.from[key]! + (tw.to[key]! - tw.from[key]!) * k;
      if (tw.t >= 1) finished.push(tw);
    }
    if (finished.length) {
      this.list = this.list.filter((tw) => !finished.includes(tw));
      for (const tw of finished) tw.done();
    }
  }
}
