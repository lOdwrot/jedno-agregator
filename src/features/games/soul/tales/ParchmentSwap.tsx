import { useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, motion, useIsPresent } from "motion/react";
import { usePrefersReducedMotion } from "@/ui";
import { paperSfx } from "../audio/paperSfx";

/**
 * A parchment that flies in (from below, slightly tilted, unrolling from a narrow strip) and flies
 * out (up and away) whenever `id` changes. Under reduced motion the content just swaps.
 */
export function ParchmentSwap({
  id,
  sound = true,
  children,
}: {
  id: string;
  sound?: boolean;
  children: ReactNode;
}) {
  const reduce = usePrefersReducedMotion();
  const last = useRef(id);
  useEffect(() => {
    if (last.current === id) return;
    last.current = id;
    if (sound) paperSfx.swish();
  }, [id, sound]);
  if (reduce) return <div key={id}>{children}</div>;
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <Sheet key={id}>{children}</Sheet>
    </AnimatePresence>
  );
}

/** The leaving sheet is hidden from assistive tech and can't be clicked. */
function Sheet({ children }: { children: ReactNode }) {
  const present = useIsPresent();
  return (
    <motion.div
      aria-hidden={present ? undefined : true}
      inert={present ? undefined : true}
      initial={{ opacity: 0, y: 70, rotate: -4, scaleY: 0.35, scaleX: 0.92 }}
      animate={{ opacity: 1, y: 0, rotate: 0, scaleY: 1, scaleX: 1 }}
      exit={{ opacity: 0, y: -90, x: 40, rotate: 6, scale: 0.85 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="origin-top"
    >
      {children}
    </motion.div>
  );
}
