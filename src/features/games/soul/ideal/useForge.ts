import { useEffect, useState } from "react";
import type { DeckList } from "../engine/state";
import type { ForgeProgress, ForgeResult } from "./forge";
import { runForgeSliced, type ForgeMessage } from "./runForge";

export interface ForgeState {
  progress: ForgeProgress | null;
  result: ForgeResult | null;
}

/**
 * Puts the "Idealny oponent" deck together against `deck`: in a Web Worker when the browser has
 * one, otherwise in small slices on the main thread. Stops when the component goes away.
 */
export function useForge(deck: DeckList, seed: number): ForgeState {
  const [state, setState] = useState<ForgeState>({ progress: null, result: null });
  useEffect(() => {
    let alive = true;
    const onMessage = (m: ForgeMessage) => {
      if (!alive) return;
      if (m.type === "done") setState((s) => ({ ...s, result: m.result }));
      else setState((s) => ({ ...s, progress: m.progress }));
    };
    let cancel = () => {};
    const fallback = () => {
      cancel();
      cancel = runForgeSliced(deck, seed, onMessage);
    };
    if (typeof Worker === "undefined") fallback();
    else {
      try {
        const w = new Worker(new URL("./forge.worker.ts", import.meta.url), { type: "module" });
        w.onmessage = (e: MessageEvent<ForgeMessage>) => onMessage(e.data);
        w.onerror = () => {
          w.terminate();
          fallback();
        };
        w.postMessage({ deck, seed });
        cancel = () => w.terminate();
      } catch {
        fallback();
      }
    }
    return () => {
      alive = false;
      cancel();
    };
  }, [deck, seed]);
  return state;
}
