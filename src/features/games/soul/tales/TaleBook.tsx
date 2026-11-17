import { useState } from "react";
import { Button, Dialog, IconButton } from "@/ui";
import { cn } from "@/lib/cn";
import { score, taleOf } from "./stories";
import { PageTurn } from "./PageTurn";
import { ParchmentSwap } from "./ParchmentSwap";
import { TaleCover } from "./TaleCover";
import { TalePage } from "./TalePage";
import { TaleQuiz } from "./TaleQuiz";
import { TaleResult } from "./TaleResult";
import { useTaleSound } from "./useTaleSound";
import "./tales.css";
import "./book.css";

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
 * "Opowieści o świętych", drawn as an old book: a leather cover that opens like a page, 5–6
 * parchment leaves turned with a 3D page flip (`PageTurn`), the quiz and the result on scrolls that
 * fly in and out (`ParchmentSwap`). A cover, 5–6 animated pages (with a lullaby and a soundscape per page,
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

  const sheet = step.k === "quiz" ? `quiz-${step.i}` : step.k === "result" ? "result" : "book";
  const leaf = step.k === "cover" ? 0 : step.k === "page" ? step.i + 1 : 0;

  return (
    <Dialog
      open
      onClose={onClose}
      title="Opowieści o świętych"
      size="lg"
      panelClassName="tale-book"
    >
      <ParchmentSwap id={sheet} sound={sound.prefs.sfx}>
        {(step.k === "cover" || step.k === "page") && (
          <div className="flex flex-col gap-4">
            {step.k === "page" && (
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-serif text-2xl text-sepia italic">{tale.title}</h3>
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
            )}
            <div className="sm:px-2">
              <PageTurn
                index={leaf}
                sound={sound.prefs.sfx}
                render={(i) =>
                  i === 0 ? (
                    <TaleCover
                      title={tale.title}
                      replay={replay}
                      onOpen={() => setStep({ k: "page", i: 0 })}
                    />
                  ) : (
                    <TalePage
                      tale={tale.id}
                      page={tale.pages[i - 1]!}
                      index={i - 1}
                      total={pages}
                    />
                  )
                }
              />
            </div>
            {step.k === "cover" ? (
              <Button variant="ghost" className="self-center" onClick={onClose}>
                Później
              </Button>
            ) : (
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
                        "size-2.5 rotate-45 rounded-[2px] transition-transform",
                        i === step.i ? "scale-125 bg-accent" : "bg-parchment-edge/50",
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
            )}
          </div>
        )}

        {step.k === "quiz" && (
          <TaleQuiz
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
      </ParchmentSwap>
    </Dialog>
  );
}
