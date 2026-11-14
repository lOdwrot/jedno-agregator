/** Pixi application of the duel: keeps one sprite per visible card and animates it towards its slot. */
import { Application, Container } from "pixi.js";
import { charDef, maxHp, type Game, type InPlay } from "../engine/state";
import type { Frame } from "../engine/events";
import { CardSprite } from "./CardSprite";
import { Fx } from "./fx";
import { computeSlots, PLACE_KEY, type Slot } from "./layout";
import { palette } from "./palette";
import { playFrame } from "./playFrame";
import { Table } from "./table";
import { ease, Tweener } from "./tween";

export interface Highlights {
  playable: number[];
  targets: number[];
  bench: boolean;
}

export class BoardRenderer {
  app = new Application();
  stage = new Container();
  table = new Table();
  cards = new Container();
  tw!: Tweener;
  fx!: Fx;
  sprites = new Map<number, CardSprite>();
  state: Game | null = null;
  w = 0;
  h = 0;
  reduced = false;
  private hover: number | null = null;
  private drag: { key: number; x: number; y: number } | null = null;
  private hl: Highlights = { playable: [], targets: [], bench: false };

  async init(el: HTMLElement, reduced: boolean) {
    await document.fonts?.ready;
    await this.app.init({
      resizeTo: el,
      backgroundAlpha: 0,
      antialias: true,
      resolution: Math.min(2, window.devicePixelRatio || 1),
      autoDensity: true,
    });
    this.app.canvas.setAttribute("aria-hidden", "true");
    this.app.canvas.style.display = "block";
    el.appendChild(this.app.canvas);
    this.reduced = reduced;
    this.tw = new Tweener(this.app.ticker);
    this.tw.speed = reduced ? 0.15 : 1;
    this.fx = new Fx(this.tw, this.app.ticker);
    this.fx.reduced = reduced;
    this.cards.sortableChildren = true;
    this.stage.addChild(this.table.layer, this.cards, this.fx.layer);
    this.app.stage.addChild(this.stage);
    this.app.ticker.add((t) => {
      for (const s of this.sprites.values()) s.tick(t.deltaMS, this.reduced);
    });
  }

  resize(w: number, h: number) {
    if (w === this.w && h === this.h) return;
    this.w = w;
    this.h = h;
    this.table.resize(w, h);
    if (this.state) void this.reconcile(this.state, 0);
  }

  destroy() {
    this.app.destroy(true, { children: true });
  }

  /** Data of the card shown under `key` in the state. */
  private lookup(
    g: Game,
    s: Slot,
  ): { cardId: string; finish: CardSprite["finish"]; play: InPlay | null } | null {
    if (s.key === PLACE_KEY)
      return g.place ? { cardId: g.place.cardId, finish: "plain", play: null } : null;
    const p = g.players[s.pid];
    const play = [p.active, ...p.bench].find((c) => c?.uid === s.key) ?? null;
    const c = play ?? p.hand.find((x) => x.uid === s.key) ?? p.discard.find((x) => x.uid === s.key);
    return c ? { cardId: c.cardId, finish: c.finish, play } : null;
  }

  private origin(s: Slot) {
    const a = this.table.a;
    if (s.zone === "hand") return a.deck[s.pid];
    if (s.zone === "discard") return a.discard[s.pid];
    return a.hand[s.pid];
  }

  /** Moves every sprite to where the state says it is; returns when the motion ends. */
  async reconcile(g: Game, ms = 420, stagger = 0): Promise<void> {
    this.state = g;
    this.table.update(g);
    const slots = computeSlots(g, this.w, this.h);
    const want = new Map(slots.map((s) => [s.key, s]));
    const jobs: Promise<void>[] = [];
    for (const [key, sp] of this.sprites) {
      if (want.has(key)) continue;
      this.sprites.delete(key);
      const deck = [g.players.me, g.players.ai].findIndex((p) => p.deck.some((c) => c.uid === key));
      const to = deck >= 0 ? this.table.a.deck[deck === 0 ? "me" : "ai"] : { x: sp.x, y: sp.y };
      jobs.push(
        this.tw
          .to(sp, { x: to.x, y: to.y, alpha: 0 }, ms)
          .then(() => sp.destroy({ children: true })),
      );
    }
    let fresh = 0;
    for (const s of slots) {
      const info = this.lookup(g, s);
      if (!info) continue;
      let sp = this.sprites.get(s.key);
      const isNew = !sp;
      if (!sp) {
        sp = new CardSprite();
        const o = this.origin(s);
        sp.position.set(o.x, o.y);
        sp.scale.set(s.scale * 0.8);
        sp.setFace(false);
        if (s.zone === "discard" || s.zone === "place") sp.alpha = 0;
        this.cards.addChild(sp);
        this.sprites.set(s.key, sp);
        fresh++;
      }
      sp.setCard(info.cardId, info.finish);
      sp.updateInPlay(info.play, info.play ? maxHp(info.play) : 0);
      sp.zIndex = this.drag?.key === s.key ? 1000 : s.z;
      sp.setGlow(this.glowFor(s));
      if (this.drag?.key === s.key) continue;
      const lift =
        this.hover === s.key && s.zone === "hand" && s.pid === "me"
          ? (-28 * s.scale) / this.table.a.unit
          : 0;
      const delay = isNew ? stagger * (fresh - 1) : 0;
      jobs.push(this.moveTo(sp, s, ms, delay, lift));
    }
    await Promise.all(jobs);
  }

  private glowFor(s: Slot): string | null {
    const p = palette();
    if (this.hl.targets.includes(s.key)) return p["logo-yellow"];
    if (s.zone === "hand" && s.pid === "me" && this.hl.playable.includes(s.key)) return p.accent;
    return null;
  }

  private async moveTo(sp: CardSprite, s: Slot, ms: number, delay: number, lift: number) {
    const flip = sp.faceUp !== s.faceUp;
    const move = Promise.all([
      this.tw.to(sp, { x: s.x, y: s.y + lift, rotation: s.rot, alpha: 1 }, ms, ease.out, delay),
      this.tw.to(sp.scale, { x: s.scale, y: s.scale }, ms, ease.out, delay),
    ]);
    if (flip) {
      await this.tw.to(sp.body.scale, { x: 0 }, ms / 2, ease.in, delay);
      sp.setFace(s.faceUp);
      await this.tw.to(sp.body.scale, { x: 1 }, ms / 2, ease.out);
    }
    await move;
  }

  async play(f: Frame, prev: Game) {
    await playFrame(this, f, prev);
  }

  sprite(key: number) {
    return this.sprites.get(key);
  }

  setThinking(on: boolean) {
    this.table.thinking.visible = on;
  }

  setHover(key: number | null) {
    if (this.hover === key) return;
    this.hover = key;
    if (this.state && !this.drag) void this.reconcile(this.state, 160);
  }

  setHighlights(h: Highlights) {
    this.hl = h;
    this.table.setBenchGlow(h.bench);
    if (this.state)
      for (const s of computeSlots(this.state, this.w, this.h))
        this.sprites.get(s.key)?.setGlow(this.glowFor(s));
  }

  dragMove(key: number, x: number, y: number) {
    const sp = this.sprites.get(key);
    if (!sp) return;
    this.drag = { key, x, y };
    this.tw.kill(sp);
    this.tw.kill(sp.scale);
    sp.zIndex = 1000;
    sp.position.set(x, y);
    sp.rotation = 0;
    sp.scale.set(this.table.a.unit * 0.95);
  }

  async dragEnd() {
    this.drag = null;
    if (this.state) await this.reconcile(this.state, 250);
  }

  /** Character info for effects. */
  charAt(g: Game, uid: number) {
    for (const p of [g.players.me, g.players.ai]) {
      const c = [p.active, ...p.bench].find((x) => x?.uid === uid);
      if (c) return { c, def: charDef(c) };
    }
    return null;
  }
}
