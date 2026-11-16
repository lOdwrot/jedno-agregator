import { useState } from "react";
import { Button, Dialog } from "@/ui";
import { cn } from "@/lib/cn";
import { score, taleOf } from "./stories";
import { TalePage } from "./TalePage";
import { TaleQuiz } from "./TaleQuiz";
import { TaleResult } from "./TaleResult";
import "./tales.css";

type Step =
  | { k: "cover" }
  | { k: "page"; i: number }
  | { k: "quiz"; i: number; picks: number[] }
  | { k: "result"; picks: number[] };

interface Props {
  cardId: string;
  /** Wins in a row that opened the book (shown on the cover). */
  streak: number;
  /** All answers right: give the card (called once). */
  onWin: () => void;
  onClose: () => void;
}

/** "Opowieści o świętych": a cover, 5–6 animated pages, a 3-question quiz and the saint's card. */
export default function TaleBook({ cardId, streak, onWin, onClose }: Props) {
  const tale = taleOf(cardId);
  const [step, setStep] = useState<Step>({ k: "cover" });
  if (!tale) return null;
  const pages = tale.pages.length;

  return (
    <Dialog open onClose={onClose} title="Opowieści o świętych" size="lg">
      {step.k === "cover" && (
        <div className="flex flex-col items-center gap-5 text-center">
          <div
            aria-hidden="true"
            className="relative isolate grid size-40 place-items-center overflow-hidden rounded-full bg-navy text-7xl shadow-lift"
          >
            <span className="soul-foil soul-foil--stained" />
            <span className="relative">📖</span>
          </div>
          <p className="font-serif text-2xl text-accent-ink italic">{streak} zwycięstw z rzędu!</p>
          <p className="max-w-prose text-lg text-ink">
            Twoja wytrwałość otworzyła starą księgę. Na jej kartach czeka opowieść o pewnym świętym.
            Przeczytaj ją uważnie — na końcu są trzy pytania, a kto odpowie dobrze na wszystkie,
            otrzyma wyjątkową kartę, której nie ma w żadnym boosterze.
          </p>
          <Button size="lg" onClick={() => setStep({ k: "page", i: 0 })}>
            📖 Poznaj świętego
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Później
          </Button>
        </div>
      )}

      {step.k === "page" && (
        <div className="flex flex-col gap-3">
          <h3 className="font-display text-xl font-extrabold text-navy">{tale.title}</h3>
          <TalePage tale={tale.id} page={tale.pages[step.i]!} index={step.i} />
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              disabled={step.i === 0}
              onClick={() => setStep({ k: "page", i: step.i - 1 })}
            >
              ← Wstecz
            </Button>
            <p className="flex items-center gap-1.5" aria-live="polite">
              <span className="sr-only">
                Strona {step.i + 1} z {pages}
              </span>
              {tale.pages.map((_, i) => (
                <span
                  key={i}
                  aria-hidden="true"
                  className={cn(
                    "size-2.5 rounded-full transition-transform",
                    i === step.i ? "scale-125 bg-accent" : "bg-pill",
                  )}
                />
              ))}
            </p>
            <Button
              onClick={() =>
                setStep(
                  step.i + 1 < pages
                    ? { k: "page", i: step.i + 1 }
                    : { k: "quiz", i: 0, picks: [] },
                )
              }
            >
              {step.i + 1 < pages ? "Dalej →" : "Do quizu ✍️"}
            </Button>
          </div>
        </div>
      )}

      {step.k === "quiz" && (
        <TaleQuiz
          key={step.i}
          question={tale.quiz[step.i]!}
          index={step.i}
          total={tale.quiz.length}
          onAnswer={(pick) => {
            const picks = [...step.picks, pick];
            if (step.i + 1 < tale.quiz.length) setStep({ k: "quiz", i: step.i + 1, picks });
            else {
              if (score(tale, picks) === tale.quiz.length) onWin();
              setStep({ k: "result", picks });
            }
          }}
        />
      )}

      {step.k === "result" && (
        <TaleResult
          cardId={tale.id}
          right={score(tale, step.picks)}
          total={tale.quiz.length}
          onReread={() => setStep({ k: "page", i: 0 })}
          onRetry={() => setStep({ k: "quiz", i: 0, picks: [] })}
          onClose={onClose}
        />
      )}
    </Dialog>
  );
}
