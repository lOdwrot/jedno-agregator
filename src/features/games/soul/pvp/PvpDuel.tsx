import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Dialog } from "@/ui";
import type { Game } from "../engine/state";
import { DuelView } from "../components/DuelView";
import { newPvpGame, type Session } from "./session";

interface Props {
  session: Session;
  onExit: () => void;
}

/** Two-player duel screen: the shared board, rematches and what happens when the other one leaves. */
export function PvpDuel({ session, onExit }: Props) {
  const { role, link, names } = session;
  const rival = role === "host" ? names.ai : names.me;
  const [game, setGame] = useState({ g: session.game, key: 0 });
  const [over, setOver] = useState<Game | null>(null);
  const [gone, setGone] = useState<string | null>(null);
  const [rematch, setRematch] = useState<"asked" | "wanted" | null>(null);
  const net = useMemo(() => ({ role, link }), [role, link]);

  const deal = useCallback(() => {
    if (!session.decks) return;
    const g = newPvpGame(session.decks, names);
    link.send({ t: "start", game: g });
    setOver(null);
    setRematch(null);
    setGame((p) => ({ g, key: p.key + 1 }));
  }, [link, names, session.decks]);

  useEffect(() => {
    const off = link.onMessage((m) => {
      if (m.t === "start" && role === "guest") {
        setOver(null);
        setRematch(null);
        setGame((p) => ({ g: m.game, key: p.key + 1 }));
      }
      if (m.t === "rematch" && role === "host") setRematch("wanted");
      if (m.t === "bye") setGone(`${rival} opuszcza pojedynek.`);
    });
    const offClose = link.onClose(() =>
      setGone((g) => g ?? "Połączenie z rywalem zostało przerwane."),
    );
    return () => {
      off();
      offClose();
    };
  }, [link, role, rival]);

  const leave = () => {
    link.send({ t: "bye" });
    setTimeout(() => link.close(), 300);
    onExit();
  };
  const again = () => {
    if (role === "host") deal();
    else {
      link.send({ t: "rematch" });
      setRematch("asked");
    }
  };

  // `over` is already the game as this screen sees it
  const won = over?.winner === "me";
  return (
    <DuelView
      key={game.key}
      initial={game.g}
      opponent={{ emoji: "🤝", name: rival }}
      net={net}
      frozen={!!gone}
      onOver={setOver}
      exitLabel="Opuść pojedynek"
      onExit={leave}
      notice={
        gone && (
          <div
            role="alert"
            className="absolute inset-x-2 top-2 mx-auto max-w-sm rounded-card bg-surface p-4 text-center text-ink shadow-lift"
          >
            <p className="font-bold text-navy">{gone}</p>
            <Button className="mt-3" onClick={onExit}>
              Wróć do menu
            </Button>
          </div>
        )
      }
      result={
        over &&
        !gone && (
          <Dialog
            open
            onClose={leave}
            title={won ? "🕊️ Wygrana!" : `Tym razem lepszy był(a) ${rival}`}
            size="sm"
          >
            <div className="flex flex-col gap-3 text-center">
              <p className="text-ink">{over.reason}</p>
              {rematch === "wanted" && (
                <p className="font-bold text-navy" role="status">
                  {rival} chce zagrać jeszcze raz!
                </p>
              )}
              {rematch === "asked" ? (
                <p className="text-ink-muted" role="status">
                  Czekamy, aż {rival} rozda nową partię…
                </p>
              ) : (
                <Button size="lg" onClick={again}>
                  {role === "host" ? "Rewanż" : "Poproś o rewanż"}
                </Button>
              )}
              <Button variant="ghost" onClick={leave}>
                Wróć do menu
              </Button>
            </div>
          </Dialog>
        )
      }
    />
  );
}
