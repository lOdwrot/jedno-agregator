import {
  at,
  circle,
  demon,
  ell,
  embers,
  glow,
  line,
  path,
  person,
  puff,
  rect,
  shade,
  sparkle,
  stars,
  stroke,
  text,
} from "./kit";
import { boar, dragon, fireGround, horse, ram, sheep, sloth, wolf } from "./creatures";
import { crown, tiara } from "./props";
import { dark, type Scene } from "./scene";

const chain = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  n: number,
  c = "#9aa4b2",
  r = 14,
) => {
  let s = "";
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = x1 + (x2 - x1) * t;
    const y = y1 + (y2 - y1) * t + Math.sin(t * Math.PI) * 30;
    s +=
      ell(
        x,
        y,
        r,
        r * 0.6,
        "none",
        stroke(shade(c, -0.5), 7) + ` transform="rotate(${i % 2 ? 90 : 0} ${x} ${y})"`,
      ) +
      ell(
        x,
        y,
        r,
        r * 0.6,
        "none",
        stroke(c, 4) + ` transform="rotate(${i % 2 ? 90 : 0} ${x} ${y})"`,
      );
  }
  return s;
};
const couch = (x: number, y: number, s = 1, c = "#7a3a5a") =>
  at(
    x,
    y,
    s,
    rect(-150, -110, 300, 80, c, 24, stroke(shade(c, -0.55), 3)) +
      rect(-170, -60, 340, 60, shade(c, 0.12), 20, stroke(shade(c, -0.55), 3)) +
      rect(-190, -90, 50, 90, c, 18, stroke(shade(c, -0.55), 3)) +
      rect(140, -90, 50, 90, c, 18, stroke(shade(c, -0.55), 3)),
  );
const remote = (x: number, y: number, rot = 0, c = "#2a2a3a") =>
  at(
    x,
    y,
    1,
    rect(-10, -30, 20, 60, c, 6, stroke("#000", 2)) +
      circle(0, -16, 4, "#e2533b") +
      circle(0, 0, 3, "#aaa") +
      circle(0, 12, 3, "#aaa"),
    rot,
  );

export const MORE_DEMONS: Record<string, Scene> = {
  marazm: dark("lenistwo", function marazm() {
    const blanket =
      path(
        `M120 370 Q120 280 220 270 Q340 250 460 280 Q500 300 490 370 Z`,
        "#5a6a9a",
        stroke("#1a2040", 3),
      ) +
      [0, 1, 2, 3]
        .map((i) => path(`M${170 + i * 80} 280 v90`, "none", stroke("#8a9ac0", 4)))
        .join("");
    const battery = at(
      470,
      180,
      1,
      rect(-40, -20, 80, 40, "none", 0, stroke("#6cbf4a", 5)) +
        rect(40, -8, 8, 16, "#6cbf4a") +
        rect(-34, -14, 68, 28, "#6cbf4a"),
    );
    return (
      at(
        260,
        330,
        0.8,
        demon({ body: "#7a7ab0", horns: "small", eyes: "sleepy", mouth: "yawn", pose: "down" }),
      ) +
      blanket +
      battery +
      text(140, 170, "z", 40, "#9ad8e0")
    );
  }),
  obojetnosc: dark("lenistwo", function obojetnosc() {
    const someone = at(
      150,
      390,
      0.75,
      person({
        dress: "coat",
        robe: "#7a8a9a",
        hairStyle: "grey",
        hair: "#ccc",
        face: "surprised",
        pose: "up",
        wrinkles: true,
      }),
    );
    return (
      someone +
      at(
        360,
        390,
        1.05,
        demon({
          body: "#8a9aa8",
          shape: "ghost",
          horns: "none",
          eyes: "bored",
          eyeColor: "#e0e8f0",
          mouth: "flat",
          pose: "hips",
        }),
      ) +
      text(470, 170, "…", 50, "#e0e8f0") +
      text(150, 160, "!", 44, "#ffd23a")
    );
  }),
  letarg: dark("lenistwo", function letarg() {
    const moon = circle(450, 110, 56, "#f4f1d0") + circle(476, 96, 50, "#0a1430");
    return (
      stars("let", 40, "#fff", [0, 0, 600, 220]) +
      moon +
      glow(450, 110, 90, "#f4f1d0", 0.3) +
      at(
        280,
        390,
        1.1,
        demon({
          body: "#2a3a7a",
          horns: "curved",
          hornColor: "#c0c8e0",
          eyes: "closed",
          mouth: "smirk",
          wings: "#1a2050",
          pose: "out",
          hat: at(0, -200, 0.7, crown("#c0c8e0", 0)),
        }),
      ) +
      text(130, 220, "Z", 50, "#9ad8e0") +
      text(160, 170, "z", 36, "#9ad8e0")
    );
  }),
  letni: dark("lenistwo", function letni() {
    const thermo = at(
      440,
      280,
      1.4,
      rect(-12, -110, 24, 110, "#fbf4e2", 12, stroke("#555", 3)) +
        circle(0, 8, 22, "#f2a040", stroke("#555", 3)) +
        rect(-6, -54, 12, 62, "#f2a040") +
        [0, 1, 2, 3, 4].map((i) => line(12, -96 + i * 20, 20, -96 + i * 20, "#555", 2)).join(""),
    );
    return (
      at(
        250,
        390,
        1.05,
        demon({
          body: "#c08a6a",
          belly: "#e0b8a0",
          horns: "small",
          eyes: "bored",
          mouth: "flat",
          pose: "hips",
        }),
      ) +
      thermo +
      text(440, 110, "±", 40, "#f2a040")
    );
  }),
  wygoda: dark("lenistwo", function wygoda() {
    return (
      couch(300, 390, 0.95) +
      at(
        300,
        330,
        0.85,
        demon({
          body: "#8a5a9a",
          shape: "blob",
          horns: "small",
          eyes: "bored",
          mouth: "smirk",
          pose: "out",
          hands: { r: [80, -100] },
          held: "",
        }),
      ) +
      remote(372, 230, 30) +
      remote(160, 300, -20, "#5a5a6a") +
      remote(470, 320, 70, "#3a3a4a")
    );
  }),
  belfegor: dark("lenistwo", function belfegor() {
    return (
      at(300, 360, 1.1, sloth()) +
      at(300, 170, 0.45, crown("#e8c15a", 0)) +
      at(300, 410, 0.8, path(`M-120 0 h240`, "none", "")) +
      couch(300, 440, 0.6, "#4a2a5a") +
      text(470, 300, "zzz", 30, "#9ad8e0")
    );
  }),
  wilk: dark("lenistwo", function wilk() {
    return (
      at(270, 380, 1.1, wolf(true)) +
      at(140, 360, 0.7, sheep(1)) +
      text(150, 230, "beee?", 26, "#fbf4e2")
    );
  }),
  niezgoda: dark("gniew", function niezgoda() {
    const bomb = at(
      300,
      280,
      1.4,
      circle(0, 0, 54, "#2a2a3a", stroke("#000", 3)) +
        rect(-14, -66, 28, 18, "#555", 3) +
        path(`M0 -66 Q20 -100 50 -96`, "none", stroke("#c9a24a", 5)) +
        path(`M-26 -24 q10 -14 24 -16`, "none", stroke("#fff", 5) + ' opacity="0.5"') +
        at(
          0,
          0,
          0.6,
          `<g>${circle(-16, -10, 10, "#ffd23a")}${circle(16, -10, 10, "#ffd23a")}${path("M-20 20 q20 -14 40 0", "none", stroke("#ffd23a", 4))}</g>`,
        ),
    );
    let trees = "";
    for (let i = 0; i < 6; i++)
      trees += at(
        60 + i * 100,
        400,
        0.8 + (i % 2) * 0.2,
        path(`M0 0 v-30 M-30 -30 L0 -110 L30 -30 Z`, "#2a3a1a", stroke("#000", 2)),
      );
    return (
      trees +
      fireGround() +
      bomb +
      glow(370, 140, 50, "#ffd23a", 0.9) +
      at(370, 142, 1, sparkle(0, 0, 20, "#fff3b0"))
    );
  }),
  "owczy-ped": dark("lenistwo", function owczyPed() {
    let flock = "";
    for (let i = 0; i < 7; i++)
      flock += at(
        80 + i * 72,
        330 + (i % 3) * 30,
        0.75 + (i % 2) * 0.15,
        sheep(1, "#2a2a2a", i === 3 ? "#d8d0c0" : "#f4f1ea"),
      );
    const cliff = path(`M520 450 L520 360 L600 360 L600 450 Z`, "#1a1010");
    return (
      flock +
      cliff +
      path(`M60 260 h420 l-20 -16 m20 16 l-20 16`, "none", stroke("#fbf4e2", 4) + ' opacity="0.6"')
    );
  }),
  fala: dark("pycha", function fala() {
    const wave =
      path(
        `M0 450 L0 300 Q120 150 260 180 Q400 210 380 120 Q470 160 470 260 Q520 330 600 300 L600 450 Z`,
        "#1a3a7a",
        stroke("#0a1a4a", 4),
      ) + path(`M380 120 Q420 130 430 170 Q400 150 380 160`, "#e0f0ff");
    const eyes =
      circle(250, 300, 14, "#ff4a3a") +
      circle(300, 300, 14, "#ff4a3a") +
      circle(250, 300, 5, "#000") +
      circle(300, 300, 5, "#000");
    return (
      wave +
      eyes +
      glow(275, 300, 80, "#ff4a3a", 0.3) +
      [0, 1, 2]
        .map((i) =>
          path(`M${80 + i * 140} ${380 + i * 6} q30 -20 60 0`, "none", stroke("#4a7ac0", 4)),
        )
        .join("")
    );
  }),
  rog: dark("pycha", function rog() {
    const horn =
      path(
        `M240 400 Q220 260 300 160 Q330 120 360 130 Q320 180 330 260 Q340 340 360 400 Z`,
        "#e8dcc0",
        stroke("#6a5a3a", 4),
      ) +
      [0, 1, 2, 3]
        .map((i) =>
          path(`M${244 + i * 6} ${360 - i * 50} q50 6 100 0`, "none", stroke("#b8a888", 3)),
        )
        .join("");
    const mouth = at(
      300,
      280,
      1.3,
      `<g>${path("M-30 -6 Q0 30 30 -6 Q0 6 -30 -6 Z", "#3a0a14", stroke("#000", 3))}${circle(-20, -36, 8, "#ffd23a")}${circle(16, -36, 8, "#ffd23a")}</g>`,
    );
    return (
      horn +
      mouth +
      text(150, 170, "BLA", 40, "#ffd23a") +
      text(470, 200, "BLA", 32, "#ffd23a") +
      text(140, 270, "BLA", 26, "#ffd23a")
    );
  }),
  raz: dark("gniew", function raz() {
    return (
      at(
        300,
        380,
        1.05,
        demon({
          body: "#c0503a",
          horns: "small",
          eyes: "sly",
          mouth: "smirk",
          pose: "wave",
          hands: { r: [60, -190] },
        }),
      ) +
      at(360, 186, 1, rect(-6, -40, 12, 30, "#c0503a", 6, stroke("#400", 2))) +
      text(130, 200, "1×", 46, "#ffd23a") +
      text(470, 300, "11×", 36, "#ff8a6a")
    );
  }),
  kajdany: dark("gniew", function kajdany() {
    return (
      at(
        300,
        380,
        1.05,
        demon({
          body: "#6a6a7a",
          horns: "ram",
          hornColor: "#3a3a4a",
          eyes: "mad",
          mouth: "fang",
          pose: "out",
          hands: { l: [-90, -110], r: [90, -110] },
        }),
      ) +
      chain(60, 170, 210, 270, 7) +
      chain(390, 270, 560, 170, 7) +
      at(
        80,
        330,
        1,
        circle(0, 0, 40, "#3a3a4a", stroke("#000", 3)) + text(0, 10, "kg", 22, "#9aa4b2"),
      )
    );
  }),
  bestia: dark("pycha", function bestia() {
    let waves = "";
    for (let i = 0; i < 8; i++)
      waves += path(`M${i * 80} 380 q40 -30 80 0`, "none", stroke("#4a6ac0", 8));
    return (
      glow(300, 200, 240, "#c62828", 0.4) +
      at(300, 440, 0.9, dragon("#3a2a7a", 7, "#1a1040", at(0, -40, 0.4, crown("#e8c15a", 0)))) +
      path(
        `M0 450 L0 360 Q150 330 300 360 Q450 390 600 350 L600 450 Z`,
        "#1a2a5a",
        stroke("#0a1030", 3),
      ) +
      waves +
      embers("bes", 30)
    );
  }),
  prorok: dark("lenistwo", function prorok() {
    return (
      at(260, 380, 1, ram()) +
      glow(150, 160, 60, "#ff6a1a", 0.6) +
      at(
        400,
        180,
        1,
        path(
          `M-70 -40 h140 q20 0 20 20 v40 q0 20 -20 20 h-100 l-30 24 l6 -24 h-16 q-20 0 -20 -20 v-40 q0 -20 20 -20 Z`,
          "#fbf4e2",
          stroke("#555", 3),
        ) + text(0, 10, "Spoko!", 24, "#3a2a14"),
      )
    );
  }),
  legion: dark("gniew", function legion() {
    let herd = "";
    for (let i = 0; i < 5; i++) herd += at(80 + i * 110, 300 - (i % 2) * 20, 0.35, boar());
    return (
      herd +
      at(300, 400, 0.95, boar()) +
      text(470, 140, "Nas wielu", 26, "#ff8a6a") +
      chain(60, 420, 200, 440, 5, "#5a5a6a", 10)
    );
  }),
  "duch-swiata": dark("lenistwo", function duchSwiata() {
    let city = "";
    for (let i = 0; i < 9; i++)
      city +=
        rect(20 + i * 64, 260 - ((i * 53) % 90), 56, 200, "#1a2030", 2, stroke("#000", 2)) +
        [0, 1, 2, 3]
          .map((k) =>
            rect(
              30 + i * 64,
              280 - ((i * 53) % 90) + k * 30,
              12,
              14,
              k % 2 ? "#6ad0ff" : "#ffd23a",
              1,
              'opacity="0.6"',
            ),
          )
          .join("");
    return (
      city +
      puff(300, 330, 2.6, "#7a8a9a", 0.45, "ds") +
      at(
        300,
        380,
        1.1,
        demon({
          body: "#9aaabb",
          shape: "ghost",
          horns: "none",
          eyes: "sly",
          eyeColor: "#e0f0ff",
          mouth: "smirk",
          pose: "out",
        }),
      ) +
      puff(160, 400, 1.2, "#8a9aaa", 0.5, "ds2")
    );
  }),
  jezdziec: dark("gniew", function jezdziec() {
    const rider =
      at(
        -20,
        -120,
        0.7,
        demon({
          body: "#3a0a0a",
          horns: "long",
          eyes: "mad",
          mouth: "shout",
          pose: "up",
          hands: { r: [70, -190] },
        }),
      ) +
      at(
        30,
        -260,
        0.7,
        path(`M0 0 L10 -100 L18 0 Z`, "#d5dbe4", stroke("#555", 2.5)) +
          rect(-14, 0, 42, 8, "#c9a24a"),
      );
    return (
      glow(300, 260, 220, "#ff4a2a", 0.4) +
      at(290, 400, 1, horse("#b2321a") + rider) +
      path(`M60 340 l60 -10 M50 380 l70 -4`, "none", stroke("#ff8a6a", 5)) +
      embers("jez", 26)
    );
  }),
  antypapiez: dark("pycha", function antypapiez() {
    const fake = at(
      300,
      400,
      1.05,
      person({
        dress: "alb",
        robe: "#3a2a4a",
        skin: "#c0a090",
        hairStyle: "none",
        face: "wink",
        hat: tiara(),
        pose: "point",
        hands: { r: [80, -120] },
        blush: false,
      }),
    );
    return (
      glow(300, 220, 200, "#9a4ad0", 0.35) +
      at(
        130,
        380,
        0.55,
        person({
          dress: "alb",
          robe: "#fbf4e2",
          hairStyle: "none",
          face: "surprised",
          hat: tiara(),
          pose: "up",
        }),
      ) +
      at(
        480,
        380,
        0.55,
        person({
          dress: "alb",
          robe: "#fbf4e2",
          hairStyle: "none",
          face: "stern",
          hat: tiara(),
          pose: "hips",
        }),
      ) +
      fake +
      text(300, 80, "3?", 40, "#ffd23a") +
      at(240, 330, 0.9, path(`M0 0 Q14 -30 30 -10 Q40 6 20 20 Z`, "#2a1a3a"))
    );
  }),
};
