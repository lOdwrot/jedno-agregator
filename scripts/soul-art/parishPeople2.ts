import {
  at,
  book,
  candle,
  church,
  circle,
  cross,
  flame,
  glow,
  halo,
  heart,
  ink,
  line,
  note,
  path,
  person,
  rect,
  rosary,
  shade,
  SKIN,
  sparkles,
  stroke,
} from "./kit";
import {
  backpack,
  baton,
  biretta,
  box,
  cap,
  crozier,
  guitar,
  headband,
  helmet,
  megaphone,
  mitre,
  scoutHat,
  staff,
  zucchetto,
} from "./props";
import { light, type Scene } from "./scene";

const scooter = (x: number, y: number) =>
  at(
    x,
    y,
    1,
    circle(-70, -16, 18, "#333", stroke("#000", 3)) +
      circle(70, -16, 18, "#333", stroke("#000", 3)) +
      circle(-70, -16, 7, "#aaa") +
      circle(70, -16, 7, "#aaa") +
      path(`M-90 -30 Q-80 -70 -30 -66 L40 -60 L60 -30 Z`, "#e2533b", stroke("#7a1a10", 3)) +
      line(60, -30, 76, -130, "#555", 7) +
      line(62, -130, 92, -130, "#333", 8) +
      circle(80, -100, 8, "#fff3b0", stroke("#888", 2)),
  );

const pipes = (x0: number, n: number, c = "#d5dbe4") => {
  let s = "";
  for (let i = 0; i < n; i++) {
    const h = 160 + Math.sin(i * 0.9) * 50 + (n / 2 - Math.abs(i - n / 2)) * 14;
    s +=
      rect(x0 + i * 26, 290 - h, 20, h, c, 8, stroke(shade(c, -0.55), 2.5)) +
      path(`M${x0 + i * 26 + 4} ${300 - h + 40} h12 l-6 10 Z`, ink);
  }
  return s;
};

const choirFigure = (x: number, y: number, s: number, i: number, skin: string) =>
  at(
    x,
    y,
    s,
    person({
      dress: "alb",
      robe: i % 2 ? "#7a1a2a" : "#2a3a7a",
      skin,
      hairStyle: (["short", "long", "bun", "curly", "grey"] as const)[i % 5],
      hair: ["#3a2a1a", "#c58a3a", "#1a1a1a", "#7a3a1a", "#bbbbbb"][i % 5],
      face: "sing",
      pose: "book",
    }) + book(0, -84, 0.6, "#1d1d2a", true),
  );

export const MORE_PEOPLE: Record<string, Scene> = {
  wikariusz: light("slowo", function wikariusz() {
    return (
      path(
        `M60 372 q-30 -6 -40 -24 M70 352 q-36 -2 -50 -14`,
        "none",
        stroke("#fff", 4) + ' opacity="0.7"',
      ) +
      scooter(300, 380) +
      at(
        280,
        340,
        0.9,
        person({
          dress: "cassock",
          robe: "#1f1f2a",
          collar: true,
          face: "joy",
          hat: helmet("#2f7fc4"),
          pose: "out",
          hands: { l: [-30, -80], r: [84, -120] },
        }),
      ) +
      book(150, 300, 0.6, "#2e7d32", false, -20) +
      book(120, 270, 0.5, "#7a2a2a", false, 15) +
      note(470, 200, 1.2, "#2a2140")
    );
  }),
  proboszcz: light("sluzba", function proboszcz() {
    return (
      church(440, 372, 0.85) +
      at(
        250,
        380,
        1.05,
        person({
          dress: "cassock",
          robe: "#1f1f2a",
          collar: true,
          hairStyle: "grey",
          hair: "#cfcfcf",
          face: "smile",
          glasses: true,
          wrinkles: true,
          hat: biretta(),
          pose: "point",
          hands: { r: [80, -140] },
        }),
      ) +
      at(
        330,
        228,
        0.7,
        path(`M0 0 l22 -10 l6 12 l-22 10 Z`, "#9a3a2a", stroke("#5a1a10", 2)) +
          `<text x="14" y="-2" font-size="12" font-family="Georgia" fill="#fff">17</text>`,
      )
    );
  }),
  scholanka: light("modlitwa", function scholanka() {
    return (
      at(
        300,
        380,
        1.05,
        person({
          dress: "casual",
          robe: "#5aa0d8",
          hairStyle: "long",
          hair: "#b0702a",
          face: "sing",
          pose: "strum",
          held: guitar(-10, -62, 0.8, -55),
        }),
      ) +
      note(180, 190, 1.2) +
      note(420, 160, 1) +
      note(450, 240, 1.4, "#4a2a6a") +
      phone_(440, 320)
    );
  }),
  babcia: light("modlitwa", function babcia() {
    return (
      at(
        300,
        384,
        1.1,
        person({
          dress: "dress",
          robe: "#6a4a7a",
          hairStyle: "bun",
          hair: "#d8d8d8",
          face: "calm",
          wrinkles: true,
          glasses: true,
          pose: "pray",
          hat: path(
            `M-46 -150 Q-50 -206 0 -208 Q50 -206 46 -150 Q30 -178 0 -180 Q-30 -178 -46 -150 Z`,
            "#d24a6a",
            stroke("#7a1a3a", 2.5),
          ),
          held: rosary(0, -70, 24, "#4a2a6a"),
        }),
      ) +
      `<text x="470" y="170" font-family="Georgia" font-size="40" font-weight="700" fill="#fff8d8" text-anchor="middle" opacity="0.85">1987</text>` +
      heart(150, 210, 1, "#e2533b") +
      sparkles("bab", 10, "#fff8d8", [100, 80, 500, 200])
    );
  }),
  oazowicz: light("sluzba", function oazowicz() {
    const tent =
      path(`M380 372 L460 230 L540 372 Z`, "#e8a040", stroke("#7a4a14", 3)) +
      path(`M460 230 L440 372 L480 372 Z`, "#7a4a14");
    let tags = "";
    for (let i = 0; i < 7; i++)
      tags += rect(
        -34 + (i % 4) * 18,
        -110 + Math.floor(i / 4) * 18,
        14,
        16,
        ["#f6d36a", "#9cc0e6", "#e2533b", "#6cbf4a"][i % 4]!,
        2,
        stroke("#333", 1.5),
      );
    return (
      tent +
      at(
        270,
        380,
        1.05,
        person({
          dress: "casual",
          robe: "#f4f1ea",
          pants: "#3a6a8a",
          hairStyle: "curly",
          hair: "#2a1a10",
          face: "joy",
          pose: "wave",
          held: tags + line(0, -116, 0, -92, "#333", 1),
        }),
      )
    );
  }),
  animator: light("sluzba", function animator() {
    return (
      flame(150, 360, 1.3) +
      at(150, 372, 1, path(`M-40 0 L40 -16 M-40 -16 L40 0`, "none", stroke("#6a4022", 10))) +
      at(
        320,
        384,
        1.05,
        person({
          dress: "casual",
          robe: "#e2533b",
          pants: "#34466a",
          hairStyle: "pony",
          hair: "#5a2a14",
          face: "joy",
          pose: "out",
          hands: { l: [-80, -110], r: [80, -150] },
        }),
      ) +
      at(
        406,
        228,
        0.8,
        path(`M0 0 h40 v-30 h-40 Z`, "#d5dbe4", stroke("#555", 2.5)) +
          line(20, -30, 20, -70, "#555", 4),
      ) +
      note(420, 160, 1)
    );
  }),
  dyrygentka: light("modlitwa", function dyrygentka() {
    return (
      at(
        300,
        384,
        1.05,
        person({
          dress: "dress",
          robe: "#1d1d2a",
          hairStyle: "bun",
          hair: "#7a3a1a",
          face: "stern",
          glasses: true,
          pose: "up",
          hands: { l: [-70, -140], r: [70, -170] },
          held: baton(370 - 300, -170, 30),
        }),
      ) +
      note(160, 170, 1.2) +
      note(200, 250, 0.9) +
      note(440, 260, 1.1) +
      path(`M120 210 q40 -40 80 0 q40 40 80 0`, "none", stroke("#fff8d8", 2) + ' opacity="0.6"')
    );
  }),
  chor: light("modlitwa", function chor() {
    let s = "";
    const row = [
      [170, 300],
      [250, 300],
      [330, 300],
      [410, 300],
      [210, 380],
      [300, 384],
      [390, 380],
    ] as const;
    row.forEach(([x, y], i) => (s += choirFigure(x, y, i < 4 ? 0.62 : 0.75, i, SKIN[i % 5]!)));
    return s + note(110, 180, 1.2) + note(500, 170, 1.2) + note(470, 110, 0.9);
  }),
  siostra: light("modlitwa", function siostra() {
    const gum = circle(456, 300, 16, "#f08ab0", stroke("#a03a6a", 2.5));
    return (
      candle(140, 372, 90) +
      at(
        300,
        384,
        1.1,
        person({
          dress: "habit",
          robe: "#1d1d2a",
          face: "stern",
          pose: "point",
          hands: { r: [90, -100] },
          sleeve: "#1d1d2a",
          held: cross(0, -84, 0.5, "#c9a24a"),
        }),
      ) +
      gum +
      path(`M420 290 l-10 -14 M440 274 l-4 -18 M470 276 l8 -16`, "none", stroke("#fff8d8", 3))
    );
  }),
  organista: light("slowo", function organista() {
    return (
      pipes(170, 10) +
      rect(150, 300, 300, 70, "#6a4022", 6, stroke("#3a2010", 3)) +
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
        .map((i) => rect(170 + i * 22, 304, 20, 22, "#fbf4e2", 2, stroke("#555", 1.5)))
        .join("") +
      at(
        300,
        404,
        0.9,
        person({
          dress: "coat",
          robe: "#4a5a3a",
          hairStyle: "grey",
          hair: "#ddd",
          beard: "#ddd",
          face: "calm",
          wrinkles: true,
          pose: "out",
          hands: { l: [-60, -110], r: [60, -110] },
        }),
      ) +
      note(470, 140, 1.1)
    );
  }),
  kancelaria: light("sluzba", function kancelaria() {
    const clock = at(
      470,
      150,
      1,
      circle(0, 0, 34, "#fbf4e2", stroke("#555", 4)) +
        line(0, 0, 0, -22, ink, 3) +
        line(0, 0, 16, 6, ink, 3),
    );
    return (
      clock +
      rect(110, 300, 380, 80, "#8a5a36", 4, stroke("#4a2a16", 3)) +
      at(
        300,
        330,
        0.95,
        person({
          dress: "dress",
          robe: "#9cc0e6",
          hairStyle: "short",
          hair: "#a03a2a",
          face: "wink",
          glasses: true,
          pose: "hold",
        }),
      ) +
      [0, 1, 2]
        .map((i) =>
          rect(
            140,
            260 - i * 14,
            70,
            14,
            ["#e2533b", "#f6d36a", "#2f7fc4"][i]!,
            2,
            stroke("#333", 2),
          ),
        )
        .join("") +
      rect(380, 270, 70, 32, "#fbf4e2", 2, stroke("#555", 2)) +
      `<text x="415" y="292" font-family="Georgia" font-size="14" text-anchor="middle" fill="#333">16-17:30</text>`
    );
  }),
  dorota: light("modlitwa", function dorota() {
    const roses = [0, 1, 2, 3, 4]
      .map((i) =>
        circle(-36 + i * 18, -196 + Math.abs(i - 2) * 4, 8, "#d24a6a", stroke("#7a1a3a", 2)),
      )
      .join("");
    return (
      church(130, 372, 0.6, "#c8705a", "#7a2a2a") +
      glow(300, 200, 120, "#fff2b0", 0.6) +
      at(
        300,
        384,
        1.1,
        person({
          dress: "habit",
          robe: "#6a4a3a",
          face: "calm",
          pose: "pray",
          hat: halo(0, -210, 42) + roses,
        }),
      ) +
      sparkles("dor", 10, "#fff8d8", [200, 80, 520, 260])
    );
  }),
  kandydat: light("modlitwa", function kandydat() {
    const dove = at(
      420,
      150,
      1,
      path(`M-30 0 Q0 -20 30 -4 L50 -10 L36 4 Q10 20 -30 0 Z`, "#ffffff", stroke("#8a93a0", 2.5)) +
        path(`M-6 -6 Q-10 -46 20 -40 Q10 -20 8 -4 Z`, "#ffffff", stroke("#8a93a0", 2.5)) +
        circle(32, -6, 2.5, ink),
    );
    return (
      glow(420, 150, 90, "#ffffff", 0.7) +
      dove +
      at(
        280,
        384,
        1.1,
        person({
          dress: "cardinal",
          robe: "#c62828",
          collar: false,
          hairStyle: "grey",
          hair: "#ccc",
          face: "surprised",
          wrinkles: true,
          hat: zucchetto("#c62828"),
          pose: "pray",
          held: cross(0, -88, 0.4, "#e8c15a"),
        }),
      )
    );
  }),
  wolontariuszka: light("sluzba", function wolontariuszka() {
    return (
      box(160, 372, 1, "#c98a4a", heart(0, -28, 0.8, "#e2533b")) +
      box(450, 372, 0.9, "#d89a5a") +
      at(
        310,
        384,
        1.05,
        person({
          dress: "casual",
          robe: "#e8672a",
          pants: "#34466a",
          hairStyle: "pony",
          hair: "#2a1a10",
          face: "joy",
          pose: "hold",
          held: box(0, -54, 0.6, "#e8b06a", heart(0, -28, 0.7, "#e2533b")),
        }),
      ) +
      heart(440, 170, 1.1, "#e8672a")
    );
  }),
  kaznodzieja: light("slowo", function kaznodzieja() {
    return (
      path(`M200 372 L210 270 L390 270 L400 372 Z`, "#8a5a36", stroke("#4a2a16", 3)) +
      path(`M190 270 Q300 250 410 270 L400 286 L200 286 Z`, "#a86e44", stroke("#4a2a16", 3)) +
      at(
        300,
        290,
        0.9,
        person({
          dress: "cassock",
          robe: "#1f1f2a",
          collar: true,
          hairStyle: "short",
          hair: "#222",
          face: "talk",
          pose: "up",
        }),
      ) +
      flame(300, 96, 0.8) +
      flame(140, 200, 0.6) +
      flame(460, 200, 0.6) +
      at(
        480,
        300,
        0.7,
        circle(0, 0, 30, "#fbf4e2", stroke("#555", 4)) +
          line(0, 0, 0, -20, ink, 3) +
          line(0, 0, 14, 0, ink, 3) +
          path(`M-40 -40 l80 80`, "none", stroke("#c62828", 6)),
      )
    );
  }),
  ewangelizator: light("slowo", function ewangelizator() {
    return (
      at(
        110,
        380,
        0.7,
        person({
          dress: "coat",
          robe: "#7a8a9a",
          hairStyle: "short",
          hair: "#555",
          face: "surprised",
          pose: "down",
        }),
      ) +
      at(
        490,
        380,
        0.7,
        person({
          dress: "coat",
          robe: "#9a6a5a",
          hairStyle: "bun",
          hair: "#222",
          face: "calm",
          pose: "down",
        }),
      ) +
      at(
        290,
        384,
        1.05,
        person({
          dress: "casual",
          robe: "#f6d36a",
          pants: "#34466a",
          hairStyle: "spiky",
          hair: "#3a2a1a",
          face: "talk",
          pose: "point",
          hands: { r: [66, -140] },
          held: book(-30, -80, 0.5, "#7a2a2a"),
        }),
      ) +
      megaphone(366, 238, 0.9, -16) +
      path(`M450 180 q14 30 0 60 M474 166 q22 44 0 88`, "none", stroke("#fff8d8", 4))
    );
  }),
  pielgrzym: light("modlitwa", function pielgrzym() {
    const monastery =
      rect(440, 230, 80, 120, "#f4f1ea", 0, stroke("#777", 2.5)) +
      rect(468, 120, 24, 110, "#f4f1ea", 0, stroke("#777", 2.5)) +
      path(
        `M474 170 v-16 q6 -8 12 0 v16 Z M454 300 v-24 q8 -10 16 0 v24 Z M490 300 v-24 q8 -10 16 0 v24 Z`,
        "#5a4a3a",
      ) +
      path(`M462 120 L480 60 L498 120 Z`, "#4a7a5a", stroke("#2a4a3a", 2.5)) +
      cross(480, 48, 0.3);
    return (
      monastery +
      glow(480, 100, 80, "#fff8d0", 0.7) +
      at(
        250,
        386,
        1.05,
        person({
          dress: "casual",
          robe: "#6cbf4a",
          pants: "#6a5a3a",
          hairStyle: "short",
          hair: "#7a4a1a",
          face: "joy",
          hat: cap("#f6d36a"),
          back: backpack("#2f7fc4"),
          pose: "point",
          hands: { l: [-56, -40], r: [90, -150] },
          held: staff(-56, -10, 150),
        }),
      )
    );
  }),
  postulant: light("modlitwa", function postulant() {
    const door =
      path(`M330 372 V180 Q420 110 510 180 V372 Z`, "#6a4022", stroke("#3a2010", 4)) +
      path(`M346 372 V188 Q420 130 494 188 V372 Z`, "#8a5a36") +
      line(420, 150, 420, 372, "#3a2010", 3) +
      circle(404, 280, 6, "#e8c15a") +
      circle(436, 280, 6, "#e8c15a");
    return (
      door +
      at(
        220,
        386,
        1.05,
        person({
          dress: "casual",
          robe: "#9cc0e6",
          pants: "#5a6a7a",
          hairStyle: "short",
          hair: "#c58a3a",
          face: "surprised",
          pose: "wave",
          hands: { r: [70, -130] },
          held: rect(-60, -60, 34, 50, "#7a4a2a", 6, stroke("#3a2010", 2.5)),
        }),
      )
    );
  }),
  cysters: light("modlitwa", function cysters() {
    const quill = at(
      380,
      230,
      1,
      path(`M0 0 Q30 -60 70 -90 Q50 -40 4 4 Z`, "#fbf4e2", stroke("#8a8a8a", 2)),
      0,
    );
    return (
      rect(150, 296, 300, 76, "#6a4022", 4, stroke("#3a2010", 3)) +
      at(
        300,
        316,
        0.95,
        person({
          dress: "monk",
          robe: "#f4f1ea",
          hairStyle: "grey",
          hair: "#7a5a3a",
          face: "calm",
          pose: "hold",
          hat: path(
            `M-40 -150 Q-44 -200 0 -200 Q44 -200 40 -150 Q30 -180 0 -182 Q-30 -180 -40 -150 Z`,
            "#2a1a10",
            stroke("#000", 2),
          ),
        }),
      ) +
      book(300, 280, 0.9, "#7a2a2a", true) +
      quill +
      candle(470, 296, 50, 12)
    );
  }),
  opat: light("modlitwa", function opat() {
    return (
      pipes(110, 4, "#e3cd9f") +
      pipes(400, 4, "#e3cd9f") +
      crozier(400, 384) +
      at(
        300,
        390,
        1.1,
        person({
          dress: "monk",
          robe: "#f4f1ea",
          hairStyle: "none",
          face: "smile",
          wrinkles: true,
          beard: "#ddd",
          hat: mitre(),
          pose: "point",
          hands: { r: [94, -110] },
          held: cross(0, -90, 0.4, "#e8c15a"),
        }),
      ) +
      sparkles("opat", 8, "#fff8d8", [100, 60, 500, 200])
    );
  }),
  zuch: light("sluzba", function zuch() {
    let badges = "";
    for (let i = 0; i < 6; i++)
      badges += circle(
        -20 + (i % 3) * 18,
        -96 + Math.floor(i / 3) * 18,
        7,
        ["#e2533b", "#f6d36a", "#2f7fc4", "#6cbf4a", "#a04ad0", "#e8672a"][i]!,
        stroke("#333", 1.5),
      );
    return (
      at(
        300,
        384,
        1.05,
        person({
          dress: "scout",
          robe: "#4a7a5a",
          pants: "#34466a",
          hairStyle: "short",
          hair: "#e8b060",
          face: "joy",
          hat: cap("#d9483a"),
          pose: "wave",
          held: badges,
        }),
      ) +
      at(
        440,
        372,
        1,
        path(`M-14 0 L-10 -40 L10 -40 L14 0 Z`, "#f4f1ea", stroke("#777", 2.5)) +
          path(`M-4 -40 h8`, "none", stroke("#c62828", 3)),
      ) +
      at(150, 372, 1, path(`M-14 0 L-10 -40 L10 -40 L14 0 Z`, "#f4f1ea", stroke("#777", 2.5)))
    );
  }),
  harcerz: light("sluzba", function harcerz() {
    const match = line(0, 0, 0, -40, "#d9a050", 5) + circle(0, -44, 6, "#c62828");
    return (
      at(160, 372, 1, path(`M-40 0 L40 -16 M-40 -16 L40 0`, "none", stroke("#6a4022", 10))) +
      flame(160, 352, 1) +
      at(
        320,
        384,
        1.05,
        person({
          dress: "scout",
          robe: "#5a6a3a",
          pants: "#3a4a2a",
          hairStyle: "short",
          hair: "#5a3a22",
          face: "smile",
          hat: scoutHat(),
          pose: "hold",
          hands: { r: [60, -130] },
          held: at(
            -30,
            -40,
            1,
            `<text font-size="34" fill="#e8c15a" font-family="Georgia">⚜</text>`,
          ),
        }),
      ) +
      at(380, 252, 1, match)
    );
  }),
  harcmistrz: light("sluzba", function harcmistrz() {
    return (
      at(300, 380, 1.2, path(`M-50 0 L50 -20 M-50 -20 L50 0`, "none", stroke("#6a4022", 12))) +
      glow(300, 300, 160, "#ffb22e", 0.6) +
      flame(300, 360, 1.6) +
      at(
        150,
        392,
        0.9,
        person({
          dress: "scout",
          robe: "#5a6a3a",
          pants: "#3a4a2a",
          hairStyle: "grey",
          hair: "#ccc",
          beard: "#bbb",
          face: "sing",
          hat: scoutHat("#4a5a2a"),
          pose: "out",
        }),
      ) +
      at(
        460,
        392,
        0.75,
        person({
          dress: "scout",
          robe: "#4a7a5a",
          pants: "#34466a",
          face: "sing",
          hat: headband(),
          hairStyle: "short",
          hair: "#7a4a1a",
          pose: "up",
        }),
      ) +
      note(300, 150, 1.2) +
      note(380, 120, 0.9) +
      `<text x="300" y="70" font-family="Georgia" font-size="26" text-anchor="middle" fill="#fff8d8" font-style="italic">Czuwaj!</text>`
    );
  }),
};

function phone_(x: number, y: number) {
  return at(
    x,
    y,
    0.6,
    rect(-22, -40, 44, 80, "#1c1c26", 8) +
      rect(-18, -33, 36, 62, "#fbf4e2", 3) +
      [0, 1, 2, 3].map((i) => line(-12, -24 + i * 12, 12, -24 + i * 12, "#777", 2)).join(""),
    12,
  );
}
