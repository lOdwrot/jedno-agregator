/** Scenes of Bernadetta's tale (Lourdes). */
import { anim } from "./anim";
import { Candle, Cloud, Emoji, Ground, Person, Sheep, Sky, Spring, Stars } from "./parts";

const Mountains = ({ className = "fill-silver-300" }: { className?: string }) => (
  <path
    d="M0 130 L60 70 L110 115 L170 50 L235 120 L290 65 L350 110 L400 80 V170 H0 Z"
    className={className}
  />
);

export function Meadow() {
  return (
    <>
      <Sky className="fill-tale-sky" />
      <Mountains />
      <path d="M170 50 L188 70 L176 68 L170 75 L162 66 L154 68 Z" className="fill-surface" />
      <Cloud x={120} y={40} />
      <Cloud x={300} y={30} s={0.8} delay={1.5} />
      <Ground className="fill-meadow-400" y={140} />
      <Ground className="fill-meadow-600" y={175} />
      {[130, 210, 270].map((x, i) => (
        <Sheep key={x} x={x} y={150 + (i % 2) * 8} delay={i * 0.35} s={0.9} />
      ))}
      <Person x={180} y={110} s={0.9} robe="fill-navy-600" veil="fill-logo-red" />
      {[100, 160, 240, 300].map((x) => (
        <circle key={x} cx={x} cy={168} r="3" className="fill-gold-300" />
      ))}
    </>
  );
}

export function Wind() {
  return (
    <>
      <Sky className="fill-silver-100" />
      <Mountains className="fill-silver-300" />
      <Ground className="fill-meadow-600" y={150} />
      <path d="M0 175 Q120 160 220 178 T400 170 V200 H0 Z" className="fill-river" />
      {[120, 270].map((x) => (
        <g key={x} transform={`translate(${x} 150)`}>
          <rect x="-3" y="-50" width="6" height="50" className="fill-tale-rock-dark" />
          <circle cy="-60" r="22" className="fill-meadow-800" />
        </g>
      ))}
      {[60, 90, 120].map((y, i) => (
        <path
          key={y}
          d="M0 0 H70"
          transform={`translate(80 ${y})`}
          className="stroke-surface"
          strokeWidth="3"
          strokeLinecap="round"
          style={anim("tale-streak 2.2s ease-in infinite", i * 0.5)}
        />
      ))}
      {[70, 100, 125, 140].map((y, i) => (
        <g key={y} transform={`translate(80 ${y})`}>
          <path
            d="M0 0 Q6 -8 12 0 Q6 6 0 0 Z"
            className="tb fill-logo-yellow"
            style={anim("tale-gust 3s ease-in-out infinite", i * 0.6)}
          />
        </g>
      ))}
      <Person x={200} y={120} s={0.9} robe="fill-navy-600" veil="fill-logo-red" />
    </>
  );
}

export function Grotto() {
  return (
    <>
      <Sky className="fill-tale-rock-dark" />
      <path
        d="M0 0 H400 V300 H0 Z M120 170 Q120 40 210 40 Q300 40 300 170 Z"
        className="fill-tale-rock"
        fillRule="evenodd"
      />
      <ellipse
        cx="250"
        cy="90"
        rx="44"
        ry="56"
        className="tb fill-gold-100"
        style={anim("tale-glow 3s ease-in-out infinite")}
      />
      <g style={anim("tale-appear 1.6s var(--ease-out-expo) both", 0.3)} className="tb">
        <Person x={250} y={72} s={1} robe="fill-surface" head="fill-tale-dawn" veil="fill-surface">
          <rect x="-12" y="16" width="24" height="5" className="fill-logo-blue" />
          <circle cx="-6" cy="41" r="3.5" className="fill-gold-500" />
          <circle cx="6" cy="41" r="3.5" className="fill-gold-500" />
        </Person>
      </g>
      {[200, 220, 285].map((x, i) => (
        <circle
          key={x}
          cx={x}
          cy={60 + i * 20}
          r="2"
          className="fill-gold-300"
          style={anim("tale-twinkle 1.8s ease-in-out infinite", i * 0.5)}
        />
      ))}
      <Ground className="fill-meadow-800" y={175} />
      <Person x={160} y={130} s={0.8} robe="fill-navy-600" veil="fill-logo-red" />
    </>
  );
}

export function SpringScene() {
  return (
    <>
      <Sky className="fill-tale-rock-dark" />
      <path
        d="M0 0 H400 V300 H0 Z M110 175 Q110 30 205 30 Q300 30 300 175 Z"
        className="fill-tale-rock"
        fillRule="evenodd"
      />
      <Ground className="fill-tale-earth" y={160} />
      <Spring x={215} y={158} />
      <Person x={160} y={120} s={0.8} robe="fill-navy-600" veil="fill-logo-red" />
      <Emoji x={268} y={120} size={26} style={anim("tale-float 3s ease-in-out infinite")}>
        🌹
      </Emoji>
    </>
  );
}

export function Candles() {
  return (
    <>
      <Sky className="fill-tale-night" />
      <Stars />
      <path
        d="M0 140 L40 90 L90 120 L140 70 L200 115 L260 60 L320 110 L400 80 V300 H0 Z"
        className="fill-navy-800"
      />
      <Ground className="fill-navy-600" y={165} />
      <g style={anim("tale-march 8s ease-in-out infinite alternate")}>
        {[120, 150, 180, 210, 240, 270].map((x, i) => (
          <Candle key={x} x={x} y={150 + (i % 2) * 6} delay={i * 0.2} />
        ))}
      </g>
      <text
        x="200"
        y="45"
        textAnchor="middle"
        className="fill-gold-100 font-serif italic"
        fontSize="20"
        style={anim("tale-fade-in 2s ease-out both", 0.5)}
      >
        Que soy era Immaculada Councepciou
      </text>
    </>
  );
}

export function Pilgrims() {
  return (
    <>
      <Sky className="fill-tale-night" />
      <Stars seed={7} />
      <g transform="translate(200 40)">
        <rect x="-4" y="-30" width="8" height="50" className="fill-silver-300" />
        <path d="M-30 20 L0 -6 L30 20 Z" className="fill-silver-300" />
        <rect x="-40" y="20" width="80" height="90" className="fill-silver-500" />
        <rect
          x="-8"
          y="70"
          width="16"
          height="40"
          rx="8"
          className="fill-logo-yellow"
          style={anim("tale-glow 2.5s ease-in-out infinite")}
        />
      </g>
      <Ground className="fill-navy-600" y={150} />
      {Array.from({ length: 12 }, (_, i) => (
        <Candle key={i} x={95 + i * 19} y={160 + (i % 3) * 7} delay={i * 0.15} />
      ))}
    </>
  );
}
