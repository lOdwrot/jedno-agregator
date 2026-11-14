import { useCallback, useState } from "react";
import type { PackType } from "../collection/packs";
import type { CardKey } from "../collection/profile";
import type { Opponent } from "../data/opponents";
import { createGame, type DeckList, type Game } from "../engine/state";
import { BoosterOpening } from "./BoosterOpening";
import { DuelResult } from "./DuelResult";
import { DuelView } from "./DuelView";

/** What a finished duel brought: talents and, for a victory over a harder opponent, a booster. */
export interface DuelOutcome {
  earned: number;
  prize: { pack: PackType; cards: CardKey[]; fresh: boolean[] } | null;
}

interface Props {
  opponent: Opponent;
  /** Practice duel: no fee, no rewards. */
  training?: boolean;
  deck: DeckList;
  onFinish: (won: boolean, souls: number) => DuelOutcome;
  onExit: (openBooster: boolean) => void;
}

const opponentDeck = (o: Opponent): DeckList =>
  Object.entries(o.deck).flatMap(([cardId, n]) =>
    Array.from({ length: n }, () => ({ cardId, finish: o.finish ?? "plain" })),
  );

/**
 * Duel against the computer: talents for the result, the opponent's moral at the end.
 * A prize booster (harder opponents) is opened first, then the result dialog follows.
 * A practice duel (`training`) is the same fight without any reward.
 */
export function SoloDuel({ opponent, training = false, deck, onFinish, onExit }: Props) {
  const [initial] = useState<Game>(() =>
    createGame(deck, opponentDeck(opponent), Date.now() % 1e9, opponent.boost),
  );
  const [over, setOver] = useState<({ g: Game } & DuelOutcome) | null>(null);
  const [prizeOpen, setPrizeOpen] = useState(true);
  const onOver = useCallback(
    (g: Game) => setOver({ g, ...onFinish(g.winner === "me", g.players.me.souls) }),
    [onFinish],
  );
  return (
    <DuelView
      initial={initial}
      opponent={training ? { ...opponent, name: `${opponent.name} (trening)` } : opponent}
      onOver={onOver}
      exitLabel={training ? "Zakończ trening" : "Poddaj się i wyjdź (bez nagrody)"}
      onExit={() => onExit(false)}
      result={
        over &&
        (over.prize && prizeOpen ? (
          <BoosterOpening
            pack={over.prize.pack}
            cards={over.prize.cards}
            fresh={over.prize.fresh}
            onClose={() => setPrizeOpen(false)}
            onAgain={null}
          />
        ) : (
          <DuelResult
            won={over.g.winner === "me"}
            reason={over.g.reason}
            souls={over.g.players.me.souls}
            earned={over.earned}
            prize={over.prize?.pack ?? null}
            opponent={opponent}
            training={training}
            onBooster={() => onExit(true)}
            onMenu={() => onExit(false)}
          />
        ))
      }
    />
  );
}
