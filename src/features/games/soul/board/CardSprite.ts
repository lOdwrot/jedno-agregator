/** One card on the canvas: face (art, name, HP), back, in-play overlay (HP bar, energy, statuses), glow. */
import {
  Assets,
  Container,
  FillGradient,
  Graphics,
  Sprite,
  Text,
  type Texture,
  type TextStyleOptions,
} from "pixi.js";
import { ART as ARTWORK, artSrc } from "../data/art";
import { getCard } from "../data/cards";
import {
  ELEMENT_INFO,
  ENERGY_LABEL,
  FINISH_BONUS,
  RARITY_SYMBOL,
  STATUS_INFO,
  type Element,
  type Finish,
} from "../data/types";
import type { InPlay } from "../engine/state";
import { CARD_H, CARD_W } from "./layout";
import { FONT_DISPLAY, FONT_SANS, palette, type Token } from "./palette";

const W = CARD_W;
const H = CARD_H;
const ART: Record<Element, [Token, Token]> = {
  modlitwa: ["logo-blue", "surface"],
  slowo: ["logo-yellow", "surface"],
  sluzba: ["logo-orange", "surface"],
  pycha: ["logo-red", "navy-800"],
  gniew: ["danger", "navy-800"],
  lenistwo: ["navy-600", "logo-blue"],
};
const KIND = {
  item: "Przedmiot",
  supporter: "Pomocnik",
  place: "Miejsce",
  energy: "Energia",
  character: "Postać",
};

export function text(s: string, style: TextStyleOptions): Text {
  const t = new Text({ text: s, style: { fontFamily: FONT_SANS, ...style }, resolution: 2 });
  return t;
}

function grad(stops: string[], diagonal = true) {
  return new FillGradient({
    type: "linear",
    start: { x: 0, y: 0 },
    end: diagonal ? { x: 1, y: 1 } : { x: 0, y: 1 },
    colorStops: stops.map((color, i) => ({ offset: i / (stops.length - 1), color })),
    textureSpace: "local",
  });
}

/** Splits a long name at the space closest to its middle. */
export function twoLines(s: string, max: number): string {
  if (s.length <= max || !s.includes(" ")) return s;
  let best = -1;
  for (let i = 0; i < s.length; i++)
    if (s[i] === " " && (best < 0 || Math.abs(i - s.length / 2) < Math.abs(best - s.length / 2)))
      best = i;
  return `${s.slice(0, best)}\n${s.slice(best + 1)}`;
}

function fit(t: Text, max: number) {
  if (t.width > max) t.scale.set(max / t.width);
}

export class CardSprite extends Container {
  /** Flipping happens on this inner container so the outer scale stays free for layout. */
  readonly body = new Container();
  private front = new Container();
  private back = new Container();
  private overlay = new Container();
  private glowG = new Graphics();
  private shine: Graphics | null = null;
  cardId = "";
  finish: Finish = "plain";
  faceUp = true;
  glowColor: string | null = null;
  private t = Math.random() * 6;

  constructor() {
    super();
    this.addChild(this.glowG, this.body);
    this.body.addChild(this.back, this.front, this.overlay);
    this.drawBack();
  }

  setCard(cardId: string, finish: Finish) {
    if (cardId === this.cardId && finish === this.finish) return;
    this.cardId = cardId;
    this.finish = finish;
    this.front.removeChildren().forEach((c) => c.destroy());
    this.shine = null;
    this.drawFront();
  }

  setFace(up: boolean) {
    this.faceUp = up;
    this.front.visible = up;
    this.overlay.visible = up;
    this.back.visible = !up;
  }

  /** Called every frame by the renderer: glow pulse and shine sweep. */
  tick(dt: number, reduced: boolean) {
    this.t += dt / 1000;
    this.glowG.visible = !!this.glowColor;
    if (this.glowColor) this.glowG.alpha = reduced ? 0.9 : 0.55 + 0.4 * Math.sin(this.t * 5);
    if (this.shine) {
      this.shine.visible = !reduced;
      this.shine.x = ((this.t * 160) % 900) - 450;
    }
  }

  setGlow(color: string | null) {
    if (color === this.glowColor) return;
    this.glowColor = color;
    this.glowG.clear();
    if (color)
      this.glowG.roundRect(-W / 2 - 9, -H / 2 - 9, W + 18, H + 18, 24).stroke({ width: 10, color });
  }

  private drawBack() {
    const p = palette();
    const g = new Graphics()
      .roundRect(-W / 2, -H / 2, W, H, 16)
      .fill(grad([p.navy, p["navy-600"], p.navy]))
      .roundRect(-W / 2 + 10, -H / 2 + 10, W - 20, H - 20, 10)
      .stroke({ width: 3, color: p["logo-yellow"], alpha: 0.8 })
      .circle(0, -10, 58)
      .fill({ color: p["logo-blue"], alpha: 0.5 })
      .circle(0, -10, 58)
      .stroke({ width: 3, color: p["logo-yellow"] });
    const dove = text("🕊️", { fontSize: 64 });
    dove.anchor.set(0.5);
    dove.y = -10;
    const t = text("WALKA O DUSZĘ", {
      fontFamily: FONT_DISPLAY,
      fontSize: 17,
      fontWeight: "800",
      fill: p["logo-yellow"],
      letterSpacing: 2,
    });
    t.anchor.set(0.5);
    t.y = 96;
    this.back.addChild(g, dove, t);
  }

  private drawFront() {
    const p = palette();
    const c = getCard(this.cardId);
    const dark = c.side === "demons";
    const panel = dark ? p.navy : p.surface;
    const ink = dark ? p.surface : p.navy;
    const muted = dark ? p["line"] : p["ink-muted"];
    const frame =
      this.finish === "gilded"
        ? grad([p["logo-yellow"], p.surface, p["logo-yellow"], p["logo-orange"]])
        : this.finish === "stained"
          ? grad([p["logo-blue"], p["logo-red"], p["logo-yellow"], p.success, p["logo-blue"]])
          : dark
            ? p["navy-600"]
            : p["surface-muted"];
    const g = new Graphics().roundRect(-W / 2, -H / 2, W, H, 16).fill(frame);
    g.roundRect(-W / 2 + 7, -H / 2 + 7, W - 14, H - 14, 12).fill(panel);
    const el: Element = c.kind === "character" ? c.element : dark ? "pycha" : "slowo";
    const [a1, a2] = ART[el];
    g.roundRect(-84, -78, 168, 108, 10).fill(grad([p[a1], p[a2]], false));
    this.front.addChild(g);

    const art = text(c.emoji, { fontSize: 76 });
    art.anchor.set(0.5);
    art.y = -24;
    this.loadArt(art);
    const isChar = c.kind === "character";
    const name = text(twoLines(c.name, isChar ? 11 : 15), {
      fontFamily: FONT_DISPLAY,
      fontSize: 23,
      fontWeight: "800",
      fill: ink,
      lineHeight: 24,
    });
    name.position.set(-86, -134);
    fit(name, isChar ? 112 : 172);
    this.front.addChild(art, name);

    if (c.kind === "character") {
      const hp = text(`${c.hp + FINISH_BONUS[this.finish].hp}`, {
        fontFamily: FONT_DISPLAY,
        fontSize: 28,
        fontWeight: "800",
        fill: ink,
      });
      hp.anchor.set(1, 0);
      hp.position.set(88, -134);
      const line = text(ELEMENT_INFO[c.element].emoji, { fontSize: 26 });
      line.position.set(-86, 38);
      const atk = text(
        c.attacks.map((x) => `${x.damage + FINISH_BONUS[this.finish].damage}`).join(" · "),
        {
          fontFamily: FONT_DISPLAY,
          fontSize: 30,
          fontWeight: "800",
          fill: ink,
        },
      );
      atk.anchor.set(1, 0);
      atk.position.set(86, 36);
      fit(atk, 120);
      this.front.addChild(hp, line, atk);
    } else {
      const kind = text(KIND[c.kind].toUpperCase(), {
        fontFamily: FONT_DISPLAY,
        fontSize: 20,
        fontWeight: "800",
        fill: muted,
        letterSpacing: 1,
      });
      kind.position.set(-84, 40);
      fit(kind, 168);
      const body = text("text" in c ? c.text : "", {
        fontSize: 15,
        fill: ink,
        wordWrap: true,
        wordWrapWidth: 168,
        lineHeight: 18,
      });
      body.position.set(-84, 68);
      this.front.addChild(kind, body);
    }
    const rar = text(
      `${RARITY_SYMBOL[c.rarity]}${this.finish === "gilded" ? " ✦" : this.finish === "stained" ? " ❖" : ""}`,
      {
        fontSize: 15,
        fill: muted,
      },
    );
    rar.anchor.set(1, 1);
    rar.position.set(88, 132);
    this.front.addChild(rar);

    if (this.finish !== "plain") {
      const mask = new Graphics().roundRect(-W / 2, -H / 2, W, H, 16).fill(p.surface);
      const shine = new Graphics().rect(-40, -H, 80, H * 2).fill({ color: p.surface, alpha: 0.35 });
      shine.rotation = 0.5;
      const holder = new Container();
      holder.addChild(mask, shine);
      holder.mask = mask;
      this.front.addChild(holder);
      this.shine = shine;
    }
  }

  /** Swaps the emoji for the card's picture once it is loaded (cover-fit into the art window). */
  private loadArt(emoji: Text) {
    const src = artSrc(this.cardId);
    if (!src) return;
    const id = this.cardId;
    void Assets.load<Texture>(src)
      .then((tex) => {
        if (this.destroyed || this.cardId !== id) return;
        const sp = new Sprite(tex);
        const k = Math.max(168 / tex.width, 108 / tex.height);
        sp.scale.set(k);
        sp.anchor.set(0.5, 0);
        sp.y = -78 - (tex.height * k - 108) * (ARTWORK[id]?.focus ?? 0.3);
        const mask = new Graphics().roundRect(-84, -78, 168, 108, 10).fill(palette().surface);
        const holder = new Container();
        holder.addChild(mask, sp);
        holder.mask = mask;
        this.front.addChildAt(holder, 1);
        emoji.visible = false;
      })
      .catch(() => undefined);
  }

  /** HP bar, energy pips and status badges of a character in play (hidden in hand/discard). */
  updateInPlay(c: InPlay | null, maxHp: number) {
    this.overlay.removeChildren().forEach((x) => x.destroy());
    if (!c) return;
    const p = palette();
    const left = Math.max(0, maxHp - c.damage);
    const ratio = maxHp ? left / maxHp : 0;
    const bar = new Graphics()
      .roundRect(-90, 98, 180, 34, 12)
      .fill({ color: p.navy, alpha: 0.88 })
      .roundRect(-84, 104, 168, 10, 5)
      .fill({ color: p.line, alpha: 0.35 });
    if (ratio > 0)
      bar.roundRect(-84, 104, 168 * ratio, 10, 5).fill(ratio > 0.35 ? p.success : p.danger);
    const hp = text(`${left}/${maxHp}`, {
      fontFamily: FONT_DISPLAY,
      fontSize: 15,
      fontWeight: "800",
      fill: p.surface,
    });
    hp.position.set(-84, 114);
    this.overlay.addChild(bar, hp);
    const side = getCard(c.cardId).side;
    if (c.energy > 0) {
      const en = text(`${ENERGY_LABEL[side].emoji}×${c.energy}`, {
        fontFamily: FONT_DISPLAY,
        fontSize: 15,
        fontWeight: "800",
        fill: p["logo-yellow"],
      });
      en.anchor.set(1, 0);
      en.position.set(86, 114);
      this.overlay.addChild(en);
    }
    c.statuses.forEach((s, i) => {
      const b = new Graphics()
        .circle(-66 + i * 40, -78, 19)
        .fill({ color: p.navy, alpha: 0.85 })
        .circle(-66 + i * 40, -78, 19)
        .stroke({ width: 2, color: p.surface });
      const e = text(STATUS_INFO[s].emoji, { fontSize: 22 });
      e.anchor.set(0.5);
      e.position.set(-66 + i * 40, -78);
      this.overlay.addChild(b, e);
    });
    if (c.shield > 0) {
      const sh = new Graphics()
        .roundRect(-W / 2 - 4, -H / 2 - 4, W + 8, H + 8, 18)
        .stroke({ width: 5, color: p["logo-blue"], alpha: 0.9 });
      this.overlay.addChild(sh);
    }
  }
}
