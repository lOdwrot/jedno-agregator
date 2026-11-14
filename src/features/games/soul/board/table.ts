/** Static-ish table: felt halves, card slots, deck stacks, soul counters, discard labels, "thinking" hint. */
import { Container, FillGradient, Graphics, Text } from "pixi.js";
import { BENCH_SIZE, SOULS_TO_WIN } from "../data/cards";
import type { Game, PlayerId } from "../engine/state";
import { text } from "./CardSprite";
import { anchors, CARD_H, CARD_W, type Anchors } from "./layout";
import { FONT_DISPLAY, palette } from "./palette";

export class Table {
  readonly layer = new Container();
  private felt = new Graphics();
  private slots = new Graphics();
  private decks = new Graphics();
  private labels = new Container();
  readonly thinking: Text;
  readonly benchGlow = new Graphics();
  a!: Anchors;
  w = 0;
  h = 0;

  constructor() {
    const p = palette();
    this.thinking = text("pomioty kombinują…", {
      fontFamily: FONT_DISPLAY,
      fontSize: 15,
      fontWeight: "800",
      fill: p["logo-yellow"],
    });
    this.thinking.anchor.set(0.5);
    this.thinking.visible = false;
    this.layer.addChild(
      this.felt,
      this.slots,
      this.benchGlow,
      this.decks,
      this.labels,
      this.thinking,
    );
  }

  resize(w: number, h: number) {
    this.w = w;
    this.h = h;
    this.a = anchors(w, h);
    const p = palette();
    const mid = this.a.mid;
    this.felt
      .clear()
      .rect(0, 0, w, mid)
      .fill(
        new FillGradient({
          type: "linear",
          start: { x: 0, y: 0 },
          end: { x: 0, y: 1 },
          colorStops: [
            { offset: 0, color: p.navy },
            { offset: 1, color: p["navy-800"] },
          ],
          textureSpace: "local",
        }),
      )
      .rect(0, mid, w, h - mid)
      .fill(
        new FillGradient({
          type: "linear",
          start: { x: 0, y: 0 },
          end: { x: 0, y: 1 },
          colorStops: [
            { offset: 0, color: p["navy-800"] },
            { offset: 1, color: p["navy-600"] },
          ],
          textureSpace: "local",
        }),
      )
      .rect(0, mid - 1.5, w, 3)
      .fill({ color: p["logo-yellow"], alpha: 0.45 });
    const u = this.a.unit;
    const slot = (x: number, y: number, s: number) =>
      this.slots
        .roundRect(x - (CARD_W * s) / 2, y - (CARD_H * s) / 2, CARD_W * s, CARD_H * s, 12 * s * 2)
        .stroke({ width: 2, color: p.surface, alpha: 0.18 });
    this.slots.clear();
    for (const pid of ["ai", "me"] as const) {
      slot(this.a.active[pid].x, this.a.active[pid].y, u);
      for (let i = 0; i < BENCH_SIZE; i++)
        slot(this.a.bench[pid][i]!.x, this.a.bench[pid][i]!.y, u * 0.7);
      slot(this.a.discard[pid].x, this.a.discard[pid].y, u * 0.62);
    }
    slot(this.a.place.x, this.a.place.y, u * 0.55);
    this.thinking.position.set(w / 2, this.a.mid - 14);
  }

  /** Deck stacks with counters and the soul doves (lit = saved / taken). */
  update(g: Game) {
    const p = palette();
    const u = this.a.unit;
    this.decks.clear();
    this.labels.removeChildren().forEach((c) => c.destroy());
    for (const pid of ["ai", "me"] as const) {
      const pl = g.players[pid];
      const d = this.a.deck[pid];
      const s = u * 0.62;
      const n = Math.min(5, Math.ceil(pl.deck.length / 5));
      for (let i = 0; i < n; i++) {
        const x = d.x - (CARD_W * s) / 2 - i * 1.5;
        const y = d.y - (CARD_H * s) / 2 - i * 2.5;
        this.decks
          .roundRect(x, y, CARD_W * s, CARD_H * s, 10 * s * 2)
          .fill(p.navy)
          .stroke({ width: 2, color: p["logo-yellow"], alpha: 0.7 });
      }
      this.label(`${pl.deck.length}`, d.x, d.y, 22, p["logo-yellow"]);
      this.label("talia", d.x, d.y + (CARD_H * s) / 2 + 9, 11, p.line);
      const dc = this.a.discard[pid];
      if (!pl.discard.length) this.label("odrzucone", dc.x, dc.y, 11, p.line);
      this.souls(pid, pl.souls);
    }
    if (!g.place) this.label("miejsce", this.a.place.x, this.a.place.y, 11, p.line);
  }

  private souls(pid: PlayerId, n: number) {
    const p = palette();
    const c = this.a.souls[pid];
    const gap = Math.max(16, CARD_W * this.a.unit * 0.2);
    for (let i = 0; i < SOULS_TO_WIN; i++) {
      const t = text("🕊️", { fontSize: Math.max(13, gap * 0.8) });
      t.anchor.set(0.5);
      t.position.set(c.x + (i - (SOULS_TO_WIN - 1) / 2) * gap, c.y);
      t.alpha = i < n ? 1 : 0.22;
      this.labels.addChild(t);
    }
    this.label(
      pid === "me" ? `ocalone: ${n}/${SOULS_TO_WIN}` : `przejęte: ${n}/${SOULS_TO_WIN}`,
      c.x,
      c.y + gap * 0.85,
      11,
      pid === "me" ? p["logo-yellow"] : p.line,
    );
  }

  private label(s: string, x: number, y: number, size: number, fill: string) {
    const t = text(s, { fontFamily: FONT_DISPLAY, fontSize: size, fontWeight: "800", fill });
    t.anchor.set(0.5);
    t.position.set(x, y);
    this.labels.addChild(t);
  }

  setBenchGlow(on: boolean) {
    const p = palette();
    this.benchGlow.clear();
    if (!on) return;
    const s = this.a.unit * 0.7;
    const b = this.a.bench.me;
    const x0 = b[0]!.x - (CARD_W * s) / 2 - 8;
    const x1 = b[b.length - 1]!.x + (CARD_W * s) / 2 + 8;
    this.benchGlow
      .roundRect(x0, b[0]!.y - (CARD_H * s) / 2 - 8, x1 - x0, CARD_H * s + 16, 18)
      .fill({ color: p["logo-yellow"], alpha: 0.12 })
      .stroke({ width: 3, color: p["logo-yellow"], alpha: 0.8 });
  }
}
