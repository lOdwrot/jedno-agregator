import { clamp } from "../useGameLoop";
import {
  ITEM_EMOJI,
  LANES,
  RH,
  RW,
  WALL_L,
  WALL_R,
  screenY,
  shoreLineY,
  type RedSeaState,
} from "./engine";
import { Chariot, FarShore, Moses, SeaWalls } from "./SeaArt";
import { Particles } from "../fx/Particles";
import type { Fx } from "../fx/useFx";

const CHARIOT_OFFSETS = [12, 0, 18];

/** Pure render of the game state (SVG, decorative — status is announced separately). */
export function RedSeaStage({ s, fx }: { s: RedSeaState; fx: Fx[] }) {
  const shoreY = shoreLineY(s);
  const flood = s.phase === "flood" || s.phase === "won" ? clamp(s.phaseT / 1.3, 0, 1) : 0;
  const floating = flood > 0;
  const bob = s.phase === "running" ? Math.sin(s.time * 16) * 2 : 0;
  const chariotBase = s.playerY + 34 + s.gap * 0.62;
  const waterTop = Math.max(shoreY + 4, 0);
  const chariots =
    chariotBase < RH + 60 &&
    LANES.map((x, i) => {
      const y = chariotBase + CHARIOT_OFFSETS[i]!;
      const tilt = floating ? Math.sin(s.time * 3 + i) * 28 : 0;
      return (
        <g
          key={x}
          transform={`translate(${x} ${y + (floating ? Math.sin(s.time * 4 + i) * 5 : 0)}) rotate(${tilt})`}
        >
          {!floating &&
            [0, 1, 2].map((k) => {
              const p = (s.time * 2.2 + k / 3 + i * 0.17) % 1;
              return (
                <circle
                  key={k}
                  cx={0}
                  cy={0}
                  r={7}
                  transform={`translate(${(k - 1) * 12} ${26 + p * 26}) scale(${0.6 + p * 1.4})`}
                  className="fill-logo-yellow"
                  opacity={(1 - p) * 0.8}
                />
              );
            })}
          <Chariot t={s.time * 14 + i * 1.7} />
        </g>
      );
    });

  return (
    <svg viewBox={`0 0 ${RW} ${RH}`} className="block h-full w-full" aria-hidden="true">
      <SeaWalls d={s.d} />
      <FarShore y={shoreY} />

      {s.items.map((it) => {
        if (it.taken) return null;
        const y = screenY(s, it.at);
        if (y < -40 || y > RH + 40) return null;
        const wiggle = it.kind === "fish" ? Math.sin(s.time * 12 + it.id) * 25 : 0;
        return (
          <text
            key={it.id}
            x={LANES[it.lane]}
            y={y}
            fontSize={it.kind === "sheep" ? 28 : 32}
            textAnchor="middle"
            dominantBaseline="central"
            transform={wiggle ? `rotate(${wiggle} ${LANES[it.lane]} ${y})` : undefined}
          >
            {ITEM_EMOJI[it.kind]}
          </text>
        );
      })}

      {Array.from({ length: Math.min(s.sheep, 8) }, (_, i) => (
        <text
          key={i}
          x={s.px + (i % 2 ? -16 : 16)}
          y={s.playerY + 36 + Math.floor(i / 2) * 18 + (i % 2 ? bob : -bob)}
          fontSize={18}
          textAnchor="middle"
        >
          🐑
        </text>
      ))}

      {!floating && chariots}

      {floating && (
        <g>
          <rect
            x={WALL_L - 8}
            y={waterTop}
            width={(RW / 2 - WALL_L + 12) * flood}
            height={RH - waterTop}
            className="fill-logo-blue"
          />
          <rect
            x={WALL_R + 8 - (WALL_R - RW / 2 + 12) * flood}
            y={waterTop}
            width={(WALL_R - RW / 2 + 12) * flood}
            height={RH - waterTop}
            className="fill-logo-blue"
          />
          {flood >= 1 &&
            LANES.map((x, i) => (
              <text
                key={x}
                x={x + 10}
                y={chariotBase - 24 - ((s.phaseT * 40 + i * 20) % 50)}
                fontSize={16}
                textAnchor="middle"
              >
                🫧
              </text>
            ))}
          {flood >= 1 && (
            <text
              x={RW / 2}
              y={Math.min(RH - 30, chariotBase + 60)}
              textAnchor="middle"
              fontSize={20}
              fontWeight={800}
              className="fill-surface"
            >
              blub… blub…
            </text>
          )}
        </g>
      )}

      {floating && <g opacity={0.9}>{chariots}</g>}

      <g transform={`translate(${s.px} ${s.playerY + bob})`}>
        {(s.phase === "shore" || s.phase === "flood") && (
          <circle
            cx={0}
            cy={0}
            r={16}
            transform={`translate(${s.phase === "shore" ? 16 : 44} ${s.phase === "shore" ? -32 : -54}) scale(${1 + Math.sin(s.time * 10) * 0.25})`}
            className="fill-logo-yellow"
            opacity={0.55}
          />
        )}
        <Moses stretching={s.phase === "flood" || s.phase === "won"} />
      </g>
      <Particles items={fx} time={s.time} />
    </svg>
  );
}
