import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Button, Dialog, usePageScrollLock, usePrefersReducedMotion } from "@/ui";
import { getCard } from "../data/cards";
import { music } from "../audio/music";
import { loadPrefs, savePrefs, type AudioPrefs } from "../audio/context";
import { BoardView } from "../board/BoardView";
import type { Game, PlayerId } from "../engine/state";
import type { Link } from "../pvp/link";
import type { Role } from "../pvp/sync";
import { usePvpSync } from "../pvp/usePvpSync";
import { CardActions, type Selection } from "./CardActions";
import { CardFace } from "./CardFace";
import { DuelBars, DuelTopBar } from "./DuelBars";
import { DuelSidebar } from "./DuelSidebar";
import { SearchDialog } from "./SearchDialog";
import { useDuelPlayer } from "./useDuelPlayer";

interface Props {
  initial: Game;
  /** Who we play against (top bar). */
  opponent: { emoji: string; name: string; theme?: "infernal" };
  /** Two-player duel: the screen shows this seat and moves go through the WebRTC sync. */
  net?: { role: Role; link: Link };
  onOver: (g: Game) => void;
  /** A demon card was seen for the first time in this duel (one call per card on the table) — bestiary. */
  onSighting?: (cardId: string) => void;
  /** End-of-duel dialog, shown once the last animation finished. */
  result: ReactNode;
  /** Extra notice over the board (e.g. the other player disconnected). */
  notice?: ReactNode;
  /** No more moves (the other player left). */
  frozen?: boolean;
  exitLabel: string;
  onExit: () => void;
}

/** Full-screen duel: Pixi board in the middle, slim bars on top and bottom, no page scrolling. */
export function DuelView({
  initial,
  opponent,
  net,
  onOver,
  onSighting,
  result,
  notice,
  exitLabel,
  onExit,
  frozen,
}: Props) {
  const reduced = usePrefersReducedMotion();
  const root = useRef<HTMLElement>(null);
  const pov: PlayerId = net?.role === "guest" ? "ai" : "me";
  const [sel, setSel] = useState<Selection | { zone: "place" } | null>(null);
  const [lesson, setLesson] = useState<string | null>(null);
  const [lastLesson, setLastLesson] = useState<string | null>(null);
  const [showLog, setShowLog] = useState(false);
  const [prefs, setPrefs] = useState<AudioPrefs>(loadPrefs);
  const [full, setFull] = useState(false);
  const seen = useRef(new Set<string>());
  const sighted = useRef(new Set<string>());
  const sight = useRef(onSighting);
  useEffect(() => {
    sight.current = onSighting;
  });
  const infernal = opponent.theme === "infernal";

  const onDemon = useCallback((id: string, key: string) => {
    if (!sighted.current.has(key)) {
      sighted.current.add(key);
      sight.current?.(id);
    }
    if (seen.current.has(id)) return;
    seen.current.add(id);
    setLesson(id);
    setLastLesson(id);
  }, []);
  const player = useDuelPlayer(initial, {
    onOver,
    onDemon: net ? undefined : onDemon,
    ai: !net,
    pov,
  });
  const { live, view, busy, renderer } = player;
  const move = usePvpSync(net, player);
  const act = frozen ? () => undefined : (move ?? player.act);

  usePageScrollLock();
  // start the music (the duel starts from a click, so audio is allowed)
  useEffect(() => {
    root.current?.focus();
    music.setTheme(infernal ? "infernal" : "church");
    if (loadPrefs().music) music.start();
    const onFs = () => setFull(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => {
      music.stop();
      music.setTheme("church");
      document.removeEventListener("fullscreenchange", onFs);
      if (document.fullscreenElement) void document.exitFullscreen?.();
    };
  }, [infernal]);

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
  const selActive =
    !!sel &&
    "uid" in sel &&
    [live.players.me.active, live.players.ai.active].some((c) => c?.uid === sel.uid);

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
  const peeked =
    live.peek?.pid === "me" ? me.deck.find((c) => c.uid === live.peek?.uid) : undefined;

  return (
    <section
      ref={root}
      tabIndex={-1}
      aria-label={`Pojedynek z: ${opponent.name}`}
      className={cn(
        "fixed inset-0 z-50 flex h-dvh flex-col text-white outline-none",
        infernal ? "bg-hell-950" : "bg-navy",
      )}
    >
      <DuelTopBar
        opponent={opponent}
        over={live.phase === "over"}
        exitLabel={exitLabel}
        prefs={prefs}
        full={full}
        onExit={onExit}
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
          theme={infernal ? "infernal" : "default"}
        />
        {lessonCard && "lesson" in lessonCard && lessonCard.lesson && (
          <div className="absolute top-1 left-1 z-10 max-w-[15rem] rounded-card bg-surface/95 px-3 py-2 text-ink shadow-lift sm:max-w-xs">
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
        {notice}
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
              active={selActive}
              showLesson={sel.zone === "opp"}
            />
            {sel.zone !== "place" && !busy && (
              <CardActions g={live} sel={sel} onAction={(a) => (setSel(null), act(a))} />
            )}
          </div>
        )}
      </Dialog>
      <Dialog
        open={!!peeked && !busy}
        onClose={() => act({ type: "peek", keep: true })}
        title="Wierzchnia karta talii"
        description="Weź ją do ręki albo odrzuć i dobierz w ciemno kolejną kartę."
        size="sm"
      >
        {peeked && (
          <div className="flex flex-col gap-3">
            <CardFace cardId={peeked.cardId} finish={peeked.finish} />
            <Button fullWidth onClick={() => act({ type: "peek", keep: true })}>
              Weź do ręki
            </Button>
            <Button variant="navy" fullWidth onClick={() => act({ type: "peek", keep: false })}>
              Odrzuć i dobierz następną
            </Button>
          </div>
        )}
      </Dialog>
      <SearchDialog g={live} open={live.search?.pid === "me" && !busy} onAction={act} />
      <Dialog open={showLog} onClose={() => setShowLog(false)} title="Przebieg walki" size="sm">
        <DuelSidebar g={live} lesson={lesson ?? lastLesson} />
      </Dialog>
      {live.phase === "over" && !busy && result}
    </section>
  );
}
