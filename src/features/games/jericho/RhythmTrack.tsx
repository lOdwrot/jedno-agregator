import { BEAT, type JerichoState } from "./engine";

export const TRACK_Y = 415;
export const TARGET_X = 90;
const SPEED = 300;

/** Notes slide from right to the target ring; blow when a note sits in the ring. */
export function RhythmTrack({ s }: { s: JerichoState }) {
  const firstBeat = Math.floor(s.time / BEAT);
  return (
    <g aria-hidden="true">
      <rect y={370} width={800} height={90} className="fill-navy" />
      {Array.from({ length: 10 }, (_, i) => {
        const x = TARGET_X + ((firstBeat + i) * BEAT - s.time) * SPEED;
        return x > 0 && x < 800 ? (
          <path
            key={firstBeat + i}
            d={`M${x} 386 V444`}
            className="stroke-white/15"
            strokeWidth={2}
          />
        ) : null;
      })}
      <circle
        cx={0}
        cy={0}
        r={30}
        transform={`translate(${TARGET_X} ${TRACK_Y}) scale(${1 + 0.12 * Math.max(0, 1 - ((s.time / BEAT) % 1) * 4)})`}
        className="fill-white/10 stroke-logo-yellow"
        strokeWidth={4}
      />
      {s.notes.map((n) => {
        const x = TARGET_X + (n.t - s.time) * SPEED;
        if (x < -40 || x > 840) return null;
        if (n.result === "perfect" || n.result === "good") {
          const age = s.time - n.t;
          if (age > 0.25) return null;
          return (
            <circle
              key={n.id}
              cx={TARGET_X}
              cy={TRACK_Y}
              r={30 + age * 120}
              className="fill-none stroke-logo-yellow"
              strokeWidth={4}
              opacity={1 - age * 4}
            />
          );
        }
        const shout = n.kind === "shout";
        return (
          <g key={n.id} opacity={n.result === "miss" ? 0.35 : 1}>
            <circle
              cx={x}
              cy={TRACK_Y}
              r={shout ? 28 : 22}
              className={shout ? "fill-logo-red stroke-white" : "fill-logo-orange stroke-white"}
              strokeWidth={3}
            />
            <text
              x={x}
              y={TRACK_Y + 1}
              fontSize={shout ? 26 : 20}
              textAnchor="middle"
              dominantBaseline="central"
            >
              {shout ? "📣" : "🎺"}
            </text>
          </g>
        );
      })}
    </g>
  );
}
