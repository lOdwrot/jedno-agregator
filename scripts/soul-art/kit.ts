/**
 * Tiny SVG illustration kit for the "Walka o duszę" card pictures (scripts/soul-art).
 * Every picture is 600×450; the subject stays inside the central band (y 120–330, x 150–450) so it
 * survives both the wide card-face crop and the portrait mini-card crop.
 */
export const W = 600;
export const H = 450;

let n = 0;
/** Unique id inside one SVG document. */
export const uid = (p = "g") => `${p}${++n}`;
export const resetIds = () => {
  n = 0;
};

// ---------- colour helpers ----------
const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
function rgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}
/** amt > 0 lightens towards white, < 0 darkens towards black. */
export function shade(hex: string, amt: number): string {
  const [r, g, b] = rgb(hex);
  const t = amt > 0 ? 255 : 0;
  const k = Math.abs(amt);
  return `#${[r, g, b]
    .map((c) =>
      clamp(c + (t - c) * k)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}
export const mix = (a: string, b: string, k: number) => {
  const A = rgb(a);
  const B = rgb(b);
  return `#${A.map((c, i) =>
    clamp(c + ((B[i] ?? 0) - c) * k)
      .toString(16)
      .padStart(2, "0"),
  ).join("")}`;
};

// ---------- deterministic randomness ----------
export function rng(seed: string) {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

// ---------- primitives ----------
export const g = (body: string, t = "") =>
  t ? `<g transform="${t}">${body}</g>` : `<g>${body}</g>`;
export const at = (x: number, y: number, s = 1, body = "", rot = 0) =>
  `<g transform="translate(${x} ${y})${rot ? ` rotate(${rot})` : ""}${s !== 1 ? ` scale(${s})` : ""}">${body}</g>`;
export const ink = "#1c1424";
export const stroke = (c: string, w = 3) =>
  `stroke="${c}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
/** Fill attribute unless `extra` already brings its own. */
const fa = (fill: string, extra: string) =>
  /(^|\s)fill="/.test(extra) ? extra : `fill="${fill}" ${extra}`;
export const circle = (x: number, y: number, r: number, fill: string, extra = "") =>
  `<circle cx="${x}" cy="${y}" r="${r}" ${fa(fill, extra)}/>`;
export const ell = (x: number, y: number, rx: number, ry: number, fill: string, extra = "") =>
  `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" ${fa(fill, extra)}/>`;
export const rect = (x: number, y: number, w: number, h: number, fill: string, r = 0, extra = "") =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" ${fa(fill, extra)}/>`;
export const path = (d: string, fill: string, extra = "") => `<path d="${d}" ${fa(fill, extra)}/>`;
export const line = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  c: string,
  w = 3,
  extra = "",
) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${stroke(c, w)} ${extra}/>`;
export const text = (x: number, y: number, s: string, size: number, fill: string, extra = "") =>
  `<text x="${x}" y="${y}" font-family="Georgia, serif" font-weight="700" font-size="${size}" text-anchor="middle" fill="${fill}" ${extra}>${s.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</text>`;

/** Outlined shape: fill + darker outline. */
export const ol = (fill: string, w = 3) => `fill="${fill}" ${stroke(shade(fill, -0.55), w)}`;

export function radial(stops: [number, string, number?][], cx = "50%", cy = "50%", r = "50%") {
  const id = uid("r");
  return {
    id,
    def: `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops
      .map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a ?? 1}"/>`)
      .join("")}</radialGradient>`,
  };
}
export function linear(stops: [number, string, number?][], x2 = 0, y2 = 1) {
  const id = uid("l");
  return {
    id,
    def: `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops
      .map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a ?? 1}"/>`)
      .join("")}</linearGradient>`,
  };
}

/** Soft radial glow. */
export function glow(x: number, y: number, r: number, color: string, a = 0.75) {
  const gr = radial([
    [0, color, a],
    [0.45, color, a * 0.45],
    [1, color, 0],
  ]);
  return `<defs>${gr.def}</defs>${circle(x, y, r, `url(#${gr.id})`)}`;
}

/** Light rays from a point. */
export function rays(
  x: number,
  y: number,
  color: string,
  count = 14,
  len = 420,
  a = 0.18,
  seed = "r",
) {
  const rnd = rng(seed);
  let out = "";
  for (let i = 0; i < count; i++) {
    const ang = (i / count) * Math.PI * 2 + rnd() * 0.2;
    const w = 0.06 + rnd() * 0.07;
    const p1 = [x + Math.cos(ang - w) * len, y + Math.sin(ang - w) * len];
    const p2 = [x + Math.cos(ang + w) * len, y + Math.sin(ang + w) * len];
    out += path(
      `M${x} ${y} L${p1[0]} ${p1[1]} L${p2[0]} ${p2[1]} Z`,
      color,
      `opacity="${a * (0.6 + rnd() * 0.6)}"`,
    );
  }
  return out;
}

/** Four-point sparkle. */
export const sparkle = (x: number, y: number, r: number, c = "#fff8d8", a = 1) =>
  path(
    `M${x} ${y - r} Q${x + r * 0.18} ${y - r * 0.18} ${x + r} ${y} Q${x + r * 0.18} ${y + r * 0.18} ${x} ${y + r} Q${x - r * 0.18} ${y + r * 0.18} ${x - r} ${y} Q${x - r * 0.18} ${y - r * 0.18} ${x} ${y - r} Z`,
    c,
    `opacity="${a}"`,
  );

export function sparkles(
  seed: string,
  count: number,
  c = "#fff8d8",
  box: [number, number, number, number] = [20, 20, 580, 300],
) {
  const rnd = rng(seed);
  let out = "";
  for (let i = 0; i < count; i++) {
    const x = box[0] + rnd() * (box[2] - box[0]);
    const y = box[1] + rnd() * (box[3] - box[1]);
    out += sparkle(x, y, 4 + rnd() * 9, c, 0.5 + rnd() * 0.5);
  }
  return out;
}

export function embers(
  seed: string,
  count: number,
  c = "#ff7a2a",
  box: [number, number, number, number] = [0, 40, 600, 450],
) {
  const rnd = rng(seed);
  let out = "";
  for (let i = 0; i < count; i++) {
    const x = box[0] + rnd() * (box[2] - box[0]);
    const y = box[1] + rnd() * (box[3] - box[1]);
    const r = 1.5 + rnd() * 3.5;
    out +=
      circle(x, y, r * 2.4, c, `opacity="${0.12 + rnd() * 0.12}"`) +
      circle(x, y, r, shade(c, 0.4), `opacity="${0.6 + rnd() * 0.4}"`);
  }
  return out;
}

/** Puffy cloud / smoke blob made of circles. */
export function puff(x: number, y: number, s: number, fill: string, a = 1, seed = "p") {
  const rnd = rng(seed);
  let out = "";
  const k = 6;
  for (let i = 0; i < k; i++) {
    const dx = (i - (k - 1) / 2) * 22 * s;
    const r = (26 + rnd() * 18) * s * (1 - Math.abs(i - (k - 1) / 2) / k);
    out += circle(x + dx, y - r * 0.4 + rnd() * 6 * s, r + 10 * s, fill);
  }
  return `<g opacity="${a}">${out}${ell(x, y + 6 * s, 70 * s, 18 * s, fill)}</g>`;
}

export function stars(
  seed: string,
  count: number,
  c = "#ffffff",
  box: [number, number, number, number] = [0, 0, 600, 220],
) {
  const rnd = rng(seed);
  let out = "";
  for (let i = 0; i < count; i++)
    out += circle(
      box[0] + rnd() * (box[2] - box[0]),
      box[1] + rnd() * (box[3] - box[1]),
      0.8 + rnd() * 1.8,
      c,
      `opacity="${0.4 + rnd() * 0.6}"`,
    );
  return out;
}

// ---------- backgrounds ----------
export type Element = "modlitwa" | "slowo" | "sluzba" | "pycha" | "gniew" | "lenistwo";

const PARISH_SKY: Record<string, [string, string, string]> = {
  modlitwa: ["#3e4f8f", "#8fa3d8", "#f6dcb0"],
  slowo: ["#c9852a", "#f2c46b", "#fff1c9"],
  sluzba: ["#c9502c", "#f29a62", "#ffe3c2"],
  neutral: ["#4d6fa8", "#9cc0e6", "#fbe9c6"],
};
const DEMON_SKY: Record<string, [string, string, string]> = {
  pycha: ["#12061f", "#3d1450", "#9a2a4a"],
  gniew: ["#120404", "#4a0c0a", "#b2321a"],
  lenistwo: ["#060b1a", "#182a4a", "#3f5f6e"],
  neutral: ["#0d0610", "#2d0f2a", "#7a2236"],
};

/** Warm, hopeful sky with rays and soft hills. */
export function parishBg(el: string, seed: string, opts: { hills?: boolean; rays?: boolean } = {}) {
  const [a, b, c] = PARISH_SKY[el] ?? PARISH_SKY.neutral!;
  const sky = linear([
    [0, a],
    [0.55, b],
    [1, c],
  ]);
  const rnd = rng(seed);
  const hill = (y: number, col: string, amp: number) => {
    const ph = rnd() * 6;
    let d = `M0 ${H} L0 ${y}`;
    for (let x = 0; x <= W; x += 30)
      d += ` L${x} ${y - Math.sin(x / 90 + ph) * amp - Math.sin(x / 37 + ph * 2) * amp * 0.3}`;
    return path(`${d} L${W} ${H} Z`, col);
  };
  return `<defs>${sky.def}</defs>${rect(0, 0, W, H, `url(#${sky.id})`)}
  ${opts.rays === false ? "" : rays(300, 210, "#fffbe8", 16, 520, 0.16, seed)}
  ${glow(300, 215, 230, "#fff6d6", 0.7)}
  ${stars(seed, el === "modlitwa" ? 30 : 0, "#ffffff", [0, 0, 600, 150])}
  ${opts.hills === false ? "" : hill(372, mix("#6aa55a", a, 0.25), 10) + hill(398, mix("#4f8d48", a, 0.2), 8)}`;
}

/** Murky, smoky hellish backdrop. */
export function demonBg(el: string, seed: string, opts: { ground?: boolean } = {}) {
  const [a, b, c] = DEMON_SKY[el] ?? DEMON_SKY.neutral!;
  const sky = linear([
    [0, a],
    [0.6, b],
    [1, c],
  ]);
  const rnd = rng(seed);
  let smoke = "";
  for (let i = 0; i < 5; i++)
    smoke += puff(rnd() * W, 60 + rnd() * 200, 0.8 + rnd() * 1.2, shade(b, 0.12), 0.25, seed + i);
  let ground = "";
  if (opts.ground !== false) {
    ground = path(`M0 ${H} L0 372 Q150 352 300 368 Q450 384 600 360 L600 ${H} Z`, shade(a, 0.08));
    for (let i = 0; i < 6; i++) {
      const x = 40 + rnd() * 520;
      ground += path(
        `M${x} ${380 + rnd() * 30} l${10 + rnd() * 18} ${12 + rnd() * 10} l${-6 + rnd() * 20} ${14 + rnd() * 12}`,
        "none",
        stroke(c, 2.5) + ` opacity="0.7"`,
      );
    }
  }
  return `<defs>${sky.def}</defs>${rect(0, 0, W, H, `url(#${sky.id})`)}${smoke}
  ${glow(300, 240, 240, c, 0.55)}${ground}${embers(seed, 22, el === "lenistwo" ? "#7fd0c8" : "#ff7a2a")}`;
}

/** Vignette + subtle paper grain on top of everything. */
export function finishLayer(dark: boolean) {
  const v = radial(
    [
      [0.55, "#000", 0],
      [1, "#000", dark ? 0.55 : 0.28],
    ],
    "50%",
    "50%",
    "75%",
  );
  return `<defs>${v.def}</defs>${rect(0, 0, W, H, `url(#${v.id})`)}`;
}

export function svgDoc(body: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${body}</svg>`;
}

// ---------- people ----------
export type Pose =
  "down" | "hold" | "up" | "pray" | "point" | "wave" | "out" | "hips" | "book" | "strum";
type Pt = [number, number];
const POSES: Record<Pose, { l: Pt; r: Pt }> = {
  down: { l: [-44, -48], r: [44, -48] },
  hold: { l: [-16, -78], r: [16, -78] },
  up: { l: [-66, -178], r: [66, -178] },
  pray: { l: [-4, -100], r: [4, -100] },
  point: { l: [-42, -50], r: [76, -128] },
  wave: { l: [-42, -50], r: [62, -170] },
  out: { l: [-74, -92], r: [74, -92] },
  hips: { l: [-38, -66], r: [38, -66] },
  book: { l: [-30, -84], r: [30, -84] },
  strum: { l: [-58, -96], r: [18, -66] },
};

export interface Person {
  skin?: string;
  hair?: string;
  hairStyle?: "short" | "long" | "bun" | "bald" | "curly" | "pony" | "spiky" | "none" | "grey";
  robe?: string;
  /** Visual style of the clothes. */
  dress?:
    | "alb"
    | "cassock"
    | "habit"
    | "casual"
    | "scout"
    | "cowl"
    | "cardinal"
    | "dress"
    | "coat"
    | "uniform"
    | "monk";
  pants?: string;
  face?: "smile" | "sleepy" | "sing" | "wink" | "calm" | "surprised" | "stern" | "joy" | "talk";
  glasses?: boolean;
  beard?: string;
  hat?: string; // svg drawn on top of head (head centre = 0,-152)
  pose?: Pose;
  hands?: { l?: Pt; r?: Pt };
  /** Drawn in front of the body but under the hands. */
  held?: string;
  /** Drawn behind everything (e.g. backpack, wings). */
  back?: string;
  collar?: boolean;
  sleeve?: string;
  wrinkles?: boolean;
  belt?: string;
  blush?: boolean;
}

export const SKIN = ["#f6d2b4", "#eec09a", "#d9a37a", "#b97d56", "#8d5a3b"] as const;

export function face(kind: Person["face"] = "smile", glasses = false, y = -150) {
  const e = ink;
  let eyes = "";
  let mouth = "";
  switch (kind) {
    case "sleepy":
      eyes =
        path(`M-22 ${y} q8 5 16 0`, "none", stroke(e, 3)) +
        path(`M6 ${y} q8 5 16 0`, "none", stroke(e, 3));
      mouth = ell(0, y + 22, 6, 4, "#7a2a2a");
      break;
    case "sing":
      eyes =
        path(`M-22 ${y + 2} q8 -7 16 0`, "none", stroke(e, 3)) +
        path(`M6 ${y + 2} q8 -7 16 0`, "none", stroke(e, 3));
      mouth = ell(0, y + 22, 8, 10, "#7a2a2a") + ell(0, y + 27, 5, 3, "#e46a6a");
      break;
    case "wink":
      eyes = ell(-14, y, 4, 5.5, e) + path(`M6 ${y} q8 -5 16 0`, "none", stroke(e, 3));
      mouth = path(`M-10 ${y + 18} q10 10 20 0`, "none", stroke(e, 3));
      break;
    case "calm":
      eyes =
        path(`M-22 ${y + 1} q8 4 16 0`, "none", stroke(e, 3)) +
        path(`M6 ${y + 1} q8 4 16 0`, "none", stroke(e, 3));
      mouth = path(`M-7 ${y + 19} q7 5 14 0`, "none", stroke(e, 2.6));
      break;
    case "surprised":
      eyes = ell(-14, y, 4.5, 6, e) + ell(14, y, 4.5, 6, e);
      mouth = ell(0, y + 22, 6, 7, "#7a2a2a");
      break;
    case "stern":
      eyes =
        ell(-14, y + 1, 4, 4.5, e) +
        ell(14, y + 1, 4, 4.5, e) +
        line(-22, y - 10, -7, y - 7, e, 3) +
        line(22, y - 10, 7, y - 7, e, 3);
      mouth = line(-8, y + 20, 8, y + 20, e, 3);
      break;
    case "joy":
      eyes =
        path(`M-22 ${y + 2} q8 -9 16 0`, "none", stroke(e, 3.2)) +
        path(`M6 ${y + 2} q8 -9 16 0`, "none", stroke(e, 3.2));
      mouth = path(`M-12 ${y + 15} q12 16 24 0 Z`, "#7a2a2a", stroke(e, 2));
      break;
    case "talk":
      eyes = ell(-14, y, 4, 5.5, e) + ell(14, y, 4, 5.5, e);
      mouth = path(`M-10 ${y + 16} q10 14 20 0 Z`, "#7a2a2a", stroke(e, 2));
      break;
    default:
      eyes =
        ell(-14, y, 4, 5.5, e) +
        ell(14, y, 4, 5.5, e) +
        circle(-12.5, y - 2, 1.4, "#fff") +
        circle(15.5, y - 2, 1.4, "#fff");
      mouth = path(`M-10 ${y + 17} q10 10 20 0`, "none", stroke(e, 3));
  }
  const gl = glasses
    ? circle(-14, y, 11, "none", stroke(e, 2.5)) +
      circle(14, y, 11, "none", stroke(e, 2.5)) +
      line(-3, y, 3, y, e, 2.5)
    : "";
  return eyes + mouth + gl;
}

/** A friendly, big-headed figure standing with its feet at (0,0); ~220 px tall. */
export function person(p: Person = {}) {
  const skin = p.skin ?? SKIN[0];
  const hair = p.hair ?? "#5a3a22";
  const robe = p.robe ?? "#f4f1ea";
  const dress = p.dress ?? "casual";
  const pose = POSES[p.pose ?? "down"];
  const hl = p.hands?.l ?? pose.l;
  const hr = p.hands?.r ?? pose.r;
  const dk = shade(robe, -0.5);
  const sleeve = p.sleeve ?? robe;
  let body = ell(0, 0, 62, 11, "#000", 'opacity="0.22"');
  body += p.back ?? "";
  // hair behind the head
  const hy = -152;
  if (p.hairStyle === "long")
    body += path(
      `M-40 ${hy - 6} Q-50 ${hy + 50} -34 ${hy + 64} L34 ${hy + 64} Q50 ${hy + 50} 40 ${hy - 6} Z`,
      hair,
      stroke(shade(hair, -0.4), 2.5),
    );
  if (p.hairStyle === "pony")
    body += path(
      `M30 ${hy - 20} q36 10 26 60 q-8 -20 -26 -30 Z`,
      hair,
      stroke(shade(hair, -0.4), 2.5),
    );
  // body
  if (dress === "casual" || dress === "scout" || dress === "uniform" || dress === "coat") {
    const pants = p.pants ?? "#34466a";
    body += path(
      `M-26 -48 L-30 -6 L-6 -6 L0 -36 L6 -6 L30 -6 L26 -48 Z`,
      pants,
      stroke(shade(pants, -0.5), 3),
    );
    body += ell(-18, -4, 15, 7, "#3a2a22") + ell(18, -4, 15, 7, "#3a2a22");
    const len = dress === "coat" ? -14 : -46;
    body += path(`M-26 -112 Q-38 -80 -34 ${len} L34 ${len} Q38 -80 26 -112 Z`, robe, stroke(dk, 3));
    if (dress === "scout")
      body +=
        path(`M-14 -112 L0 -86 L14 -112`, "none", stroke("#d9483a", 6)) +
        circle(0, -86, 5, "#e8c15a");
    if (dress === "uniform")
      body +=
        line(0, -110, 0, -48, dk, 2) +
        circle(-6, -95, 2.5, "#e8c15a") +
        circle(-6, -75, 2.5, "#e8c15a");
  } else {
    // long robe
    body += ell(-16, -3, 13, 6, "#3a2a22") + ell(16, -3, 13, 6, "#3a2a22");
    body += path(`M-26 -114 Q-40 -60 -56 -8 Q0 4 56 -8 Q40 -60 26 -114 Z`, robe, stroke(dk, 3));
    body +=
      path(`M-4 -100 Q-10 -50 -18 -10`, "none", stroke(shade(robe, -0.18), 2.5)) +
      path(`M8 -96 Q14 -50 22 -10`, "none", stroke(shade(robe, -0.18), 2.5));
    if (dress === "cassock" || dress === "cardinal")
      for (let i = 0; i < 6; i++)
        body += circle(0, -104 + i * 15, 2.4, dress === "cardinal" ? "#7a0e1a" : "#d24a4a");
    if (dress === "alb")
      body +=
        path(`M-24 -66 Q0 -60 24 -66`, "none", stroke(p.belt ?? "#e8c15a", 4)) +
        line(10, -64, 14, -30, p.belt ?? "#e8c15a", 3);
    if (dress === "habit" || dress === "monk" || dress === "cowl")
      body +=
        path(`M-24 -66 Q0 -60 24 -66`, "none", stroke(p.belt ?? "#2a1e18", 4)) +
        line(-12, -64, -16, -24, p.belt ?? "#2a1e18", 3);
    if (dress === "dress")
      body += path(`M-24 -70 Q0 -62 24 -70`, "none", stroke(shade(robe, -0.25), 4));
  }
  if (p.collar) body += rect(-8, -116, 16, 8, "#ffffff", 2, stroke("#555", 1.5));
  // head
  body += rect(-9, -122, 18, 14, shade(skin, -0.08));
  body +=
    circle(-40, hy + 4, 8, skin, stroke(shade(skin, -0.45), 2.5)) +
    circle(40, hy + 4, 8, skin, stroke(shade(skin, -0.45), 2.5));
  if (dress === "habit")
    body += path(
      `M-50 ${hy - 10} Q-52 ${hy + 60} -40 ${hy + 50} L40 ${hy + 50} Q52 ${hy + 60} 50 ${hy - 10} Q46 ${hy - 54} 0 ${hy - 54} Q-46 ${hy - 54} -50 ${hy - 10} Z`,
      "#1d1d2a",
      stroke("#000", 2.5),
    );
  if (dress === "cowl")
    body += path(
      `M-52 ${hy + 4} Q-50 ${hy - 56} 0 ${hy - 56} Q50 ${hy - 56} 52 ${hy + 4} Q54 ${hy + 56} 30 ${hy + 46} L-30 ${hy + 46} Q-54 ${hy + 56} -52 ${hy + 4} Z`,
      shade(robe, -0.12),
      stroke(dk, 3),
    );
  body += circle(0, hy, 40, skin, stroke(shade(skin, -0.45), 3));
  if (dress === "habit")
    body += path(
      `M-38 ${hy - 14} Q0 ${hy - 34} 38 ${hy - 14} L38 ${hy - 26} Q0 ${hy - 46} -38 ${hy - 26} Z`,
      "#ffffff",
      stroke("#888", 1.5),
    );
  if (p.blush !== false)
    body +=
      ell(-24, hy + 12, 7, 4.5, "#f08a8a", 'opacity="0.55"') +
      ell(24, hy + 12, 7, 4.5, "#f08a8a", 'opacity="0.55"');
  if (p.wrinkles)
    body += path(
      `M-30 ${hy - 4} q4 6 0 10 M30 ${hy - 4} q-4 6 0 10 M-12 ${hy - 26} q12 -4 24 0`,
      "none",
      stroke(shade(skin, -0.35), 2),
    );
  if (p.beard)
    body += path(
      `M-34 ${hy + 6} Q-30 ${hy + 52} 0 ${hy + 56} Q30 ${hy + 52} 34 ${hy + 6} Q20 ${hy + 30} 0 ${hy + 28} Q-20 ${hy + 30} -34 ${hy + 6} Z`,
      p.beard,
      stroke(shade(p.beard, -0.4), 2),
    );
  body += face(p.face, p.glasses, hy + 2);
  // hair on top
  const hs = shade(hair, -0.4);
  switch (p.hairStyle ?? "short") {
    case "short":
      body += path(
        `M-40 ${hy - 2} Q-42 ${hy - 44} 0 ${hy - 44} Q42 ${hy - 44} 40 ${hy - 2} Q30 ${hy - 26} 4 ${hy - 24} Q-26 ${hy - 26} -40 ${hy - 2} Z`,
        hair,
        stroke(hs, 2.5),
      );
      break;
    case "grey":
      body += path(
        `M-40 ${hy - 2} Q-42 ${hy - 40} -14 ${hy - 40} Q-30 ${hy - 26} -40 ${hy - 2} Z M40 ${hy - 2} Q42 ${hy - 40} 14 ${hy - 40} Q30 ${hy - 26} 40 ${hy - 2} Z`,
        hair,
        stroke(hs, 2),
      );
      break;
    case "long":
    case "pony":
      body += path(
        `M-42 ${hy + 4} Q-46 ${hy - 46} 0 ${hy - 46} Q46 ${hy - 46} 42 ${hy + 4} Q36 ${hy - 22} 10 ${hy - 26} Q-8 ${hy - 14} -42 ${hy + 4} Z`,
        hair,
        stroke(hs, 2.5),
      );
      break;
    case "bun":
      body +=
        circle(0, hy - 46, 16, hair, stroke(hs, 2.5)) +
        path(
          `M-40 ${hy} Q-42 ${hy - 44} 0 ${hy - 44} Q42 ${hy - 44} 40 ${hy} Q30 ${hy - 24} 0 ${hy - 26} Q-30 ${hy - 24} -40 ${hy} Z`,
          hair,
          stroke(hs, 2.5),
        );
      break;
    case "curly":
      for (let i = 0; i < 7; i++)
        body += circle(-36 + i * 12, hy - 34 + Math.abs(i - 3) * 4, 13, hair, stroke(hs, 2));
      break;
    case "spiky":
      body += path(
        `M-40 ${hy - 6} L-34 ${hy - 50} L-18 ${hy - 36} L-6 ${hy - 58} L8 ${hy - 38} L22 ${hy - 56} L28 ${hy - 34} L42 ${hy - 44} L40 ${hy - 6} Q20 ${hy - 26} -40 ${hy - 6} Z`,
        hair,
        stroke(hs, 2.5),
      );
      break;
    default:
  }
  body += p.hat ?? "";
  // held prop and arms
  body += p.held ?? "";
  const arm = (side: -1 | 1, h: Pt) => {
    const sx = side * 24;
    const sy = -104;
    const ex = (sx + h[0]) / 2 + side * 14;
    const ey = (sy + h[1]) / 2 + 8;
    return (
      path(`M${sx} ${sy} Q${ex} ${ey} ${h[0]} ${h[1]}`, "none", stroke(shade(sleeve, -0.5), 19)) +
      path(`M${sx} ${sy} Q${ex} ${ey} ${h[0]} ${h[1]}`, "none", stroke(sleeve, 13)) +
      circle(h[0], h[1], 9, skin, stroke(shade(skin, -0.45), 2.5))
    );
  };
  body += arm(-1, hl) + arm(1, hr);
  return body;
}

// ---------- demons ----------
export interface Demon {
  body?: string;
  belly?: string;
  shape?: "imp" | "ghost" | "tall" | "blob";
  horns?: "small" | "curved" | "ram" | "none" | "long";
  hornColor?: string;
  eyes?: "mad" | "sleepy" | "sly" | "glow" | "closed" | "wide" | "bored" | "cross";
  eyeColor?: string;
  mouth?: "grin" | "smirk" | "yawn" | "fang" | "o" | "flat" | "frown" | "shout" | "tongue";
  wings?: string;
  tail?: boolean;
  pose?: Pose;
  hands?: { l?: Pt; r?: Pt };
  held?: string;
  hat?: string;
  back?: string;
  ears?: boolean;
}

export function demonEyes(kind: Demon["eyes"] = "mad", c = "#ffd23a", y = -140) {
  const glowE = (x: number) => circle(x, y, 13, c, 'opacity="0.25"');
  switch (kind) {
    case "sleepy":
      return (
        path(`M-28 ${y} q12 0 22 0 q-11 12 -22 0 Z`, c) +
        path(`M6 ${y} q12 0 22 0 q-11 12 -22 0 Z`, c) +
        line(-30, y, -4, y, ink, 4) +
        line(4, y, 30, y, ink, 4)
      );
    case "bored":
      return (
        path(`M-28 ${y - 4} h22 v6 q-11 8 -22 0 Z`, c) +
        path(`M6 ${y - 4} h22 v6 q-11 8 -22 0 Z`, c) +
        line(-30, y - 4, -4, y - 4, ink, 4) +
        line(4, y - 4, 30, y - 4, ink, 4) +
        circle(-14, y, 2.5, ink) +
        circle(20, y, 2.5, ink)
      );
    case "sly":
      return (
        glowE(-16) +
        glowE(16) +
        path(`M-30 ${y - 2} L-4 ${y - 8} L-6 ${y + 4} Q-20 ${y + 6} -30 ${y - 2} Z`, c) +
        path(`M30 ${y - 2} L4 ${y - 8} L6 ${y + 4} Q20 ${y + 6} 30 ${y - 2} Z`, c) +
        ell(-12, y - 1, 2, 4, ink) +
        ell(12, y - 1, 2, 4, ink)
      );
    case "closed":
      return (
        path(`M-28 ${y} q12 8 22 0`, "none", stroke(ink, 3.5)) +
        path(`M6 ${y} q12 8 22 0`, "none", stroke(ink, 3.5))
      );
    case "wide":
      return (
        circle(-16, y, 12, "#fff", stroke(ink, 2.5)) +
        circle(16, y, 12, "#fff", stroke(ink, 2.5)) +
        circle(-14, y + 2, 5, ink) +
        circle(14, y + 2, 5, ink)
      );
    case "cross":
      return (
        circle(-16, y, 10, c) +
        circle(16, y, 10, c) +
        circle(-10, y + 2, 4, ink) +
        circle(10, y + 2, 4, ink)
      );
    case "glow":
      return (
        glowE(-16) +
        glowE(16) +
        ell(-16, y, 8, 6, c) +
        ell(16, y, 8, 6, c) +
        ell(-16, y, 3, 5, "#fff8c0") +
        ell(16, y, 3, 5, "#fff8c0")
      );
    default:
      return (
        glowE(-16) +
        glowE(16) +
        path(`M-30 ${y - 8} L-4 ${y} Q-14 ${y + 10} -26 ${y + 4} Z`, c) +
        path(`M30 ${y - 8} L4 ${y} Q14 ${y + 10} 26 ${y + 4} Z`, c) +
        circle(-14, y + 1, 3, ink) +
        circle(14, y + 1, 3, ink)
      );
  }
}

export function demonMouth(kind: Demon["mouth"] = "grin", y = -108) {
  switch (kind) {
    case "smirk":
      return (
        path(`M-16 ${y} Q4 ${y + 8} 20 ${y - 8}`, "none", stroke(ink, 3.5)) +
        path(`M12 ${y - 2} l3 7 l4 -8`, "#fff")
      );
    case "yawn":
      return ell(0, y + 4, 14, 16, "#3a0a14", stroke(ink, 3)) + ell(0, y + 12, 8, 5, "#d4506a");
    case "fang":
      return (
        path(`M-22 ${y - 4} Q0 ${y + 14} 22 ${y - 4} Z`, "#3a0a14", stroke(ink, 3)) +
        path(`M-14 ${y - 1} l4 10 l4 -9 Z M6 ${y - 1} l4 10 l4 -10 Z`, "#fff")
      );
    case "o":
      return ell(0, y, 8, 9, "#3a0a14", stroke(ink, 3));
    case "flat":
      return line(-14, y, 14, y + 2, ink, 3.5);
    case "frown":
      return path(`M-16 ${y + 6} Q0 ${y - 8} 16 ${y + 6}`, "none", stroke(ink, 3.5));
    case "shout":
      return (
        path(
          `M-20 ${y - 8} Q0 ${y - 12} 20 ${y - 8} Q14 ${y + 20} 0 ${y + 20} Q-14 ${y + 20} -20 ${y - 8} Z`,
          "#3a0a14",
          stroke(ink, 3),
        ) + path(`M-14 ${y - 8} l4 6 l4 -6 l4 6 l4 -6 l4 6 l4 -6`, "#fff")
      );
    case "tongue":
      return (
        path(`M-20 ${y - 4} Q0 ${y + 12} 20 ${y - 4}`, "#3a0a14", stroke(ink, 3)) +
        path(`M-4 ${y + 4} q4 22 12 6 q-2 -6 -2 -8 Z`, "#e0506a", stroke(ink, 2))
      );
    default:
      return (
        path(
          `M-26 ${y - 8} Q0 ${y + 16} 26 ${y - 8} Q0 ${y + 2} -26 ${y - 8} Z`,
          "#3a0a14",
          stroke(ink, 3),
        ) + path(`M-18 ${y - 3} l4 7 l4 -5 l4 6 l4 -5 l4 6 l4 -5 l4 6`, "none", stroke("#fff", 2))
      );
  }
}

/** A cartoon demon / temptation with its feet at (0,0); ~200 px tall. */
export function demon(d: Demon = {}) {
  const c = d.body ?? "#b23a48";
  const dk = shade(c, -0.55);
  const belly = d.belly ?? shade(c, 0.25);
  const pose = POSES[d.pose ?? "down"];
  const hl = d.hands?.l ?? pose.l;
  const hr = d.hands?.r ?? pose.r;
  const hc = d.hornColor ?? "#f2e6c8";
  let s = d.shape === "ghost" ? "" : ell(0, 0, 58, 10, "#000", 'opacity="0.3"');
  s += d.back ?? "";
  const wing = d.wings;
  if (wing) {
    const wg = (k: 1 | -1) =>
      path(
        `M${k * 20} -110 Q${k * 80} -190 ${k * 130} -170 Q${k * 110} -150 ${k * 118} -128 Q${k * 96} -132 ${k * 100} -108 Q${k * 78} -112 ${k * 76} -88 Q${k * 50} -96 ${k * 20} -80 Z`,
        wing,
        stroke(shade(wing, -0.55), 3),
      );
    s += wg(-1) + wg(1);
  }
  if (d.tail)
    s +=
      path(`M26 -30 Q90 -20 80 -80 Q76 -100 92 -110`, "none", stroke(dk, 9)) +
      path(`M26 -30 Q90 -20 80 -80 Q76 -100 92 -110`, "none", stroke(c, 5)) +
      path(`M86 -116 l20 -6 l-8 18 Z`, c, stroke(dk, 2.5));
  // body
  const shape = d.shape ?? "imp";
  if (shape === "ghost")
    s += path(
      `M-46 -120 Q-60 -40 -50 -10 q12 -10 20 4 q12 -14 22 2 q10 -16 20 0 q10 -14 22 -2 q8 -12 16 2 Q60 -40 46 -120 Z`,
      c,
      stroke(dk, 3),
    );
  else if (shape === "tall")
    s += path(
      `M-30 -120 Q-44 -60 -34 -6 L-8 -6 L0 -40 L8 -6 L34 -6 Q44 -60 30 -120 Z`,
      c,
      stroke(dk, 3),
    );
  else if (shape === "blob")
    s += path(`M-70 -10 Q-80 -110 0 -120 Q80 -110 70 -10 Q0 6 -70 -10 Z`, c, stroke(dk, 3));
  else {
    s += path(`M-20 -30 L-26 -4 L-6 -4 Z M20 -30 L26 -4 L6 -4 Z`, c, stroke(dk, 3));
    s += path(`M-44 -40 Q-58 -110 0 -118 Q58 -110 44 -40 Q0 -16 -44 -40 Z`, c, stroke(dk, 3));
  }
  if (shape !== "ghost")
    s += ell(
      0,
      shape === "blob" ? -50 : -62,
      shape === "blob" ? 42 : 26,
      shape === "blob" ? 34 : 24,
      belly,
      'opacity="0.85"',
    );
  // head (merged on imp/blob)
  const hy = -140;
  const horn = (k: 1 | -1) => {
    switch (d.horns ?? "small") {
      case "none":
        return "";
      case "curved":
        return path(
          `M${k * 26} ${hy - 30} Q${k * 50} ${hy - 50} ${k * 46} ${hy - 82} Q${k * 36} ${hy - 50} ${k * 12} ${hy - 38} Z`,
          hc,
          stroke(shade(hc, -0.6), 2.5),
        );
      case "ram":
        return path(
          `M${k * 26} ${hy - 26} Q${k * 70} ${hy - 50} ${k * 62} ${hy - 6} Q${k * 56} ${hy + 18} ${k * 40} ${hy + 4} Q${k * 54} ${hy - 6} ${k * 48} ${hy - 22} Q${k * 40} ${hy - 30} ${k * 30} ${hy - 12} Z`,
          hc,
          stroke(shade(hc, -0.6), 2.5),
        );
      case "long":
        return path(
          `M${k * 22} ${hy - 32} Q${k * 40} ${hy - 80} ${k * 70} ${hy - 104} Q${k * 44} ${hy - 64} ${k * 8} ${hy - 38} Z`,
          hc,
          stroke(shade(hc, -0.6), 2.5),
        );
      default:
        return path(
          `M${k * 20} ${hy - 32} L${k * 34} ${hy - 62} L${k * 8} ${hy - 38} Z`,
          hc,
          stroke(shade(hc, -0.6), 2.5),
        );
    }
  };
  s += horn(-1) + horn(1);
  if (d.ears)
    s += path(
      `M-40 ${hy - 6} L-66 ${hy - 20} L-42 ${hy + 12} Z M40 ${hy - 6} L66 ${hy - 20} L42 ${hy + 12} Z`,
      c,
      stroke(dk, 2.5),
    );
  s += path(
    `M-44 ${hy + 10} Q-50 ${hy - 46} 0 ${hy - 46} Q50 ${hy - 46} 44 ${hy + 10} Q36 ${hy + 52} 0 ${hy + 52} Q-36 ${hy + 52} -44 ${hy + 10} Z`,
    c,
    stroke(dk, 3),
  );
  s += path(
    `M-28 ${hy - 30} Q-10 ${hy - 40} 6 ${hy - 36}`,
    "none",
    stroke(shade(c, 0.35), 4) + ' opacity="0.6"',
  );
  s += demonEyes(d.eyes, d.eyeColor, hy + 2) + demonMouth(d.mouth, hy + 32);
  s += d.hat ?? "";
  s += d.held ?? "";
  const arm = (k: -1 | 1, h: Pt) => {
    const sx = k * 34;
    const sy = -86;
    const ex = (sx + h[0]) / 2 + k * 16;
    const ey = (sy + h[1]) / 2 + 6;
    return (
      path(`M${sx} ${sy} Q${ex} ${ey} ${h[0]} ${h[1]}`, "none", stroke(dk, 15)) +
      path(`M${sx} ${sy} Q${ex} ${ey} ${h[0]} ${h[1]}`, "none", stroke(c, 9)) +
      circle(h[0], h[1], 8, c, stroke(dk, 2.5)) +
      path(
        `M${h[0] - 6} ${h[1] - 6} l-5 -6 M${h[0]} ${h[1] - 8} l0 -8 M${h[0] + 6} ${h[1] - 6} l5 -6`,
        "none",
        stroke(dk, 2.5),
      )
    );
  };
  if (shape !== "ghost" || d.pose) s += arm(-1, hl) + arm(1, hr);
  return s;
}

// ---------- common props ----------
export const halo = (x: number, y: number, r = 34) =>
  ell(x, y, r, r * 0.32, "none", stroke("#ffe27a", 6) + ' opacity="0.95"') +
  ell(x, y, r, r * 0.32, "none", stroke("#fff8d0", 2));

export const candle = (x: number, y: number, h = 70, w = 16, c = "#fbf3dc") =>
  glow(x, y - h - 14, 50, "#ffd36a", 0.8) +
  rect(x - w / 2, y - h, w, h, c, 3, stroke(shade(c, -0.45), 2.5)) +
  line(x, y - h, x, y - h - 6, ink, 2) +
  path(
    `M${x} ${y - h - 30} Q${x + 9} ${y - h - 14} ${x} ${y - h - 6} Q${x - 9} ${y - h - 14} ${x} ${y - h - 30} Z`,
    "#ffb22e",
    stroke("#d06a10", 1.5),
  ) +
  path(
    `M${x} ${y - h - 22} Q${x + 4} ${y - h - 13} ${x} ${y - h - 9} Q${x - 4} ${y - h - 13} ${x} ${y - h - 22} Z`,
    "#fff3b0",
  );

export const flame = (x: number, y: number, s = 1, c = "#ff8a1e") =>
  at(
    x,
    y,
    s,
    path(
      `M0 -60 Q30 -26 22 -4 Q14 14 0 14 Q-14 14 -22 -4 Q-30 -26 0 -60 Z`,
      c,
      stroke(shade(c, -0.4), 2.5),
    ) + path(`M0 -34 Q14 -14 10 0 Q6 8 0 8 Q-6 8 -10 0 Q-14 -14 0 -34 Z`, "#ffe27a"),
  );

export const cross = (x: number, y: number, s = 1, c = "#e8c15a") =>
  at(
    x,
    y,
    s,
    rect(-6, -40, 12, 80, c, 2, stroke(shade(c, -0.55), 2.5)) +
      rect(-26, -22, 52, 12, c, 2, stroke(shade(c, -0.55), 2.5)),
  );

export function book(x: number, y: number, s = 1, cover = "#7a2a2a", open = false, rot = 0) {
  if (open)
    return at(
      x,
      y,
      s,
      path(`M0 -6 Q-30 -20 -62 -10 L-62 30 Q-30 20 0 34 Z`, "#fbf4e2", stroke("#8a6a40", 2.5)) +
        path(`M0 -6 Q30 -20 62 -10 L62 30 Q30 20 0 34 Z`, "#fbf4e2", stroke("#8a6a40", 2.5)) +
        [0, 1, 2, 3]
          .map(
            (i) =>
              line(-52, -2 + i * 8, -10, 4 + i * 8, "#b6a27e", 2) +
              line(10, 4 + i * 8, 52, -2 + i * 8, "#b6a27e", 2),
          )
          .join(""),
      rot,
    );
  return at(
    x,
    y,
    s,
    rect(-30, -40, 60, 80, cover, 5, stroke(shade(cover, -0.55), 3)) +
      rect(24, -38, 6, 76, "#fbf4e2") +
      cross(0, 0, 0.45, "#e8c15a"),
    rot,
  );
}

export const scroll = (x: number, y: number, s = 1, rot = 0) =>
  at(
    x,
    y,
    s,
    rect(-50, -34, 100, 68, "#f3e6c8", 2, stroke("#b48a52", 2.5)) +
      ell(-50, 0, 9, 38, "#e3cd9f", stroke("#b48a52", 2.5)) +
      ell(50, 0, 9, 38, "#e3cd9f", stroke("#b48a52", 2.5)) +
      [0, 1, 2, 3, 4]
        .map((i) => line(-34, -20 + i * 10, 30 - (i % 2) * 14, -20 + i * 10, "#8a6a40", 2))
        .join(""),
    rot,
  );

export const phone = (x: number, y: number, s = 1, rot = 0, screen = "#6ad0ff") =>
  at(
    x,
    y,
    s,
    rect(-22, -40, 44, 80, "#1c1c26", 8, stroke("#000", 2)) +
      rect(-18, -33, 36, 62, screen, 3) +
      glow(0, 0, 50, screen, 0.35) +
      circle(0, 34, 2.5, "#666"),
    rot,
  );

export const speech = (
  x: number,
  y: number,
  w: number,
  h: number,
  fill = "#fff",
  body = "",
  tail: "l" | "r" = "l",
) =>
  path(
    `M${x - w / 2 + 14} ${y - h / 2} h${w - 28} q14 0 14 14 v${h - 28} q0 14 -14 14 h-${w / 2 - 6} l${tail === "l" ? -28 : 20} 20 l${tail === "l" ? 4 : -14} -20 h-${w / 2 - 36} q-14 0 -14 -14 v-${h - 28} q0 -14 14 -14 Z`,
    fill,
    stroke(shade(fill, -0.6), 3),
  ) + body;

export const note = (x: number, y: number, s = 1, c = "#2a2140") =>
  at(
    x,
    y,
    s,
    ell(0, 0, 9, 7, c, 'transform="rotate(-20)"') +
      line(8, -2, 8, -34, c, 3) +
      path(`M8 -34 q14 4 12 18`, "none", stroke(c, 3)),
  );

export const heart = (x: number, y: number, s = 1, c = "#e2533b") =>
  at(
    x,
    y,
    s,
    path(
      `M0 14 C-30 -6 -24 -30 -8 -30 C-2 -30 0 -24 0 -20 C0 -24 2 -30 8 -30 C24 -30 30 -6 0 14 Z`,
      c,
      stroke(shade(c, -0.5), 2.5),
    ),
  );

export const rosary = (cx: number, cy: number, r = 46, bead = "#7a3b2a", crossC = "#e8c15a") => {
  let s = "";
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * Math.PI * 2;
    s += circle(
      cx + Math.cos(a) * r,
      cy + Math.sin(a) * r * 0.8,
      i % 6 === 0 ? 6 : 4.2,
      bead,
      stroke(shade(bead, -0.5), 1.5),
    );
  }
  s +=
    line(cx, cy + r * 0.8, cx, cy + r * 0.8 + 26, bead, 2.5) +
    cross(cx, cy + r * 0.8 + 44, 0.42, crossC);
  return s;
};

/** Gothic church / building silhouette helper. */
export function church(
  x: number,
  y: number,
  s = 1,
  wall = "#e9dcc4",
  roof = "#9a3a2a",
  tower = true,
) {
  const dk = shade(wall, -0.55);
  let b = rect(-90, -110, 180, 110, wall, 0, stroke(dk, 3));
  b += path(`M-100 -110 L0 -170 L100 -110 Z`, roof, stroke(shade(roof, -0.5), 3));
  b += path(`M-22 0 V-50 Q0 -78 22 -50 V0 Z`, "#5a3a22", stroke(dk, 3));
  for (const k of [-60, 60])
    b +=
      path(`M${k - 12} -40 V-78 Q${k} -96 ${k + 12} -78 V-40 Z`, "#7fb4e6", stroke(dk, 2.5)) +
      line(k, -40, k, -90, dk, 1.5);
  b += circle(0, -128, 14, "#7fb4e6", stroke(dk, 2.5));
  if (tower) {
    b +=
      rect(-26, -250, 52, 140, wall, 0, stroke(dk, 3)) +
      path(`M-34 -250 L0 -320 L34 -250 Z`, roof, stroke(shade(roof, -0.5), 3)) +
      cross(0, -334, 0.4, "#e8c15a");
    b += path(`M-10 -200 V-226 Q0 -238 10 -226 V-200 Z`, "#3a2a22");
  }
  return at(x, y, s, b);
}

export const table = (y = 330, c = "#8a5a36") =>
  path(`M60 ${y} L540 ${y} L560 ${y + 24} L40 ${y + 24} Z`, c, stroke(shade(c, -0.5), 3)) +
  rect(40, y + 24, 520, 14, shade(c, -0.2), 0, stroke(shade(c, -0.5), 3));

/** A cloth-covered pedestal with a glow, for item cards. */
export const pedestal = (dark: boolean) =>
  ell(300, 336, 150, 26, dark ? "#2a0d1e" : "#f4e2c0", stroke(dark ? "#000" : "#b48a52", 3)) +
  ell(300, 330, 128, 18, dark ? "#4a1530" : "#fffaf0", 'opacity="0.7"');
