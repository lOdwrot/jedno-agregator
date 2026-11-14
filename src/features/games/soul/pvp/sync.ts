/**
 * Lock-step sync of a two-player duel. The host's browser decides the order of moves: every move
 * (its own, or one the guest asked for) is applied there and then sent as `apply` with a running
 * number and a checksum. The guest replays the same moves on its copy of the deterministic engine;
 * if the checksum ever differs it asks for the whole state.
 */
import { actorOf, type Action } from "../engine/actions";
import type { Game, PlayerId } from "../engine/state";
import type { Link } from "./link";
import { hashGame, type Msg } from "./protocol";

export type Role = "host" | "guest";
export const seatOf = (role: Role): PlayerId => (role === "host" ? "me" : "ai");

/** What the sync needs from the duel player (canonical = host-perspective state). */
export interface SyncTarget {
  canonical(): Game;
  /** Applies a move (queued behind running animations); null if the engine rejected it. */
  push(a: Action): Game | null;
  /** Replaces the whole state (after a resync). */
  reset(g: Game): void;
}

export class DuelSync {
  private n = 0;
  private waiting = false;
  private off: () => void;

  constructor(
    readonly role: Role,
    private link: Link,
    private target: SyncTarget,
  ) {
    this.off = link.onMessage((m) => this.receive(m));
  }

  dispose() {
    this.off();
  }

  /** A move made on this screen. */
  move(a: Action) {
    if (actorOf(this.target.canonical(), a) !== seatOf(this.role)) return;
    if (this.role === "host") this.commit(a);
    else this.link.send({ t: "act", a });
  }

  private commit(a: Action) {
    const s = this.target.push(a);
    if (s) this.link.send({ t: "apply", n: ++this.n, a, h: hashGame(s) });
  }

  private receive(m: Msg) {
    if (this.role === "host") {
      if (m.t === "act" && actorOf(this.target.canonical(), m.a) === "ai") this.commit(m.a);
      else if (m.t === "resync")
        this.link.send({ t: "state", n: this.n, game: this.target.canonical() });
      return;
    }
    if (m.t === "state") {
      this.target.reset(m.game);
      this.n = m.n;
      this.waiting = false;
    } else if (m.t === "apply" && !this.waiting) {
      const s = m.n === this.n + 1 ? this.target.push(m.a) : null;
      this.n = m.n;
      if (!s || hashGame(s) !== m.h) {
        this.waiting = true;
        this.link.send({ t: "resync" });
      }
    }
  }
}
