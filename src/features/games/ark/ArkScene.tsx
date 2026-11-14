import { animal, type AnimalId } from "./engine";

const RAINBOW = [
  "stroke-logo-red",
  "stroke-logo-orange",
  "stroke-logo-yellow",
  "stroke-success",
  "stroke-logo-blue",
];

/** The Ark with matched animals in its windows; rain until the last pair, then a rainbow. */
export function ArkScene({
  animals,
  matched,
  won,
}: {
  animals: AnimalId[];
  matched: AnimalId[];
  won: boolean;
}) {
  const perRow = Math.ceil(animals.length / Math.ceil(animals.length / 9));
  const rows = Math.ceil(animals.length / perRow);
  const cabinTop = rows > 1 ? 50 : 62;
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
              className={`fill-none ${c} origin-center [transform-box:fill-box] motion-safe:animate-[game-pop-in_0.8s_var(--ease-spring)_both]`}
              style={{ animationDelay: `${i * 0.12}s` }}
              strokeWidth={9}
            />
          ))}
        {won && (
          <text
            x={300}
            y={50}
            fontSize={30}
            className="motion-safe:animate-[game-fly_1.6s_var(--ease-out-expo)_0.7s_both]"
          >
            🕊️
          </text>
        )}
        <g className="origin-center [transform-box:fill-box] motion-safe:animate-[game-bob_3.2s_ease-in-out_infinite]">
          <g className="stroke-navy" strokeWidth={3} strokeLinejoin="round">
            <rect
              x={104}
              y={cabinTop}
              width={192}
              height={112 - cabinTop}
              rx={6}
              className="fill-logo-yellow"
            />
            <path
              d={`M94 ${cabinTop + 4} L200 ${cabinTop - 34} L306 ${cabinTop + 4} Z`}
              className="fill-logo-red"
            />
            <path d="M50 108 H350 L318 150 H82 Z" className="fill-logo-orange" />
            <path d="M70 124 H330" className="fill-none" strokeWidth={2} />
          </g>
          {animals.map((id, i) => {
            const row = Math.floor(i / perRow);
            const inRow = Math.min(perRow, animals.length - row * perRow);
            const x = 200 - (inRow * 21) / 2 + (i % perRow) * 21 + 1.5;
            const y = cabinTop + 10 + row * 27;
            return (
              <g key={id}>
                <rect
                  x={x}
                  y={y}
                  width={18}
                  height={22}
                  rx={4}
                  className="fill-surface stroke-navy"
                  strokeWidth={2}
                />
                {matched.includes(id) && (
                  <text
                    x={x + 9}
                    y={y + 16}
                    fontSize={14}
                    textAnchor="middle"
                    className="origin-center [transform-box:fill-box] motion-safe:animate-[game-pop-in_0.6s_var(--ease-spring)_both]"
                  >
                    {animal(id).emoji}
                  </text>
                )}
              </g>
            );
          })}
        </g>
        <path
          d="M0 150 Q25 140 50 150 T100 150 T150 150 T200 150 T250 150 T300 150 T350 150 T400 150 T450 150 T500 150 V170 H0 Z"
          className="fill-logo-blue motion-safe:animate-[game-wave_3s_linear_infinite]"
        />
      </svg>
    </div>
  );
}
