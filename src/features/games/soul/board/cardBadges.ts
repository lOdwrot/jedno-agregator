/** Small badges drawn on a card face: type icon, "evolves from" picture, weakness and attached energy. */
import {
  Assets,
  Container,
  Graphics,
  Sprite,
  Text,
  type Texture,
  type TextStyleOptions,
} from "pixi.js";
import { artFocus, artSrc } from "../data/art";
import { getCard } from "../data/cards";
import { cardTypeBadge } from "../data/cardType";
import { ELEMENT_INFO, type Element } from "../data/types";
import { FONT_DISPLAY, FONT_SANS, palette } from "./palette";

const label = (s: string, style: TextStyleOptions) =>
  new Text({ text: s, style: { fontFamily: FONT_SANS, ...style }, resolution: 2 });

const ring = (dark: boolean) => (dark ? palette()["logo-red"] : palette()["logo-yellow"]);

/** Type badge in the top-left corner (basic / evolution / item / supporter / place / energy). */
export function drawTypeIcon(layer: Container, cardId: string, dark: boolean) {
  const p = palette();
  const x = -78;
  const y = -118;
  const disc = new Graphics()
    .circle(x, y, 17)
    .fill(dark ? p["navy-600"] : p.surface)
    .circle(x, y, 17)
    .stroke({ width: 3, color: ring(dark) });
  const t = label(cardTypeBadge(getCard(cardId)).icon, { fontSize: 20 });
  t.anchor.set(0.5);
  t.position.set(x, y + 1);
  layer.addChild(disc, t);
}

/** Small round picture of the card this one evolves from (top-right of the art window). */
export function drawEvolvesFrom(
  layer: Container,
  fromId: string,
  dark: boolean,
  alive: () => boolean,
) {
  const p = palette();
  const x = 64;
  const y = -54;
  const r = 21;
  const disc = new Graphics().circle(x, y, r).fill(dark ? p["navy-600"] : p.surface);
  const emoji = label(getCard(fromId).emoji, { fontSize: 22 });
  emoji.anchor.set(0.5);
  emoji.position.set(x, y + 1);
  const border = new Graphics().circle(x, y, r).stroke({ width: 3, color: ring(dark) });
  const ax = x - r + 1;
  const ay = y + r - 1;
  const arrow = new Graphics()
    .circle(ax, ay, 9)
    .fill(p.navy)
    .circle(ax, ay, 9)
    .stroke({ width: 2, color: p.surface });
  const arrowT = label("↑", { fontSize: 13, fontWeight: "800", fill: p.surface });
  arrowT.anchor.set(0.5);
  arrowT.position.set(ax, ay - 1);
  layer.addChild(disc, emoji, border, arrow, arrowT);
  const src = artSrc(fromId);
  if (!src) return;
  void Assets.load<Texture>(src)
    .then((tex) => {
      if (!alive()) return;
      const sp = new Sprite(tex);
      const k = (2 * r) / Math.min(tex.width, tex.height);
      sp.scale.set(k);
      sp.anchor.set(0.5, 0);
      sp.position.set(x, y - r - (tex.height * k - 2 * r) * artFocus(fromId));
      const mask = new Graphics().circle(x, y, r).fill(p.surface);
      const holder = new Container();
      holder.addChild(mask, sp);
      holder.mask = mask;
      layer.addChildAt(holder, layer.getChildIndex(border));
      emoji.visible = false;
    })
    .catch(() => undefined);
}

/** Weakness badge ("słabość 💢 ×2") — readable on the table without opening the card. */
export function drawWeakness(layer: Container, w: Element, dark: boolean) {
  const p = palette();
  const pill = new Graphics()
    .roundRect(-88, 68, 176, 28, 14)
    .fill({ color: p.danger, alpha: dark ? 0.35 : 0.14 })
    .roundRect(-88, 68, 176, 28, 14)
    .stroke({ width: 2, color: p.danger, alpha: 0.8 });
  const name = label("SŁABOŚĆ", {
    fontFamily: FONT_DISPLAY,
    fontSize: 14,
    fontWeight: "800",
    fill: dark ? p.surface : p.navy,
    letterSpacing: 1,
  });
  name.anchor.set(0, 0.5);
  name.position.set(-78, 82);
  const icon = label(ELEMENT_INFO[w].emoji, { fontSize: 22 });
  icon.anchor.set(0.5);
  icon.position.set(36, 82);
  const x2 = label("×2", {
    fontFamily: FONT_DISPLAY,
    fontSize: 20,
    fontWeight: "800",
    fill: dark ? p.surface : p.danger,
  });
  x2.anchor.set(1, 0.5);
  x2.position.set(82, 82);
  layer.addChild(pill, name, icon, x2);
}

/** Attached energy: a big badge over the art, readable on a phone. */
export function drawEnergy(layer: Container, emoji: string, n: number) {
  const p = palette();
  const pill = new Graphics()
    .roundRect(6, -16, 88, 50, 25)
    .fill({ color: p.navy, alpha: 0.92 })
    .roundRect(6, -16, 88, 50, 25)
    .stroke({ width: 3, color: p["logo-yellow"] });
  const e = label(emoji, { fontSize: 30 });
  e.anchor.set(0.5);
  e.position.set(32, 9);
  const t = label(`${n}`, {
    fontFamily: FONT_DISPLAY,
    fontSize: 40,
    fontWeight: "800",
    fill: p["logo-yellow"],
  });
  t.anchor.set(0.5);
  t.position.set(70, 9);
  if (t.width > 36) t.scale.set(36 / t.width);
  layer.addChild(pill, e, t);
}
