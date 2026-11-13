import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { cn } from "@/lib/cn";
import { Button, Icon } from "@/ui";
import { StageOverlay } from "../components/StageOverlay";
import { higherIsBetter, useBestScore } from "../useBestScore";
import { useGameLoop } from "../useGameLoop";
import {
  GROUND,
  H,
  SLING,
  STONES,
  TAUNTS,
  W,
  createDavid,
  distanceSteps,
  previewPath,
  setAim,
  startDavid,
  stepDavid,
  throwStone,
  type DavidState,
} from "./engine";
import { DavidFigure, GoliathFigure, Scenery } from "./Figures";
import { AimControls } from "./AimControls";

const MAX_PULL = 170;

export function DavidGame() {
  const [s, setS] = useState<DavidState>(createDavid);
  const [pull, setPull] = useState<{ x: number; y: number } | null>(null);
  const [record, setRecord] = useState(false);
  const anchor = useRef<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const best = useBestScore("dawid-i-goliat", higherIsBetter);

  useGameLoop(
    (dt) => {
      const n = stepDavid(s, dt);
      if (n.phase === "won" && s.phase !== "won") setRecord(best.submit(n.stonesLeft));
      setS(n);
    },
    s.phase === "playing" || (s.phase === "won" && s.fall < 1),
  );

  const start = () => {
    setS(startDavid());
    setRecord(false);
    stageRef.current?.focus({ preventScroll: true });
    stageRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  };
  const canThrow = s.phase === "playing" && !s.stone && s.stonesLeft > 0;
  const doThrow = () => setS((x) => throwStone(x));
  const aim = (angle: number, power: number) => setS((x) => setAim(x, angle, power));

  const toSvg = (e: PointerEvent) => {
    const svg = svgRef.current;
    const m = svg?.getScreenCTM();
    if (!svg || !m) return { x: 0, y: 0 };
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  };
  const onDown = (e: PointerEvent<SVGSVGElement>) => {
    if (!canThrow) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    anchor.current = toSvg(e);
  };
  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    if (!anchor.current) return;
    const p = toSvg(e);
    const dx = anchor.current.x - p.x;
    const dy = anchor.current.y - p.y;
    const len = Math.min(MAX_PULL, Math.hypot(dx, dy));
    if (len < 6) return;
    aim((Math.atan2(-dy, dx) * 180) / Math.PI, len / MAX_PULL);
    setPull({ x: (-dx / Math.hypot(dx, dy)) * len, y: (-dy / Math.hypot(dx, dy)) * len });
  };
  const onUp = () => {
    if (anchor.current && pull && Math.hypot(pull.x, pull.y) > 18) doThrow();
    anchor.current = null;
    setPull(null);
  };

  const onKey = (e: KeyboardEvent) => {
    const map: Record<string, () => void> = {
      ArrowUp: () => aim(s.aim.angle + 2, s.aim.power),
      ArrowDown: () => aim(s.aim.angle - 2, s.aim.power),
      ArrowRight: () => aim(s.aim.angle, s.aim.power + 0.03),
      ArrowLeft: () => aim(s.aim.angle, s.aim.power - 0.03),
      " ": () => (s.phase === "playing" ? doThrow() : start()),
      Enter: () => (s.phase === "playing" ? doThrow() : start()),
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
        aria-label="Plansza gry Dawid i Goliat. Strzałki góra/dół zmieniają kąt, lewo/prawo siłę, Spacja rzuca kamień."
        onKeyDown={onKey}
        className="relative aspect-square overflow-hidden rounded-card bg-accent-soft shadow-card select-none sm:aspect-video"
      >
        {/* eslint-enable jsx-a11y/no-noninteractive-tabindex, jsx-a11y/no-noninteractive-element-interactions */}
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="block size-full touch-none"
          preserveAspectRatio="xMidYMax meet"
          aria-hidden="true"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        >
          <Scenery />
          <text x={34} y={398} fontSize={38}>
            🐑
          </text>
          <g transform={`translate(${SLING.x - 22} ${GROUND})`}>
            <DavidFigure aiming={canThrow} angle={s.aim.angle} />
          </g>
          {canThrow &&
            previewPath(s.aim).map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={4 - i * 0.3} className="fill-navy/60" />
            ))}
          {pull && (
            <path
              d={`M${SLING.x} ${SLING.y} l${pull.x * 0.35} ${pull.y * 0.35}`}
              className="stroke-logo-dark"
              strokeWidth={3}
              strokeDasharray="6 5"
            />
          )}
          <g
            transform={`translate(${s.goliathX} ${GROUND}) rotate(${-s.fall * 84}) translate(0 ${
              s.phase === "playing" ? Math.abs(Math.sin(s.time * 5)) * -4 : 0
            })`}
          >
            <GoliathFigure dizzy={s.phase === "won"} />
          </g>
          {s.phase === "won" && (
            <text x={s.goliathX - 260 * s.fall} y={GROUND - 40 - 30 * s.fall} fontSize={34}>
              💫
            </text>
          )}
          {s.stone && (
            <circle
              cx={s.stone.x}
              cy={s.stone.y}
              r={7}
              className="fill-ink-muted stroke-navy"
              strokeWidth={2}
            />
          )}
        </svg>

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

      <AimControls
        angle={s.aim.angle}
        power={s.aim.power}
        onChange={aim}
        disabled={s.phase !== "playing"}
      >
        <Button
          onClick={doThrow}
          disabled={!canThrow}
          leftIcon={<Icon name="arrowUpRight" size={18} />}
        >
          Rzuć kamień!
        </Button>
      </AimControls>
    </div>
  );
}
