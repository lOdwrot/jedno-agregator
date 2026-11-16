import { motion } from "motion/react";
import { Button } from "@/ui";
import { Confetti } from "../../fx/Confetti";
import { getCard } from "../data/cards";
import { CardFace } from "../components/CardFace";

/**
 * "Zdobyto kartę!": the saint's stained-glass card flies out of the book and fills the screen
 * (a big close-up over spinning rays), then settles. Shown only the first time a tale is won.
 */
export function TaleCardWon({ cardId, onClose }: { cardId: string; onClose: () => void }) {
  const name = getCard(cardId).name;
  return (
    <div className="relative isolate -mx-2 flex flex-col items-center gap-4 overflow-hidden rounded-card bg-navy px-3 py-6 text-center text-white sm:-mx-4">
      <span aria-hidden="true" className="soul-foil soul-foil--stained soul-foil--dark" />
      <Confetti count={60} />
      <motion.p
        initial={{ opacity: 0, scale: 0.3 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.9, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative z-10 font-display text-4xl font-extrabold text-white sm:text-5xl"
        aria-live="polite"
      >
        Zdobyto kartę!
      </motion.p>
      <p className="relative z-10 text-lg text-white/90">
        Wszystkie odpowiedzi dobre — <strong>{name}</strong> trafia do Twojej kolekcji.
      </p>
      <div className="relative grid w-full place-items-center py-4">
        <span
          aria-hidden="true"
          className="soul-rays pointer-events-none absolute top-1/2 left-1/2 size-[150%] -translate-x-1/2 -translate-y-1/2"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.08, rotateY: 540, y: 120 }}
          animate={{
            opacity: [0, 1, 1, 1],
            scale: [0.08, 0.6, 1.18, 1],
            rotateY: [540, 180, 0, 0],
            y: [120, 0, -10, 0],
          }}
          transition={{ duration: 1.6, times: [0, 0.35, 0.75, 1], ease: "easeOut" }}
          className="relative z-10 w-[min(88vw,26rem)] [transform-style:preserve-3d]"
        >
          <CardFace cardId={cardId} finish="stained" active />
        </motion.div>
      </div>
      <p className="relative z-10 text-white/85">
        Tę kartę można zdobyć tylko raz. Znajdziesz ją w zakładce Talia, a opowieść możesz przeżyć
        ponownie w zakładce Opowieści.
      </p>
      <Button size="lg" className="relative z-10" onClick={onClose}>
        Dziękuję!
      </Button>
    </div>
  );
}
