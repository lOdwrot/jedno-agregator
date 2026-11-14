import { useCallback, useState } from "react";
import type { Opponent } from "../data/opponents";
import { createGame, type DeckList, type Game } from "../engine/state";
import { DuelResult } from "./DuelResult";
import { DuelView } from "./DuelView";

interface Props {
  opponent: Opponent;
  deck: DeckList;
  onFinish: (won: boolean, souls: number) => number;
  onExit: (openBooster: boolean) => void;
}

const opponentDeck = (o: Opponent): DeckList =>
  Object.entries(o.deck).flatMap(([cardId, n]) =>
    Array.from({ length: n }, () => ({ cardId, finish: "plain" as const })),
  );

/** Duel against the computer: talents for the result, the opponent's moral at the end. */
export function SoloDuel({ opponent, deck, onFinish, onExit }: Props) {
  const [initial] = useState<Game>(() =>
    createGame(deck, opponentDeck(opponent), Date.now() % 1e9, opponent.boost),
  );
  const [over, setOver] = useState<{ g: Game; earned: number } | null>(null);
  const onOver = useCallback(
    (g: Game) => setOver({ g, earned: onFinish(g.winner === "me", g.players.me.souls) }),
    [onFinish],
  );
  return (
    <DuelView
      initial={initial}
      opponent={opponent}
      onOver={onOver}
      exitLabel="Poddaj się i wyjdź (bez nagrody)"
      onExit={() => onExit(false)}
      result={
        over && (
          <DuelResult
            won={over.g.winner === "me"}
            reason={over.g.reason}
            souls={over.g.players.me.souls}
            earned={over.earned}
            opponent={opponent}
            onBooster={() => onExit(true)}
            onMenu={() => onExit(false)}
          />
        )
      }
    />
  );
}
