import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { usePrefersReducedMotion } from "@/ui";
import { cn } from "@/lib/cn";
import { getCard } from "../data/cards";
import type { Finish } from "../data/types";
import { CardBack } from "../components/CardBack";
import { CardFace } from "../components/CardFace";
import { drawParticles } from "./drawParticles";
import { EMISSION, emit, stepParticles, type Particle } from "./glassParticles";
import { atRest, clampTilt, restingY, settle, type Spin } from "./spring";

/** Perspective of the stage (px) — the particles are projected with the same one. */
const PERSPECTIVE = 900;
const DRAG_Y = 0.45;
const DRAG_X = 0.35;

const face = (ay: number) => (((Math.round(ay / 180) % 2) + 2) % 2 === 0 ? "front" : "back");

/**
 * A card you turn with a finger (or the mouse / arrow keys), like holding it in your hand:
 * free spin around the vertical axis (the back shows the dove), a limited tilt, a light glare
 * that follows the angle, and a spring back to rest. Gilded prints shed gold dust and stained
 * prints fling glass shards and sparkles into 3D space — the faster the turn, the more.
 */
export function TiltCard({ cardId, finish }: { cardId: string; finish: Finish }) {
  const reduced = usePrefersReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spin = useRef<Spin>({ ax: 0, ay: 0, vx: 0, vy: 0 });
  const drag = useRef<{ id: number; x: number; y: number; t: number } | null>(null);
  const wake = useRef<() => void>(() => {});
  const [side, setSide] = useState<"front" | "back">("front");
  const sparkly = !reduced && EMISSION[finish] !== null;

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let prev = { ax: spin.current.ax, ay: spin.current.ay };
    let parts: Particle[] = [];
    let carry = 0;

    const paint = () => {
      const { ax, ay } = spin.current;
      const el = cardRef.current;
      if (el) {
        el.style.transform = `rotateX(${ax}deg) rotateY(${ay}deg)`;
        // parallax of the picture's layers: the figure stands in front of the backdrop
        el.style.setProperty("--tilt-y", Math.sin((ay * Math.PI) / 180).toFixed(4));
        el.style.setProperty("--tilt-x", Math.sin((ax * Math.PI) / 180).toFixed(4));
      }
      const g = glareRef.current;
      if (g) {
        // the light slides across the face against the turn
        const fy = ((((ay + 90) % 360) + 360) % 360) - 90;
        g.style.transform = `translate(${-fy * 0.9}%, ${ax * 0.9}%)`;
        g.style.opacity = String(Math.min(0.9, 0.25 + (Math.abs(fy) + Math.abs(ax)) / 70));
      }
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = spin.current;
      if (!drag.current) {
        spin.current = reduced
          ? { ax: 0, ay: restingY({ ...s, vy: 0 }), vx: 0, vy: 0 }
          : settle(s, dt);
        if (atRest(spin.current))
          spin.current = { ...spin.current, ax: 0, ay: restingY(spin.current), vx: 0, vy: 0 };
      }
      paint();
      const pose = { ax: spin.current.ax, ay: spin.current.ay };
      const canvas = canvasRef.current;
      const card = cardRef.current;
      if (sparkly && canvas && card) {
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        const w = Math.round(canvas.clientWidth * dpr);
        const h = Math.round(canvas.clientHeight * dpr);
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
        }
        const out = emit(
          finish,
          prev,
          pose,
          dt,
          { w: card.offsetWidth, h: card.offsetHeight },
          carry,
        );
        carry = out.carry;
        parts = stepParticles([...parts, ...out.born], dt);
        const ctx = canvas.getContext("2d");
        if (ctx) drawParticles(ctx, parts, finish, PERSPECTIVE, dpr);
      }
      prev = pose;
      const resting = !drag.current && spin.current.vx === 0 && spin.current.vy === 0;
      if (resting) setSide(face(spin.current.ay));
      if (resting && !sparkly) {
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    wake.current = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    paint();
    wake.current();
    return () => {
      cancelAnimationFrame(raf);
      raf = 0;
      wake.current = () => {};
    };
  }, [finish, reduced, sparkly]);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now() };
    spin.current = { ...spin.current, vx: 0, vy: 0 };
    wake.current();
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const now = performance.now();
    const dt = Math.max(0.008, (now - d.t) / 1000);
    const dy = (e.clientX - d.x) * DRAG_Y;
    const dx = -(e.clientY - d.y) * DRAG_X;
    const s = spin.current;
    const ax = clampTilt(s.ax + dx);
    // a smoothed throw speed, used when the finger lets go
    spin.current = {
      ax,
      ay: s.ay + dy,
      vx: s.vx * 0.5 + ((ax - s.ax) / dt) * 0.5,
      vy: s.vy * 0.5 + (dy / dt) * 0.5,
    };
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, t: now };
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (drag.current?.id !== e.pointerId) return;
    // a finger that stopped before letting go doesn't throw the card
    if (performance.now() - drag.current.t > 80) spin.current = { ...spin.current, vx: 0, vy: 0 };
    drag.current = null;
    wake.current();
  };

  /** Keyboard: arrows push the card (a full flip under reduced motion), Home / End = front / back. */
  const push = (vx: number, vy: number) => {
    const s = spin.current;
    spin.current = reduced
      ? { ...s, ay: s.ay + Math.sign(vy) * 180 }
      : { ...s, vx: s.vx + vx, vy: s.vy + vy };
    wake.current();
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const s = spin.current;
    const k = e.key;
    if (k === "ArrowRight") push(0, 420);
    else if (k === "ArrowLeft") push(0, -420);
    else if (k === "ArrowUp") push(260, 0);
    else if (k === "ArrowDown") push(-260, 0);
    else if (k === "Home" || k === "End") {
      const want = k === "Home" ? "front" : "back";
      if (face(s.ay) !== want) push(0, 700);
    } else return;
    e.preventDefault();
  };

  const name = getCard(cardId).name;
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        role="slider"
        tabIndex={0}
        aria-label={`Obróć kartę: ${name}`}
        aria-valuemin={0}
        aria-valuemax={180}
        aria-valuenow={side === "front" ? 0 : 180}
        aria-valuetext={side === "front" ? "przód karty" : "tył karty"}
        aria-orientation="horizontal"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        className="relative grid w-full cursor-grab touch-none place-items-center rounded-card px-4 py-8 select-none active:cursor-grabbing"
        style={{ perspective: `${PERSPECTIVE}px` }}
      >
        <div ref={cardRef} className="relative w-full max-w-xs transform-3d">
          <div className="relative overflow-hidden rounded-card backface-hidden">
            <CardFace cardId={cardId} finish={finish} active stories={false} depth />
            <span
              ref={glareRef}
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute -inset-1/2 bg-radial from-white/70 via-white/10 to-transparent to-60% opacity-25 mix-blend-soft-light",
                finish !== "plain" && "mix-blend-overlay",
              )}
            />
          </div>
          <CardBack
            foil="from-logo-blue via-navy-600 to-logo-blue"
            className="absolute inset-0 rotate-y-180 backface-hidden"
          />
        </div>
        {sparkly && (
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="pointer-events-none absolute -top-10 -left-6 h-[calc(100%+5rem)] w-[calc(100%+3rem)]"
          />
        )}
      </div>
    </div>
  );
}
