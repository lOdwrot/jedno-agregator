import { useRef, type RefObject } from "react";
import { buzz } from "../audio/haptics";
import { packSfx } from "../audio/packSfx";
import { cutDir, cutDone, cutProgress, extendCut, type Cut } from "./tearGesture";

interface Props {
  /** The pack on screen — the swipe is measured against its top edge. */
  packRef: RefObject<HTMLElement | null>;
  onCut: (cut: Cut | null) => void;
  onTear: (dir: 1 | -1) => void;
}

/**
 * Full-screen swipe surface over the sealed booster: sweep a finger (or the mouse) sideways across
 * the top of the pack to tear it open. It is a real button too — Enter/Space (a click with
 * `detail === 0`) tears the pack for keyboard and screen-reader users; a plain tap does not.
 */
export function TearZone({ packRef, onCut, onTear }: Props) {
  const cut = useRef<Cut | null>(null);
  const step = useRef(0);
  const active = useRef<number | null>(null);

  const set = (c: Cut | null) => {
    cut.current = c;
    onCut(c);
  };
  const move = (x: number, y: number) => {
    const box = packRef.current?.getBoundingClientRect();
    if (!box) return;
    const next = extendCut(cut.current, box, x, y);
    if (next === cut.current) return;
    if (!cut.current) packSfx.crinkle(0.3);
    const p = cutProgress(next);
    const s = Math.floor(p * 8);
    if (s > step.current) {
      step.current = s;
      packSfx.scratch(p);
      buzz(6);
    }
    if (cutDone(next)) {
      active.current = null;
      set(next);
      buzz([20, 30, 40]);
      onTear(cutDir(next));
      return;
    }
    set(next);
  };
  const end = () => {
    active.current = null;
    step.current = 0;
    if (!cutDone(cut.current)) set(null);
  };

  return (
    <button
      type="button"
      aria-label="Rozerwij booster"
      data-tear=""
      className="absolute inset-0 z-20 cursor-grab touch-none outline-none select-none focus-visible:ring-4 focus-visible:ring-logo-yellow focus-visible:ring-inset active:cursor-grabbing"
      onClick={(e) => {
        if (e.detail === 0) onTear(1);
      }}
      onPointerDown={(e) => {
        active.current = e.pointerId;
        step.current = 0;
        e.currentTarget.setPointerCapture?.(e.pointerId);
        move(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (active.current === e.pointerId) move(e.clientX, e.clientY);
      }}
      onPointerUp={end}
      onPointerCancel={end}
    />
  );
}
