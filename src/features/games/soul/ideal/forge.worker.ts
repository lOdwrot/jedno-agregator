/** Runs the deck search off the main thread, so the loading screen stays smooth. */
import type { DeckList } from "../engine/state";
import { runForge, type ForgeMessage } from "./runForge";

const ctx = self as unknown as Worker;

ctx.onmessage = (e: MessageEvent<{ deck: DeckList; seed: number }>) => {
  runForge(e.data.deck, e.data.seed, (m: ForgeMessage) => ctx.postMessage(m));
};
