import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Dialog, usePrefersReducedMotion } from "@/ui";
import { getCard } from "../data/cards";
import type { Opponent } from "../data/opponents";
import { music } from "../audio/music";
import { loadPrefs, savePrefs, type AudioPrefs } from "../audio/context";
import { BoardView } from "../board/BoardView";
import { createGame, type DeckList, type Game } from "../engine/state";
import { CardActions, type Selection } from "./CardActions";
import { CardFace } from "./CardFace";
import { DuelBars, DuelTopBar } from "./DuelBars";
import { DuelResult } from "./DuelResult";
import { DuelSidebar } from "./DuelSidebar";
import { useDuelPlayer } from "./useDuelPlayer";

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

/** Full-screen duel: Pixi board in the middle, slim bars on top and bottom, no page scrolling. */
export function DuelView({ opponent, deck, onFinish, onExit }: Props) {
  const reduced = usePrefersReducedMotion();
  const root = useRef<HTMLElement>(null);
  const [initial] = useState<Game>(() =>
    createGame(deck, opponentDeck(opponent), Date.now() % 1e9),
  );
  const [sel, setSel] = useState<Selection | { zone: "place" } | null>(null);
  const [lesson, setLesson] = useState<string | null>(null);
  const [lastLesson, setLastLesson] = useState<string | null>(null);
  const [showLog, setShowLog] = useState(false);
  const [earned, setEarned] = useState<number | null>(null);
  const [prefs, setPrefs] = useState<AudioPrefs>(loadPrefs);
  const [full, setFull] = useState(false);
  const seen = useRef(new Set<string>());

  const onDemon = useCallback((id: string) => {
    if (seen.current.has(id)) return;
    seen.current.add(id);
    setLesson(id);
    setLastLesson(id);
  }, []);
  const onOver = useCallback(
    (g: Game) => setEarned(onFinish(g.winner === "me", g.players.me.souls)),
    [onFinish],
  );
  const { live, view, busy, act, renderer } = useDuelPlayer(initial, { onOver, onDemon });

  // lock page scroll, start the music (the duel starts from a click, so audio is allowed)
  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    root.current?.focus();
    if (loadPrefs().music) music.start();
    const onFs = () => setFull(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => {
      html.style.overflow = prev;
      music.stop();
      document.removeEventListener("fullscreenchange", onFs);
      if (document.fullscreenElement) void document.exitFullscreen?.();
    };
  }, []);

  useEffect(() => {
    if (!lesson) return;
    const t = setTimeout(() => setLesson(null), 9000);
    return () => clearTimeout(t);
  }, [lesson]);

  const togglePref = (k: keyof AudioPrefs) => {
    const next = { ...prefs, [k]: !prefs[k] };
    setPrefs(next);
    savePrefs(next);
    if (k === "music") (next.music ? music.start : music.stop)();
  };
  const toggleFull = () => {
    if (document.fullscreenElement) void document.exitFullscreen?.();
    else void root.current?.requestFullscreen?.().catch(() => undefined);
  };

  const me = live.players.me;
  const selCard =
    sel &&
    (sel.zone === "place"
      ? live.place && { cardId: live.place.cardId, finish: "plain" as const }
      : sel.zone === "hand"
        ? me.hand.find((c) => c.uid === sel.uid)
        : (() => {
            const p = live.players[sel.zone === "opp" ? "ai" : "me"];
            return [p.active, ...p.bench, ...p.discard].find((c) => c?.uid === sel.uid);
          })());

  const onSelect = (s: Selection | { zone: "place" }) => {
    if (
      !busy &&
      live.phase === "promote" &&
      live.promote?.who === "me" &&
      s.zone === "field" &&
      me.bench.some((b) => b.uid === s.uid)
    )
      act({ type: "promote", uid: s.uid });
    else setSel(s);
  };
  const lessonCard = lesson ? getCard(lesson) : null;

  return (
    <section
      ref={root}
      tabIndex={-1}
      aria-label={`Pojedynek z: ${opponent.name}`}
      className="fixed inset-0 z-50 flex h-dvh flex-col bg-navy text-white outline-none"
    >
      <DuelTopBar
        opponent={opponent}
        over={live.phase === "over"}
        prefs={prefs}
        full={full}
        onExit={() => onExit(false)}
        onToggle={togglePref}
        onFull={toggleFull}
        onLog={() => setShowLog(true)}
      />
      <div className="relative min-h-0 flex-1">
        <BoardView
          view={view}
          live={live}
          busy={busy}
          reduced={reduced}
          renderer={renderer}
          onSelect={onSelect}
          onAction={act}
        />
        {lessonCard && "lesson" in lessonCard && lessonCard.lesson && (
          <div className="absolute top-1 left-1 max-w-[15rem] rounded-card bg-surface/95 px-3 py-2 text-ink shadow-lift sm:max-w-xs">
            <p className="text-sm font-extrabold text-navy">
              <span aria-hidden="true">{lessonCard.emoji} </span>Rozpoznaj pokusę: {lessonCard.name}
            </p>
            <p className="mt-0.5 line-clamp-2 text-xs">{lessonCard.lesson.tempts}</p>
            <div className="flex gap-3">
              <Button size="sm" variant="link" onClick={() => setShowLog(true)}>
                Jak się bronić?
              </Button>
              <Button size="sm" variant="link" onClick={() => setLesson(null)}>
                Zamknij
              </Button>
            </div>
          </div>
        )}
      </div>
      <DuelBars g={live} view={view} busy={busy} onAction={act} />

      <p role="status" aria-live="polite" className="sr-only">
        {view.log.at(-1)}
      </p>

      <Dialog
        open={!!selCard}
        onClose={() => setSel(null)}
        title={selCard ? getCard(selCard.cardId).name : "Karta"}
        hideTitle
        size="sm"
      >
        {selCard && sel && (
          <div className="flex flex-col gap-4 pt-10">
            <CardFace
              cardId={selCard.cardId}
              finish={selCard.finish}
              showLesson={sel.zone === "opp"}
            />
            {sel.zone !== "place" && !busy && (
              <CardActions g={live} sel={sel} onAction={(a) => (setSel(null), act(a))} />
            )}
          </div>
        )}
      </Dialog>
      <Dialog open={showLog} onClose={() => setShowLog(false)} title="Przebieg walki" size="sm">
        <DuelSidebar g={live} lesson={lesson ?? lastLesson} />
      </Dialog>
      {live.phase === "over" && earned !== null && !busy && (
        <DuelResult
          won={live.winner === "me"}
          reason={live.reason}
          souls={me.souls}
          earned={earned}
          opponent={opponent}
          onBooster={() => onExit(true)}
          onMenu={() => onExit(false)}
        />
      )}
    </section>
  );
}
