import {
  at,
  circle,
  demon,
  ell,
  embers,
  glow,
  ink,
  line,
  path,
  phone,
  puff,
  rect,
  sparkle,
  speech,
  stroke,
  text,
} from "./kit";
import { dragon, fly, peacock, serpent } from "./creatures";
import { crown } from "./props";
import { dark, type Scene } from "./scene";
import { MORE_DEMONS } from "./demonChars2";

const zzz = (x: number, y: number, c = "#9ad8e0") =>
  text(x, y, "z", 26, c) + text(x + 22, y - 24, "z", 34, c) + text(x + 50, y - 56, "Z", 44, c);
const alarm = (x: number, y: number, s = 1) =>
  at(
    x,
    y,
    s,
    circle(-24, -40, 12, "#c62828", stroke("#400", 2.5)) +
      circle(24, -40, 12, "#c62828", stroke("#400", 2.5)) +
      circle(0, 0, 40, "#e2533b", stroke("#400", 3)) +
      circle(0, 0, 30, "#fbf4e2") +
      line(0, 0, 0, -20, ink, 3) +
      line(0, 0, 14, 4, ink, 3) +
      path(`M-26 40 l-8 12 M26 40 l8 12`, "none", stroke("#400", 4)),
  );
const calendar = (x: number, y: number, s = 1, label = "jutro") =>
  at(
    x,
    y,
    s,
    rect(-50, -50, 100, 100, "#fbf4e2", 6, stroke("#555", 3)) +
      rect(-50, -50, 100, 26, "#c62828", 6) +
      text(0, 14, label, 22, "#3a2a14") +
      path(`M-30 -58 v14 M30 -58 v14`, "none", stroke("#555", 5)),
  );
const mirror = (x: number, y: number, s = 1) =>
  at(
    x,
    y,
    s,
    ell(0, 0, 50, 66, "#c9a24a", stroke("#6a4a14", 3)) +
      ell(0, 0, 40, 56, "#bfe3f5") +
      path(`M-20 -30 l20 -16 M-26 -10 l34 -28`, "none", stroke("#fff", 4)) +
      rect(-8, 62, 16, 50, "#c9a24a", 3, stroke("#6a4a14", 2)),
  );
const coin = (x: number, y: number, r = 16) =>
  ell(x, y, r, r * 0.9, "#e8c15a", stroke("#8a6514", 2.5)) +
  text(x, y + r * 0.35, "$", r, "#8a6514");

export const DEMON_CHARS: Record<string, Scene> = {
  drzemka: dark("lenistwo", function drzemka() {
    return (
      rect(130, 330, 340, 40, "#4a3a6a", 10, stroke("#1a1030", 3)) +
      ell(170, 326, 50, 22, "#e8e0f0", stroke("#8a80a0", 2.5)) +
      at(
        300,
        360,
        0.95,
        demon({
          body: "#6a7ac0",
          shape: "blob",
          horns: "small",
          eyes: "closed",
          mouth: "o",
          pose: "hold",
        }),
      ) +
      alarm(470, 300, 0.8) +
      path(`M496 230 l-30 40`, "none", stroke("#fff", 4)) +
      zzz(380, 170)
    );
  }),
  odkladanie: dark("lenistwo", function odkladanie() {
    return (
      calendar(160, 200, 1, "jutro") +
      calendar(440, 170, 0.8, "jutro") +
      calendar(480, 300, 0.6, "jutro") +
      at(
        300,
        380,
        1.05,
        demon({
          body: "#4a8a8a",
          horns: "curved",
          eyes: "bored",
          mouth: "smirk",
          pose: "point",
          hands: { r: [80, -130] },
        }),
      )
    );
  }),
  scroll: dark("lenistwo", function scroll_() {
    return (
      glow(300, 200, 160, "#6ad0ff", 0.4) +
      at(
        300,
        380,
        1.05,
        demon({
          body: "#2a5a9a",
          horns: "small",
          eyes: "wide",
          mouth: "flat",
          pose: "hold",
          held: phone(0, -90, 0.9, 0, "#6ad0ff"),
        }),
      ) +
      [0, 1, 2]
        .map((i) =>
          path(
            `M${440 + i * 30} ${160 + i * 20} v-40 l-8 10 m8 -10 l8 10`,
            "none",
            stroke("#6ad0ff", 4),
          ),
        )
        .join("") +
      text(140, 180, "3h", 44, "#6ad0ff")
    );
  }),
  zniechecenie: dark("lenistwo", function zniechecenie() {
    let rain = "";
    for (let i = 0; i < 14; i++)
      rain += line(
        200 + i * 15,
        150 + (i % 3) * 10,
        194 + i * 15,
        180 + (i % 3) * 10,
        "#9ab4d0",
        2.5,
      );
    return (
      puff(300, 130, 1.3, "#4a5a6a", 0.9, "zn") +
      rain +
      at(
        300,
        390,
        1.1,
        demon({
          body: "#7a8a9a",
          shape: "ghost",
          horns: "none",
          eyes: "sleepy",
          eyeColor: "#bcd0e0",
          mouth: "frown",
        }),
      ) +
      puff(160, 350, 0.8, "#5a6a7a", 0.5, "z1") +
      puff(450, 360, 0.9, "#5a6a7a", 0.5, "z2")
    );
  }),
  szyderca: dark("pycha", function szyderca() {
    const hat =
      path(
        `M-40 -170 L-60 -230 L-10 -186 L0 -240 L10 -186 L60 -230 L40 -170 Z`,
        "#7a1aa0",
        stroke("#2a0040", 2.5),
      ) +
      circle(-60, -232, 7, "#e8c15a") +
      circle(0, -242, 7, "#e8c15a") +
      circle(60, -232, 7, "#e8c15a");
    return (
      at(
        300,
        380,
        1.05,
        demon({ body: "#c0406a", horns: "none", eyes: "sly", mouth: "grin", pose: "up", hat }),
      ) +
      text(140, 200, "HA", 40, "#ffd23a") +
      text(460, 160, "HA", 34, "#ffd23a") +
      text(470, 260, "HA", 28, "#ffd23a")
    );
  }),
  plotka: dark("gniew", function plotka() {
    return (
      at(
        220,
        380,
        1,
        demon({
          body: "#c05a2a",
          horns: "small",
          eyes: "sly",
          mouth: "smirk",
          pose: "point",
          hands: { r: [60, -130] },
        }),
      ) +
      speech(430, 180, 200, 90, "#fbf4e2", text(430, 186, "Podobno…", 24, "#3a2a14"), "l") +
      at(
        430,
        300,
        0.5,
        path(`M-40 0 Q0 -50 40 0 Q0 30 -40 0 Z`, "#fbf4e2", stroke("#333", 3)) +
          circle(0, 0, 10, ink),
      )
    );
  }),
  obmowa: dark("gniew", function obmowa() {
    return (
      at(320, 380, 1.2, serpent("#3f8a3a")) +
      speech(160, 150, 150, 80, "#fbf4e2", text(160, 158, "psst…", 24, "#3a2a14"), "r")
    );
  }),
  zlosnik: dark("gniew", function zlosnik() {
    const steam = (x: number) =>
      path(`M${x} 120 q-14 -20 0 -40 q14 -20 0 -40`, "none", stroke("#fff", 6) + ' opacity="0.6"');
    return (
      steam(250) +
      steam(350) +
      at(
        300,
        380,
        1.05,
        demon({ body: "#d23a2a", horns: "small", eyes: "mad", mouth: "shout", pose: "hips" }),
      ) +
      path(
        `M140 200 l20 10 l-14 10 l20 10 M460 200 l-20 10 l14 10 l-20 10`,
        "none",
        stroke("#ffd23a", 4),
      )
    );
  }),
  krytykant: dark("gniew", function krytykant() {
    const monocle =
      circle(16, -138, 16, "none", stroke("#e8c15a", 3)) +
      path(`M30 -128 q10 30 0 60`, "none", stroke("#e8c15a", 2));
    return (
      at(
        280,
        380,
        1.05,
        demon({
          body: "#8a4a6a",
          horns: "curved",
          eyes: "cross",
          mouth: "frown",
          pose: "point",
          hands: { r: [80, -100] },
          hat: monocle,
        }),
      ) +
      at(
        450,
        360,
        1,
        path(`M-40 0 Q-40 -30 0 -30 L40 -14 L40 0 Z`, "#4a2a16", stroke("#1a0a06", 3)),
      ) +
      text(450, 270, "?!", 40, "#ffd23a")
    );
  }),
  pyszalek: dark("pycha", function pyszalek() {
    return (
      at(300, 390, 1, peacock()) + at(312, 192, 0.45, crown("#e8c15a", 0)) + mirror(470, 300, 0.6)
    );
  }),
  lewiatan: dark("pycha", function lewiatan() {
    let waves = "";
    for (let i = 0; i < 8; i++)
      waves += path(`M${i * 80} 400 q40 -30 80 0`, "none", stroke("#2a3a7a", 10));
    const body =
      path(
        `M80 380 Q140 260 220 340 Q300 420 360 300 Q400 200 330 150`,
        "none",
        stroke("#1a1a4a", 50),
      ) +
      path(
        `M80 380 Q140 260 220 340 Q300 420 360 300 Q400 200 330 150`,
        "none",
        stroke("#3a3aa0", 40),
      );
    const head = at(
      330,
      150,
      1.1,
      path(
        `M-40 0 Q-40 -50 10 -50 Q60 -40 90 -10 Q70 20 20 20 Q-30 30 -40 0 Z`,
        "#3a3aa0",
        stroke("#1a1a4a", 3),
      ) +
        at(10, -20, 0.5, "") +
        circle(10, -22, 8, "#ffd23a") +
        path(`M40 10 l8 10 l8 -10 l8 10`, "none", stroke("#fff", 3)),
    );
    return body + head + at(330, 60, 0.9, crown("#e8c15a", 0)) + waves;
  }),
  "wieczne-jutro": dark("lenistwo", function wieczneJutro() {
    const hg = at(
      300,
      240,
      2,
      path(
        `M-30 -50 h60 L4 0 L30 50 h-60 L-4 0 Z`,
        "#cfe8ff",
        stroke("#c9a24a", 3) + ' opacity="0.9"',
      ) +
        path(`M-14 -28 h28 L0 -6 Z M-22 46 h44 L0 16 Z`, "#e8c15a") +
        rect(-38, -58, 76, 9, "#6a4022") +
        rect(-38, 50, 76, 9, "#6a4022"),
    );
    return (
      hg +
      at(
        150,
        380,
        0.75,
        demon({
          body: "#4a6a8a",
          horns: "curved",
          eyes: "bored",
          mouth: "smirk",
          pose: "point",
          hands: { r: [70, -100] },
        }),
      ) +
      calendar(470, 330, 0.6, "jutro")
    );
  }),
  lawina: dark("gniew", function lawina() {
    let bubbles = "";
    for (let i = 0; i < 12; i++)
      bubbles += speech(
        90 + (i % 6) * 84,
        120 + Math.floor(i / 6) * 70,
        70,
        44,
        "#fbf4e2",
        text(90 + (i % 6) * 84, 128 + Math.floor(i / 6) * 70, "!!", 18, "#c62828"),
      );
    return (
      puff(300, 380, 2, "#7a3a2a", 0.8, "law") +
      bubbles +
      at(
        300,
        380,
        0.9,
        demon({
          body: "#a02a2a",
          shape: "ghost",
          horns: "long",
          eyes: "glow",
          mouth: "shout",
          pose: "up",
        }),
      ) +
      text(470, 300, "3000×", 30, "#ffd23a")
    );
  }),
  smok: dark("pycha", function smok() {
    return (
      glow(300, 200, 220, "#ff4a2a", 0.4) +
      at(300, 410, 0.85, dragon("#a01a1a", 7, "#4a0e1a", "", true)) +
      embers("smk", 30)
    );
  }),
  porownania: dark("pycha", function porownania() {
    const pic = (x: number, y: number, r: number) =>
      at(
        x,
        y,
        1,
        rect(-60, -46, 120, 92, "#fff", 4, stroke("#888", 2)) +
          rect(-52, -38, 104, 60, "#6ad0ff") +
          circle(30, -20, 12, "#ffd23a") +
          path(`M-52 22 l30 -30 l26 20 l20 -14 l28 24 Z`, "#4a9a4a"),
        r,
      );
    return (
      pic(150, 170, -10) +
      pic(470, 180, 8) +
      at(
        300,
        380,
        1,
        demon({
          body: "#9a4a9a",
          horns: "curved",
          eyes: "sly",
          mouth: "smirk",
          pose: "out",
          hands: { r: [90, -80] },
        }),
      ) +
      mirror(400, 310, 0.6)
    );
  }),
  mamona: dark("pycha", function mamona() {
    let coins = "";
    for (let i = 0; i < 14; i++)
      coins += coin(160 + (i % 7) * 46, 380 - Math.floor(i / 7) * 22, 18);
    return (
      glow(300, 260, 200, "#ffd23a", 0.4) +
      at(
        300,
        370,
        1.05,
        demon({
          body: "#c9a24a",
          belly: "#f6d36a",
          horns: "curved",
          hornColor: "#8a6514",
          eyes: "glow",
          eyeColor: "#ffd23a",
          mouth: "grin",
          pose: "out",
          hands: { l: [-80, -120], r: [80, -120] },
        }),
      ) +
      coins +
      coin(220, 220, 20) +
      coin(390, 200, 20) +
      sparkle(160, 160, 14, "#fff3b0")
    );
  }),
  wybredny: dark("lenistwo", function wybredny() {
    const cup = at(
      400,
      260,
      1.1,
      path(`M-30 -30 h60 l-6 50 q-24 14 -48 0 Z`, "#fbf4e2", stroke("#555", 3)) +
        path(`M30 -20 q24 0 18 22 q-6 12 -20 10`, "none", stroke("#555", 4)) +
        path(
          `M-10 -40 q-10 -20 6 -36 M10 -40 q-10 -20 6 -36`,
          "none",
          stroke("#fff", 3) + ' opacity="0.6"',
        ),
    );
    return (
      at(
        260,
        380,
        1.05,
        demon({
          body: "#6a8a4a",
          horns: "small",
          eyes: "bored",
          mouth: "frown",
          pose: "point",
          hands: { r: [96, -130] },
          hat: path(`M-30 -176 Q-34 -220 0 -224 Q34 -220 30 -176 Z`, "#fff", stroke("#888", 2)),
        }),
      ) +
      cup +
      text(420, 160, "nie tak!", 26, "#ffd23a")
    );
  }),
  belzebub: dark("pycha", function belzebub() {
    let flies = "";
    for (let i = 0; i < 9; i++)
      flies += at(80 + ((i * 61) % 460), 100 + ((i * 37) % 220), 0.18, fly());
    return (
      glow(300, 220, 200, "#7a9a2a", 0.4) +
      at(300, 380, 1, fly("#2a3a1a")) +
      at(300, 196, 0.7, crown("#e8c15a", 0)) +
      flies +
      path(`M440 150 q20 -10 40 0 q20 10 40 0 M80 300 q20 -10 40 0`, "none", stroke("#c0d080", 3))
    );
  }),
  lucyfer: dark("pycha", function lucyfer() {
    const wings =
      path(
        `M300 220 Q120 60 60 180 Q120 150 140 220 Q100 220 110 280 Q170 240 300 260 Z`,
        "#2a2a3a",
        stroke("#000", 3),
      ) +
      path(
        `M300 220 Q480 60 540 180 Q480 150 460 220 Q500 220 490 280 Q430 240 300 260 Z`,
        "#2a2a3a",
        stroke("#000", 3),
      );
    const star = at(300, 90, 1, sparkle(0, 0, 30, "#5a5a7a"));
    return (
      star +
      wings +
      at(
        300,
        390,
        1.05,
        demon({
          body: "#4a4a6a",
          shape: "tall",
          horns: "long",
          hornColor: "#1a1a2a",
          eyes: "glow",
          eyeColor: "#ff4a3a",
          mouth: "smirk",
          pose: "out",
        }),
      ) +
      glow(300, 90, 70, "#9a9ac0", 0.3)
    );
  }),
  abaddon: dark("gniew", function abaddon() {
    const volcano =
      path(`M60 380 L200 160 L250 180 L300 140 L360 170 L540 380 Z`, "#3a1a10", stroke("#000", 3)) +
      path(
        `M220 170 L240 260 L210 320 M300 140 L310 230 M360 170 L380 280`,
        "none",
        stroke("#ff6a1a", 6),
      );
    return (
      volcano +
      glow(300, 140, 120, "#ff6a1a", 0.8) +
      at(
        300,
        400,
        1.1,
        demon({
          body: "#5a1a10",
          horns: "ram",
          hornColor: "#2a1a10",
          eyes: "mad",
          eyeColor: "#ff6a1a",
          mouth: "fang",
          wings: "#3a0a08",
          pose: "up",
        }),
      ) +
      embers("aba", 40)
    );
  }),
  acedia: dark("lenistwo", function acedia() {
    const sun = circle(300, 90, 46, "#c0a060", 'opacity="0.6"');
    const hole =
      ell(300, 360, 200, 50, "#000", stroke("#2a3a4a", 4)) + ell(300, 360, 150, 34, "#05070c");
    return (
      sun +
      hole +
      at(
        300,
        350,
        1,
        demon({
          body: "#3a4a5a",
          shape: "ghost",
          horns: "curved",
          eyes: "bored",
          eyeColor: "#a0c0c0",
          mouth: "flat",
          pose: "down",
        }),
      ) +
      at(
        470,
        200,
        0.6,
        rect(-40, -40, 80, 80, "#fbf4e2", 40, stroke("#555", 3)) +
          line(0, 0, 0, -30, ink, 4) +
          line(0, 0, 0, -26, ink, 4),
      )
    );
  }),
  ...MORE_DEMONS,
};
