import { useEffect, useState } from "react";
import { Button } from "@/ui";
import type { Game } from "../engine/state";
import type { Coach } from "./useCoach";

/** The tutorial's instructions over the board: what happens, why, and what to do now. */
export function CoachPanel({ coach, g, busy }: { coach: Coach; g: Game; busy: boolean }) {
  const { step, next } = coach;
  const [open, setOpen] = useState(true);
  const [shownFor, setShownFor] = useState(step?.id);
  // a new step always opens the panel again
  if (shownFor !== step?.id) {
    setShownFor(step?.id);
    setOpen(true);
  }
  // waiting steps end on their own once the demons' turn is over (and its animations played)
  const done = !!step?.until && !busy && step.until(g);
  useEffect(() => {
    if (done) next();
  }, [done, next]);
  if (!step) return null;

  const text = typeof step.text === "function" ? step.text(g) : step.text;
  const explain = !step.expect && !step.until;
  if (!open)
    return (
      <div className="absolute inset-x-1 top-1 z-10 flex justify-center md:justify-start">
        <Button size="sm" onClick={() => setOpen(true)} aria-expanded={false}>
          <span aria-hidden="true">🎓</span> Pokaż wskazówkę
        </Button>
      </div>
    );
  return (
    <div
      role="region"
      aria-label="Samouczek"
      className="pointer-events-none absolute inset-x-1 top-1 z-10 flex justify-center md:justify-start"
    >
      <div className="pointer-events-auto max-h-[46dvh] w-full max-w-md overflow-y-auto md:max-h-[80%] md:max-w-[19rem] rounded-card bg-surface/95 px-3 py-2 text-ink shadow-lift">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-bold text-ink-muted">
            <span aria-hidden="true">🎓 </span>Samouczek · krok {coach.index + 1} z {coach.total}
          </p>
          <Button
            size="sm"
            variant="link"
            aria-expanded
            onClick={() => setOpen(false)}
            className="-my-1"
          >
            Zwiń
          </Button>
        </div>
        <div aria-live="polite">
          <h2 className="font-display text-base leading-tight font-extrabold text-navy">
            {step.title}
          </h2>
          <p className="mt-1 text-sm">{text}</p>
          {step.todo && (
            <p className="mt-2 rounded-lg bg-accent-soft p-2 text-sm font-bold text-navy">
              <span aria-hidden="true">👉 </span>
              {step.todo}
            </p>
          )}
          {step.until && (
            <p className="mt-2 text-xs text-ink-muted italic">Pomioty wykonują ruch…</p>
          )}
          {coach.message && (
            <p className="mt-2 text-sm font-bold text-accent-ink">{coach.message}</p>
          )}
        </div>
        {explain && (
          <div className="mt-2 flex justify-end">
            <Button size="sm" onClick={next}>
              {step.next ?? "Dalej"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
