import { Button } from "@/ui";
import { getCard, isBasic } from "../data/cards";
import type { SupportDef } from "../data/types";
import {
  attackBlock,
  benchEnergyTargets,
  canAttach,
  canBench,
  canUseAbility,
  evolveTargets,
  retreatBlock,
  type Action,
} from "../engine/actions";
import { fuelMax, placeRule, previewDamage, retreatCost } from "../engine/combat";
import { canPlaySupport, lockedBy, supportTargets, targetKind } from "../engine/support";
import { charDef, inPlay, nameOf, type CardInst, type Game, type InPlay } from "../engine/state";

export type Selection = { zone: "hand" | "field" | "opp"; uid: number };

interface Opt {
  label: string;
  action?: Action;
  note?: string;
}

const where = (g: Game, c: InPlay) => (g.players.me.active?.uid === c.uid ? "aktywna" : "ławka");

function handOptions(g: Game, c: CardInst): Opt[] {
  const d = getCard(c.cardId);
  const me = g.players.me;
  if (g.phase === "setup" && me.active)
    return [{ label: "", note: "Czekaj, aż rywal wystawi postać." }];
  if (g.phase === "setup") {
    return isBasic(d)
      ? [{ label: "Wystaw do walki", action: { type: "chooseActive", uid: c.uid } }]
      : [{ label: "", note: "Na start wybierz postać podstawową." }];
  }
  if (g.turn !== "me" || g.phase !== "main")
    return [{ label: "", note: "Poczekaj na swoją turę." }];
  if (d.kind === "character") {
    if (!d.evolvesFrom)
      return canBench(g, "me", c)
        ? [{ label: "Posadź na ławce", action: { type: "playBasic", uid: c.uid } }]
        : [{ label: "", note: "Ławka jest pełna (3 miejsca)." }];
    const t = evolveTargets(g, "me", c);
    return t.length
      ? t.map((x) => ({
          label: `Rozwiń: ${nameOf(x)} (${where(g, x)})`,
          action: { type: "evolve", uid: c.uid, target: x.uid },
        }))
      : [
          {
            label: "",
            note: `Potrzebujesz w grze: ${getCard(d.evolvesFrom).name}, wystawionego co najmniej turę wcześniej (od 2. tury każdego gracza).`,
          },
        ];
  }
  if (d.kind === "energy") {
    if (!canAttach(g, "me", c))
      return [{ label: "", note: "W tej turze dołączono już energię (1 na turę)." }];
    return inPlay(me).map((x) => ({
      label: `Dołącz do: ${nameOf(x)} (${where(g, x)})`,
      action: { type: "attach", uid: c.uid, target: x.uid },
    }));
  }
  const s = d as SupportDef;
  if (!canPlaySupport(g, "me", c)) {
    const lock = lockedBy(g, s.kind);
    return [
      {
        label: "",
        note: lock
          ? `${nameOf(lock)} blokuje ${s.kind === "item" ? "przedmioty" : "pomocników"}, dopóki jest aktywną postacią.`
          : s.kind === "supporter" && g.flags.supporter
            ? "Pomocnika można zagrać raz na turę."
            : s.kind === "item" && placeRule(g, "noItems")
              ? `${getCard(g.place!.cardId).name}: nikt nie może teraz zagrywać przedmiotów.`
              : "Ta karta teraz nic by nie zmieniła.",
      },
    ];
  }
  const kind = targetKind(s);
  if (!kind) return [{ label: "Zagraj kartę", action: { type: "support", uid: c.uid } }];
  return supportTargets(g, "me", s).map((x) => ({
    label: `Wybierz: ${nameOf(x)}`,
    action: { type: "support", uid: c.uid, target: x.uid },
  }));
}

function fieldOptions(g: Game, c: InPlay): Opt[] {
  const me = g.players.me;
  if (g.phase === "promote" && g.promote?.who === "me")
    return me.bench.some((b) => b.uid === c.uid)
      ? [{ label: "Wyślij do walki", action: { type: "promote", uid: c.uid } }]
      : [];
  if (g.turn !== "me" || g.phase !== "main") return [];
  const out: Opt[] = [];
  const energy = me.hand.find((x) => canAttach(g, "me", x));
  if (energy)
    out.push({
      label: "Dołącz Łaskę ✨",
      action: { type: "attach", uid: energy.uid, target: c.uid },
    });
  for (const h of me.hand)
    if (evolveTargets(g, "me", h).some((t) => t.uid === c.uid))
      out.push({
        label: `Rozwiń w: ${nameOf(h)}`,
        action: { type: "evolve", uid: h.uid, target: c.uid },
      });
  if (canUseAbility(g, "me", c))
    out.push({
      label: `Użyj mocy: ${charDef(c).ability!.name}`,
      action: { type: "ability", target: c.uid },
    });
  else if (charDef(c).ability && placeRule(g, "noAbilities"))
    out.push({
      label: "",
      note: `${getCard(g.place!.cardId).name}: nikt nie może teraz używać mocy.`,
    });
  if (me.active?.uid === c.uid) {
    charDef(c).attacks.forEach((a, index) => {
      const block = attackBlock(g, "me", a);
      if (block) return void out.push({ label: `Atak: ${a.name}`, note: block });
      const targets = benchEnergyTargets(g, "me", a);
      if (targets.length)
        return void targets.forEach((t) =>
          out.push({
            label: `Atak: ${a.name} (${previewDamage(g, "me", a)} obr.) — ✨ dla: ${nameOf(t)}`,
            action: { type: "attack", index, target: t.uid },
          }),
        );
      for (let fuel = 0; fuel <= fuelMax(g, "me", a); fuel++)
        out.push({
          label: fuel
            ? `Atak: ${a.name} + odrzuć ${fuel} ✨ z ręki (${previewDamage(g, "me", a, fuel)} obr.)`
            : `Atak: ${a.name} (${previewDamage(g, "me", a)} obr.)`,
          action: fuel ? { type: "attack", index, fuel } : { type: "attack", index },
        });
    });
  } else {
    const block = retreatBlock(g, "me");
    const cost = me.active ? retreatCost(g, "me", me.active) : 0;
    out.push(
      block
        ? { label: "Zamień z aktywną", note: block }
        : {
            label: `Zamień z aktywną (wycofanie: ${cost} ✨)`,
            action: { type: "retreat", target: c.uid },
          },
    );
  }
  return out;
}

/** Buttons available for the selected card. */
export function CardActions({
  g,
  sel,
  onAction,
}: {
  g: Game;
  sel: Selection;
  onAction: (a: Action) => void;
}) {
  let opts: Opt[] = [];
  if (sel.zone === "hand") {
    const c = g.players.me.hand.find((x) => x.uid === sel.uid);
    if (c) opts = handOptions(g, c);
  } else if (sel.zone === "field") {
    const c = inPlay(g.players.me).find((x) => x.uid === sel.uid);
    if (c) opts = fieldOptions(g, c);
  }
  if (!opts.length) return null;
  return (
    <div className="flex flex-col gap-2">
      {opts.map((o, i) =>
        o.action ? (
          <Button
            key={i}
            variant={o.action.type === "attack" ? "solid" : "navy"}
            fullWidth
            onClick={() => onAction(o.action!)}
          >
            {o.label}
          </Button>
        ) : (
          <p key={i} className="rounded-lg bg-surface-muted p-2 text-sm text-ink-muted">
            {o.label && <strong className="text-navy">{o.label}: </strong>}
            {o.note}
          </p>
        ),
      )}
    </div>
  );
}
