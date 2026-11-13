import { useEffect, useRef, useState } from "react";
import { Button, Dialog, Icon, Spinner, usePrefersReducedMotion } from "@/ui";
import { getCard } from "../data/cards";
import type { Opponent } from "../data/opponents";
import { attackBlock, dispatch, type Action } from "../engine/actions";
import { aiAction } from "../engine/ai";
import { createGame, charDef, type DeckList, type Game } from "../engine/state";
import { Board } from "./Board";
import { CardActions, type Selection } from "./CardActions";
import { CardFace } from "./CardFace";
import { DuelResult } from "./DuelResult";
import { DuelSidebar } from "./DuelSidebar";
import { HandRow } from "./HandRow";

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

/** Demon cards currently visible on the computer's side. */
function visibleDemons(g: Game): string[] {
  const p = g.players.ai;
  const ids = [p.active, ...p.bench].flatMap((c) => (c ? [c.cardId] : []));
  if (g.place?.owner === "ai") ids.push(g.place.cardId);
  const top = p.discard.at(-1);
  if (top && getCard(top.cardId).kind !== "energy") ids.push(top.cardId);
  return ids;
}

export function DuelView({ opponent, deck, onFinish, onExit }: Props) {
  const [g, setG] = useState<Game>(() =>
    createGame(deck, opponentDeck(opponent), Date.now() % 1e9),
  );
  const [sel, setSel] = useState<Selection | null>(null);
  const [lesson, setLesson] = useState<string | null>(null);
  const [earned, setEarned] = useState<number | null>(null);
  const seen = useRef(new Set<string>());
  const reduce = usePrefersReducedMotion();

  const reported = useRef(false);

  /** Applies a new state and reacts to it (lesson about a new demon, result reporting). */
  const commit = (next: Game) => {
    if (next === g) return;
    setG(next);
    const fresh = visibleDemons(next).find((id) => !seen.current.has(id));
    if (fresh) {
      seen.current.add(fresh);
      setLesson(fresh);
    }
    if (next.phase === "over" && !reported.current) {
      reported.current = true;
      setEarned(onFinish(next.winner === "me", next.players.me.souls));
    }
  };

  const act = (a: Action) => {
    setSel(null);
    commit(dispatch(g, a));
  };

  // computer's turn: one move every ~0.8 s so the player can follow it
  useEffect(() => {
    if (g.phase !== "main" || g.turn !== "ai") return;
    const t = setTimeout(
      () => {
        const a = aiAction(g, "ai");
        const next = a ? dispatch(g, a) : g;
        commit(next === g ? dispatch(g, { type: "endTurn" }) : next);
      },
      reduce ? 350 : 850,
    );
    return () => clearTimeout(t);
  });

  const me = g.players.me;
  const myTurn = g.phase === "main" && g.turn === "me";
  const selCard =
    sel &&
    (sel.zone === "hand"
      ? me.hand.find((c) => c.uid === sel.uid)
      : [
          g.players[sel.zone === "opp" ? "ai" : "me"].active,
          ...g.players[sel.zone === "opp" ? "ai" : "me"].bench,
        ].find((c) => c?.uid === sel.uid));

  const banner =
    g.phase === "setup"
      ? "Wybierz z ręki postać podstawową (podświetloną), która stanie do walki."
      : g.phase === "promote" && g.promote?.who === "me"
        ? "Twoja postać zeszła z pola. Stuknij postać na ławce, by wysłać ją do walki."
        : g.turn === "ai" && g.phase === "main"
          ? "Pomioty kombinują…"
          : g.turnNo === 1 && myTurn
            ? "Pierwsza tura: rozstaw się (bez ataku). Zakończ turę, gdy skończysz."
            : null;

  return (
    <div className="relative grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-display text-lg font-extrabold text-navy">
            <span aria-hidden="true">{opponent.emoji} </span>
            {opponent.name}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onExit(false)}
            leftIcon={<Icon name="chevronLeft" size={16} />}
          >
            {g.phase === "over" ? "Wróć do menu" : "Poddaj się (bez nagrody)"}
          </Button>
        </div>

        {banner && (
          <p className="flex items-center gap-2 rounded-card bg-navy p-3 text-sm font-bold text-white">
            {g.turn === "ai" && g.phase === "main" && <Spinner />}
            {banner}
          </p>
        )}

        <Board
          g={g}
          onSelect={(s) =>
            g.phase === "promote" &&
            g.promote?.who === "me" &&
            s.zone === "field" &&
            me.bench.some((b) => b.uid === s.uid)
              ? act({ type: "promote", uid: s.uid })
              : setSel(s)
          }
        />

        <div className="flex flex-wrap gap-2" role="group" aria-label="Akcje aktywnej postaci">
          {me.active &&
            charDef(me.active).attacks.map((a, index) => {
              const block = attackBlock(g, "me", a);
              return (
                <Button
                  key={a.name}
                  size="sm"
                  disabled={!!block}
                  title={block ?? undefined}
                  onClick={() => act({ type: "attack", index })}
                >
                  {"✨".repeat(a.cost)} {a.name}
                </Button>
              );
            })}
          <Button
            size="sm"
            variant="navy"
            disabled={!myTurn}
            onClick={() => act({ type: "endTurn" })}
            className="ml-auto"
          >
            Zakończ turę
          </Button>
        </div>
        <p className="text-xs text-ink-muted">
          Stuknij kartę, by zobaczyć szczegóły i akcje. W turze: 1 energia, 1 pomocnik, 1 wycofanie,
          dowolnie przedmiotów, a atak kończy turę.
        </p>

        <HandRow g={g} onSelect={(uid) => setSel({ zone: "hand", uid })} />
      </div>

      <DuelSidebar g={g} lesson={lesson} />

      <p role="status" aria-live="polite" className="sr-only">
        {g.log.at(-1)}
      </p>

      <Dialog
        open={!!selCard}
        onClose={() => setSel(null)}
        title={selCard ? getCard(selCard.cardId).name : "Karta"}
        hideTitle
        size="sm"
      >
        {selCard && sel && (
          <div className="flex flex-col gap-4">
            <CardFace
              cardId={selCard.cardId}
              finish={selCard.finish}
              showLesson={sel.zone === "opp"}
            />
            <CardActions g={g} sel={sel} onAction={act} />
          </div>
        )}
      </Dialog>

      {g.phase === "over" && (
        <DuelResult
          won={g.winner === "me"}
          reason={g.reason}
          souls={me.souls}
          earned={earned ?? 0}
          opponent={opponent}
          onBooster={() => onExit(true)}
          onMenu={() => onExit(false)}
        />
      )}
    </div>
  );
}
