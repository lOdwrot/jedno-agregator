import { useEffect, useRef, useState, type PointerEvent } from "react";
import { cn } from "@/lib/cn";
import { Button, Icon, IconButton } from "@/ui";
import { StageOverlay } from "../components/StageOverlay";
import { higherIsBetter, useBestScore } from "../useBestScore";
import { useGameLoop } from "../useGameLoop";
import {
  GOAL,
  LANES,
  MAX_GAP,
  createRedSea,
  moveLane,
  startRedSea,
  stepRedSea,
  stretchHand,
  type RedSeaState,
} from "./engine";
import { Meter } from "./Meter";
import { RedSeaStage } from "./RedSeaStage";
import { useRedSeaReactions } from "./useRedSeaReactions";
import { sfx } from "../audio/sfx";
import { useFx } from "../fx/useFx";

const ACTIVE = new Set(["running", "shore", "flood"]);

export function RedSeaGame() {
  const [s, setS] = useState<RedSeaState>(() => createRedSea());
  const [record, setRecord] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const best = useBestScore("morze-czerwone", higherIsBetter);
  const active = ACTIVE.has(s.phase);
  const fx = useFx();
  const react = useRedSeaReactions(stageRef, fx.spawn);

  useGameLoop((dt) => {
    const n = stepRedSea(s, dt);
    react(s, n);
    if (n.phase === "won" && s.phase !== "won") setRecord(best.submit(n.sheep));
    setS(n);
  }, active);

  const start = () => {
    sfx.unlock();
    fx.clear();
    setS(startRedSea());
    setRecord(false);
    stageRef.current?.focus({ preventScroll: true });
    stageRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  };
  const turn = (dir: -1 | 1) => {
    if (moveLane(s, dir).lane !== s.lane) sfx.swish();
    setS((x) => moveLane(x, dir));
  };
  const left = () => turn(-1);
  const right = () => turn(1);
  const stretch = () => setS((x) => stretchHand(x));

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      const interactive =
        e.target instanceof Element && e.target.closest("button, a, input, select, textarea");
      const k = e.key.toLowerCase();
      if (k === "arrowleft" || k === "a") left();
      else if (k === "arrowright" || k === "d") right();
      else if ((k === " " || k === "enter" || k === "arrowup" || k === "w") && !interactive)
        stretch();
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const onTap = (e: PointerEvent<HTMLDivElement>) => {
    if (s.phase === "shore") return stretch();
    if (s.phase !== "running") return;
    const r = e.currentTarget.getBoundingClientRect();
    if (e.clientX - r.left < r.width / 2) left();
    else right();
  };

  const fresh = s.feedback && s.time - s.feedback.at < 1.6 ? s.feedback : null;
  const progress = Math.round((Math.min(s.d, GOAL) / GOAL) * 100);
  const danger = s.gap < 90;

  return (
    <div className="grid gap-5 lg:grid-cols-[auto_1fr] lg:items-start">
      {/* Game stage is a focusable keyboard target (role=application), like a canvas game. */}
      {/* eslint-disable jsx-a11y/no-noninteractive-tabindex */}
      <div
        ref={stageRef}
        tabIndex={0}
        role="application"
        aria-roledescription="gra"
        aria-label="Plansza gry Przez Morze Czerwone. Strzałki lewo/prawo zmieniają tor, Spacja wyciąga rękę nad morze."
        onPointerDown={onTap}
        className="relative mx-auto aspect-[9/16] w-full max-w-[min(100%,calc(70svh*9/16))] touch-manipulation overflow-hidden rounded-card bg-logo-blue shadow-card select-none"
      >
        {/* eslint-enable jsx-a11y/no-noninteractive-tabindex */}
        <RedSeaStage s={s} fx={fx.items} />

        {fresh && (
          <p
            aria-hidden="true"
            className={cn(
              "absolute inset-x-3 top-3 rounded-card border-2 bg-surface px-3 py-2 text-center text-sm font-bold shadow-card",
              fresh.good ? "border-success text-success" : "border-navy text-navy",
            )}
          >
            {fresh.text}
          </p>
        )}
        {s.phase === "running" && danger && !fresh && (
          <p
            aria-hidden="true"
            className="absolute inset-x-6 bottom-3 rounded-card bg-navy px-3 py-1.5 text-center text-sm font-bold text-white"
          >
            „Stać! Kto będzie lepił cegły?!” 🏺
          </p>
        )}
        {s.phase === "shore" && (
          <div className="absolute inset-x-3 bottom-4 flex justify-center">
            <Button
              size="lg"
              onClick={stretch}
              onPointerDown={(e) => e.stopPropagation()}
              className="animate-pulse motion-reduce:animate-none"
            >
              Wyciągnij rękę nad morze! ✋
            </Button>
          </div>
        )}

        {s.phase === "intro" && (
          <StageOverlay
            emoji="🌊🏃🐎"
            title="Faraon zmienił zdanie!"
            actionLabel="Uciekamy!"
            onAction={start}
            footer={best.best !== null ? `Rekord: ${best.best} uratowanych owiec` : undefined}
          >
            Morze się rozstąpiło, a rydwany już pędzą. Omijaj kraby i kamienie, zbieraj zabłąkane
            owce, a na drugim brzegu wyciągnij rękę nad morze.
          </StageOverlay>
        )}
        {(s.phase === "won" || s.phase === "lost") && (
          <StageOverlay
            emoji={s.phase === "won" ? "🎉🌊" : "🧱"}
            title={s.phase === "won" ? "Lud jest wolny!" : "Złapali Cię…"}
            celebrate={s.phase === "won"}
            actionLabel="Jeszcze raz"
            onAction={start}
            footer={
              s.phase === "won"
                ? record
                  ? "Nowy rekord owiec! 🎉"
                  : best.best !== null
                    ? `Rekord: ${best.best} owiec`
                    : undefined
                : undefined
            }
          >
            {s.phase === "won" ? (
              <>
                Morze się zamknęło, a rydwany faraona odkryły, że nie umieją pływać. Uratowane owce:{" "}
                <strong>{s.sheep}</strong>.
              </>
            ) : (
              <>Wracasz lepić cegły w Egipcie. Ale Pan daje drugą szansę — spróbuj jeszcze raz!</>
            )}
          </StageOverlay>
        )}
      </div>

      <div className="flex flex-col gap-4 lg:max-w-sm">
        <div className="rounded-card bg-surface p-4 shadow-card">
          <Meter label="Droga do brzegu" value={progress} tone="bg-success" text={`${progress}%`} />
          <Meter
            label="Odległość od rydwanów"
            value={Math.round((Math.max(0, s.gap) / MAX_GAP) * 100)}
            tone={danger ? "bg-danger" : "bg-logo-blue"}
            text={danger ? "Blisko!" : "Bezpiecznie"}
          />
          <p className="mt-3 text-sm font-bold text-navy">Owce: {s.sheep} 🐑</p>
        </div>
        <div className="flex items-center justify-center gap-4 rounded-card bg-surface p-3 shadow-card">
          <IconButton
            label="Tor w lewo"
            size="lg"
            variant="navy"
            onClick={left}
            disabled={s.phase !== "running" || s.lane === 0}
          >
            <Icon name="chevronLeft" size={28} />
          </IconButton>
          <Button variant="soft" onClick={stretch} disabled={s.phase !== "shore"}>
            Ręka nad morze
          </Button>
          <IconButton
            label="Tor w prawo"
            size="lg"
            variant="navy"
            onClick={right}
            disabled={s.phase !== "running" || s.lane === LANES.length - 1}
          >
            <Icon name="chevronRight" size={28} />
          </IconButton>
        </div>
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {fresh?.text ?? ""}
      </p>
    </div>
  );
}
