import { Button, Icon } from "@/ui";
import type { Opponent } from "../data/opponents";
import type { AudioPrefs } from "../audio/context";
import { attackBlock, type Action } from "../engine/actions";
import { previewDamage } from "../engine/combat";
import { charDef, type Game } from "../engine/state";

const btn =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-2 text-lg hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-logo-yellow";

interface TopProps {
  opponent: Opponent;
  over: boolean;
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
        aria-label={over ? "Wróć do menu" : "Poddaj się i wyjdź (bez nagrody)"}
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
  if (g.phase === "setup")
    return "Przeciągnij (albo stuknij) postać podstawową z ręki, żeby stanęła do walki.";
  if (g.phase === "promote" && g.promote?.who === "me")
    return "Twoja postać zeszła z pola — stuknij postać na ławce.";
  if (g.phase === "over") return "Koniec pojedynku.";
  if (g.peek?.pid === "me") return "Weź odkrytą kartę albo odrzuć ją i dobierz następną.";
  if (g.turn === "ai") return "Pomioty wykonują ruch…";
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
  return (
    <div className="border-t border-white/10 px-2 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
      <p className="truncate text-center text-xs text-white/85">{hint(busy ? view : g)}</p>
      <div className="mt-1 flex items-center gap-1.5" role="group" aria-label="Ataki i koniec tury">
        <div className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto">
          {a &&
            charDef(a).attacks.map((atk, index) => {
              const block = attackBlock(g, "me", atk);
              return (
                <Button
                  key={atk.name}
                  size="sm"
                  disabled={!!block || !myTurn}
                  title={block ?? undefined}
                  onClick={() => onAction({ type: "attack", index })}
                  className="shrink-0"
                >
                  <span aria-hidden="true">{"✨".repeat(atk.cost)}</span> {atk.name}
                  {atk.damage > 0 && (
                    <span className="font-display">· {previewDamage(g, "me", atk)}</span>
                  )}
                </Button>
              );
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
