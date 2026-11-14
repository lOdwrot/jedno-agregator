/** One animation (and sound) per engine event — this is what makes the duel readable move by move. */
import { ENERGY_LABEL, STATUS_INFO } from "../data/types";
import { music } from "../audio/music";
import { sfx } from "../audio/sfx";
import type { Frame } from "../engine/events";
import { other, type Game } from "../engine/state";
import type { BoardRenderer } from "./BoardRenderer";
import { elementStyle, impact, projectile, shards } from "./attackFx";
import { shake } from "./fx";
import { playSignature } from "./signatures";
import { powerSound } from "../audio/signatures";
import { palette } from "./palette";
import { ease } from "./tween";

const ELEMENT_SPARK: Record<string, string> = {
  modlitwa: "logo-blue",
  slowo: "logo-yellow",
  sluzba: "logo-orange",
  pycha: "logo-red",
  gniew: "danger",
  lenistwo: "logo-blue",
};

export async function playFrame(r: BoardRenderer, f: Frame, prev: Game) {
  const { ev, state } = f;
  const p = palette();
  const { tw, fx } = r;
  const a = r.table.a;
  const at = (uid: number) => {
    const s = r.sprite(uid);
    return s ? { x: s.x, y: s.y } : { x: r.w / 2, y: a.mid };
  };

  switch (ev.t) {
    case "turn": {
      music.setDark(ev.pid === "ai");
      sfx.turn(ev.pid === "me");
      await r.reconcile(state);
      await fx.banner(
        a.mid,
        r.w,
        ev.pid === "me" ? "Twoja tura" : "Tura pomiotów",
        `Tura ${state.turnNo}`,
        ev.pid === "me" ? p["logo-yellow"] : p["logo-red"],
      );
      return;
    }
    case "draw":
      for (let i = 0; i < ev.n; i++) sfx.deal(i);
      await r.reconcile(state, 480, 90);
      return;
    case "shuffle": {
      sfx.shuffle();
      await r.reconcile(state, 400);
      await fx.ring(a.deck[ev.pid].x, a.deck[ev.pid].y, p["logo-yellow"], 60, 4);
      return;
    }
    case "toActive":
    case "bench": {
      await r.reconcile(state, 460);
      const s = at(ev.uid);
      sfx.place();
      void fx.ring(s.x, s.y, p.surface, 80 * a.unit * 3, 5);
      fx.burst(s.x, s.y + 40 * a.unit * 2, [p.line, p.surface], 14, 220, 400);
      const sp = r.sprite(ev.uid);
      if (sp) {
        const k = sp.scale.x;
        await tw.to(sp.scale, { x: k * 1.08, y: k * 1.08 }, 90);
        await tw.to(sp.scale, { x: k, y: k }, 200, ease.back);
      }
      return;
    }
    case "evolve": {
      const s = at(ev.uid);
      sfx.evolve();
      void fx.rays(s.x, s.y, p["logo-yellow"]);
      const sp = r.sprite(ev.uid);
      if (sp) {
        const k = sp.scale.x;
        await tw.to(sp.scale, { x: k * 1.25, y: k * 1.25 }, 420, ease.out);
        await fx.flash(r.w, r.h, p.surface, 0.5);
        await r.reconcile(state, 0);
        sp.scale.set(k * 1.25);
        await tw.to(sp.scale, { x: k, y: k }, 380, ease.back);
      } else await r.reconcile(state);
      fx.emojis(s.x, s.y, "✨", 10);
      return;
    }
    case "attach": {
      const side = state.players[ev.pid].side;
      const to = at(ev.uid);
      sfx.energy(side === "demons");
      await fx.fly(a.hand[ev.pid], to, ENERGY_LABEL[side].emoji, 44);
      await r.reconcile(state, 250);
      return;
    }
    case "support":
    case "place": {
      const key = ev.t === "place" ? ev.cardId : ev.uid;
      const sp =
        typeof key === "number"
          ? r.sprite(key)
          : [...r.sprites.entries()].find(([k]) =>
              prev.players[ev.pid].hand.some((c) => c.uid === k && c.cardId === ev.cardId),
            )?.[1];
      sfx.support();
      if (sp) {
        sp.setCard(ev.cardId, sp.finish);
        sp.zIndex = 900;
        await Promise.all([
          tw.to(sp, { x: r.w / 2, y: a.mid, rotation: 0 }, 360),
          tw.to(sp.scale, { x: a.unit * 1.25, y: a.unit * 1.25 }, 360, ease.back),
        ]);
        if (!sp.faceUp) {
          await tw.to(sp.body.scale, { x: 0 }, 120, ease.in);
          sp.setFace(true);
          await tw.to(sp.body.scale, { x: 1 }, 120);
        }
        sp.setGlow(p["logo-yellow"]);
        fx.emojis(r.w / 2, a.mid, ev.pid === "me" ? "✨" : "🔥", 8);
        await tw.wait(750);
        sp.setGlow(null);
      }
      if (ev.t === "place") {
        sfx.place_card();
        // the sprite of a place lives under PLACE_KEY; hand it over
        for (const [k, s] of r.sprites) if (s === sp) r.sprites.delete(k);
        if (sp) r.sprites.set(-1, sp);
      }
      await r.reconcile(state, 380);
      return;
    }
    case "attack": {
      const sp = r.sprite(ev.uid);
      const from = at(ev.uid);
      const to = at(ev.target);
      const color = ev.pid === "me" ? p["logo-yellow"] : p["logo-red"];
      void fx.caption(
        from.x,
        from.y - 150 * a.unit * (ev.pid === "me" ? 1 : -1) - (ev.pid === "me" ? 0 : 20),
        ev.name,
        color,
      );
      const attacker = r.charAt(prev, ev.uid);
      const atkDef = attacker?.def.attacks.find((x) => x.name === ev.name);
      const dmg = atkDef?.damage ?? 0;
      if (sp) {
        sfx.windup();
        const k = sp.scale.x;
        sp.setGlow(attacker ? elementStyle(attacker.def.element).core : color);
        await Promise.all([
          tw.to(sp.scale, { x: k * 1.12, y: k * 1.12 }, 260),
          tw.to(sp, { y: from.y + (from.y > to.y ? 18 : -18) }, 260),
        ]);
        const signed = await playSignature(ev.name, { r, from, to });
        if (!signed && dmg > 0 && attacker) {
          powerSound(dmg);
          await projectile(fx, tw, from, to, attacker.def.element, dmg >= 60);
        }
        sp.setGlow(null);
        await tw.to(
          sp,
          { x: from.x + (to.x - from.x) * 0.55, y: from.y + (to.y - from.y) * 0.55 },
          150,
          ease.in,
        );
        void tw.to(sp, { x: from.x, y: from.y }, 320, ease.out);
        void tw.to(sp.scale, { x: k, y: k }, 320);
      }
      return;
    }
    case "damage": {
      const sp = r.sprite(ev.uid);
      const s = at(ev.uid);
      const hit = r.charAt(prev, ev.uid);
      sfx.hit(ev.amount);
      const spark = hit ? p[ELEMENT_SPARK[hit.def.element] as "logo-blue"] : p.danger;
      const foe = prev.players[hit && prev.players.me.active?.uid === ev.uid ? "ai" : "me"].active;
      const atkStyle = foe ? elementStyle(r.charAt(prev, foe.uid)!.def.element) : null;
      const power = Math.min(2, 0.6 + ev.amount / 60);
      fx.burst(
        s.x,
        s.y,
        [p.danger, spark, p.surface, ...(atkStyle?.colors ?? [])],
        Math.round(20 + ev.amount / 3),
        300 + ev.amount * 2,
      );
      shards(
        fx,
        s,
        hit?.def.side === "demons" ? p["navy-600"] : p.surface,
        Math.round(6 + ev.amount / 8),
        power,
      );
      void impact(fx, tw, s, atkStyle?.core ?? p.danger, power);
      if (atkStyle && ev.amount >= 40)
        fx.emojis(s.x, s.y, atkStyle.emoji, Math.round(ev.amount / 15), false, 26);
      if (ev.amount >= 60) void shake(tw, r.stage, Math.min(18, ev.amount / 6), r.reduced);
      void fx.flash(r.w, r.h, p.danger, Math.min(0.3, ev.amount / 400));
      if (sp) void shake(tw, sp, 14, r.reduced);
      void fx.float(s.x, s.y - 20, `−${ev.amount}`, p.danger, 44 + Math.min(30, ev.amount / 5));
      if (ev.weak) {
        sfx.weak();
        void fx.float(s.x, s.y + 50, "SŁABOŚĆ ×2!", p["logo-yellow"], 24);
      }
      await tw.wait(260);
      await r.reconcile(state, 200);
      await tw.wait(400);
      return;
    }
    case "benchDamage": {
      sfx.hit(20);
      for (const uid of ev.uids) {
        const s = at(uid);
        fx.burst(s.x, s.y, [p.danger, p.surface], 10, 220);
        void fx.float(s.x, s.y, `−${ev.amount}`, p.danger, 30);
        const sp = r.sprite(uid);
        if (sp) void shake(tw, sp, 8, r.reduced);
      }
      await tw.wait(450);
      await r.reconcile(state, 200);
      return;
    }
    case "heal": {
      sfx.heal();
      for (const uid of ev.uids) {
        const s = at(uid);
        fx.emojis(s.x, s.y + 30, "✚", 6, true, 22);
        fx.burst(s.x, s.y, [p.success, p.surface], 12, 160, -150);
        void fx.float(s.x, s.y - 10, `+${ev.amount}`, p.success, 36);
      }
      await tw.wait(380);
      await r.reconcile(state, 200);
      await tw.wait(250);
      return;
    }
    case "status": {
      const s = at(ev.uid);
      sfx.status();
      void fx.float(
        s.x,
        s.y - 10,
        `${STATUS_INFO[ev.s].emoji} ${STATUS_INFO[ev.s].label}`,
        p["logo-yellow"],
        28,
      );
      fx.emojis(s.x, s.y, STATUS_INFO[ev.s].emoji, 6, false, 24);
      await tw.wait(500);
      await r.reconcile(state, 150);
      return;
    }
    case "cleanse":
    case "shield": {
      if (ev.t === "cleanse") sfx.cleanse();
      else sfx.shield();
      for (const uid of ev.t === "cleanse" ? ev.uids : [ev.uid]) {
        const s = at(uid);
        void fx.ring(
          s.x,
          s.y,
          ev.t === "cleanse" ? p.surface : p["logo-blue"],
          120 * a.unit * 2,
          6,
        );
      }
      await tw.wait(350);
      await r.reconcile(state, 150);
      return;
    }
    case "coin":
      sfx.coin();
      await fx.coin(r.w / 2, a.mid, ev.heads);
      return;
    case "ko": {
      const sp = r.sprite(ev.uid);
      const s = at(ev.uid);
      sfx.ko();
      if (sp) {
        await shake(tw, sp, 16, r.reduced);
        fx.emojis(s.x, s.y, ev.pid === "ai" ? "💨" : "💔", 10, true, 30);
        fx.burst(s.x, s.y, [p["logo-dark"], p.line], 30, 260, -60);
        await Promise.all([
          tw.to(
            sp,
            { rotation: ev.pid === "ai" ? 0.5 : -0.5, alpha: 0.15, y: s.y + 30 },
            500,
            ease.in,
          ),
          tw.to(sp.scale, { x: sp.scale.x * 0.6, y: sp.scale.y * 0.6 }, 500, ease.in),
        ]);
      }
      await r.reconcile(state, 450);
      return;
    }
    case "souls": {
      if (!ev.n) return;
      const taker = ev.pid;
      const from = a.active[other(taker)];
      for (let i = 0; i < ev.n; i++) {
        sfx.soul();
        await fx.fly(from, a.souls[taker], "🕊️", 52, 750);
      }
      await r.reconcile(state, 420, 80);
      return;
    }
    case "peek": {
      const d = a.deck[ev.pid];
      if (ev.kept === null) {
        sfx.shuffle();
        await fx.ring(d.x, d.y, p["logo-yellow"], 60, 4);
        return;
      }
      if (ev.kept) sfx.deal(0);
      await r.reconcile(state, 380);
      return;
    }
    case "swap":
      sfx.swap();
      await r.reconcile(state, 480);
      return;
    case "discardEnergy": {
      const s = at(ev.uid);
      const side = r.charAt(prev, ev.uid)?.def.side ?? "parish";
      void fx.float(s.x, s.y, `−${ENERGY_LABEL[side].emoji}${ev.n}`, p.line, 28);
      fx.burst(s.x, s.y, [p["logo-dark"], p.line], 12, 200);
      await r.reconcile(state, 300);
      return;
    }
    case "ability": {
      const s = at(ev.uid);
      sfx.support();
      void fx.rays(s.x, s.y, p["logo-blue"], 800);
      await fx.caption(
        s.x,
        s.y - 100 * a.unit * 2,
        r.charAt(prev, ev.uid)?.def.ability?.name ?? "",
        p["logo-yellow"],
      );
      return;
    }
    case "over": {
      const won = ev.winner === "me";
      if (won) sfx.win();
      else sfx.lose();
      await r.reconcile(state);
      if (won) fx.emojis(r.w / 2, r.h / 2, "🕊️", 24, true, 36);
      else fx.emojis(r.w / 2, r.h / 2, "🔥", 18, true, 30);
      await fx.banner(
        a.mid,
        r.w,
        won ? "Dusze ocalone!" : "Pomioty górą",
        "",
        won ? p["logo-yellow"] : p["logo-red"],
      );
      return;
    }
  }
}
