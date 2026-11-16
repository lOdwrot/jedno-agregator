import { useCallback, useMemo, useState } from "react";
import type { Action } from "../engine/actions";
import type { Game } from "../engine/state";
import type { TutorialStep } from "./steps";

/** A guided duel: the steps and how the demons play while the player is being led. */
export interface TutorialScript {
  steps: readonly TutorialStep[];
  aiMove: (g: Game) => Action | null;
}

export interface Coach {
  /** The guided part is still on (moves are limited to the current step). */
  active: boolean;
  step: TutorialStep | null;
  index: number;
  total: number;
  /** Why the last move was refused. */
  message: string | null;
  /** Null when the move is allowed now, otherwise what to do instead. */
  check: (g: Game, a: Action) => string | null;
  /** The move of an `expect` step went through. */
  moved: () => void;
  /** Closes an explanation / a finished wait. */
  next: () => void;
  reject: (why: string) => void;
  /** The computer waits while an explanation is on screen. */
  aiPaused: boolean;
  aiMove?: (g: Game) => Action | null;
}

const READ_FIRST = "Najpierw przeczytaj wskazówkę i stuknij przycisk pod nią.";
const NOT_NOW = "To jeszcze nie ten ruch — zrób to, co pokazuje wskazówka 👉.";
const WAIT = "Poczekaj, aż pomioty skończą swój ruch.";

/** Step-by-step guide of the tutorial duel (inactive without a script). */
export function useCoach(script: TutorialScript | undefined): Coach {
  const [index, setIndex] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const steps = script?.steps;
  const step = steps?.[index] ?? null;
  const next = useCallback(() => {
    setMessage(null);
    setIndex((i) => i + 1);
  }, []);
  const check = useCallback(
    (g: Game, a: Action): string | null => {
      if (!step) return null;
      if (step.expect) return step.expect(g, a) ? null : NOT_NOW;
      return step.until ? WAIT : READ_FIRST;
    },
    [step],
  );
  return useMemo(
    () => ({
      active: !!step,
      step,
      index,
      total: steps?.length ?? 0,
      message,
      check,
      moved: next,
      next,
      reject: setMessage,
      aiPaused: !!step && !step.expect && !step.until,
      aiMove: step ? script?.aiMove : undefined,
    }),
    [check, index, message, next, script, step, steps],
  );
}
