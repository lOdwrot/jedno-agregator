import { Particles } from "../fx/Particles";
import type { Fx } from "../fx/useFx";
import { AimGauges } from "./AimGauges";
import { GROUND, H, SLING, W, type DavidState } from "./engine";
import { DavidFigure, GoliathFigure, Scenery } from "./Figures";

interface DavidStageProps {
  s: DavidState;
  fx: Fx[];
  /** Game time of the last non-lethal hit on Goliath (for his wobble). */
  hitAt: number | null;
  onTap: () => void;
}

/** SVG world of "Dawid i Goliat" (decorative; status is announced by the game). */
export function DavidStage({ s, fx, hitAt, onTap }: DavidStageProps) {
  const canThrow = s.phase === "playing" && !s.stone && s.stonesLeft > 0;
  const since = hitAt === null ? 1 : s.time - hitAt;
  const wobble = since < 0.7 ? Math.sin(since * 28) * 7 * (1 - since / 0.7) : 0;
  const walk = s.phase === "playing" ? Math.abs(Math.sin(s.time * 5)) * -4 : 0;
  const cheer = s.phase === "won" ? -Math.abs(Math.sin(s.time * 9)) * 16 : 0;
  // sling pouch whirls faster as the power grows
  const whirl = s.time * (7 + s.aim.power * 16);
  const pouch = { x: SLING.x + Math.cos(whirl) * 18, y: SLING.y - 30 + Math.sin(whirl) * 8 };

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="block size-full touch-none"
      preserveAspectRatio="xMidYMax meet"
      aria-hidden="true"
      onPointerDown={(e) => {
        if (s.phase !== "playing") return;
        e.preventDefault();
        onTap();
      }}
    >
      <Scenery />
      <text x={34} y={398 + cheer * 0.6} fontSize={38}>
        🐑
      </text>
      <g transform={`translate(${SLING.x - 22} ${GROUND + cheer})`}>
        <DavidFigure aiming={canThrow} angle={s.aim.angle} />
      </g>
      {canThrow && s.aimStage === "power" && (
        <g>
          <path
            d={`M${SLING.x} ${SLING.y - 26} L${pouch.x} ${pouch.y}`}
            className="stroke-ink-muted"
            strokeWidth={2}
          />
          <circle
            cx={pouch.x}
            cy={pouch.y}
            r={6}
            className="fill-ink-muted stroke-navy"
            strokeWidth={2}
          />
        </g>
      )}
      <AimGauges s={s} />
      <g
        transform={`translate(${s.goliathX} ${GROUND}) rotate(${-s.fall * 84 + wobble}) translate(0 ${walk})`}
      >
        <GoliathFigure dizzy={s.phase === "won" || since < 0.7} />
      </g>
      {s.phase === "won" &&
        [0, 1, 2].map((i) => {
          const a = s.time * 4 + (i * Math.PI * 2) / 3;
          const cx = s.goliathX - 230 * s.fall + Math.cos(a) * 30;
          const cy = GROUND - 210 * (1 - s.fall) - 30 + Math.sin(a) * 10;
          return (
            <text key={i} x={cx} y={cy} fontSize={22} textAnchor="middle">
              ⭐
            </text>
          );
        })}
      {s.stone && (
        <g>
          {[3, 2, 1].map((k) => (
            <circle
              key={k}
              cx={s.stone!.x - s.stone!.vx * 0.022 * k}
              cy={s.stone!.y - s.stone!.vy * 0.022 * k}
              r={7 - k * 1.5}
              className="fill-ink-muted"
              opacity={0.45 - k * 0.12}
            />
          ))}
          <g transform={`translate(${s.stone.x} ${s.stone.y}) rotate(${s.time * 900})`}>
            <circle r={7} className="fill-ink-muted stroke-navy" strokeWidth={2} />
            <path
              d="M-3 -3 L2 -1"
              className="stroke-surface"
              strokeWidth={2}
              strokeLinecap="round"
            />
          </g>
        </g>
      )}
      <Particles items={fx} time={s.time} />
    </svg>
  );
}
