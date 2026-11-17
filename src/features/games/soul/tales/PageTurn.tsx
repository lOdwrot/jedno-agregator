import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { usePrefersReducedMotion } from "@/ui";
import { cn } from "@/lib/cn";
import { paperSfx } from "../audio/paperSfx";

interface Turn {
  from: number;
  to: number;
}

const EASE = [0.45, 0.05, 0.25, 1] as const;
const DURATION = 0.8;

/**
 * Turns the pages of a book. Forward: the current leaf lifts at the right edge and swings over the
 * spine (left edge) to reveal the next one underneath. Backward: the previous leaf comes back from
 * the left and covers the current one. Every page keeps its key, so a page that ends a turn on top
 * is the same element (its scene keeps playing). Under reduced motion the pages simply swap.
 */
export function PageTurn({
  index,
  render,
  sound = true,
}: {
  index: number;
  render: (i: number) => ReactNode;
  sound?: boolean;
}) {
  const reduce = usePrefersReducedMotion();
  const [cur, setCur] = useState(index);
  const [turn, setTurn] = useState<Turn | null>(null);

  if (index !== cur) {
    setCur(index);
    setTurn(reduce ? null : { from: cur, to: index });
  }

  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (sound) paperSfx.turn();
  }, [cur, sound]);

  const forward = turn ? turn.to > turn.from : true;
  // Bottom first: the page lying underneath, then the leaf in the air.
  const layers: { i: number; leaf: boolean }[] = !turn
    ? [{ i: cur, leaf: false }]
    : forward
      ? [
          { i: turn.to, leaf: false },
          { i: turn.from, leaf: true },
        ]
      : [
          { i: turn.from, leaf: false },
          { i: turn.to, leaf: true },
        ];

  return (
    <div className="grid [perspective:1800px]">
      {layers.map(({ i, leaf }) => {
        const top = i === cur;
        return (
          <motion.div
            key={i}
            aria-hidden={top ? undefined : true}
            inert={top ? undefined : true}
            initial={false}
            animate={leaf ? { rotateY: forward ? [0, -180] : [-180, 0] } : { rotateY: 0 }}
            transition={leaf ? { duration: DURATION, ease: EASE } : { duration: 0 }}
            onAnimationComplete={() => {
              if (leaf) setTurn((t) => (t && (t.from === i || t.to === i) ? null : t));
            }}
            className={cn(
              "relative origin-left [grid-area:1/1] [transform-style:preserve-3d]",
              leaf && "z-10",
            )}
          >
            <div className="h-full [backface-visibility:hidden]">{render(i)}</div>
            {leaf && (
              <>
                <span
                  aria-hidden="true"
                  className="tale-paper-back absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden]"
                />
                <motion.span
                  aria-hidden="true"
                  className="tale-leaf-shade pointer-events-none absolute inset-0 [backface-visibility:hidden]"
                  initial={{ opacity: forward ? 0 : 0.8 }}
                  animate={{ opacity: forward ? 0.8 : 0 }}
                  transition={{ duration: DURATION, ease: EASE }}
                />
              </>
            )}
            {!leaf && turn && (
              <motion.span
                aria-hidden="true"
                className="tale-under-shade pointer-events-none absolute inset-0"
                initial={{ opacity: forward ? 1 : 0 }}
                animate={{ opacity: forward ? 0 : 1 }}
                transition={{ duration: DURATION, ease: EASE }}
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
