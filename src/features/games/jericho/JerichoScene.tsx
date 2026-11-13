/** Jericho, its walls, the guards and the procession (SVG, decorative). */
import { LAP_TIME, LEAD_IN } from "./engine";

const CHUNKS = [
  { x: 200, w: 70, tower: true },
  { x: 270, w: 80 },
  { x: 350, w: 50 },
  { x: 400, w: 50 },
  { x: 450, w: 80 },
  { x: 530, w: 70, tower: true },
];
const WALL_TOP = 150;
const GROUND = 300;
const CRACKS = [
  "M300 300 l8 -30 l-10 -20 l12 -25",
  "M480 300 l-6 -28 l10 -22 l-8 -30",
  "M235 240 l14 18 l-6 20",
  "M565 230 l-12 22 l8 18",
  "M380 180 l10 26 l-8 20",
  "M420 300 l4 -40 l-12 -16",
  "M330 170 l-8 30 l10 18",
];

function Guard({ x, fallen, t }: { x: number; fallen: number; t: number }) {
  const y = WALL_TOP - 4 + fallen * 170;
  return (
    <g
      transform={`translate(${x} ${y}) rotate(${fallen * (x % 2 ? 160 : -140)}) translate(0 ${
        fallen ? 0 : Math.sin(t * 6 + x) * 1.5
      })`}
      className="stroke-navy"
      strokeWidth={2}
    >
      <path d="M12 -38 V6" className="stroke-logo-dark" strokeWidth={3} />
      <rect x={-8} y={-18} width={16} height={16} rx={4} className="fill-logo-blue" />
      <circle cy={-26} r={9} className="fill-accent-soft" />
      <path d="M-10 -28 Q0 -44 10 -28 Z" className="fill-ink-muted" />
      <path d="M-4 -22 Q0 -18 4 -22" className="fill-none" strokeWidth={1.6} />
    </g>
  );
}

function Wall({ collapse }: { collapse: number }) {
  return (
    <g>
      {[
        { x: 234, w: 32 },
        { x: 314, w: 42 },
        { x: 444, w: 42 },
      ].map((h) => (
        <g key={h.x}>
          <rect
            x={h.x}
            y={150}
            width={h.w}
            height={GROUND - 150}
            className="fill-logo-orange/40 stroke-navy"
            strokeWidth={2}
          />
          <rect
            x={h.x + h.w / 2 - 6}
            y={170}
            width={12}
            height={14}
            rx={2}
            className="fill-logo-dark"
          />
        </g>
      ))}
      <path
        d="M230 150 l20 -30 l20 30 Z M310 150 l25 -40 l25 40 Z M440 150 l25 -36 l25 36 Z"
        className="fill-logo-orange/70 stroke-navy"
        strokeWidth={2}
      />
      {CHUNKS.map((c, i) => {
        const top = c.tower ? WALL_TOP - 40 : WALL_TOP;
        const fall = Math.max(0, Math.min(1, collapse * 1.6 - (i % 3) * 0.2));
        const dir = i < 3 ? -1 : 1;
        return (
          <g
            key={c.x}
            transform={`translate(${dir * fall * 26} ${fall * 120}) rotate(${dir * fall * 24} ${c.x + c.w / 2} ${GROUND})`}
            opacity={1 - fall * 0.35}
          >
            <rect
              x={c.x}
              y={top}
              width={c.w}
              height={GROUND - top}
              className="fill-logo-yellow stroke-navy"
              strokeWidth={2.5}
            />
            {Array.from({ length: 4 }, (_, k) => (
              <rect
                key={k}
                x={c.x + 2 + k * (c.w / 4)}
                y={top - 12}
                width={c.w / 4 - 6}
                height={12}
                className="fill-logo-yellow stroke-navy"
                strokeWidth={2}
              />
            ))}
            {Array.from({ length: Math.floor((GROUND - top) / 22) }, (_, r) => (
              <path
                key={r}
                d={`M${c.x} ${top + 22 * (r + 1)} h${c.w} M${c.x + (r % 2 ? 18 : 36)} ${top + 22 * r} v22`}
                className="stroke-logo-orange/60"
                strokeWidth={1.5}
              />
            ))}
          </g>
        );
      })}
      {collapse < 0.3 && (
        <path
          d="M380 300 v-60 a20 20 0 0 1 40 0 v60 Z"
          className="fill-logo-dark stroke-navy"
          strokeWidth={2.5}
        />
      )}
    </g>
  );
}

function Procession({ time }: { time: number }) {
  const progress = time < LEAD_IN ? 0 : ((time - LEAD_IN) / LAP_TIME) % 1;
  const members = ["priest", "priest", "priest", "ark", "people", "people"] as const;
  return (
    <g>
      {members.map((m, i) => {
        const x = ((progress * 1000 + 900 - i * 62) % 1000) - 100;
        const bob = Math.abs(Math.sin(time * 7 + i)) * -3;
        return (
          <g key={i} transform={`translate(${x} ${348 + bob})`}>
            {m === "ark" ? (
              <g className="stroke-navy" strokeWidth={2}>
                <path d="M-34 -14 H34" className="stroke-logo-dark" strokeWidth={4} />
                <rect x={-20} y={-34} width={40} height={22} rx={3} className="fill-logo-yellow" />
                <path
                  d="M-16 -34 q4 -14 14 -4 M16 -34 q-4 -14 -14 -4"
                  className="fill-none stroke-logo-orange"
                  strokeWidth={3}
                />
                <circle cx={-28} cy={-4} r={7} className="fill-accent-soft" />
                <circle cx={28} cy={-4} r={7} className="fill-accent-soft" />
              </g>
            ) : (
              <g className="stroke-navy" strokeWidth={2}>
                <path
                  d="M-9 0 L-11 -24 L11 -24 L9 0 Z"
                  className={m === "priest" ? "fill-surface" : "fill-logo-blue"}
                />
                <circle cy={-32} r={8} className="fill-accent-soft" />
                {m === "priest" && (
                  <text x={4} y={-24} fontSize={20} stroke="none">
                    🎺
                  </text>
                )}
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
}

export function JerichoScene({
  time,
  cracks,
  collapse,
}: {
  time: number;
  cracks: number;
  collapse: number;
}) {
  return (
    <g aria-hidden="true">
      <rect width={800} height={370} className="fill-accent-soft" />
      <circle cx={680} cy={70} r={38} className="fill-logo-yellow/70" />
      <rect y={GROUND} width={800} height={70} className="fill-logo-yellow/55" />
      <g
        transform={
          collapse > 0 && collapse < 0.6 ? `translate(${Math.sin(time * 60) * 4} 0)` : undefined
        }
      >
        <Wall collapse={collapse} />
        {collapse < 0.15 &&
          CRACKS.slice(0, cracks).map((d) => (
            <path
              key={d}
              d={d}
              className="fill-none stroke-navy"
              strokeWidth={2.5}
              strokeLinecap="round"
            />
          ))}
      </g>
      {[250, 340, 470, 560].map((x) => (
        <Guard key={x} x={x} t={time} fallen={Math.min(1, collapse * 1.4)} />
      ))}
      {collapse > 0.2 && (
        <g opacity={Math.max(0, 1 - collapse)}>
          {[260, 330, 400, 470, 540].map((x, i) => (
            <circle
              key={x}
              cx={x}
              cy={280 - collapse * 40 - i * 4}
              r={30 + collapse * 30}
              className="fill-surface/80"
            />
          ))}
        </g>
      )}
      <Procession time={time} />
    </g>
  );
}
