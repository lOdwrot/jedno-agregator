/** Building blocks of the tale scenes (400 × 300 SVG; keep the important things in x 110–290, y 30–165). */
import type { CSSProperties, ReactNode } from "react";
import { anim } from "./anim";
import { cn } from "@/lib/cn";

export function Sky({ className }: { className: string }) {
  return <rect width="400" height="300" className={className} />;
}

export function Ground({ className, y = 150, d }: { className: string; y?: number; d?: string }) {
  return (
    <path d={d ?? `M0 ${y} Q100 ${y - 18} 200 ${y} T400 ${y} V300 H0 Z`} className={className} />
  );
}

export function Cloud({
  x,
  y,
  s = 1,
  delay = 0,
}: {
  x: number;
  y: number;
  s?: number;
  delay?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g style={anim("tale-drift 7s ease-in-out infinite alternate", delay)}>
        <ellipse cx="0" cy="0" rx="30" ry="12" className="fill-surface opacity-90" />
        <ellipse cx="-14" cy="-8" rx="16" ry="12" className="fill-surface opacity-90" />
        <ellipse cx="12" cy="-10" rx="18" ry="14" className="fill-surface opacity-90" />
      </g>
    </g>
  );
}

export function Sheep({
  x,
  y,
  s = 1,
  delay = 0,
  flip,
}: {
  x: number;
  y: number;
  s?: number;
  delay?: number;
  flip?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <g style={anim("tale-walk-in 2.4s var(--ease-out-expo) both", delay)}>
        <g style={anim("tale-hop 0.9s ease-in-out infinite", delay)}>
          <rect x="-12" y="4" width="4" height="12" rx="2" className="fill-navy" />
          <rect x="6" y="4" width="4" height="12" rx="2" className="fill-navy" />
          <ellipse cx="0" cy="0" rx="18" ry="12" className="fill-surface" />
          <circle cx="-10" cy="-6" r="7" className="fill-surface" />
          <circle cx="8" cy="-7" r="8" className="fill-surface" />
          <g className="tb" style={anim("tale-bob 2.2s ease-in-out infinite", delay + 0.5)}>
            <ellipse cx="19" cy="2" rx="6" ry="8" className="fill-navy" />
            <circle cx="21" cy="0" r="1.2" className="fill-surface" />
          </g>
        </g>
      </g>
    </g>
  );
}

export function Bird({
  x,
  y,
  s = 1,
  delay = 0,
  fly = true,
  className = "stroke-navy",
}: {
  x: number;
  y: number;
  s?: number;
  delay?: number;
  fly?: boolean;
  className?: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g style={fly ? anim("tale-fly-in 2.6s var(--ease-out-expo) both", delay) : undefined}>
        <g style={anim("tale-float 3s ease-in-out infinite", delay)}>
          <path
            d="M-10 0 Q-5 -7 0 0 Q5 -7 10 0"
            className={cn("tb fill-none", className)}
            strokeWidth="2.5"
            strokeLinecap="round"
            style={anim("tale-flap 0.5s ease-in-out infinite", delay)}
          />
        </g>
      </g>
    </g>
  );
}

/** A simple figure in a long robe; `head` is the skin/veil colour class. */
export function Person({
  x,
  y,
  s = 1,
  robe,
  head = "fill-tale-dawn",
  veil,
  children,
}: {
  x: number;
  y: number;
  s?: number;
  robe: string;
  head?: string;
  veil?: string;
  children?: ReactNode;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-14 40 Q-12 6 0 2 Q12 6 14 40 Z" className={robe} />
      <circle cx="0" cy="-6" r="9" className={head} />
      {veil && (
        <path
          d="M-11 -4 Q-10 -18 0 -17 Q10 -18 11 -4 Q12 8 14 14 L-14 14 Q-12 8 -11 -4 Z"
          className={veil}
        />
      )}
      {veil && <circle cx="0" cy="-5" r="6.5" className={head} />}
      {children}
    </g>
  );
}

export function Sun({
  x,
  y,
  r = 22,
  className = "fill-logo-yellow",
}: {
  x: number;
  y: number;
  r?: number;
  className?: string;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="tb" style={anim("tale-spin 18s linear infinite")}>
        {Array.from({ length: 12 }, (_, i) => (
          <rect
            key={i}
            x="-2"
            y={-r - 16}
            width="4"
            height="10"
            rx="2"
            className={className}
            transform={`rotate(${i * 30})`}
          />
        ))}
      </g>
      <circle r={r} className={className} />
    </g>
  );
}

export function Stars({ n = 14, seed = 3 }: { n?: number; seed?: number }) {
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const x = ((i * 97 + seed * 31) % 380) + 10;
        const y = ((i * 53 + seed * 17) % 120) + 8;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={i % 3 === 0 ? 2 : 1.3}
            className="fill-gold-100"
            style={anim("tale-twinkle 2.4s ease-in-out infinite", (i % 5) * 0.4)}
          />
        );
      })}
    </g>
  );
}

export function Emoji({
  x,
  y,
  size = 32,
  children,
  style,
}: {
  x: number;
  y: number;
  size?: number;
  children: string;
  style?: CSSProperties;
}) {
  return (
    <text x={x} y={y} fontSize={size} textAnchor="middle" dominantBaseline="central" style={style}>
      {children}
    </text>
  );
}

/** Water that gushes out of the ground at (x, y) with droplets jumping off. */
export function Spring({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path
        d="M-6 0 Q-8 -40 0 -52 Q8 -40 6 0 Z"
        className="tb-bottom fill-river-light"
        style={anim("tale-gush 1.4s var(--ease-spring) both", 0.4)}
      />
      <ellipse
        cx="0"
        cy="4"
        rx="46"
        ry="8"
        className="fill-river"
        style={anim("tale-fade-in 1.2s ease-out both", 0.8)}
      />
      {[-14, -6, 4, 12, 18].map((dx, i) => (
        <circle
          key={dx}
          cx="0"
          cy="-48"
          r="3"
          className="fill-river-light"
          style={anim("tale-drop 1.3s ease-out infinite", 0.6 + i * 0.25, {
            "--dx": `${dx * 2}px`,
          } as CSSProperties)}
        />
      ))}
    </g>
  );
}

export function Candle({ x, y, delay = 0 }: { x: number; y: number; delay?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle
        cy="-14"
        r="9"
        className="fill-logo-yellow opacity-30"
        style={anim("tale-glow 1.6s ease-in-out infinite", delay)}
      />
      <rect x="-2" y="-8" width="4" height="14" className="fill-surface" />
      <path
        d="M0 -20 Q4 -14 0 -9 Q-4 -14 0 -20 Z"
        className="tb-bottom fill-logo-orange"
        style={anim("tale-flicker 0.7s ease-in-out infinite", delay)}
      />
    </g>
  );
}
