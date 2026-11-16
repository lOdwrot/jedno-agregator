import { Button } from "@/ui";
import type { Action } from "../engine/actions";
import type { Game } from "../engine/state";

/** Bottom bar of the opening: keep the dealt hand, or shuffle it back and draw a new one (once). */
export function OpeningBar({
  g,
  busy,
  onAction,
}: {
  g: Game;
  busy: boolean;
  onAction: (a: Action) => void;
}) {
  const o = g.opening;
  const ready = !!o?.ready.me;
  const redrawn = !!o?.redrawn.me;
  const hint = ready
    ? "Czekaj, aż rywal zdecyduje o swojej ręce…"
    : redrawn
      ? "Nowa ręka — zawsze z postacią na start. Rzuć monetą, kto zaczyna."
      : "Twoja ręka startowa (zawsze z postacią na start). Możesz raz przetasować talię i dobrać nowe karty.";
  return (
    <div className="border-t border-white/10 px-2 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
      <p className="text-center text-xs text-white/85" aria-live="polite">
        {hint}
      </p>
      <div
        className="mt-1 flex flex-wrap items-center justify-center gap-1.5"
        role="group"
        aria-label="Ręka startowa"
      >
        <Button
          size="sm"
          variant="outline"
          disabled={busy || ready || redrawn}
          onClick={() => onAction({ type: "redraw" })}
          className="shrink-0 border-white/40 text-white"
        >
          <span aria-hidden="true">🔀</span> {redrawn ? "Przetasowano" : "Przetasuj i dobierz (1×)"}
        </Button>
        <Button
          size="sm"
          disabled={busy || ready}
          onClick={() => onAction({ type: "ready" })}
          className="shrink-0"
        >
          <span aria-hidden="true">🪙</span> Gram tymi kartami — rzut monetą
        </Button>
      </div>
    </div>
  );
}
