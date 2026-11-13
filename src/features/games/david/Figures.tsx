/** Cartoon SVG figures for "Dawid i Goliat". Coordinates are relative to the feet (0,0). */

export function DavidFigure({ aiming, angle }: { aiming: boolean; angle: number }) {
  // throwing arm points along the aim while aiming
  const rad = (angle * Math.PI) / 180;
  const hand = aiming
    ? { x: 22 - Math.cos(rad) * 22, y: -78 + Math.sin(rad) * 22 }
    : { x: 26, y: -82 };
  return (
    <g className="stroke-navy" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <path d="M-8 -30 L-12 0 M8 -30 L12 0" fill="none" />
      <path d="M-18 -30 L-12 -70 L12 -70 L18 -30 Z" className="fill-logo-blue" />
      <path d="M-10 -34 L10 -34" className="stroke-logo-yellow" strokeWidth={4} />
      <path d={`M10 -64 L${hand.x} ${hand.y}`} fill="none" />
      <path
        d={`M${hand.x} ${hand.y} L${hand.x + 14} ${hand.y - 6}`}
        className="stroke-ink-muted"
        strokeWidth={2}
      />
      <path d="M-10 -64 L-22 -46" fill="none" />
      <circle cx={0} cy={-84} r={14} className="fill-accent-soft" />
      <circle cx={-6} cy={-97} r={6} className="fill-navy" strokeWidth={0} />
      <circle cx={2} cy={-99} r={6} className="fill-navy" strokeWidth={0} />
      <circle cx={10} cy={-95} r={5} className="fill-navy" strokeWidth={0} />
      <circle cx={5} cy={-86} r={1.6} className="fill-navy" strokeWidth={0} />
      <path d="M2 -79 Q7 -76 11 -80" fill="none" strokeWidth={2} />
    </g>
  );
}

export function GoliathFigure({ dizzy }: { dizzy: boolean }) {
  return (
    <g className="stroke-navy" strokeWidth={3.5} strokeLinejoin="round" strokeLinecap="round">
      {/* spear */}
      <path d="M56 6 L48 -300" fill="none" strokeWidth={7} className="stroke-logo-dark" />
      <path d="M48 -300 L40 -276 L57 -277 Z" className="fill-ink-subtle" />
      {/* legs + sandals */}
      <rect x={-32} y={-80} width={22} height={74} rx={8} className="fill-accent-soft" />
      <rect x={10} y={-80} width={22} height={74} rx={8} className="fill-accent-soft" />
      <rect x={-38} y={-8} width={30} height={9} rx={4} className="fill-logo-dark" />
      <rect x={6} y={-8} width={30} height={9} rx={4} className="fill-logo-dark" />
      {/* armour */}
      <path d="M-48 -176 L48 -176 L54 -66 L-54 -66 Z" className="fill-ink-subtle" />
      <path d="M-48 -150 H48 M-50 -124 H50 M-52 -98 H52" fill="none" strokeWidth={2} />
      <rect x={-56} y={-82} width={112} height={18} rx={6} className="fill-logo-red" />
      {/* arms */}
      <path d="M-48 -168 Q-74 -120 -64 -86" fill="none" strokeWidth={22} className="stroke-navy" />
      <path
        d="M-48 -168 Q-74 -120 -64 -86"
        fill="none"
        strokeWidth={16}
        className="stroke-accent-soft"
      />
      <path d="M48 -168 Q60 -150 52 -120" fill="none" strokeWidth={22} className="stroke-navy" />
      <path
        d="M48 -168 Q60 -150 52 -120"
        fill="none"
        strokeWidth={16}
        className="stroke-accent-soft"
      />
      {/* head */}
      <rect x={-14} y={-184} width={20} height={14} className="fill-accent-soft" />
      <circle cx={-4} cy={-202} r={27} className="fill-accent-soft" />
      <path
        d="M-30 -196 Q-28 -158 -4 -160 Q20 -158 22 -196 Q8 -178 -4 -180 Q-18 -178 -30 -196 Z"
        className="fill-navy"
      />
      {dizzy ? (
        <path
          d="M-22 -206 l8 8 m0 -8 l-8 8 M0 -206 l8 8 m0 -8 l-8 8"
          fill="none"
          strokeWidth={2.5}
        />
      ) : (
        <>
          <circle cx={-18} cy={-201} r={2.6} className="fill-navy" />
          <circle cx={2} cy={-201} r={2.6} className="fill-navy" />
          <path d="M-26 -212 L-12 -207 M8 -212 L-4 -207" fill="none" strokeWidth={3} />
        </>
      )}
      <path d="M-14 -186 Q-8 -182 -2 -186" fill="none" strokeWidth={2.5} />
      {/* helmet */}
      <path d="M-34 -216 Q-32 -252 -2 -252 Q28 -252 30 -216 Z" className="fill-ink-muted" />
      <path d="M-36 -216 H32" fill="none" strokeWidth={5} />
      <path d="M-8 -252 Q2 -282 22 -270 Q8 -264 6 -252 Z" className="fill-logo-red" />
    </g>
  );
}

export function Scenery() {
  return (
    <g aria-hidden="true">
      <rect width={800} height={450} className="fill-accent-soft" />
      <circle cx={420} cy={80} r={44} className="fill-logo-yellow/70" />
      <g className="fill-surface motion-safe:animate-[ui-float_9s_ease-in-out_infinite]">
        <ellipse cx={200} cy={70} rx={58} ry={18} />
        <ellipse cx={236} cy={58} rx={34} ry={16} />
      </g>
      <g className="fill-surface/90 motion-safe:animate-[ui-float_12s_ease-in-out_infinite_reverse]">
        <ellipse cx={600} cy={50} rx={50} ry={15} />
        <ellipse cx={630} cy={40} rx={28} ry={13} />
      </g>
      <path
        d="M0 330 Q140 250 300 320 T620 300 T800 290 V400 H0 Z"
        className="fill-logo-yellow/45"
      />
      <path d="M0 360 Q200 320 420 360 T800 350 V400 H0 Z" className="fill-logo-yellow/60" />
      <rect y={400} width={800} height={50} className="fill-logo-orange/45" />
      <path d="M0 400 H800" className="stroke-logo-dark/40" strokeWidth={2} />
    </g>
  );
}
