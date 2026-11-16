import { useCallback, useState } from "react";
import { Button, Dialog } from "@/ui";
import { DuelView } from "../components/DuelView";
import type { Game } from "../engine/state";
import { TUTORIAL_REWARD } from "../collection/profile";
import { createTutorialGame, scriptedAi } from "./game";
import { TUTORIAL_STEPS } from "./steps";
import type { TutorialScript } from "./useCoach";

const SCRIPT: TutorialScript = { steps: TUTORIAL_STEPS, aiMove: scriptedAi };
const OPPONENT = { emoji: "🎓", name: "Samouczek — Chochliki z kanapy" };

interface Props {
  /** A won tutorial: returns the talents it brought (only the first time on this device). */
  onFinish: (won: boolean) => number;
  onAgain: () => void;
  onExit: () => void;
}

/** The tutorial duel: fixed decks, a guide for the first two souls, the last two on your own. */
export function TutorialDuel({ onFinish, onAgain, onExit }: Props) {
  const [initial] = useState<Game>(createTutorialGame);
  const [over, setOver] = useState<{ won: boolean; reason: string; earned: number } | null>(null);
  const onOver = useCallback(
    (g: Game) => {
      const won = g.winner === "me";
      setOver({ won, reason: g.reason, earned: onFinish(won) });
    },
    [onFinish],
  );
  return (
    <DuelView
      initial={initial}
      opponent={OPPONENT}
      tutorial={SCRIPT}
      onOver={onOver}
      exitLabel="Przerwij samouczek i wróć do menu"
      onExit={onExit}
      result={
        over && (
          <Dialog
            open
            onClose={onExit}
            title={over.won ? "🎓 Samouczek ukończony!" : "🔥 Tym razem pomioty górą"}
            size="sm"
          >
            <div className="flex flex-col gap-3 text-center">
              <p className="text-ink">{over.reason}</p>
              {over.won && over.earned > 0 && (
                <p className="font-bold text-navy">
                  +{over.earned} talentów na start <span aria-hidden="true">🪙</span>
                </p>
              )}
              {over.won && over.earned === 0 && (
                <p className="text-sm text-ink-muted">
                  Nagrodę {TUTORIAL_REWARD} talentów dostaje się tylko za pierwsze ukończenie
                  samouczka na tym urządzeniu.
                </p>
              )}
              <p className="rounded-card bg-accent-soft p-3 text-left text-sm text-ink">
                {over.won
                  ? "Znasz już wszystkie zasady. Zbuduj własną talię, otwieraj boostery i zmierz się z coraz trudniejszymi pomiotami."
                  : "Nic straconego — zagraj samouczek jeszcze raz. Pamiętaj o ławce, słabości rywala i o tym, by atakować na końcu tury."}
              </p>
              {!over.won && <Button onClick={onAgain}>Zagraj jeszcze raz</Button>}
              <Button variant={over.won ? "solid" : "ghost"} onClick={onExit}>
                Wróć do menu
              </Button>
            </div>
          </Dialog>
        )
      }
    />
  );
}
