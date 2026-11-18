import {
  at,
  circle,
  demon,
  ell,
  embers,
  flame,
  glow,
  ink,
  line,
  path,
  person,
  phone,
  puff,
  rays,
  rect,
  shade,
  SKIN,
  sparkle,
  sparkles,
  speech,
  stroke,
  table,
  text,
} from "./kit";
import { serpent } from "./creatures";
import { crown } from "./props";
import { dark, type Scene } from "./scene";

const box = (x: number, y: number, s: number, c: string, ribbon = "#e8c15a") =>
  at(
    x,
    y,
    s,
    rect(-50, -70, 100, 70, c, 3, stroke(shade(c, -0.55), 3)) +
      rect(-56, -86, 112, 20, shade(c, 0.15), 3, stroke(shade(c, -0.55), 3)) +
      rect(-8, -86, 16, 86, ribbon) +
      path(
        `M0 -86 q-30 -30 -34 -6 q4 10 34 6 q30 -30 34 -6 q-4 10 -34 6`,
        ribbon,
        stroke(shade(ribbon, -0.5), 2),
      ),
  );
const tv = (x: number, y: number, s: number, screen: string) =>
  at(
    x,
    y,
    s,
    rect(-110, -80, 220, 150, "#1c1c26", 12, stroke("#000", 3)) +
      rect(-98, -68, 196, 126, screen, 4) +
      path(`M-30 70 l-20 30 M30 70 l20 30`, "none", stroke("#1c1c26", 8)),
  );
const bubble = (x: number, y: number, r: number, c = "#bfe8ff") =>
  circle(x, y, r, c, `opacity="0.18"`) +
  circle(x, y, r, "none", stroke(c, 3) + ' opacity="0.8"') +
  path(
    `M${x - r * 0.5} ${y - r * 0.4} q${r * 0.2} ${-r * 0.3} ${r * 0.5} ${-r * 0.3}`,
    "none",
    stroke("#fff", 4) + ' opacity="0.8"',
  );
const brick = (x: number, y: number) => rect(x, y, 56, 26, "#8a3a2a", 2, stroke("#3a1010", 2));
const mask = (x: number, y: number, s: number, happy: boolean, c: string, rot = 0) =>
  at(
    x,
    y,
    s,
    path(`M-50 -50 Q0 -70 50 -50 Q56 20 0 60 Q-56 20 -50 -50 Z`, c, stroke(shade(c, -0.55), 3)) +
      path(`M-34 -16 q12 -12 24 0 q-12 6 -24 0 Z M10 -16 q12 -12 24 0 q-12 6 -24 0 Z`, ink) +
      path(happy ? `M-26 18 Q0 46 26 18 Q0 30 -26 18 Z` : `M-26 34 Q0 8 26 34 Q0 22 -26 34 Z`, ink),
    rot,
  );
const cup = (x: number, y: number, s: number) =>
  at(
    x,
    y,
    s,
    path(`M-50 -90 h100 Q50 -10 0 -6 Q-50 -10 -50 -90 Z`, "#e8c15a", stroke("#8a6514", 3)) +
      rect(-8, -8, 16, 60, "#e8c15a", 2, stroke("#8a6514", 2.5)) +
      path(`M-40 64 Q0 40 40 64 Z`, "#e8c15a", stroke("#8a6514", 3)) +
      ell(0, -88, 48, 10, "#5a0a2a") +
      [0, 1, 2]
        .map((i) =>
          circle(-24 + i * 24, -54, 6, ["#c62828", "#2f7fc4", "#2e7d32"][i]!, stroke("#000", 1.5)),
        )
        .join(""),
  );

export const DEMON_THINGS: Record<string, Scene> = {
  algorytm: dark("pycha", function algorytm() {
    let rings = "";
    for (let i = 0; i < 4; i++)
      rings += circle(300, 230, 120 - i * 30, i % 2 ? "#fbf4e2" : "#c62828", stroke("#3a0a0a", 3));
    let code = "";
    for (let i = 0; i < 18; i++)
      code += text(
        40 + (i % 6) * 100,
        60 + Math.floor(i / 6) * 150,
        i % 2 ? "01" : "10",
        22,
        "#4aff8a",
        'opacity="0.35"',
      );
    return (
      code +
      rings +
      at(
        300,
        230,
        1,
        circle(0, 0, 14, "#ffd23a") +
          path(`M0 0 L160 -140`, "none", stroke("#6a4022", 8)) +
          path(`M160 -140 l20 -40 l-10 30 l30 -20 Z`, "#e2533b"),
      ) +
      glow(300, 230, 60, "#ffd23a", 0.6)
    );
  }),
  rozpamietywanie: dark("gniew", function rozpamietywanie() {
    let loops = "";
    for (let i = 0; i < 3; i++)
      loops += circle(
        300,
        210,
        70 + i * 50,
        "none",
        stroke("#ff8a6a", 5) + ` stroke-dasharray="40 20" opacity="${0.8 - i * 0.2}"`,
      );
    return (
      loops +
      path(`M420 140 l26 -6 l-6 26`, "none", stroke("#ff8a6a", 5)) +
      at(
        300,
        350,
        0.8,
        person({
          dress: "casual",
          robe: "#5a5a7a",
          hairStyle: "short",
          hair: "#3a2a1a",
          face: "stern",
          pose: "hold",
        }),
      ) +
      speech(300, 120, 200, 60, "#fbf4e2", text(300, 128, "A pamiętasz…?", 20, "#3a2a14"))
    );
  }),
  nawyki: dark("lenistwo", function nawyki() {
    const magnet = at(
      300,
      230,
      1.6,
      path(
        `M-50 -40 V10 A50 50 0 0 0 50 10 V-40 H24 V10 A24 24 0 0 1 -24 10 V-40 Z`,
        "#c62828",
        stroke("#3a0a0a", 3),
      ) +
        rect(-50, -60, 26, 22, "#d5dbe4", 0, stroke("#3a0a0a", 3)) +
        rect(24, -60, 26, 22, "#d5dbe4", 0, stroke("#3a0a0a", 3)),
      180,
    );
    const things = [
      phone(130, 150, 0.6, -30, "#6ad0ff"),
      at(
        470,
        150,
        0.8,
        rect(-30, -14, 60, 28, "#e8c15a", 6, stroke("#6a4a14", 2)) +
          text(0, 6, "chips", 14, "#6a2a14"),
        20,
      ),
      at(
        120,
        330,
        0.7,
        rect(-24, -40, 48, 80, "#2a2a3a", 6, stroke("#000", 2)) + circle(0, -16, 6, "#e2533b"),
        -20,
      ),
      at(
        480,
        330,
        0.8,
        path(`M-30 0 L30 0 L20 -40 L-20 -40 Z`, "#a0a0b0", stroke("#333", 2)) +
          text(0, -12, "zzz", 14, "#333"),
      ),
    ].join("");
    return (
      things +
      magnet +
      path(
        `M180 180 l40 20 M420 180 l-40 20 M190 310 l40 -20 M410 310 l-40 -20`,
        "none",
        stroke("#9ad8e0", 3) + ' stroke-dasharray="6 8"',
      )
    );
  }),
  powiadomienie: dark("lenistwo", function powiadomienie() {
    const bellIcon = at(
      300,
      240,
      2,
      path(
        `M-36 20 Q-38 -30 0 -36 Q38 -30 36 20 L46 30 L-46 30 Z`,
        "#ffd23a",
        stroke("#8a6514", 2.5),
      ) +
        circle(0, 38, 8, "#ffd23a", stroke("#8a6514", 2)) +
        circle(32, -30, 16, "#e2533b", stroke("#7a0a0a", 2)) +
        text(32, -24, "99", 14, "#fff"),
    );
    return (
      glow(300, 240, 180, "#ffd23a", 0.4) +
      bellIcon +
      path(
        `M160 200 q-20 40 0 80 M130 180 q-30 60 0 120 M440 200 q20 40 0 80 M470 180 q30 60 0 120`,
        "none",
        stroke("#ffd23a", 5),
      ) +
      text(300, 90, "Ding!", 34, "#fbf4e2")
    );
  }),
  wymowka: dark("lenistwo", function wymowka() {
    let notes = "";
    const words = ["nie mam czasu", "wszyscy tak robią", "to nic takiego"];
    words.forEach(
      (w, i) =>
        (notes += at(
          150 + i * 150,
          140 + (i % 2) * 40,
          1,
          rect(-70, -26, 140, 52, "#f6d36a", 3, stroke("#8a6514", 2)) +
            text(0, 6, w, 15, "#3a2a14"),
          -8 + i * 8,
        )),
    );
    const plaster = at(
      300,
      300,
      1.6,
      rect(-70, -22, 140, 44, "#e8b890", 14, stroke("#8a5a3a", 3)) +
        rect(-24, -22, 48, 44, "#f4d0b0") +
        [0, 1, 2, 3]
          .map((i) => circle(-12 + (i % 2) * 24, -8 + Math.floor(i / 2) * 16, 2.5, "#c0907a"))
          .join(""),
      -12,
    );
    return notes + plaster;
  }),
  falszywy: dark("pycha", function falszywy() {
    const glasses =
      path(`M-36 -152 h28 v14 q-14 10 -28 0 Z M8 -152 h28 v14 q-14 10 -28 0 Z`, "#111") +
      line(-8, -150, 8, -150, "#111", 3);
    return (
      at(
        300,
        384,
        1.05,
        person({
          dress: "casual",
          robe: "#e2533b",
          pants: "#1d1d2a",
          skin: SKIN[2],
          hairStyle: "spiky",
          hair: "#1a1a1a",
          face: "wink",
          pose: "wave",
          hands: { l: [-80, -110] },
          hat: glasses,
        }),
      ) +
      at(
        460,
        300,
        0.7,
        path(`M-20 0 L0 -60 L20 0 Z`, "none", "") +
          rect(-14, -50, 28, 60, "#4a9a4a", 6, stroke("#123", 2)),
      ) +
      path(`M180 190 l-26 -10 M180 230 l-30 4`, "none", stroke("#ffd23a", 4)) +
      at(220, 240, 1, path(`M0 0 l-20 30 h40 Z`, "#c62828", 'opacity="0.0"'))
    );
  }),
  hejt: dark("gniew", function hejt() {
    const kb = at(
      300,
      340,
      1.4,
      rect(-140, -40, 280, 80, "#2a2a3a", 10, stroke("#000", 3)) +
        [0, 1, 2]
          .map((r) =>
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
              .map((k) => rect(-128 + k * 26 + r * 6, -30 + r * 22, 22, 18, "#4a4a5a", 3))
              .join(""),
          )
          .join(""),
    );
    let bubbles = "";
    ["#@!%", "!!!", "&*#"].forEach(
      (t, i) =>
        (bubbles += speech(
          150 + i * 150,
          150 + (i % 2) * 30,
          120,
          60,
          "#c62828",
          text(150 + i * 150, 160 + (i % 2) * 30, t, 26, "#fff"),
        )),
    );
    return bubbles + kb + text(500, 80, "2:00", 30, "#6ad0ff");
  }),
  maraton: dark("lenistwo", function maraton() {
    return (
      tv(300, 230, 1.3, "#2a4a8a") +
      text(300, 236, "Następny za 5…", 22, "#fbf4e2") +
      rect(200, 250, 200, 8, "#555", 4) +
      rect(200, 250, 140, 8, "#e2533b", 4) +
      at(
        150,
        400,
        0.7,
        ell(0, 0, 60, 40, "#e8c15a", stroke("#8a6514", 3)) +
          [0, 1, 2, 3, 4]
            .map((i) => circle(-30 + i * 15, -30, 12, "#fbf4e2", stroke("#aaa", 1.5)))
            .join(""),
      )
    );
  }),
  impreza: dark("pycha", function impreza() {
    const ball = at(
      300,
      150,
      1,
      circle(0, 0, 56, "#c0c8d8", stroke("#555", 3)) +
        [0, 1, 2, 3, 4]
          .map(
            (i) =>
              line(-56, -40 + i * 20, 56, -40 + i * 20, "#7a8090", 1.5) +
              line(-40 + i * 20, -56, -40 + i * 20, 56, "#7a8090", 1.5),
          )
          .join("") +
        line(0, -56, 0, -150, "#555", 2),
    );
    let beams = "";
    ["#ff4ad0", "#4ad0ff", "#ffd23a", "#4aff8a"].forEach(
      (c, i) =>
        (beams += path(
          `M300 150 L${60 + i * 160} 450 L${120 + i * 160} 450 Z`,
          c,
          'opacity="0.22"',
        )),
    );
    let crowd = "";
    for (let i = 0; i < 5; i++)
      crowd += at(
        90 + i * 105,
        430,
        0.7,
        person({
          dress: "casual",
          robe: ["#ff4ad0", "#4ad0ff", "#ffd23a", "#4aff8a", "#a04ad0"][i]!,
          skin: SKIN[i % 5]!,
          hairStyle: (["spiky", "long", "curly", "pony", "short"] as const)[i]!,
          hair: "#1a1a1a",
          face: "sing",
          pose: "up",
        }),
      );
    return beams + ball + crowd + sparkles("imp", 14, "#fff");
  }),
  kabaret: dark("pycha", function kabaret() {
    const curtain =
      path(`M0 0 h140 Q120 200 150 450 H0 Z`, "#8a0a1a", stroke("#3a0008", 3)) +
      path(`M600 0 h-140 Q480 200 450 450 H600 Z`, "#8a0a1a", stroke("#3a0008", 3)) +
      rect(0, 0, 600, 40, "#a01a2a");
    return (
      curtain +
      glow(300, 300, 160, "#ffd23a", 0.4) +
      mask(250, 230, 1, true, "#f6d36a", -12) +
      mask(360, 240, 1, false, "#9aa4b2", 12) +
      text(300, 400, "HA HA HA", 30, "#ffd23a")
    );
  }),
  banka: dark("lenistwo", function banka() {
    let inside = "";
    for (let i = 0; i < 4; i++)
      inside += at(
        240 + (i % 2) * 120,
        260 + Math.floor(i / 2) * 90,
        0.45,
        person({
          dress: "casual",
          robe: "#7a8a9a",
          hairStyle: "short",
          hair: "#555",
          face: "calm",
          pose: "down",
          skin: SKIN[1],
        }),
      );
    return (
      bubble(300, 250, 170) +
      inside +
      bubble(100, 120, 40) +
      bubble(500, 110, 30) +
      bubble(520, 360, 46) +
      text(300, 130, "zgadzam się", 22, "#bfe8ff")
    );
  }),
  galeria: dark("pycha", function galeria() {
    const mall =
      rect(60, 140, 480, 240, "#2a2a4a", 4, stroke("#000", 3)) +
      rect(60, 120, 480, 30, "#ff4ad0", 4) +
      text(300, 143, "MEGA PROMOCJE", 22, "#fff") +
      [0, 1, 2, 3]
        .map((i) => rect(80 + i * 115, 170, 100, 90, "#6ad0ff", 3, 'opacity="0.6"'))
        .join("") +
      text(300, 230, "-70%", 36, "#ffd23a");
    const bags =
      at(
        200,
        400,
        1,
        rect(-30, -60, 60, 60, "#e2533b", 4, stroke("#400", 2)) +
          path(`M-14 -60 q14 -26 28 0`, "none", stroke("#400", 3)),
      ) +
      at(
        400,
        400,
        1,
        rect(-30, -60, 60, 60, "#ffd23a", 4, stroke("#640", 2)) +
          path(`M-14 -60 q14 -26 28 0`, "none", stroke("#640", 3)),
      );
    return mall + bags + at(300, 400, 0.6, rect(-30, -60, 60, 60, "#4aff8a", 4, stroke("#040", 2)));
  }),
  reset: dark("lenistwo", function reset() {
    const arrows =
      path(`M200 230 A100 100 0 1 1 300 330`, "none", stroke("#6ad0ff", 14)) +
      path(`M300 300 l0 60 l40 -30 Z`, "#6ad0ff");
    return (
      arrows +
      at(
        300,
        230,
        1,
        circle(0, 0, 40, "#1c2a4a", stroke("#6ad0ff", 4)) +
          line(0, -24, 0, 0, "#6ad0ff", 6) +
          path(`M-16 -14 A22 22 0 1 0 16 -14`, "none", stroke("#6ad0ff", 6)),
      ) +
      text(120, 120, "od jutra", 26, "#fbf4e2") +
      text(480, 380, "od pojutrza", 22, "#fbf4e2", 'opacity="0.7"')
    );
  }),
  influencer: dark("pycha", function influencer() {
    const ring = circle(300, 200, 150, "none", stroke("#fbf4e2", 14) + ' opacity="0.8"');
    return (
      ring +
      at(
        300,
        400,
        1.1,
        demon({
          body: "#e0508a",
          horns: "curved",
          eyes: "sly",
          mouth: "grin",
          pose: "point",
          hands: { r: [70, -170] },
          hat: path(`M-36 -152 h28 v14 q-14 10 -28 0 Z M8 -152 h28 v14 q-14 10 -28 0 Z`, "#111"),
        }),
      ) +
      phone(370, 230, 0.8, 20, "#ffd0e0") +
      text(140, 140, "SMOŁA20", 24, "#ffd23a") +
      at(
        470,
        120,
        1,
        path(
          `M0 14 C-30 -6 -24 -30 -8 -30 C-2 -30 0 -24 0 -20 C0 -24 2 -30 8 -30 C24 -30 30 -6 0 14 Z`,
          "#ff4a8a",
        ),
      )
    );
  }),
  czat: dark("pycha", function czat() {
    let b = "";
    for (let i = 0; i < 7; i++)
      b += speech(
        160 + (i % 2) * 260 + (i % 3) * 20,
        70 + i * 48,
        180 - (i % 3) * 30,
        40,
        i % 2 ? "#6ad0ff" : "#fbf4e2",
        text(
          160 + (i % 2) * 260 + (i % 3) * 20,
          78 + i * 48,
          ["lol", "haha", "?", "xD", "ok", "!!!", "…"][i]!,
          18,
          "#333",
        ),
        i % 2 ? "r" : "l",
      );
    return (
      b +
      at(
        300,
        230,
        1,
        circle(0, 0, 36, "#e2533b", stroke("#7a0a0a", 3)) + text(0, 8, "327", 22, "#fff"),
      )
    );
  }),
  reklama: dark("pycha", function reklama() {
    const board =
      rect(110, 80, 380, 220, "#ffd23a", 6, stroke("#8a6514", 5)) +
      text(300, 160, "TYLKO DZIŚ!", 44, "#c62828") +
      text(300, 220, "-99%", 54, "#1c1424") +
      line(200, 300, 200, 400, "#555", 10) +
      line(400, 300, 400, 400, "#555", 10);
    return (
      rays(300, 190, "#ffd23a", 18, 400, 0.15, "rek") +
      board +
      sparkles("rek", 10, "#fff3b0", [80, 60, 520, 320])
    );
  }),
  obietnica: dark("pycha", function obietnica() {
    return (
      glow(300, 260, 180, "#ffd23a", 0.4) +
      box(300, 400, 1.6, "#a01a6a") +
      at(420, 200, 1, box(0, 0, 0.6, "#4a1a8a")) +
      at(470, 120, 1, box(0, 0, 0.35, "#1a6a8a")) +
      text(510, 70, "?", 34, "#ffd23a")
    );
  }),
  szef: dark("pycha", function szef() {
    const desk = table(320, "#3a2a2a");
    const laptop = at(
      300,
      320,
      1,
      rect(-60, -70, 120, 70, "#1c1c26", 4, stroke("#000", 2)) +
        rect(-54, -64, 108, 58, "#6ad0ff") +
        text(0, -28, "23:58", 18, "#1c1424"),
    );
    return (
      at(
        300,
        300,
        0.95,
        demon({
          body: "#5a2a2a",
          horns: "ram",
          hornColor: "#2a1a1a",
          eyes: "mad",
          mouth: "shout",
          pose: "point",
          hands: { r: [90, -150] },
          hat: path(`M-14 -88 l14 10 l14 -10 l-6 40 h-16 Z`, "#c62828"),
        }),
      ) +
      desk +
      laptop +
      speech(470, 110, 140, 60, "#fbf4e2", text(470, 118, "Na wczoraj!", 18, "#3a2a14"), "l")
    );
  }),
  remont: dark("gniew", function remont() {
    let wall = "";
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 11; c++) wall += brick(-20 + c * 60 + (r % 2) * 30, 80 + r * 30);
    const drill = at(
      300,
      260,
      1.4,
      rect(-60, -22, 90, 44, "#e8c15a", 10, stroke("#6a4a14", 3)) +
        rect(-40, 20, 30, 50, "#2a2a2a", 6) +
        rect(30, -8, 50, 16, "#9aa4b2", 2, stroke("#333", 2)) +
        path(`M80 0 l20 0`, "none", stroke("#9aa4b2", 6)),
    );
    return (
      wall +
      path(`M400 180 l40 20 l-30 20 l50 30`, "none", stroke("#1c1424", 6)) +
      drill +
      text(130, 70, "7:00", 30, "#fbf4e2") +
      path(`M440 240 l30 -10 M440 280 l30 10`, "none", stroke("#ffd23a", 5))
    );
  }),
  "ciche-dni": dark("lenistwo", function cicheDni() {
    const zipper =
      path(`M-20 -108 h40`, "none", stroke("#9aa4b2", 6)) +
      [0, 1, 2, 3, 4].map((i) => line(-18 + i * 9, -114, -18 + i * 9, -102, "#555", 2)).join("");
    return (
      at(
        180,
        390,
        0.95,
        person({
          dress: "casual",
          robe: "#5a6a8a",
          hairStyle: "short",
          hair: "#3a2a1a",
          face: "stern",
          pose: "hips",
          hat: zipper.replace(/-108/g, "-130").replace(/-114/g, "-136").replace(/-102/g, "-124"),
        }),
      ) +
      at(
        420,
        390,
        0.95,
        person({
          dress: "dress",
          robe: "#8a5a7a",
          hairStyle: "long",
          hair: "#7a3a1a",
          face: "stern",
          pose: "hips",
          hat: zipper.replace(/-108/g, "-130").replace(/-114/g, "-136").replace(/-102/g, "-124"),
        }),
      ) +
      rect(296, 120, 8, 280, "#9ad8e0", 0, 'opacity="0.4"') +
      text(300, 100, "…", 50, "#e0e8f0")
    );
  }),
  kompleksy: dark("pycha", function kompleksy() {
    const frame = (x: number, y: number, c: string) =>
      rect(x - 50, y - 64, 100, 128, "none", 10, stroke(c, 4) + ' stroke-dasharray="10 6"');
    return (
      at(
        300,
        260,
        1.6,
        ell(0, 0, 70, 90, "#c9a24a", stroke("#6a4a14", 3)) + ell(0, 0, 60, 80, "#3a4a6a"),
      ) +
      at(
        300,
        380,
        0.7,
        person({
          dress: "casual",
          robe: "#a05aa0",
          hairStyle: "long",
          hair: "#c58a3a",
          face: "stern",
          pose: "down",
        }),
      ) +
      frame(120, 180, "#ff4ad0") +
      frame(480, 180, "#4ad0ff") +
      text(120, 270, "filtr", 20, "#ff4ad0") +
      text(480, 270, "filtr", 20, "#4ad0ff")
    );
  }),
  pokusa: dark("gniew", function pokusa() {
    return (
      glow(300, 240, 220, "#ff6a1a", 0.7) +
      flame(300, 330, 3.6, "#ff5a1a") +
      embers("pok", 40) +
      at(
        300,
        270,
        1,
        circle(-20, 0, 8, ink) +
          circle(20, 0, 8, ink) +
          path(`M-20 24 Q0 40 20 24`, "none", stroke(ink, 4)),
      )
    );
  }),
  babilon: dark("pycha", function babilon() {
    let towers = "";
    for (let i = 0; i < 7; i++) {
      const h = 120 + ((i * 47) % 140);
      const x = 40 + i * 80;
      towers +=
        rect(x, 380 - h, 70, h, "#4a2a5a", 2, stroke("#1a0a2a", 3)) +
        path(`M${x} ${380 - h} l35 -40 l35 40 Z`, "#e8c15a", stroke("#8a6514", 2)) +
        [0, 1, 2]
          .map((k) =>
            rect(x + 12 + (k % 2) * 30, 400 - h + k * 34, 16, 20, "#ffd23a", 2, 'opacity="0.7"'),
          )
          .join("");
    }
    return (
      towers +
      at(300, 180, 1.1, crown("#e8c15a", 0)) +
      glow(300, 160, 120, "#ffd23a", 0.4) +
      text(300, 430, "$ $ $", 28, "#ffd23a")
    );
  }),
  "ojciec-klamstwa": dark("gniew", function ojciecKlamstwa() {
    const tree =
      path(
        `M280 400 Q270 300 220 250 Q300 260 300 200 Q320 260 380 240 Q330 300 320 400 Z`,
        "#3a2a1a",
        stroke("#000", 3),
      ) +
      puff(300, 180, 2.2, "#1a3a1a", 1, "tree") +
      circle(240, 220, 14, "#c62828", stroke("#400", 2)) +
      circle(370, 200, 14, "#c62828", stroke("#400", 2));
    return (
      tree +
      at(300, 400, 1, serpent("#6a2a8a", "#ffd23a")) +
      at(170, 290, 0.6, mask(0, 0, 1, true, "#fbf4e2"))
    );
  }),
  kielich: dark("pycha", function kielich() {
    return (
      glow(300, 220, 180, "#ffd23a", 0.5) +
      cup(300, 300, 1.6) +
      path(
        `M300 160 q-10 -30 10 -60 q20 -30 0 -60`,
        "none",
        stroke("#9a2a6a", 6) + ' opacity="0.6"',
      ) +
      sparkle(200, 160, 14, "#fff3b0") +
      sparkle(410, 140, 10, "#fff3b0")
    );
  }),
  znamie: dark("gniew", function znamie() {
    const hand = at(
      300,
      330,
      1.6,
      path(
        `M-40 60 V-20 Q-40 -40 -26 -40 V-60 Q-26 -74 -14 -74 Q-2 -74 -2 -60 V-70 Q-2 -84 10 -84 Q22 -84 22 -70 V-60 Q22 -72 34 -72 Q46 -72 46 -58 V20 Q46 60 20 60 Z`,
        SKIN[1],
        stroke(shade(SKIN[1], -0.45), 3),
      ) + text(4, 0, "666", 26, "#c62828"),
    );
    return (
      glow(300, 300, 150, "#ff4a2a", 0.4) +
      hand +
      at(
        450,
        150,
        1,
        path(
          `M0 -60 V60 M-30 -60 Q-30 -20 0 -20 Q30 -20 30 -60 M-30 -60 l-6 14 l12 0 Z M30 -60 l-6 14 l12 0 Z M0 -60 l-6 14 l12 0 Z`,
          "none",
          stroke("#e8c15a", 6),
        ),
      )
    );
  }),
  odgrzewany: dark("gniew", function odgrzewany() {
    const pot = at(
      300,
      330,
      1.5,
      path(`M-80 -60 h160 v50 Q80 30 0 30 Q-80 30 -80 -10 Z`, "#5a5a6a", stroke("#1a1a2a", 3)) +
        rect(-90, -70, 180, 14, "#7a7a8a", 6, stroke("#1a1a2a", 3)) +
        path(`M-90 -50 h-24 M90 -50 h24`, "none", stroke("#1a1a2a", 8)) +
        ell(0, -64, 74, 10, "#6a3a1a"),
    );
    const steam = [240, 300, 360]
      .map((x) =>
        path(
          `M${x} 200 q-20 -30 0 -60 q20 -30 0 -60`,
          "none",
          stroke("#c0a0a0", 6) + ' opacity="0.6"',
        ),
      )
      .join("");
    return (
      steam +
      pot +
      flame(250, 440, 0.8, "#4a8aff") +
      flame(300, 440, 0.9, "#4a8aff") +
      flame(350, 440, 0.8, "#4a8aff")
    );
  }),
  nawrot: dark("gniew", function nawrot() {
    const loop =
      path(
        `M120 330 Q120 120 300 120 Q480 120 480 260 Q480 360 360 340`,
        "none",
        stroke("#ff8a6a", 18),
      ) + path(`M370 310 l-40 30 l46 24 Z`, "#ff8a6a");
    return (
      loop +
      flame(220, 360, 1.2) +
      flame(390, 230, 0.8) +
      at(
        300,
        380,
        0.6,
        demon({ body: "#a03a2a", horns: "small", eyes: "sly", mouth: "grin", pose: "wave" }),
      )
    );
  }),
};
