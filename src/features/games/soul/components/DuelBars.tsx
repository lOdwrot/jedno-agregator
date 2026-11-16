import { useState } from "react";
import { Button, Icon } from "@/ui";
import type { Opponent } from "../data/opponents";
import type { AudioPrefs } from "../audio/context";
import { attackBlock, benchEnergyTargets, type Action } from "../engine/actions";
import { attackCost, fuelMax, previewDamage } from "../engine/combat";
import { charDef, nameOf, type Game } from "../engine/state";

const btn =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-2 text-lg hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-logo-yellow";

interface TopProps {
  opponent: Pick<Opponent, "emoji" | "name">;
  over: boolean;
  /** Label of the back button while the duel is on. */
  exitLabel: string;
  prefs: AudioPrefs;
  full: boolean;
  onExit: () => void;
  onToggle: (k: keyof AudioPrefs) => void;
  onFull: () => void;
  onLog: () => void;
}

export function DuelTopBar({
  opponent,
  over,
  exitLabel,
  prefs,
  full,
  onExit,
  onToggle,
  onFull,
  onLog,
}: TopProps) {
  return (
    <div className="flex items-center gap-1 border-b border-white/10 px-2 pt-[env(safe-area-inset-top)]">
      <button
        type="button"
        className={btn}
        onClick={onExit}
        aria-label={over ? "Wróć do menu" : exitLabel}
      >
        <Icon name="chevronLeft" size={20} />
      </button>
      <p className="min-w-0 flex-1 truncate font-display text-sm font-extrabold">
        <span aria-hidden="true">{opponent.emoji} </span>
        {opponent.name}
      </p>
      <button type="button" className={btn} onClick={onLog} aria-label="Przebieg walki i pokusy">
        <span aria-hidden="true">📜</span>
      </button>
      <button
        type="button"
        className={btn}
        onClick={() => onToggle("sfx")}
        aria-pressed={prefs.sfx}
        aria-label="Efekty dźwiękowe"
      >
        <span aria-hidden="true">{prefs.sfx ? "🔊" : "🔇"}</span>
      </button>
      <button
        type="button"
        className={btn}
        onClick={() => onToggle("music")}
        aria-pressed={prefs.music}
        aria-label="Muzyka w tle"
      >
        <span aria-hidden="true" className={prefs.music ? "" : "opacity-40"}>
          🎵
        </span>
      </button>
      <button
        type="button"
        className={btn}
        onClick={onFull}
        aria-pressed={full}
        aria-label="Pełny ekran"
      >
        <span aria-hidden="true">{full ? "🗗" : "⛶"}</span>
      </button>
    </div>
  );
}

function hint(g: Game): string {
  if (g.phase === "setup" && g.players.me.active) return "Czekaj, aż rywal wystawi postać…";
  if (g.phase === "setup")
    return "Przeciągnij (albo stuknij) postać podstawową z ręki, żeby stanęła do walki.";
  if (g.phase === "promote" && g.promote?.who === "me")
    return "Twoja postać zeszła z pola — stuknij postać na ławce.";
  if (g.phase === "over") return "Koniec pojedynku.";
  if (g.peek?.pid === "me") return "Weź odkrytą kartę albo odrzuć ją i dobierz następną.";
  if (g.search?.pid === "me") return "Wybierz 2 karty do odrzucenia i postać z talii.";
  if (g.phase === "promote") return "Rywal wybiera nową postać do walki…";
  if (g.turn === "ai") return g.pvp ? `${g.pvp.names.ai} wykonuje ruch…` : "Pomioty wykonują ruch…";
  if (g.turnNo === 1)
    return "Pierwsza tura: rozstaw się (bez ataku). Przeciągaj karty z ręki na stół.";
  return "Przeciągnij kartę na stół albo stuknij ją. Atak kończy turę.";
}

export function DuelBars({
  g,
  view,
  busy,
  onAction,
}: {
  view: Game;
  g: Game;
  busy: boolean;
  onAction: (a: Action) => void;
}) {
  const a = g.players.me.active;
  const myTurn = g.phase === "main" && g.turn === "me" && !busy;
  // attack waiting for the benched character that gets its energy
  const [pick, setPick] = useState<number | null>(null);
  const pickAtk = myTurn && a && pick !== null ? charDef(a).attacks[pick] : undefined;
  const targets =
    pickAtk && !attackBlock(g, "me", pickAtk) ? benchEnergyTargets(g, "me", pickAtk) : [];
  if (pick !== null && !targets.length) setPick(null);
  if (pickAtk && targets.length)
    return (
      <div className="border-t border-white/10 px-2 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
        <p className="truncate text-center text-xs text-white/85" aria-live="polite">
          {pickAtk.name}: wybierz postać na ławce, która dostanie ✨ z talii.
        </p>
        <div
          className="mt-1 flex flex-wrap items-center gap-1.5"
          role="group"
          aria-label="Komu dołączyć Łaskę"
        >
          {targets.map((t) => (
            <Button
              key={t.uid}
              size="sm"
              className="shrink-0"
              onClick={() => {
                setPick(null);
                onAction({ type: "attack", index: pick!, target: t.uid });
              }}
            >
              {nameOf(t)}
              <span className="font-display">
                {" "}
                · <span aria-hidden="true">✨</span>
                <span className="sr-only">Łaska: </span>
                {t.energy}
              </span>
            </Button>
          ))}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPick(null)}
            className="ml-auto shrink-0 border-white/40 text-white"
          >
            Anuluj
          </Button>
        </div>
      </div>
    );
  return (
    <div className="border-t border-white/10 px-2 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
      <p className="truncate text-center text-xs text-white/85">{hint(busy ? view : g)}</p>
      <div className="mt-1 flex items-center gap-1.5" role="group" aria-label="Ataki i koniec tury">
        <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
          {a &&
            charDef(a).attacks.flatMap((atk, index) => {
              const block = attackBlock(g, "me", atk);
              // "fuel" attacks get one extra button per energy card that can be burned from hand
              const levels = block ? [0] : [...Array(fuelMax(g, "me", atk) + 1).keys()];
              return levels.map((fuel) => (
                <Button
                  key={`${atk.name}-${fuel}`}
                  size="sm"
                  disabled={!!block || !myTurn}
                  title={block ?? undefined}
                  aria-label={
                    fuel
                      ? `${atk.name}: odrzuć z ręki ${fuel} ✨ — ${previewDamage(g, "me", atk, fuel)} obrażeń`
                      : undefined
                  }
                  onClick={() =>
                    !fuel && benchEnergyTargets(g, "me", atk).length
                      ? setPick(index)
                      : onAction(fuel ? { type: "attack", index, fuel } : { type: "attack", index })
                  }
                  className="shrink-0"
                >
                  {fuel ? (
                    <span aria-hidden="true">+🔥{fuel}</span>
                  ) : (
                    <>
                      <span aria-hidden="true">{"✨".repeat(attackCost(g, "me", atk))}</span>{" "}
                      {atk.name}
                    </>
                  )}
                  {atk.damage > 0 && (
                    <span className="font-display">· {previewDamage(g, "me", atk, fuel)}</span>
                  )}
                </Button>
              ));
            })}
        </div>
        <Button
          size="sm"
          variant="outline"
          disabled={!myTurn}
          onClick={() => onAction({ type: "endTurn" })}
          className="shrink-0 border-white/40 text-white"
        >
          Zakończ turę
        </Button>
      </div>
    </div>
  );
}
