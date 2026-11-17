import { useId, useState } from "react";
import { Button } from "@/ui";
import { cn } from "@/lib/cn";
import type { QuizQuestion } from "./stories";

/** One single-choice question; the answer is only checked at the end of the quiz. */
export function TaleQuiz({
  question,
  index,
  total,
  onAnswer,
}: {
  question: QuizQuestion;
  index: number;
  total: number;
  onAnswer: (pick: number) => void;
}) {
  const [pick, setPick] = useState<number | null>(null);
  const name = useId();
  return (
    <form
      className="tale-scroll flex flex-col gap-4 sm:px-8"
      onSubmit={(e) => {
        e.preventDefault();
        if (pick !== null) onAnswer(pick);
      }}
    >
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3">
          <span className="block font-serif text-lg text-sepia-muted italic">
            Pytanie {index + 1} z {total}
          </span>
          <span className="mt-1 block font-serif text-3xl text-sepia">{question.q}</span>
        </legend>
        {question.options.map((o, i) => (
          <label
            key={o}
            className={cn(
              "flex min-h-14 cursor-pointer items-center gap-3 rounded-card border-2 bg-parchment-light/70 px-4 py-3 text-lg text-sepia transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent-ink",
              pick === i
                ? "border-accent-strong bg-accent-soft"
                : "border-parchment-edge/50 hover:border-parchment-edge",
            )}
          >
            <input
              type="radio"
              name={name}
              value={i}
              checked={pick === i}
              onChange={() => setPick(i)}
              className="size-5 accent-accent-strong"
            />
            {o}
          </label>
        ))}
      </fieldset>
      <Button type="submit" size="lg" disabled={pick === null} className="self-end">
        {index + 1 < total ? "Dalej" : "Sprawdź odpowiedzi"}
      </Button>
    </form>
  );
}
