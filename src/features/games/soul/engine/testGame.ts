/** Test helper: a new game past the opening (both hands kept, coin thrown) — ready for the setup. */
import { dispatch } from "./actions";
import { createGame, type Game } from "./state";

export function startedGame(...args: Parameters<typeof createGame>): Game {
  let g = createGame(...args);
  g = dispatch(g, { type: "ready", pid: "me" });
  if (g.phase === "opening") g = dispatch(g, { type: "ready", pid: "ai" });
  return g;
}
