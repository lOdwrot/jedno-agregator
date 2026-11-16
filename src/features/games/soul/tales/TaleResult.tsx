import { motion } from "motion/react";
import { Button } from "@/ui";
import { Confetti } from "../../fx/Confetti";
import { getCard } from "../data/cards";
import { CardFace } from "../components/CardFace";

/** Quiz result: the score, and the saint's stained-glass card when every answer was right. */
export function TaleResult({
  cardId,
  right,
  total,
  onReread,
  onRetry,
  onClose,
}: {
  cardId: string;
  right: number;
  total: number;
  onReread: () => void;
  onRetry: () => void;
  onClose: () => void;
}) {
  const won = right === total;
  return (
    <div className="relative flex flex-col items-center gap-4 text-center">
      <p className="font-display text-2xl font-extrabold text-navy" aria-live="polite">
        Poprawne odpowiedzi: {right} / {total}
      </p>
      {won ? (
        <>
          <Confetti />
          <p className="text-lg text-ink">
            Brawo! Za uważne słuchanie otrzymujesz specjalną, witrażową kartę:{" "}
            <strong>{getCard(cardId).name}</strong>. Jest już w Twojej kolekcji — znajdziesz ją w
            zakładce Talia.
          </p>
          <motion.div
            initial={{ opacity: 0, scale: 0.4, rotateY: 180 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1.1, ease: [0.34, 1.56, 0.64, 1] }}
            className="w-full max-w-xs"
          >
            <CardFace cardId={cardId} finish="stained" active />
          </motion.div>
          <Button size="lg" onClick={onClose}>
            Dziękuję!
          </Button>
        </>
      ) : (
        <>
          <p className="text-lg text-ink">
            Prawie! Karta świętego czeka na tego, kto odpowie dobrze na wszystkie pytania. Wróć do
            opowieści albo spróbuj jeszcze raz.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button size="lg" onClick={onReread}>
              Przeczytaj jeszcze raz
            </Button>
            <Button size="lg" variant="outline" onClick={onRetry}>
              Spróbuj quizu ponownie
            </Button>
          </div>
          <Button variant="ghost" onClick={onClose}>
            Później
          </Button>
        </>
      )}
    </div>
  );
}
