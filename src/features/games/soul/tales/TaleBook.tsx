import { useState } from "react";
import { Button, Dialog, IconButton } from "@/ui";
import { cn } from "@/lib/cn";
import { score, taleOf } from "./stories";
import { TalePage } from "./TalePage";
import { TaleQuiz } from "./TaleQuiz";
import { TaleResult } from "./TaleResult";
import { useTaleSound } from "./useTaleSound";
import "./tales.css";

type Step =
  | { k: "cover" }
  | { k: "page"; i: number }
  | { k: "quiz"; i: number; picks: number[] }
  | { k: "result"; picks: number[] };

interface Props {
  cardId: string;
  /** All answers right: give the card (called once; never on a replay). */
  onWin?: () => void;
  /** Reading again a tale whose card was already won: no card at the end. */
  replay?: boolean;
  onClose: () => void;
}

/**
 * "Opowieści o świętych": a cover, 5–6 animated pages (with a lullaby and a soundscape per page,
 * `useTaleSound`), a 3-question quiz and the saint's card (only the first time — a replay ends
 * without one).
 */
export default function TaleBook({ cardId, onWin, replay = false, onClose }: Props) {
  const tale = taleOf(cardId);
  const [step, setStep] = useState<Step>({ k: "cover" });
  const scene = tale && step.k === "page" ? tale.pages[step.i]!.scene : null;
  const sound = useTaleSound(cardId, scene, step.k !== "cover");
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
          {replay ? (
            <>
              <p className="font-serif text-2xl text-accent-ink italic">{tale.title}</p>
              <p className="max-w-prose text-lg text-ink">
                Otwórz księgę jeszcze raz i przeżyj tę opowieść od nowa. Na końcu znów czekają trzy
                pytania — tym razem bez karty, bo kartę świętego masz już w kolekcji.
              </p>
            </>
          ) : (
            <>
              <p className="font-serif text-2xl text-accent-ink italic">Nowa opowieść o świętym!</p>
              <p className="max-w-prose text-lg text-ink">
                Twoja wytrwałość otworzyła starą księgę. Na jej kartach czeka opowieść o pewnym
                świętym. Przeczytaj ją uważnie — na końcu są trzy pytania, a kto odpowie dobrze na
                wszystkie, otrzyma wyjątkową kartę, której nie ma w żadnym boosterze.
              </p>
            </>
          )}
          <Button size="lg" onClick={() => setStep({ k: "page", i: 0 })}>
            {replay ? "📖 Przeżyj opowieść ponownie" : "📖 Poznaj świętego"}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Później
          </Button>
        </div>
      )}

      {step.k === "page" && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-display text-xl font-extrabold text-navy">{tale.title}</h3>
            <div className="flex gap-1">
              <IconButton
                variant="soft"
                label="Muzyka w tle"
                aria-pressed={sound.prefs.music}
                onClick={() => sound.toggle("music")}
              >
                <span aria-hidden="true" className={cn(!sound.prefs.music && "opacity-40")}>
                  🎵
                </span>
              </IconButton>
              <IconButton
                variant="soft"
                label="Odgłosy opowieści"
                aria-pressed={sound.prefs.sfx}
                onClick={() => sound.toggle("sfx")}
              >
                <span aria-hidden="true">{sound.prefs.sfx ? "🔊" : "🔇"}</span>
              </IconButton>
            </div>
          </div>
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
              if (!replay && score(tale, picks) === tale.quiz.length) onWin?.();
              setStep({ k: "result", picks });
            }
          }}
        />
      )}

      {step.k === "result" && (
        <TaleResult
          cardId={tale.id}
          quiz={tale.quiz}
          picks={step.picks}
          reward={!replay}
          onReread={() => setStep({ k: "page", i: 0 })}
          onRetry={() => setStep({ k: "quiz", i: 0, picks: [] })}
          onClose={onClose}
        />
      )}
    </Dialog>
  );
}
