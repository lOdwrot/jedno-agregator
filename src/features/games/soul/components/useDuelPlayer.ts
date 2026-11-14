import { useCallback, useEffect, useRef, useState } from "react";
import { getCard } from "../data/cards";
import { dispatchFrames, type Action } from "../engine/actions";
import { aiAction } from "../engine/ai";
import type { Frame } from "../engine/events";
import type { Game } from "../engine/state";
import type { BoardRenderer } from "../board/BoardRenderer";

/**
 * Owns the duel state and plays engine frames one by one on the board.
 * `live` is the real state, `view` is what the board currently shows (it lags behind while animating).
 */
export function useDuelPlayer(
  initial: Game,
  opts: { onOver: (g: Game) => void; onDemon: (cardId: string) => void },
) {
  const [live, setLive] = useState(initial);
  const [view, setView] = useState(initial);
  const [busy, setBusy] = useState(false);
  const renderer = useRef<BoardRenderer | null>(null);
  const queue = useRef<Promise<void>>(Promise.resolve());
  const viewRef = useRef(initial);
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
        if ((ev.t === "bench" || ev.t === "toActive") && ev.pid === "ai") {
          const p = f.state.players.ai;
          const c = [p.active, ...p.bench].find((x) => x?.uid === ev.uid);
          if (c) o.current.onDemon(c.cardId);
        }
        if ((ev.t === "support" || ev.t === "place") && ev.pid === "ai")
          o.current.onDemon(ev.cardId);
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

  const act = useCallback(
    (a: Action) => {
      if (busy) return;
      const { state, frames } = dispatchFrames(live, a);
      if (state === live) return;
      setLive(state);
      enqueue(frames, state);
    },
    [busy, live, enqueue],
  );

  // the computer moves one step at a time, each with its own animation
  useEffect(() => {
    renderer.current?.setThinking(live.phase === "main" && live.turn === "ai");
    if (busy || live.phase !== "main" || live.turn !== "ai") return;
    const t = setTimeout(() => {
      const a = aiAction(live, "ai");
      let res = a ? dispatchFrames(live, a) : { state: live, frames: [] };
      if (res.state === live) res = dispatchFrames(live, { type: "endTurn" });
      setLive(res.state);
      enqueue(res.frames, res.state);
    }, 420);
    return () => clearTimeout(t);
  }, [busy, live, enqueue]);

  return {
    live,
    view,
    busy,
    act,
    renderer,
    isDemon: (id: string) => getCard(id).side === "demons",
  };
}
