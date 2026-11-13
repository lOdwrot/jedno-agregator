import { MAX_ANGLE, MIN_ANGLE, SLING, type DavidState } from "./engine";

const R = 86;
const point = (deg: number, r = R) => {
  const rad = (deg * Math.PI) / 180;
  return { x: SLING.x + Math.cos(rad) * r, y: SLING.y - Math.sin(rad) * r };
};

const METER = { x: 26, y: 196, width: 22, height: 132 };

/** FIFA-penalty style gauges: a swinging angle arrow, then a pumping power bar. */
export function AimGauges({ s }: { s: DavidState }) {
  if (s.phase !== "playing" || s.stone) return null;
  const from = point(MIN_ANGLE);
  const to = point(MAX_ANGLE);
  const tip = point(s.aim.angle);
  const base = point(s.aim.angle, 22);
  const head1 = point(s.aim.angle - 7, R - 16);
  const head2 = point(s.aim.angle + 7, R - 16);
  const swingingAngle = s.aimStage === "angle";
  const fillH = METER.height * s.aim.power;

  return (
    <g aria-hidden="true">
      <path
        d={`M${from.x} ${from.y} A${R} ${R} 0 0 0 ${to.x} ${to.y}`}
        className="fill-none stroke-navy/25"
        strokeWidth={10}
        strokeLinecap="round"
      />
      <g className={swingingAngle ? "fill-logo-red stroke-logo-red" : "fill-navy stroke-navy"}>
        <path d={`M${base.x} ${base.y} L${tip.x} ${tip.y}`} strokeWidth={5} strokeLinecap="round" />
        <path
          d={`M${tip.x} ${tip.y} L${head1.x} ${head1.y} L${head2.x} ${head2.y} Z`}
          strokeWidth={2}
          strokeLinejoin="round"
        />
      </g>

      {!swingingAngle && (
        <g>
          <text
            x={METER.x + METER.width / 2}
            y={METER.y - 10}
            textAnchor="middle"
            fontSize={14}
            fontWeight={800}
            className="fill-navy"
          >
            SIŁA
          </text>
          <rect {...METER} rx={8} className="fill-surface stroke-navy" strokeWidth={3} />
          <rect
            x={METER.x + 3}
            y={METER.y + METER.height - fillH}
            width={METER.width - 6}
            height={Math.max(0, fillH - 3)}
            rx={5}
            className={
              s.aim.power > 0.75
                ? "fill-logo-red"
                : s.aim.power > 0.4
                  ? "fill-logo-orange"
                  : "fill-logo-yellow"
            }
          />
        </g>
      )}
    </g>
  );
}
