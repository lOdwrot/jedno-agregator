import { Button } from "@/ui";
import { getCard } from "../data/cards";
import type { QuizQuestion } from "./stories";
import { TaleCardWon } from "./TaleCardWon";

/**
 * Quiz result. All right + `reward`: "Zdobyto kartę!" with a big close-up of the saint's card.
 * All right on a replay (the card can be won only once): praise, no card. A wrong answer: a
 * "Niestety…" screen naming the missed questions, with another try.
 */
export function TaleResult({
  cardId,
  quiz,
  picks,
  reward,
  onReread,
  onRetry,
  onClose,
}: {
  cardId: string;
  quiz: readonly QuizQuestion[];
  picks: readonly number[];
  /** The card is won now (first time all answers are right, not a replay). */
  reward: boolean;
  onReread: () => void;
  onRetry: () => void;
  onClose: () => void;
}) {
  const wrong = quiz.flatMap((q, i) => (picks[i] === q.answer ? [] : [i]));
  const total = quiz.length;
  if (!wrong.length && reward) return <TaleCardWon cardId={cardId} onClose={onClose} />;

  if (!wrong.length)
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <span aria-hidden="true" className="text-7xl">
          🌟
        </span>
        <p className="font-display text-2xl font-extrabold text-navy" aria-live="polite">
          Brawo! Wszystkie odpowiedzi dobre ({total} / {total})
        </p>
        <p className="max-w-prose text-lg text-ink">
          Pięknie pamiętasz tę opowieść. Kartę <strong>{getCard(cardId).name}</strong> masz już w
          swojej kolekcji — każdą kartę z opowieści można zdobyć tylko raz.
        </p>
        <Button size="lg" onClick={onClose}>
          Zamknij księgę
        </Button>
      </div>
    );

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <span aria-hidden="true" className="animate-[game-pop-in_0.5s_ease-out_both] text-7xl">
        😔
      </span>
      <div aria-live="polite">
        <p className="font-display text-3xl font-extrabold text-navy">Niestety…</p>
        <p className="mt-1 text-lg font-bold text-ink">
          {wrong.length === 1
            ? "Jedna odpowiedź jest błędna."
            : `Błędne odpowiedzi: ${wrong.length} z ${total}.`}
        </p>
        <p className="text-ink-muted">
          Poprawne: {total - wrong.length} / {total}
        </p>
      </div>
      <ul className="flex w-full max-w-prose flex-col gap-2 text-left">
        {wrong.map((i) => (
          <li key={i} className="rounded-card border-2 border-line bg-surface px-4 py-3 text-ink">
            <span className="block text-sm font-bold tracking-wide text-ink-muted uppercase">
              ✗ Pytanie {i + 1}
            </span>
            {quiz[i]!.q}
          </li>
        ))}
      </ul>
      <p className="max-w-prose text-lg text-ink">
        {reward
          ? "Spróbuj jeszcze raz! Karta świętego czeka na tego, kto odpowie dobrze na wszystkie pytania."
          : "Spróbuj jeszcze raz — na pewno się uda!"}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button size="lg" onClick={onRetry}>
          Spróbuj jeszcze raz
        </Button>
        <Button size="lg" variant="outline" onClick={onReread}>
          Przeczytaj opowieść ponownie
        </Button>
      </div>
      <Button variant="ghost" onClick={onClose}>
        Później
      </Button>
    </div>
  );
}
