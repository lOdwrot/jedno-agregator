import { useCallback, useRef, useState } from "react";
import { duelDiscoveries, RECOGNIZE_AT, type Discoveries } from "../collection/bestiary";
import type { PackType } from "../collection/packs";
import type { Profile } from "../collection/profile";
import type { CardKey } from "../collection/profile";
import type { Opponent } from "../data/opponents";
import { createGame, type DeckList, type Game } from "../engine/state";
import { BoosterOpening } from "./BoosterOpening";
import { DuelResult } from "./DuelResult";
import { DuelView } from "./DuelView";
import { LazyTaleBook } from "../tales/LazyTaleBook";

/** What a finished duel brought: talents and, for a victory over a harder opponent, a booster. */
export interface DuelOutcome {
  earned: number;
  /** Rank points before and after the duel. */
  rank: { from: number; to: number };
  prize: { pack: PackType; cards: CardKey[]; fresh: boolean[] } | null;
  /** A saint's tale this win unlocked (its book opens instead of going back to the menu). */
  tale?: { cardId: string } | null;
}

interface Props {
  opponent: Opponent;
  /** Practice duel: no fee, no rewards. */
  training?: boolean;
  deck: DeckList;
  /** The computer's deck when the opponent has none of its own (`Opponent.adaptive`). */
  aiDeck?: DeckList;
  onFinish: (won: boolean, souls: number) => DuelOutcome;
  /** A demon card showed up on the table (bestiary progress, practice duels count too). */
  onSighting?: (cardId: string) => void;
  /** The bestiary at the start of the duel — the result lists what this duel added to it. */
  bestiary?: Profile["bestiary"];
  onExit: (openBooster: boolean) => void;
  /** Every quiz answer of the unlocked tale was right. */
  onTaleWin?: (cardId: string) => void;
  /** Leaving before the end: counts as a defeat for the rank. */
  onForfeit: () => void;
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
export function SoloDuel({
  opponent,
  training = false,
  deck,
  aiDeck,
  onFinish,
  onSighting,
  bestiary,
  onExit,
  onTaleWin,
  onForfeit,
}: Props) {
  const [initial] = useState<Game>(() =>
    createGame(deck, aiDeck ?? opponentDeck(opponent), Date.now() % 1e9, opponent.extraDraw ?? 0),
  );
  const [over, setOver] = useState<({ g: Game; found: Discoveries } & DuelOutcome) | null>(null);
  const [prizeOpen, setPrizeOpen] = useState(true);
  /** The result was closed while a tale waits: the book opens, then `onExit(booster)`. */
  const [book, setBook] = useState<{ booster: boolean } | null>(null);
  const leave = (booster: boolean) => (over?.tale ? setBook({ booster }) : onExit(booster));
  const [before] = useState(bestiary);
  const sighted = useRef<Partial<Record<string, number>>>({});
  const sight = useCallback(
    (id: string) => {
      sighted.current[id] = (sighted.current[id] ?? 0) + 1;
      onSighting?.(id);
    },
    [onSighting],
  );
  const onOver = useCallback(
    (g: Game) =>
      setOver({
        g,
        found: duelDiscoveries(before, sighted.current),
        ...onFinish(g.winner === "me", g.players.me.souls),
      }),
    [before, onFinish],
  );
  return (
    <DuelView
      initial={initial}
      opponent={training ? { ...opponent, name: `${opponent.name} (trening)` } : opponent}
      onOver={onOver}
      onSighting={sight}
      recognized={(id) => (before?.[id] ?? 0) >= RECOGNIZE_AT}
      exitLabel={
        training ? "Zakończ trening" : "Poddaj się i wyjdź (bez nagrody, tracisz punkty rangi)"
      }
      onExit={() => {
        if (!over && !training) onForfeit();
        onExit(false);
      }}
      result={
        over &&
        (book && over.tale ? (
          <LazyTaleBook
            cardId={over.tale.cardId}
            onWin={() => onTaleWin?.(over.tale!.cardId)}
            onClose={() => onExit(book.booster)}
          />
        ) : over.prize && prizeOpen ? (
          <BoosterOpening
            pack={over.prize.pack}
            cards={over.prize.cards}
            fresh={over.prize.fresh}
            onClose={() => setPrizeOpen(false)}
            onAgain={null}
            onMenu={() => leave(false)}
          />
        ) : (
          <DuelResult
            won={over.g.winner === "me"}
            reason={over.g.reason}
            souls={over.g.players.me.souls}
            earned={over.earned}
            rank={over.rank}
            prize={over.prize?.pack ?? null}
            opponent={opponent}
            found={over.found}
            training={training}
            tale={!!over.tale}
            onBooster={() => leave(true)}
            onMenu={() => leave(false)}
          />
        ))
      }
    />
  );
}
