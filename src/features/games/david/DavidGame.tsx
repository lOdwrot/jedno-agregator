import { useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";
import { Button, Icon } from "@/ui";
import { StageOverlay } from "../components/StageOverlay";
import { higherIsBetter, useBestScore } from "../useBestScore";
import { useGameLoop } from "../useGameLoop";
import { sfx } from "../audio/sfx";
import { useFx } from "../fx/useFx";
import {
  STONES,
  TAUNTS,
  W,
  createDavid,
  distanceSteps,
  startDavid,
  stepDavid,
  tap,
  type DavidState,
} from "./engine";
import { DavidStage } from "./DavidStage";
import { useDavidReactions } from "./useDavidReactions";

export function DavidGame() {
  const [s, setS] = useState<DavidState>(createDavid);
  const [record, setRecord] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const best = useBestScore("dawid-i-goliat", higherIsBetter);
  const fx = useFx();
  const [hitAt, setHitAt] = useState<number | null>(null);

  const react = useDavidReactions(stageRef, fx.spawn, setHitAt);

  useGameLoop(
    (dt) => {
      const n = stepDavid(s, dt);
      react(s, n);
      if (n.phase === "won" && s.phase !== "won") setRecord(best.submit(n.stonesLeft));
      setS(n);
    },
    s.phase === "playing" || (s.phase === "won" && s.time - (s.feedback?.at ?? 0) < 4),
  );

  const start = () => {
    sfx.unlock();
    fx.clear();
    setHitAt(null);
    setS(startDavid());
    setRecord(false);
    stageRef.current?.focus({ preventScroll: true });
    stageRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  };
  const canThrow = s.phase === "playing" && !s.stone && s.stonesLeft > 0;
  const doTap = () => {
    if (!canThrow) return;
    if (s.aimStage === "angle") sfx.click();
    else {
      sfx.whoosh();
      sfx.whistle();
    }
    setS(tap(s));
  };

  const onKey = (e: KeyboardEvent) => {
    const map: Record<string, () => void> = {
      " ": () => (s.phase === "playing" ? doTap() : start()),
      Enter: () => (s.phase === "playing" ? doTap() : start()),
    };
    const fn = map[e.key];
    if (!fn || e.target !== e.currentTarget) return;
    e.preventDefault();
    fn();
  };

  const fresh = s.feedback && s.time - s.feedback.at < 1.9 ? s.feedback : null;
  const bubble =
    s.phase === "intro"
      ? TAUNTS[0]
      : (fresh?.text ?? TAUNTS[Math.floor(s.time / 4) % TAUNTS.length]);
  const bubbleLeft = Math.min(62, Math.max(18, ((s.goliathX - 230) / W) * 100));
  const showResult = s.phase === "lost" || (s.phase === "won" && s.fall >= 1);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm font-bold text-navy">
        <p className="flex items-center gap-1.5">
          <span>Kamienie:</span>
          <span aria-hidden="true" className="flex gap-1">
            {Array.from({ length: STONES }, (_, i) => (
              <span
                key={i}
                className={cn(
                  "size-4 rounded-full border-2 border-navy",
                  i < s.stonesLeft ? "bg-ink-muted" : "bg-transparent opacity-40",
                )}
              />
            ))}
          </span>
          <span className="sr-only">
            {s.stonesLeft} z {STONES}
          </span>
        </p>
        <p>
          Goliat jest <span className="text-accent-ink">{distanceSteps(s)}</span> kroków od Ciebie
        </p>
      </div>

      {/* Game stage is a focusable keyboard target (role=application), like a canvas game. */}
      {/* eslint-disable jsx-a11y/no-noninteractive-tabindex, jsx-a11y/no-noninteractive-element-interactions */}
      <div
        ref={stageRef}
        tabIndex={0}
        role="application"
        aria-roledescription="gra"
        aria-label="Plansza gry Dawid i Goliat. Spacja lub stuknięcie: najpierw zatrzymuje wskaźnik kąta, potem wskaźnik siły i rzuca kamień."
        onKeyDown={onKey}
        className="relative aspect-square overflow-hidden rounded-card bg-accent-soft shadow-card select-none sm:aspect-video"
      >
        {/* eslint-enable jsx-a11y/no-noninteractive-tabindex, jsx-a11y/no-noninteractive-element-interactions */}
        <DavidStage s={s} fx={fx.items} hitAt={hitAt} onTap={doTap} />

        {s.phase !== "lost" && (
          <p
            aria-hidden="true"
            style={{ left: `${bubbleLeft}%` }}
            className={cn(
              "absolute top-2 max-w-[58%] rounded-card border-2 border-navy bg-surface px-2.5 py-1.5 text-[clamp(0.75rem,1.8vw,0.95rem)] leading-snug font-bold text-navy shadow-card sm:top-4 sm:max-w-[42%]",
              fresh?.kind === "win" && "border-success text-success",
            )}
          >
            {s.phase === "won" ? "Uuuuu…" : bubble}
          </p>
        )}

        {s.phase === "intro" && (
          <StageOverlay
            emoji="🐑🪨"
            title="Gotowy, Dawidzie?"
            actionLabel="Zaczynamy!"
            onAction={start}
            footer={
              best.best !== null ? `Rekord: ${best.best} niewykorzystanych kamieni` : undefined
            }
          >
            Trafi tylko kamień w czoło — pod hełmem. Zbroja Goliata jest na wszystko odporna… poza
            zaufaniem do Boga.
          </StageOverlay>
        )}
        {showResult && (
          <StageOverlay
            emoji={s.phase === "won" ? "🏆" : "😅"}
            title={s.phase === "won" ? "Goliat pokonany!" : "Tym razem Goliat górą"}
            celebrate={s.phase === "won"}
            actionLabel="Zagraj jeszcze raz"
            onAction={start}
            footer={
              s.phase === "won"
                ? record
                  ? "Nowy rekord! 🎉"
                  : best.best !== null
                    ? `Rekord: ${best.best} niewykorzystanych kamieni`
                    : undefined
                : undefined
            }
          >
            {s.phase === "won" ? (
              <>
                Wystarczyło {STONES - s.stonesLeft}{" "}
                {STONES - s.stonesLeft === 1 ? "kamienia" : "kamieni"}. Filistyni uciekają, owce
                biją brawo (kopytkami).
              </>
            ) : s.lostReason === "stones" ? (
              <>Kamienie się skończyły. Dawid też ćwiczył latami na wilkach i niedźwiedziach!</>
            ) : (
              <>Goliat podszedł za blisko. Rzucaj szybciej — i celuj w czoło!</>
            )}
          </StageOverlay>
        )}
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {fresh?.text ?? ""}
      </p>

      <div className="flex flex-col items-center gap-2 rounded-card bg-surface p-4 text-center shadow-card sm:flex-row sm:justify-between sm:text-left">
        <p className="font-bold text-navy">
          {s.phase !== "playing"
            ? "Najpierw stuknij, by zatrzymać kąt, potem — by zatrzymać siłę."
            : s.stone
              ? "Kamień leci…"
              : s.aimStage === "angle"
                ? `Krok 1: zatrzymaj kąt (${Math.round(s.aim.angle)}°)`
                : `Krok 2: zatrzymaj siłę (${Math.round(s.aim.power * 100)}%)`}
        </p>
        <Button
          size="lg"
          onClick={doTap}
          disabled={!canThrow}
          leftIcon={<Icon name={s.aimStage === "angle" ? "check" : "arrowUpRight"} size={20} />}
        >
          {s.aimStage === "angle" ? "Stop — kąt!" : "Stop — rzut!"}
        </Button>
      </div>
    </div>
  );
}
