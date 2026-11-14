/** A reliable, ordered message pipe to the other player (WebRTC in the app, in-memory in tests). */
import type { Msg } from "./protocol";

export interface Link {
  send(m: Msg): void;
  /** Returns an unsubscribe function. */
  onMessage(fn: (m: Msg) => void): () => void;
  /** The connection dropped (or the other side closed it). */
  onClose(fn: () => void): () => void;
  close(): void;
}

/** Small listener set shared by link implementations. */
export class Listeners<T extends unknown[]> {
  private fns = new Set<(...a: T) => void>();
  add(fn: (...a: T) => void) {
    this.fns.add(fn);
    return () => void this.fns.delete(fn);
  }
  emit(...a: T) {
    for (const fn of [...this.fns]) fn(...a);
  }
}

/** Two connected in-memory links (messages are delivered asynchronously, in order, as JSON). */
export function memoryPair(): [Link, Link] {
  const make = () => ({ msg: new Listeners<[Msg]>(), close: new Listeners<[]>(), open: true });
  const a = make();
  const b = make();
  const link = (self: typeof a, peer: typeof a): Link => ({
    send: (m) => {
      if (!self.open || !peer.open) return;
      const copy = JSON.parse(JSON.stringify(m)) as Msg;
      setTimeout(() => peer.open && peer.msg.emit(copy), 0);
    },
    onMessage: (fn) => self.msg.add(fn),
    onClose: (fn) => self.close.add(fn),
    close: () => {
      if (!self.open) return;
      self.open = false;
      self.close.emit();
      setTimeout(() => {
        if (!peer.open) return;
        peer.open = false;
        peer.close.emit();
      }, 0);
    },
  });
  return [link(a, b), link(b, a)];
}
