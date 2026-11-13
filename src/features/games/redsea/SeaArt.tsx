/** SVG pieces of the Red Sea run. */
import { RH, RW, WALL_L, WALL_R } from "./engine";

function wallPath(side: "l" | "r", d: number, inset = 0) {
  const pts: string[] = [];
  for (let y = -20; y <= RH + 20; y += 20) {
    const wave = Math.sin((y + d) / 28) * 6 + Math.sin((y + d) / 11) * 2;
    pts.push(`${side === "l" ? WALL_L - inset + wave : WALL_R + inset - wave} ${y}`);
  }
  const edge = side === "l" ? 0 : RW;
  return `M${edge} -20 L${pts.join(" L")} L${edge} ${RH + 20} Z`;
}

export function SeaWalls({ d }: { d: number }) {
  return (
    <g aria-hidden="true">
      <rect x={WALL_L - 10} width={WALL_R - WALL_L + 20} height={RH} className="fill-logo-yellow" />
      <rect x={WALL_L - 10} width={WALL_R - WALL_L + 20} height={RH} className="fill-surface/45" />
      {Array.from({ length: 9 }, (_, i) => {
        const y = ((i * 83 + d) % (RH + 60)) - 30;
        return (
          <path
            key={i}
            d={`M${110 + (i % 3) * 50} ${y} q8 -5 16 0 t16 0`}
            className="fill-none stroke-logo-orange/40"
            strokeWidth={2}
            strokeLinecap="round"
          />
        );
      })}
      {(["l", "r"] as const).map((side) => (
        <g key={side}>
          <path d={wallPath(side, d)} className="fill-logo-blue" />
          <path d={wallPath(side, d * 1.3, 14)} className="fill-navy-600/60" />
          <path d={wallPath(side, d)} className="fill-none stroke-surface/80" strokeWidth={3} />
        </g>
      ))}
      {Array.from({ length: 6 }, (_, i) => {
        const y = ((i * 131 + d * 0.9) % (RH + 80)) - 40;
        const left = i % 2 === 0;
        return (
          <text key={i} x={left ? 18 + (i % 3) * 14 : RW - 52 + (i % 3) * 8} y={y} fontSize={22}>
            {["🐟", "🐠", "🐡"][i % 3]}
          </text>
        );
      })}
    </g>
  );
}

export function FarShore({ y }: { y: number }) {
  if (y < -10) return null;
  return (
    <g aria-hidden="true">
      <path d={`M0 -10 H${RW} V${y} Q${RW / 2} ${y + 16} 0 ${y} Z`} className="fill-logo-yellow" />
      <text x={24} y={y - 26} fontSize={30}>
        🌴
      </text>
      <text x={RW - 62} y={y - 40} fontSize={26}>
        🐪
      </text>
      <g transform={`translate(${RW / 2 + 50} ${y - 58})`}>
        <rect
          x={-36}
          y={-16}
          width={72}
          height={24}
          rx={5}
          className="fill-surface stroke-navy"
          strokeWidth={2}
        />
        <text y={1} textAnchor="middle" fontSize={12} fontWeight={800} className="fill-navy">
          WOLNOŚĆ!
        </text>
        <path d="M0 8 V30" className="stroke-navy" strokeWidth={3} />
      </g>
    </g>
  );
}

export function Moses({ stretching }: { stretching: boolean }) {
  return (
    <g className="stroke-navy" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round">
      <ellipse cx={0} cy={8} rx={14} ry={19} className="fill-logo-orange" />
      <path d="M-14 4 Q0 12 14 4" className="fill-none stroke-logo-yellow" strokeWidth={4} />
      <circle cx={0} cy={-16} r={10} className="fill-accent-soft" />
      <path d="M-9 -14 Q0 6 9 -14 Q0 -8 -9 -14 Z" className="fill-surface" />
      <path d="M-11 -20 Q0 -32 11 -20" className="fill-ink-subtle" />
      {stretching ? (
        <path d="M12 -2 L30 -26 M30 -26 L44 -52" className="stroke-logo-dark" strokeWidth={4} />
      ) : (
        <path d="M17 -30 L15 24" className="stroke-logo-dark" strokeWidth={4} />
      )}
    </g>
  );
}

function Horse({ x, t }: { x: number; t: number }) {
  const a = Math.sin(t) * 5;
  const b = Math.sin(t + Math.PI) * 5;
  return (
    <g className="stroke-navy" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      {/* galloping legs (front pair and hind pair move in opposite phase) */}
      <path
        d={`M${x - 5} -34 l-3 ${-6 - a} M${x + 5} -34 l3 ${-6 - b} M${x - 5} -18 l-3 ${6 + b} M${x + 5} -18 l3 ${6 + a}`}
        strokeWidth={2.4}
        className="fill-none stroke-logo-dark"
      />
      <path d={`M${x} -13 q${a * 0.8} 6 ${-a * 0.4} 12`} className="fill-none" strokeWidth={3} />
      <ellipse cx={x} cy={-26} rx={7} ry={13} className="fill-accent-ink" />
      <ellipse cx={x} cy={-45} rx={4.6} ry={8} className="fill-accent-ink" />
      <path d={`M${x} -37 V-50`} className="fill-none" strokeWidth={2.6} />
      <path
        d={`M${x - 3.5} -50 l-1.5 -5 l3 2 Z M${x + 3.5} -50 l1.5 -5 l-3 2 Z`}
        className="fill-accent-ink"
      />
      <ellipse cx={x} cy={-52} rx={2.6} ry={1.6} className="fill-logo-dark" strokeWidth={0} />
    </g>
  );
}

function Wheel({ x, t }: { x: number; t: number }) {
  return (
    <g transform={`translate(${x} 9) rotate(${(t * 40) % 360})`} className="stroke-navy">
      <circle r={8} className="fill-logo-yellow" strokeWidth={2.2} />
      <path d="M-8 0 H8 M0 -8 V8 M-5.7 -5.7 L5.7 5.7 M-5.7 5.7 L5.7 -5.7" strokeWidth={1.4} />
      <circle r={2} className="fill-navy" />
    </g>
  );
}

/** Top-down cartoon war chariot: two galloping horses, yoke, gold car with spoked wheels, driver with whip. */
export function Chariot({ t = 0 }: { t?: number }) {
  const whip = Math.sin(t * 0.7) * 6;
  return (
    <g>
      <Horse x={-10} t={t} />
      <Horse x={10} t={t + 0.9} />
      <g className="fill-none stroke-navy" strokeLinecap="round">
        <path d="M-17 -36 H17" strokeWidth={3} className="stroke-logo-yellow" />
        <path d="M0 -36 V-4" strokeWidth={3} />
        <path d="M-3 -2 L-10 -46 M3 -2 L10 -46" strokeWidth={1} />
      </g>
      <path d="M-20 9 H20" className="stroke-navy" strokeWidth={3} />
      <Wheel x={-20} t={t} />
      <Wheel x={20} t={t} />
      <path
        d="M-13 12 V2 Q-13 -7 0 -7 Q13 -7 13 2 V12 Z"
        className="fill-logo-yellow stroke-navy"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <path d="M-9 0 H9" className="stroke-logo-red" strokeWidth={2} />
      {/* driver seen from above: nemes headdress with stripes */}
      <path
        d="M-7 7 Q-8 -1 0 -2 Q8 -1 7 7 L5 11 H-5 Z"
        className="fill-logo-blue stroke-navy"
        strokeWidth={1.5}
      />
      <path d="M-5 4 H5 M-6 7 H6" className="stroke-logo-yellow" strokeWidth={1.4} />
      <circle cx={0} cy={3} r={3.4} className="fill-accent-soft stroke-navy" strokeWidth={1.2} />
      <path
        d={`M6 4 L15 -6 q${6 + whip} -8 ${2 + whip} -20`}
        className="fill-none stroke-logo-dark"
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </g>
  );
}
