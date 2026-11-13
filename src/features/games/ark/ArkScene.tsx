import { ANIMALS, animal, type AnimalId } from "./engine";

const RAINBOW = [
  "stroke-logo-red",
  "stroke-logo-orange",
  "stroke-logo-yellow",
  "stroke-success",
  "stroke-logo-blue",
];

/** The Ark with matched animals in its windows; rain until the last pair, then a rainbow. */
export function ArkScene({ matched, won }: { matched: AnimalId[]; won: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-card bg-logo-blue/25">
      {!won && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          {Array.from({ length: 16 }, (_, i) => (
            <span
              key={i}
              className="absolute top-0 h-4 w-0.5 rounded-full bg-logo-blue motion-safe:animate-[game-rain_0.9s_linear_infinite]"
              style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i % 7) * -0.13}s` }}
            />
          ))}
        </div>
      )}
      <svg viewBox="0 0 400 170" className="relative block w-full" aria-hidden="true">
        {won &&
          RAINBOW.map((c, i) => (
            <path
              key={c}
              d={`M${40 + i * 9} 150 A${160 - i * 9} ${130 - i * 9} 0 0 1 ${360 - i * 9} 150`}
              className={`fill-none ${c}`}
              strokeWidth={9}
            />
          ))}
        {won && (
          <text x={300} y={50} fontSize={30}>
            🕊️
          </text>
        )}
        <g className="stroke-navy" strokeWidth={3} strokeLinejoin="round">
          <rect x={110} y={62} width={180} height={50} rx={6} className="fill-logo-yellow" />
          <path d="M100 66 L200 30 L300 66 Z" className="fill-logo-red" />
          <path d="M50 108 H350 L318 150 H82 Z" className="fill-logo-orange" />
          <path d="M70 124 H330" className="fill-none" strokeWidth={2} />
        </g>
        {ANIMALS.map((a, i) => {
          const x = 122 + i * 21;
          const has = matched.includes(a.id);
          return (
            <g key={a.id}>
              <rect
                x={x}
                y={74}
                width={18}
                height={24}
                rx={4}
                className="fill-surface stroke-navy"
                strokeWidth={2}
              />
              {has && (
                <text x={x + 9} y={92} fontSize={15} textAnchor="middle">
                  {animal(a.id).emoji}
                </text>
              )}
            </g>
          );
        })}
        <path
          d="M0 150 Q25 140 50 150 T100 150 T150 150 T200 150 T250 150 T300 150 T350 150 T400 150 V170 H0 Z"
          className="fill-logo-blue"
        />
      </svg>
    </div>
  );
}
