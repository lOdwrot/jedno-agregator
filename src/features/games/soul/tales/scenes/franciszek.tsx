/** Scenes of Francis's tale (Assisi, Gubbio, Greccio). */
import { anim } from "./anim";
import { Bird, Cloud, Emoji, Ground, Person, Sky, Stars, Sun } from "./parts";

const Hill = () => (
  <path d="M0 160 Q120 60 240 110 T400 100 V300 H0 Z" className="fill-meadow-600" />
);

export function Town() {
  return (
    <>
      <Sky className="fill-tale-dawn" />
      <Sun x={320} y={55} r={18} />
      <Hill />
      {[130, 160, 190, 220, 250].map((x, i) => (
        <g key={x} transform={`translate(${x} ${108 - (i % 2) * 8})`}>
          <rect x="-12" y="0" width="24" height="30" className="fill-tale-dawn" />
          <path d="M-14 0 L0 -12 L14 0 Z" className="fill-logo-red" />
        </g>
      ))}
      <rect x="202" y="62" width="10" height="40" className="fill-tale-dawn" />
      <g transform="translate(212 62)">
        <path
          d="M0 0 H22 L16 6 L22 12 H0 Z"
          className="tb fill-logo-blue"
          style={anim("tale-sway 1.2s ease-in-out infinite")}
        />
      </g>
      <Person x={180} y={150} s={0.9} robe="fill-logo-red" head="fill-tale-dawn">
        <rect x="-14" y="14" width="28" height="5" className="fill-gold-500" />
      </Person>
      <Emoji x={210} y={140} size={20} style={anim("tale-float 2s ease-in-out infinite")}>
        🎵
      </Emoji>
    </>
  );
}

export function Stones() {
  return (
    <>
      <Sky className="fill-tale-sky" />
      <Cloud x={130} y={40} />
      <Ground className="fill-meadow-400" y={160} />
      <g transform="translate(230 160)">
        <path d="M-50 0 V-50 L0 -80 L50 -50 V0 Z" className="fill-tale-rock" />
        <rect x="-10" y="-30" width="20" height="30" rx="10" className="fill-tale-rock-dark" />
        {[
          [-40, -58],
          [-20, -70],
          [30, -62],
        ].map(([x, y], i) => (
          <rect
            key={i}
            x={x}
            y={y}
            width="18"
            height="10"
            rx="2"
            className="fill-silver-300"
            style={anim("tale-drop-in 1s var(--ease-spring) both", 0.4 + i * 0.5)}
          />
        ))}
        <g transform="translate(0 -95)">
          <rect x="-2" y="-12" width="4" height="22" className="fill-tale-earth" />
          <rect x="-9" y="-6" width="18" height="4" className="fill-tale-earth" />
        </g>
        <circle
          cx="0"
          cy="-100"
          r="16"
          className="tb fill-gold-300 opacity-40"
          style={anim("tale-glow 2s ease-in-out infinite")}
        />
      </g>
      <Person x={150} y={125} s={0.9} robe="fill-tale-robe">
        <rect
          x="-10"
          y="-30"
          width="20"
          height="10"
          rx="2"
          className="fill-silver-300"
          style={anim("tale-bob 1.4s ease-in-out infinite")}
        />
      </Person>
    </>
  );
}

export function Birds() {
  return (
    <>
      <Sky className="fill-tale-sky" />
      <Sun x={320} y={50} r={16} />
      <Ground className="fill-meadow-400" y={150} />
      <g transform="translate(260 150)">
        <rect x="-4" y="-60" width="8" height="60" className="fill-tale-earth" />
        <circle cy="-70" r="30" className="fill-meadow-600" />
      </g>
      <Person x={170} y={110} s={0.95} robe="fill-tale-robe" />
      {Array.from({ length: 9 }, (_, i) => (
        <Bird
          key={i}
          x={200 + (i % 3) * 28}
          y={60 + Math.floor(i / 3) * 22}
          s={0.9}
          delay={i * 0.25}
          className={i % 2 ? "stroke-navy" : "stroke-logo-blue"}
        />
      ))}
      {[
        [130, 150],
        [150, 156],
        [205, 154],
      ].map(([x, y], i) => (
        <Emoji
          key={i}
          x={x!}
          y={y!}
          size={18}
          style={anim("tale-hop 1s ease-in-out infinite", i * 0.3)}
        >
          🐦
        </Emoji>
      ))}
    </>
  );
}

export function Wolf() {
  return (
    <>
      <Sky className="fill-tale-dawn" />
      <path d="M0 120 L50 80 L90 110 L140 70 L190 105 V300 H0 Z" className="fill-silver-300" />
      <g transform="translate(300 60)">
        <rect x="-30" y="0" width="60" height="60" className="fill-tale-rock" />
        {[-30, -10, 10].map((x) => (
          <rect key={x} x={x} y="-10" width="12" height="10" className="fill-tale-rock" />
        ))}
      </g>
      <Ground className="fill-meadow-400" y={150} />
      <Person x={230} y={118} s={0.95} robe="fill-tale-robe" />
      <g transform="translate(180 140)">
        <g style={anim("tale-run-in 2.2s var(--ease-out-expo) both", 0.3)}>
          <Emoji x={0} y={0} size={46}>
            🐺
          </Emoji>
        </g>
      </g>
      <Emoji
        x={206}
        y={100}
        size={22}
        style={anim("tale-appear 0.8s var(--ease-spring) both", 2.4)}
      >
        💛
      </Emoji>
      {[120, 140].map((x, i) => (
        <path
          key={x}
          d="M0 0 H40"
          transform={`translate(${x - 60} ${130 + i * 12})`}
          className="stroke-surface"
          strokeWidth="3"
          strokeLinecap="round"
          style={anim("tale-streak 1.2s ease-out 2", 0.3 + i * 0.2)}
        />
      ))}
    </>
  );
}

export function Crib() {
  return (
    <>
      <Sky className="fill-tale-night" />
      <Stars seed={5} n={18} />
      <g
        transform="translate(230 34)"
        style={anim("tale-glow 2.5s ease-in-out infinite")}
        className="tb"
      >
        <path d="M0 -12 L3 -3 L12 0 L3 3 L0 12 L-3 3 L-12 0 L-3 -3 Z" className="fill-gold-300" />
      </g>
      <path
        d="M0 0 H400 V300 H0 Z M110 175 Q110 60 200 60 Q290 60 290 175 Z"
        className="fill-tale-rock-dark"
        fillRule="evenodd"
      />
      <Ground className="fill-tale-earth" y={165} />
      <ellipse
        cx="200"
        cy="130"
        rx="70"
        ry="50"
        className="tb fill-logo-yellow opacity-30"
        style={anim("tale-glow 3s ease-in-out infinite")}
      />
      <g transform="translate(200 150)">
        <path d="M-24 -8 H24 L18 10 H-18 Z" className="fill-tale-earth" />
        <path d="M-22 -8 Q0 -16 22 -8" className="fill-tale-wheat" />
        <circle cx="0" cy="-14" r="6" className="fill-tale-dawn" />
      </g>
      <Emoji
        x={145}
        y={140}
        size={38}
        style={anim("tale-walk-in 2s var(--ease-out-expo) both", 0.3)}
      >
        🐂
      </Emoji>
      <Emoji
        x={258}
        y={140}
        size={36}
        style={anim("tale-walk-in-right 2s var(--ease-out-expo) both", 0.6)}
      >
        🫏
      </Emoji>
    </>
  );
}

export function SunScene() {
  return (
    <>
      <Sky className="fill-tale-sky" />
      <Sun x={200} y={65} r={28} />
      <Cloud x={120} y={50} s={0.8} />
      <Cloud x={290} y={70} s={0.7} delay={2} />
      <Ground className="fill-meadow-400" y={150} />
      <path d="M0 172 Q100 160 200 172 T400 168 V190 H0 Z" className="fill-river" />
      <Person x={200} y={118} s={0.9} robe="fill-tale-robe" />
      {[
        [140, 150],
        [260, 150],
      ].map(([x, y], i) => (
        <Emoji
          key={i}
          x={x!}
          y={y!}
          size={22}
          style={anim("tale-flicker 0.8s ease-in-out infinite", i * 0.3)}
        >
          🔥
        </Emoji>
      ))}
      {[0, 1, 2].map((i) => (
        <Bird key={i} x={150 + i * 50} y={110 - i * 6} s={0.7} delay={i * 0.4} />
      ))}
    </>
  );
}
