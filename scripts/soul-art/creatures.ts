/** Animal-like demons. Each draws around (0,0) = ground under its centre. */
import {
  at,
  circle,
  demonEyes,
  demonMouth,
  ell,
  ink,
  line,
  path as rawPath,
  shade,
  stroke,
} from "./kit";

/** `path` that lets `extra` carry its own fill (used with `o()`). */
const path = (d: string, fill: string, extra = "") =>
  extra.startsWith("fill=") ? `<path d="${d}" ${extra}/>` : rawPath(d, fill, extra);

const o = (c: string, w = 3) => `fill="${c}" ${stroke(shade(c, -0.55), w)}`;

export function serpent(c = "#3f8a3a", eye = "#ffd23a", crown = "") {
  const d = `M-150 -10 Q-110 -60 -60 -20 Q-10 20 30 -30 Q60 -70 40 -120`;
  return (
    ell(-30, 0, 140, 12, "#000", 'opacity="0.3"') +
    path(d, "none", stroke(shade(c, -0.55), 40)) +
    path(d, "none", stroke(c, 32)) +
    path(
      d,
      "none",
      `stroke="${shade(c, 0.3)}" stroke-width="10" stroke-dasharray="4 14" fill="none" stroke-linecap="round"`,
    ) +
    path(
      `M10 -140 Q30 -190 80 -170 Q110 -150 90 -120 Q60 -100 30 -110 Q6 -116 10 -140 Z`,
      "none",
      `fill="${c}" ${stroke(shade(c, -0.55), 3)}`,
    ) +
    at(58, -146, 0.55, demonEyes("sly", eye, 0)) +
    path(`M92 -128 l26 4 l-6 -8 m6 8 l-4 10`, "none", stroke("#e0506a", 3)) +
    crown
  );
}

export function dragon(c = "#7a1a2a", heads = 1, wing = "#4a0e1a", headCrown = "", fire = false) {
  let s = ell(0, 0, 150, 14, "#000", 'opacity="0.3"');
  const wg = (k: 1 | -1) =>
    path(
      `M${k * 20} -120 Q${k * 120} -260 ${k * 220} -200 Q${k * 180} -180 ${k * 190} -150 Q${k * 150} -160 ${k * 150} -120 Q${k * 110} -130 ${k * 100} -96 Z`,
      "none",
      o(wing),
    );
  s += wg(-1) + wg(1);
  s +=
    path(`M60 -30 Q160 -10 170 -70 Q176 -100 200 -96`, "none", stroke(shade(c, -0.55), 22)) +
    path(`M60 -30 Q160 -10 170 -70 Q176 -100 200 -96`, "none", stroke(c, 14)) +
    path(`M196 -110 l26 10 l-24 10 Z`, "none", o(c));
  s += path(`M-80 -10 Q-100 -110 0 -120 Q100 -110 80 -10 Q0 10 -80 -10 Z`, "none", o(c));
  s += ell(0, -50, 46, 40, shade(c, 0.3), 'opacity="0.7"');
  for (const x of [-50, 40]) s += path(`M${x} -14 l-8 18 h40 l-8 -18 Z`, "none", o(c));
  for (let i = 0; i < heads; i++) {
    const a = heads === 1 ? 0 : -1.25 + (2.5 * i) / (heads - 1);
    const hx = Math.sin(a) * 175;
    const hy = -160 - Math.cos(a) * 90;
    s +=
      path(`M0 -100 Q${hx * 0.4} ${hy + 40} ${hx} ${hy}`, "none", stroke(shade(c, -0.55), 30)) +
      path(`M0 -100 Q${hx * 0.4} ${hy + 40} ${hx} ${hy}`, "none", stroke(c, 22));
    s += at(
      hx,
      hy,
      heads === 1 ? 1 : 0.72,
      path(
        `M-34 0 Q-36 -40 0 -42 Q30 -40 50 -14 L70 -6 Q60 14 30 16 Q-30 26 -34 0 Z`,
        "none",
        o(c),
      ) +
        path(`M-20 -36 L-34 -70 L-4 -40 Z M8 -40 L10 -76 L24 -38 Z`, "none", o("#f2e6c8", 2.5)) +
        at(2, -16, 0.55, demonEyes("mad", "#ffd23a", 0)) +
        path(`M30 6 l6 8 l6 -8 l6 6`, "none", stroke("#fff", 2.5)) +
        headCrown +
        (fire && i % 3 === 1
          ? path(
              `M66 0 Q110 -20 150 10 Q110 0 120 30 Q90 10 66 10 Z`,
              "#ff8a1e",
              stroke("#c0400a", 2),
            )
          : ""),
      a < 0 ? -10 : 10,
    );
  }
  return s;
}

export function peacock() {
  let s = ell(0, 0, 80, 10, "#000", 'opacity="0.3"');
  for (let i = 0; i < 13; i++) {
    const a = -Math.PI + (i / 12) * Math.PI;
    const x = Math.cos(a) * 170;
    const y = -90 + Math.sin(a) * 150;
    s +=
      path(`M0 -70 L${x} ${y}`, "none", stroke("#2a7a5a", 5)) +
      ell(
        x,
        y,
        26,
        34,
        "#1a8a7a",
        stroke("#0a4a3a", 2.5) + ` transform="rotate(${(a * 180) / Math.PI + 90} ${x} ${y})"`,
      ) +
      circle(x, y, 13, "#e8c15a") +
      circle(x, y, 8, "#1a3a8a");
  }
  s +=
    path(`M-30 0 Q-50 -90 0 -110 Q40 -90 30 0 Z`, "none", o("#1a4aa0")) +
    path(`M-10 -100 Q-20 -170 10 -180 Q34 -176 26 -150 Q12 -130 14 -100 Z`, "none", o("#1a4aa0"));
  s +=
    path(`M24 -166 l24 6 l-24 6 Z`, "#e8a020") +
    circle(16, -164, 6, "#fff") +
    circle(18, -164, 3, ink) +
    path(`M0 -184 l-8 -20 M10 -186 l0 -22 M20 -184 l8 -20`, "none", stroke("#1a4aa0", 3)) +
    circle(-8, -206, 4, "#e8c15a") +
    circle(10, -210, 4, "#e8c15a") +
    circle(28, -206, 4, "#e8c15a");
  return s + line(-12, 0, -16, 20, "#a07a3a", 4) + line(12, 0, 16, 20, "#a07a3a", 4);
}

export function fly(c = "#2a3a2a") {
  const wing = (k: 1 | -1) =>
    ell(
      k * 70,
      -150,
      70,
      34,
      "#cfe8ff",
      stroke("#6a8aa0", 2.5) + ` opacity="0.8" transform="rotate(${k * -25} ${k * 70} -150)"`,
    );
  let legs = "";
  for (const k of [-1, 1])
    for (let i = 0; i < 3; i++)
      legs += path(
        `M${k * 20} ${-80 + i * 20} q${k * 40} 10 ${k * 50} ${30}`,
        "none",
        stroke(ink, 5),
      );
  return (
    ell(0, 0, 80, 10, "#000", 'opacity="0.3"') +
    legs +
    wing(-1) +
    wing(1) +
    ell(0, -80, 50, 70, "none", o(c)) +
    [0, 1, 2]
      .map((i) =>
        path(
          `M-46 ${-80 + i * 22} Q0 ${-70 + i * 22} 46 ${-80 + i * 22}`,
          "none",
          stroke(shade(c, 0.3), 3),
        ),
      )
      .join("") +
    circle(0, -160, 46, "none", o(c)) +
    circle(-24, -166, 22, "#a01a1a", stroke("#400", 2.5)) +
    circle(24, -166, 22, "#a01a1a", stroke("#400", 2.5)) +
    path(
      `M-28 -176 h8 M-24 -170 h8 M-20 -164 h8 M20 -176 h8 M24 -170 h8 M28 -164 h8`,
      "none",
      stroke("#ff6060", 2),
    ) +
    path(`M0 -130 l0 24 l8 4`, "none", stroke(ink, 4))
  );
}

export function wolf(fleece = true) {
  let s = ell(0, 0, 110, 12, "#000", 'opacity="0.3"');
  s += path(`M-100 -40 Q-130 -60 -120 -90`, "none", stroke("#5d6776", 14));
  for (const x of [-70, -40, 40, 70]) s += rect_(x - 8, -40, 16, 40, "#5d6776");
  if (fleece)
    for (let i = 0; i < 14; i++)
      s += circle(
        -80 + (i % 7) * 26,
        -70 - Math.floor(i / 7) * 26,
        22,
        "#f4f1ea",
        stroke("#9a9488", 2.5),
      );
  else s += ell(0, -60, 100, 40, "none", o("#5d6776"));
  s += path(
    `M60 -60 Q80 -130 130 -120 L150 -150 L150 -110 L200 -90 Q200 -60 150 -60 Q110 -40 60 -60 Z`,
    "none",
    o("#5d6776"),
  );
  s +=
    path(`M150 -76 l6 10 l6 -10 l6 10 l6 -10`, "#fff", stroke(ink, 1.5)) +
    circle(136, -106, 6, "#ffd23a") +
    circle(137, -106, 2.5, ink) +
    circle(198, -88, 6, ink);
  return s;
}

function rect_(x: number, y: number, w: number, h: number, c: string) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" ${o(c)}/>`;
}

export function sheep(s = 1, face = "#2a2a2a", wool = "#f4f1ea") {
  let b = ell(0, 0, 60, 8, "#000", 'opacity="0.25"');
  for (const x of [-30, -12, 14, 32]) b += rect_(x - 5, -30, 10, 30, face);
  for (let i = 0; i < 9; i++)
    b += circle(
      -40 + (i % 5) * 20,
      -46 - Math.floor(i / 5) * 18 + (i % 2) * 4,
      18,
      wool,
      stroke("#9a9488", 2),
    );
  b +=
    ell(54, -60, 18, 22, "none", o(face)) +
    ell(46, -76, 10, 5, face) +
    circle(58, -64, 3, "#fff") +
    circle(59, -64, 1.5, ink);
  return at(0, 0, s, b);
}

export function ram() {
  let b = sheep(1.6, "#3a2a2a", "#f4f1ea");
  b += at(
    86,
    -100,
    1,
    path(`M-10 -16 Q-40 -50 -10 -60 Q20 -60 14 -30 Q4 -10 -6 -24`, "none", stroke("#c9a24a", 10)) +
      path(`M14 -16 Q44 -50 14 -60`, "none", stroke("#c9a24a", 10)),
  );
  return b;
}

export function boar() {
  let s = ell(0, 0, 120, 12, "#000", 'opacity="0.3"');
  for (const x of [-70, -36, 40, 74]) s += rect_(x - 9, -40, 18, 40, "#3a2a22");
  s += path(
    `M-110 -50 Q-110 -130 0 -130 Q110 -130 120 -60 Q100 -24 0 -30 Q-110 -24 -110 -50 Z`,
    "none",
    o("#5a3a2a"),
  );
  for (let i = 0; i < 10; i++) s += path(`M${-80 + i * 18} -126 l6 -20 l6 18`, "#3a2a22");
  s +=
    path(`M90 -110 Q150 -110 170 -70 Q170 -50 150 -50 Q110 -40 90 -60 Z`, "none", o("#5a3a2a")) +
    ell(166, -66, 10, 14, "#c08070", stroke("#5a2a2a", 2)) +
    path(`M140 -54 q10 -30 -4 -40`, "none", stroke("#f4f1ea", 6)) +
    circle(130, -94, 6, "#ff4a2a") +
    path(`M96 -116 l10 -26 l12 20 Z`, "#5a3a2a");
  return s;
}

export function horse(c = "#b2321a") {
  let s = ell(0, 0, 130, 12, "#000", 'opacity="0.3"');
  s += path(`M-80 -110 Q-150 -100 -150 -30`, "none", stroke("#2a0a0a", 16));
  for (const [x, a] of [
    [-80, -10],
    [-50, 20],
    [50, -25],
    [80, 15],
  ] as const)
    s += at(x, -60, 1, rect_(-8, 0, 16, 64, c), a);
  s += path(
    `M-100 -70 Q-100 -140 0 -130 L70 -130 Q120 -130 110 -70 Q60 -50 -100 -70 Z`,
    "none",
    o(c),
  );
  s +=
    path(`M70 -120 L120 -210 Q150 -220 180 -170 L170 -150 L130 -160 L110 -110 Z`, "none", o(c)) +
    path(`M80 -130 Q100 -200 130 -214 Q110 -170 100 -126 Z`, "#2a0a0a") +
    circle(148, -186, 5, "#ffd23a");
  return s;
}

export function sloth() {
  return (
    path(`M-160 -170 L160 -170`, "none", stroke("#6a4022", 16)) +
    ell(0, -90, 70, 60, "none", o("#8a7a5a")) +
    path(
      `M-50 -130 Q-80 -160 -80 -170 M50 -130 Q80 -160 80 -170 M-40 -50 Q-90 -110 -100 -170 M40 -50 Q90 -110 100 -170`,
      "none",
      stroke("#6a5a3a", 18),
    ) +
    circle(0, -160, 44, "none", o("#a08a6a")) +
    ell(0, -156, 34, 26, "#e8dcc0") +
    ell(-16, -160, 12, 8, "#4a3a2a", ' transform="rotate(-20 -16 -160)"') +
    ell(16, -160, 12, 8, "#4a3a2a", ' transform="rotate(20 16 -160)"') +
    path(`M-22 -160 q6 4 12 0 M10 -160 q6 4 12 0`, "none", stroke("#fff", 2)) +
    ell(0, -150, 6, 4, ink) +
    path(`M-10 -138 q10 8 20 0`, "none", stroke(ink, 3))
  );
}

export const fireGround = (c = "#ff6a1a") =>
  [0, 1, 2, 3, 4, 5, 6]
    .map((i) =>
      path(
        `M${40 + i * 80} 450 Q${60 + i * 80} 380 ${80 + i * 80} 400 Q${90 + i * 80} 360 ${110 + i * 80} 450 Z`,
        c,
        'opacity="0.55"',
      ),
    )
    .join("");

export { demonMouth };
