import { useCallback, useEffect, useRef, useState } from "react";
import { getCard } from "../data/cards";
import { dispatchFrames, type Action } from "../engine/actions";
import { aiAction } from "../engine/ai";
import type { Frame } from "../engine/events";
import type { Game, PlayerId } from "../engine/state";
import type { BoardRenderer } from "../board/BoardRenderer";
import { frameAs, viewAs } from "../pvp/flip";

export interface DuelPlayerOpts {
  onOver: (g: Game) => void;
  onDemon?: (cardId: string) => void;
  /** The computer plays the "ai" seat (solo). Off in a two-player duel. */
  ai?: boolean;
  /** Whose eyes the screen shows: "me" (solo, host) or "ai" (guest of a two-player duel). */
  pov?: PlayerId;
}

/**
 * Owns the duel state and plays engine frames one by one on the board.
 * `live` is the real state, `view` is what the board currently shows (it lags behind while animating) —
 * both as seen by `pov`. The canonical state (host perspective) is what moves are applied to.
 */
export function useDuelPlayer(initial: Game, opts: DuelPlayerOpts) {
  const pov = opts.pov ?? "me";
  const ai = opts.ai ?? true;
  const [live, setLive] = useState(() => viewAs(initial, pov));
  const [view, setView] = useState(() => viewAs(initial, pov));
  const [busy, setBusy] = useState(false);
  const renderer = useRef<BoardRenderer | null>(null);
  const queue = useRef<Promise<void>>(Promise.resolve());
  const canon = useRef(initial);
  const viewRef = useRef(viewAs(initial, pov));
  const pending = useRef(0);
  const reported = useRef(false);
  const o = useRef(opts);
  useEffect(() => {
    o.current = opts;
  });

  const enqueue = useCallback((frames: Frame[], final: Game) => {
    pending.current++;
    setBusy(true);
    queue.current = queue.current.then(async () => {
      for (const f of frames) {
        try {
          const r = renderer.current;
          if (r)
            await Promise.race([
              r.play(f, viewRef.current),
              new Promise((ok) => setTimeout(ok, 5000)),
            ]);
        } catch {
          /* a failed effect must never block the game */
        }
        viewRef.current = f.state;
        setView(f.state);
        const ev = f.ev;
        const onDemon = o.current.onDemon;
        if (!onDemon) continue;
        if ((ev.t === "bench" || ev.t === "toActive") && ev.pid === "ai") {
          const p = f.state.players.ai;
          const c = [p.active, ...p.bench].find((x) => x?.uid === ev.uid);
          if (c) onDemon(c.cardId);
        }
        if ((ev.t === "support" || ev.t === "place") && ev.pid === "ai") onDemon(ev.cardId);
      }
      viewRef.current = final;
      setView(final);
      const r = renderer.current;
      if (r)
        await Promise.race([r.reconcile(final, 250), new Promise((ok) => setTimeout(ok, 2000))]);
      if (final.phase === "over" && !reported.current) {
        reported.current = true;
        o.current.onOver(final);
      }
      if (--pending.current === 0) setBusy(false);
    });
  }, []);

  /** Applies a move to the canonical state right away; its animation waits for earlier ones. */
  const push = useCallback(
    (a: Action): Game | null => {
      const { state, frames } = dispatchFrames(canon.current, a);
      if (state === canon.current) return null;
      canon.current = state;
      const seen = viewAs(state, pov);
      setLive(seen);
      enqueue(
        frames.map((f) => frameAs(f, pov)),
        seen,
      );
      return state;
    },
    [enqueue, pov],
  );

  /** Replaces the state without animating (two-player resync). */
  const reset = useCallback(
    (g: Game) => {
      canon.current = g;
      const seen = viewAs(g, pov);
      setLive(seen);
      enqueue([], seen);
    },
    [enqueue, pov],
  );

  const act = useCallback(
    (a: Action) => {
      if (!busy) push(a);
    },
    [busy, push],
  );

  // the computer moves one step at a time, each with its own animation
  useEffect(() => {
    const theirs = live.phase === "main" && live.turn === "ai";
    renderer.current?.setThinking(theirs, live);
    if (!ai || busy || !theirs) return;
    const t = setTimeout(() => {
      const g = canon.current;
      const a = aiAction(g, "ai");
      if (!(a && push(a))) push({ type: "endTurn" });
    }, 420);
    return () => clearTimeout(t);
  }, [ai, busy, live, push]);

  const canonical = useCallback(() => canon.current, []);

  return {
    live,
    view,
    busy,
    act,
    push,
    reset,
    canonical,
    renderer,
    isDemon: (id: string) => getCard(id).side === "demons",
  };
}
