import { AnimatePresence, motion } from "motion/react";
import type { TalePage as Page } from "./stories";
import { cn } from "@/lib/cn";
import { Scene } from "./scenes";
import { groundOf } from "./scenes/ground";

/** One page of the tale: the animated scene fills the card, the text panel overlaps its lower edge. */
export function TalePage({ tale, page, index }: { tale: string; page: Page; index: number }) {
  return (
    <div className="relative overflow-hidden rounded-card bg-navy shadow-lift [perspective:1200px]">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={index}
          initial={{ opacity: 0, rotateY: 35, x: 60 }}
          animate={{ opacity: 1, rotateY: 0, x: 0 }}
          exit={{ opacity: 0, rotateY: -35, x: -60 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className={cn("relative flex flex-col", groundOf(page.scene, tale))}
        >
          <div className="relative aspect-[4/3] sm:aspect-[16/9]">
            <Scene id={page.scene} tale={tale} />
          </div>
          <p className="relative mx-3 -mt-12 mb-3 rounded-card bg-surface/90 p-4 font-sans text-xl leading-relaxed text-ink shadow-card backdrop-blur-sm sm:mx-4 sm:mb-4 sm:p-5 sm:text-2xl sm:leading-relaxed">
            {page.text}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
