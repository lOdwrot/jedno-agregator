import { usePrefersReducedMotion } from "@/ui";
import type { Fx } from "./useFx";

/** Deterministic pseudo-random 0..1 from an id and index (stable between frames). */
const rand = (id: number, i: number) => {
  const x = Math.sin(id * 12.9898 + i * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

const STAR = "M0 -6 L1.8 -1.8 L6 0 L1.8 1.8 L0 6 L-1.8 1.8 L-6 0 L-1.8 -1.8 Z";

function Effect({ fx, age }: { fx: Fx; age: number }) {
  const p = age / fx.life;
  const fade = 1 - p;
  const s = fx.scale;
  switch (fx.kind) {
    case "stars":
      return (
        <g>
          {Array.from({ length: 7 }, (_, i) => {
            const a = (i / 7) * Math.PI * 2 + rand(fx.id, i);
            const v = (60 + rand(fx.id, i + 9) * 70) * s;
            const x = fx.x + Math.cos(a) * v * age;
            const y = fx.y + Math.sin(a) * v * age + 160 * age * age;
            return (
              <path
                key={i}
                d={STAR}
                transform={`translate(${x} ${y}) rotate(${age * 400 + i * 40}) scale(${s})`}
                className={fx.tone ?? "fill-logo-yellow"}
                opacity={fade}
              />
            );
          })}
        </g>
      );
    case "burst":
      return (
        <g transform={`translate(${fx.x} ${fx.y}) scale(${s * (0.6 + p * 1.2)})`} opacity={fade}>
          {Array.from({ length: 10 }, (_, i) => (
            <path
              key={i}
              d="M0 -14 V-30"
              transform={`rotate(${i * 36})`}
              className={fx.tone ?? "stroke-logo-yellow"}
              strokeWidth={4}
              strokeLinecap="round"
            />
          ))}
        </g>
      );
    case "dust":
      return (
        <g opacity={fade * 0.85}>
          {Array.from({ length: 5 }, (_, i) => (
            <circle
              key={i}
              cx={0}
              cy={0}
              r={10}
              transform={`translate(${fx.x + (i - 2) * 14 * s * (0.5 + p)} ${
                fx.y - p * 22 * s - rand(fx.id, i) * 8
              }) scale(${s * (0.6 + p * 1.4)})`}
              className={fx.tone ?? "fill-surface"}
            />
          ))}
        </g>
      );
    case "splash":
      return (
        <g>
          {Array.from({ length: 8 }, (_, i) => {
            const a = -Math.PI / 2 + (rand(fx.id, i) - 0.5) * 2.4;
            const v = (90 + rand(fx.id, i + 3) * 90) * s;
            const x = fx.x + Math.cos(a) * v * age;
            const y = fx.y + Math.sin(a) * v * age + 380 * age * age;
            return (
              <circle
                key={i}
                cx={0}
                cy={0}
                r={4}
                transform={`translate(${x} ${y}) scale(${s})`}
                className={fx.tone ?? "fill-logo-blue"}
                opacity={fade}
              />
            );
          })}
        </g>
      );
    case "sparkle":
      return (
        <g>
          {Array.from({ length: 4 }, (_, i) => (
            <path
              key={i}
              d={STAR}
              transform={`translate(${fx.x + (rand(fx.id, i) - 0.5) * 40 * s} ${
                fx.y + (rand(fx.id, i + 5) - 0.5) * 30 * s - p * 10
              }) scale(${s * Math.sin(Math.min(1, p * 1.3) * Math.PI) * 1.3})`}
              className={fx.tone ?? "fill-logo-yellow"}
            />
          ))}
        </g>
      );
    case "text":
      return (
        <text
          x={0}
          y={0}
          transform={`translate(${fx.x} ${fx.y - p * 40}) scale(${s * (p < 0.15 ? 0.6 + p * 2.6 : 1)})`}
          textAnchor="middle"
          fontSize={22}
          fontWeight={800}
          className={fx.tone ?? "fill-navy"}
          opacity={p > 0.7 ? (1 - p) / 0.3 : 1}
          stroke="white"
          strokeWidth={4}
          paintOrder="stroke"
        >
          {fx.text}
        </text>
      );
  }
}

/** Renders the live particle effects. With reduced motion only floating texts are shown. */
export function Particles({ items, time }: { items: Fx[]; time: number }) {
  const reduce = usePrefersReducedMotion();
  return (
    <g aria-hidden="true" pointerEvents="none">
      {items.map((fx) => {
        const age = time - fx.at;
        if (age < 0 || age >= fx.life) return null;
        if (reduce && fx.kind !== "text") return null;
        return <Effect key={fx.id} fx={fx} age={age} />;
      })}
    </g>
  );
}
