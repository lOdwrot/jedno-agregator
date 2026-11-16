/** Scenes of Isidore's tale (fields near Madrid). */
import { anim } from "./anim";
import { Bird, Cloud, Emoji, Ground, Person, Sky, Spring, Sun } from "./parts";

const Furrows = ({ y = 150 }: { y?: number }) => (
  <g>
    <rect x="0" y={y} width="400" height={300 - y} className="fill-tale-earth" />
    {Array.from({ length: 6 }, (_, i) => (
      <path
        key={i}
        d={`M0 ${y + 8 + i * 12} H400`}
        className="stroke-tale-rock-dark"
        strokeWidth="2"
        opacity="0.5"
      />
    ))}
  </g>
);

const Church = ({ x, y }: { x: number; y: number }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x="-18" y="-24" width="36" height="24" className="fill-surface" />
    <path d="M-21 -24 L0 -36 L21 -24 Z" className="fill-logo-red" />
    <rect x="-6" y="-46" width="12" height="22" className="fill-surface" />
    <rect x="-1" y="-56" width="2" height="10" className="fill-navy" />
    <rect x="-4" y="-53" width="8" height="2" className="fill-navy" />
  </g>
);

export function Field() {
  return (
    <>
      <Sky className="fill-tale-dawn" />
      <Sun x={110} y={120} r={20} className="fill-logo-orange" />
      <Church x={290} y={140} />
      <Furrows y={140} />
      <Person x={200} y={105} s={0.9} robe="fill-tale-earth" head="fill-tale-dawn">
        <rect x="-16" y="10" width="32" height="4" className="fill-tale-rock-dark" />
      </Person>
      <Emoji x={150} y={132} size={30}>
        🐂
      </Emoji>
      <Emoji x={250} y={132} size={30}>
        🐂
      </Emoji>
    </>
  );
}

export function Mist() {
  return (
    <>
      <Sky className="fill-silver-300" />
      <Furrows y={150} />
      <Person x={190} y={115} s={0.85} robe="fill-logo-blue">
        <rect x="-14" y="14" width="28" height="4" className="fill-gold-500" />
      </Person>
      {[60, 95, 130, 165].map((y, i) => (
        <ellipse
          key={y}
          cx="200"
          cy={y}
          rx="240"
          ry="16"
          className="fill-silver-100 opacity-70"
          style={anim(`tale-drift ${5 + i}s ease-in-out infinite alternate`, i * 0.7)}
        />
      ))}
    </>
  );
}

export function Angels() {
  return (
    <>
      <Sky className="fill-tale-sky" />
      <Sun x={320} y={50} r={16} />
      <Furrows y={150} />
      <Person x={130} y={118} s={0.85} robe="fill-tale-earth">
        <circle
          cx="0"
          cy="-6"
          r="13"
          className="tb fill-gold-300 opacity-40"
          style={anim("tale-glow 2s ease-in-out infinite")}
        />
      </Person>
      {[0, 1].map((i) => (
        <g key={i} transform={`translate(230 ${120 + i * 28})`}>
          <g style={anim("tale-plough 5s ease-in-out infinite alternate", i * 0.8)}>
            <Emoji x={-22} y={0} size={28}>
              🐂
            </Emoji>
            <Emoji x={22} y={-14} size={26} style={anim("tale-float 1.6s ease-in-out infinite")}>
              👼
            </Emoji>
            <path d="M-8 6 L-2 14" className="stroke-tale-rock-dark" strokeWidth="3" />
          </g>
        </g>
      ))}
    </>
  );
}

export function Snow() {
  return (
    <>
      <Sky className="fill-silver-300" />
      <Ground className="fill-tale-snow" y={150} />
      <Person x={180} y={112} s={0.9} robe="fill-tale-earth">
        <ellipse cx="18" cy="16" rx="10" ry="14" className="fill-tale-wheat" />
      </Person>
      {[210, 225, 240, 255].map((x, i) => (
        <circle
          key={x}
          cx={x}
          cy={152 + (i % 2) * 3}
          r="2.5"
          className="fill-tale-wheat"
          style={anim("tale-fade-in 0.6s ease-out both", 1 + i * 0.3)}
        />
      ))}
      {[215, 240, 262].map((x, i) => (
        <Emoji
          key={x}
          x={x}
          y={144}
          size={20}
          style={anim("tale-walk-in-right 1.6s var(--ease-out-expo) both", 0.4 + i * 0.3)}
        >
          🐦
        </Emoji>
      ))}
      {Array.from({ length: 26 }, (_, i) => (
        <circle
          key={i}
          cx={(i * 61) % 400}
          cy={-10}
          r={i % 3 ? 2 : 3}
          className="fill-surface"
          style={anim(`tale-fall ${5 + (i % 4)}s linear infinite`, -(i * 0.37) % 6)}
        />
      ))}
    </>
  );
}

export function SpringFields() {
  return (
    <>
      <Sky className="fill-tale-dawn" />
      <Sun x={300} y={50} r={22} className="fill-logo-orange" />
      <Ground className="fill-tale-wheat" y={150} />
      <Spring x={210} y={160} />
      <Person x={160} y={118} s={0.85} robe="fill-tale-earth">
        <path d="M14 -10 L34 36" className="stroke-tale-rock-dark" strokeWidth="3" />
      </Person>
      <Person x={262} y={118} s={0.85} robe="fill-logo-red" head="fill-tale-dawn" />
    </>
  );
}

export function Harvest() {
  return (
    <>
      <Sky className="fill-tale-dawn" />
      <Sun x={200} y={140} r={34} className="fill-logo-orange" />
      <Cloud x={130} y={50} s={0.7} />
      <Ground className="fill-tale-wheat" y={150} />
      {Array.from({ length: 22 }, (_, i) => (
        <g key={i} transform={`translate(${10 + i * 18} ${170 + (i % 2) * 8})`}>
          <g
            className="tb-bottom"
            style={anim("tale-sway 2.6s ease-in-out infinite", (i % 5) * 0.3)}
          >
            <rect x="-1" y="-30" width="2" height="30" className="fill-gold-700" />
            <ellipse cx="0" cy="-34" rx="3.5" ry="8" className="fill-gold-500" />
          </g>
        </g>
      ))}
      <Person x={175} y={112} s={0.9} robe="fill-tale-earth" />
      <Person x={225} y={112} s={0.9} robe="fill-logo-blue" veil="fill-surface" />
      <Bird x={140} y={60} s={0.8} />
      <Bird x={170} y={45} s={0.7} delay={0.4} />
    </>
  );
}
