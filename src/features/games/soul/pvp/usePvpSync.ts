import { useCallback, useEffect, useRef } from "react";
import type { Action } from "../engine/actions";
import type { Link } from "./link";
import { DuelSync, type Role, type SyncTarget } from "./sync";

/** Connects a duel player to the other browser; returns the move function for this screen. */
export function usePvpSync(
  net: { role: Role; link: Link } | undefined,
  player: SyncTarget & { busy: boolean },
): ((a: Action) => void) | null {
  const sync = useRef<DuelSync | null>(null);
  const target = useRef<SyncTarget>(player);
  useEffect(() => {
    target.current = player;
  });
  const role = net?.role;
  const link = net?.link;
  useEffect(() => {
    if (!role || !link) return;
    const s = new DuelSync(role, link, {
      canonical: () => target.current.canonical(),
      push: (a) => target.current.push(a),
      reset: (g) => target.current.reset(g),
    });
    sync.current = s;
    return () => {
      s.dispose();
      sync.current = null;
    };
  }, [role, link]);
  const { busy } = player;
  const move = useCallback((a: Action) => !busy && sync.current?.move(a), [busy]);
  return net ? move : null;
}
