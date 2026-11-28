import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import type { Finish } from "../data/types";
import { CardFace } from "./CardFace";
import { fitScale } from "./fitScale";

/** Width the face is laid out at before it is scaled (the album's `max-w-xs`). */
const NATURAL = 320;
/**
 * A flat card face (no turning) scaled down to fill its box — used in the duel, where the card
 * and its actions must be readable at once without scrolling. The box must have a size of its
 * own (e.g. `flex-1 min-h-0`).
 */
export function FitCard({
  cardId,
  finish,
  showLesson = false,
  className,
}: {
  cardId: string;
  finish: Finish;
  showLesson?: boolean;
  className?: string;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const faceRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState({ scale: 1, h: 0 });

  useLayoutEffect(() => {
    const box = boxRef.current;
    const face = faceRef.current;
    if (!box || !face) return;
    const update = () => {
      const h = face.offsetHeight;
      const scale = fitScale(NATURAL, h, box.clientWidth, box.clientHeight);
      setFit((f) => (f.scale === scale && f.h === h ? f : { scale, h }));
    };
    update();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(update);
    ro.observe(box);
    ro.observe(face);
    return () => ro.disconnect();
  }, [cardId, finish, showLesson]);

  return (
    <div ref={boxRef} className={cn("grid min-h-0 min-w-0 place-items-center", className)}>
      <div
        className="relative"
        style={{ width: NATURAL * fit.scale, height: fit.h ? fit.h * fit.scale : undefined }}
      >
        <div
          ref={faceRef}
          className="absolute top-0 left-0 origin-top-left"
          style={{ width: NATURAL, transform: `scale(${fit.scale})` }}
        >
          <CardFace
            cardId={cardId}
            finish={finish}
            active
            stories={false}
            showLesson={showLesson}
          />
        </div>
      </div>
    </div>
  );
}
