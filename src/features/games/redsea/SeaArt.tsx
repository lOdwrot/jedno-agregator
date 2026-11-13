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

export function Chariot() {
  return (
    <g className="stroke-navy" strokeWidth={2} strokeLinejoin="round">
      <text x={-17} y={-2} fontSize={26} stroke="none">
        🐎
      </text>
      <rect x={-15} y={4} width={30} height={20} rx={5} className="fill-logo-yellow" />
      <circle cx={-15} cy={22} r={5} className="fill-logo-dark" />
      <circle cx={15} cy={22} r={5} className="fill-logo-dark" />
      <circle cx={0} cy={4} r={7} className="fill-accent-soft" />
      <path d="M-9 4 Q0 -10 9 4 L11 12 L-11 12 Z" className="fill-logo-blue" />
    </g>
  );
}
