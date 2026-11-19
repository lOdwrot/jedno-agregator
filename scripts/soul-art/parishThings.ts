import {
  at,
  book,
  candle,
  church,
  circle,
  cross,
  ell,
  glow,
  halo,
  heart,
  ink,
  line,
  path,
  pedestal,
  person,
  rays,
  rect,
  rosary,
  scroll,
  shade,
  SKIN,
  sparkle,
  sparkles,
  speech,
  stroke,
  table,
  text,
} from "./kit";
import { backpack, cap, megaphone, mic, mitre, staff } from "./props";
import { light, type Scene } from "./scene";

const crowd = (y: number, n: number, s: number, seed: number, x0 = 120, dx = 90) => {
  let out = "";
  const robes = ["#e2533b", "#2f7fc4", "#6cbf4a", "#f6d36a", "#a04ad0", "#e8672a", "#5a6a7a"];
  const hairs = ["short", "long", "bun", "curly", "pony", "grey"] as const;
  for (let i = 0; i < n; i++)
    out += at(
      x0 + i * dx,
      y,
      s,
      person({
        dress: "casual",
        robe: robes[(i + seed) % 7]!,
        skin: SKIN[(i * 2 + seed) % 5]!,
        hairStyle: hairs[(i + seed) % 6]!,
        hair: ["#3a2a1a", "#c58a3a", "#1a1a1a", "#7a3a1a"][(i + seed) % 4]!,
        face: (["joy", "smile", "sing", "calm"] as const)[(i + seed) % 4]!,
        pose: (["down", "wave", "hold", "up"] as const)[(i + seed) % 4]!,
      }),
    );
  return out;
};

const key = (x: number, y: number, s = 1, rot = 0, c = "#e8c15a") =>
  at(
    x,
    y,
    s,
    circle(0, 0, 16, "none", stroke(c, 7)) +
      line(0, 16, 0, 70, c, 7) +
      line(0, 50, 14, 50, c, 6) +
      line(0, 62, 12, 62, c, 6),
    rot,
  );

const chair = (x: number, y: number, s = 1, c = "#8a5a36") =>
  at(
    x,
    y,
    s,
    rect(-24, -90, 48, 50, c, 4, stroke(shade(c, -0.5), 3)) +
      rect(-28, -40, 56, 10, shade(c, 0.1), 2, stroke(shade(c, -0.5), 3)) +
      line(-22, -30, -22, 0, shade(c, -0.3), 6) +
      line(22, -30, 22, 0, shade(c, -0.3), 6),
  );

const monstrance = (x: number, y: number, s = 1) =>
  at(
    x,
    y,
    s,
    rays(0, 0, "#ffe27a", 24, 90, 0.9, "mon") +
      circle(0, 0, 44, "#e8c15a", stroke("#8a6514", 3)) +
      circle(0, 0, 28, "#fffdf2", stroke("#c9a24a", 3)) +
      rect(-5, 44, 10, 70, "#e8c15a", 2, stroke("#8a6514", 2)) +
      path(`M-40 130 Q0 100 40 130 Z`, "#e8c15a", stroke("#8a6514", 2.5)) +
      cross(0, -64, 0.4),
  );

export const PARISH_THINGS: Record<string, Scene> = {
  sobor: light("slowo", function sobor() {
    let bishops = "";
    for (let i = 0; i < 6; i++)
      bishops += at(
        90 + i * 84,
        400 - (i % 2) * 16,
        0.62,
        person({
          dress: "alb",
          robe: "#fbf4e2",
          skin: SKIN[i % 5]!,
          hairStyle: "none",
          face: (["talk", "joy", "surprised"] as const)[i % 3]!,
          hat: mitre(),
          pose: i % 2 ? "up" : "hold",
        }),
      );
    const hourglass = at(
      470,
      140,
      0.9,
      path(`M-26 -40 h52 L4 0 L26 40 h-52 L-4 0 Z`, "#fbf4e2", stroke("#8a6514", 3)) +
        path(`M-10 -20 h20 L0 -6 Z M-18 36 h36 L0 14 Z`, "#e8c15a") +
        rect(-32, -48, 64, 8, "#8a5a36") +
        rect(-32, 40, 64, 8, "#8a5a36"),
    );
    return (
      scroll(200, 140, 1.1, -8) +
      hourglass +
      path(`M420 100 l-24 -20 M520 120 l26 -14`, "none", stroke("#fff8d0", 4)) +
      bishops
    );
  }),
  woda: light("modlitwa", function woda() {
    const font =
      path(`M190 260 Q300 380 410 260 Z`, "#d5dbe4", stroke("#5d6776", 3)) +
      ell(300, 260, 110, 22, "#9aa4b2", stroke("#5d6776", 3)) +
      ell(300, 262, 96, 15, "#7fc4f0") +
      rect(286, 330, 28, 42, "#b6bec9", 2, stroke("#5d6776", 3)) +
      ell(300, 372, 54, 10, "#b6bec9", stroke("#5d6776", 3));
    let drops = "";
    for (let i = 0; i < 7; i++)
      drops += at(
        220 + i * 26,
        170 + (i % 3) * 22,
        0.7 + (i % 2) * 0.3,
        path(`M0 -20 Q14 0 0 10 Q-14 0 0 -20 Z`, "#7fc4f0", stroke("#2f7fc4", 2)),
      );
    return (
      font +
      drops +
      glow(300, 250, 140, "#bfe8ff", 0.5) +
      sparkles("woda", 8, "#ffffff", [180, 100, 420, 240])
    );
  }),
  rozaniec: light("modlitwa", function rozaniec() {
    return (
      pedestal(false) +
      glow(300, 230, 140, "#fff6d6", 0.8) +
      rosary(300, 196, 90, "#6a2a4a", "#e8c15a") +
      sparkles("roz", 10)
    );
  }),
  medalik: light("modlitwa", function medalik() {
    const medal = at(
      300,
      236,
      1.6,
      path(`M0 -86 L-40 -40 M0 -86 L40 -40`, "none", stroke("#c9a24a", 3)) +
        ell(0, 0, 40, 50, "#e8c15a", stroke("#8a6514", 3)) +
        ell(0, 0, 32, 42, "#f6d36a", stroke("#c9a24a", 2)) +
        at(
          0,
          14,
          0.38,
          person({ dress: "habit", robe: "#2f7fc4", face: "calm", pose: "out", blush: false }),
        ) +
        halo(0, -36, 14),
    );
    return (
      glow(300, 240, 160, "#fff2b0", 0.8) +
      medal +
      sparkles("med", 10) +
      heart(470, 140, 0.9, "#e2533b")
    );
  }),
  pismo: light("slowo", function pismo() {
    return (
      pedestal(false) +
      rays(300, 260, "#fff6c0", 20, 260, 0.4, "pis") +
      glow(300, 240, 150, "#fff6c0", 0.9) +
      book(300, 280, 2, "#7a2a2a", true) +
      sparkles("pis", 12, "#fffbe0", [150, 80, 450, 220]) +
      text(300, 160, "ΑΩ", 46, "#8a6514", 'opacity="0.8"')
    );
  }),
  ogloszenia: light("slowo", function ogloszenia() {
    const pew = (x: number, y: number, s: number) =>
      at(
        x,
        y,
        s,
        rect(-90, -40, 180, 14, "#8a5a36", 3, stroke("#4a2a16", 2.5)) +
          rect(-90, -26, 180, 26, "#6a4022", 3, stroke("#4a2a16", 2.5)),
      );
    return (
      pew(200, 400, 1) +
      pew(420, 400, 1) +
      pew(150, 340, 0.7) +
      pew(450, 340, 0.7) +
      megaphone(150, 200, 1.4, -10) +
      scroll(370, 190, 1.2, 4) +
      path(`M250 150 q20 30 0 60 M276 130 q30 50 0 100`, "none", stroke("#fff8d0", 5))
    );
  }),
  ksiega: light("slowo", function ksiega() {
    const big = at(
      300,
      250,
      1.5,
      path(`M0 -6 Q-50 -26 -100 -14 L-100 50 Q-50 36 0 56 Z`, "#fbf4e2", stroke("#8a6a40", 2.5)) +
        path(`M0 -6 Q50 -26 100 -14 L100 50 Q50 36 0 56 Z`, "#fbf4e2", stroke("#8a6a40", 2.5)) +
        [0, 1, 2, 3, 4]
          .map(
            (i) =>
              line(-88, -2 + i * 9, -14, 6 + i * 9, "#7a5a3a", 1.6) +
              line(14, 6 + i * 9, 88, -2 + i * 9, "#7a5a3a", 1.6),
          )
          .join("") +
        path(
          `M-104 52 Q-50 40 0 60 Q50 40 104 52 L104 60 Q50 48 0 68 Q-50 48 -104 60 Z`,
          "#4a2416",
        ),
    );
    return (
      table(340, "#6a4022") +
      big +
      at(430, 260, 1, path(`M0 0 Q20 -50 60 -80 Q40 -30 4 4 Z`, "#fbf4e2", stroke("#888", 2))) +
      candle(140, 340, 60, 14) +
      heart(300, 150, 0.7, "#e2533b")
    );
  }),
  kadzidlo: light("slowo", function kadzidlo() {
    const censer = at(
      300,
      330,
      1.7,
      line(0, -150, -10, -40, "#c9a24a", 2.5) +
        line(0, -150, 10, -40, "#c9a24a", 2.5) +
        line(0, -150, 0, -50, "#c9a24a", 2.5) +
        path(`M-30 -40 Q0 -70 30 -40 Z`, "#e8c15a", stroke("#8a6514", 2.5)) +
        path(`M-34 -40 h68 Q30 10 0 12 Q-30 10 -34 -40 Z`, "#e8c15a", stroke("#8a6514", 2.5)) +
        circle(0, -14, 4, "#ff7a2a") +
        circle(-14, -18, 3, "#ff7a2a") +
        circle(14, -18, 3, "#ff7a2a"),
      10,
    );
    let smoke = "";
    for (let i = 0; i < 6; i++)
      smoke += path(
        `M${290 + i * 4} 250 q${-30 + i * 10} -40 ${10 - i * 4} -80 q${30} -40 ${-10 + i * 10} -90`,
        "none",
        stroke("#ffffff", 10 - i) + ` opacity="${0.5 - i * 0.05}"`,
      );
    return smoke + censer;
  }),
  gromnica: light("modlitwa", function gromnica() {
    const wolf = at(
      470,
      372,
      0.9,
      path(
        `M-50 0 Q-60 -50 -20 -60 L0 -90 L10 -60 Q40 -60 50 -30 L70 -30 L50 -14 L50 0 Z`,
        "#5d6776",
        stroke("#2a2f3a", 3),
      ) + circle(16, -56, 3, "#ffd23a"),
    );
    return (
      candle(300, 372, 170, 26, "#fbf4e2") +
      path(`M287 300 q13 -12 26 0 M287 320 q13 -12 26 0`, "none", stroke("#2f7fc4", 4)) +
      wolf +
      path(`M520 300 l30 -10 M520 320 l34 4`, "none", stroke("#fff", 4)) +
      sparkles("gro", 8, "#fff8d8", [180, 60, 420, 200])
    );
  }),
  koscielny: light("sluzba", function koscielny() {
    let keys = "";
    for (let i = 0; i < 7; i++)
      keys += key(-40 + i * 13, -60, 0.45, -20 + i * 8, i % 2 ? "#c9a24a" : "#9aa4b2");
    return (
      church(470, 372, 0.7) +
      at(
        270,
        386,
        1.1,
        person({
          dress: "coat",
          robe: "#5a4a3a",
          hairStyle: "grey",
          hair: "#ccc",
          face: "wink",
          wrinkles: true,
          pose: "hold",
          hands: { r: [60, -140] },
          held: "",
        }),
      ) +
      at(270 + 66, 386 - 154 + 70, 1.1, circle(0, -70, 30, "none", stroke("#8a6514", 4)) + keys)
    );
  }),
  katechetka: light("slowo", function katechetka() {
    const board =
      rect(330, 120, 200, 140, "#2a4a3a", 6, stroke("#6a4022", 8)) +
      text(430, 175, "Sakramenty", 22, "#fbf4e2") +
      [0, 1, 2]
        .map((i) => line(350, 200 + i * 18, 500 - i * 30, 200 + i * 18, "#fbf4e2", 2))
        .join("");
    return (
      board +
      at(
        230,
        388,
        1.1,
        person({
          dress: "dress",
          robe: "#d24a6a",
          hairStyle: "bun",
          hair: "#5a3a22",
          face: "talk",
          glasses: true,
          pose: "point",
          hands: { r: [92, -150] },
          held: book(-36, -76, 0.5, "#2f7fc4"),
        }),
      ) +
      book(470, 330, 0.6, "#f6d36a") +
      book(400, 340, 0.6, "#e2533b")
    );
  }),
  kolo: light("modlitwa", function kolo() {
    let s = "";
    const n = 8;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const x = 300 + Math.cos(a) * 190;
      const y = 300 + Math.sin(a) * 60;
      s += at(
        x,
        y + 60,
        0.5 + (Math.sin(a) + 1) * 0.08,
        person({
          dress: "dress",
          robe: ["#6a4a7a", "#2f7fc4", "#d24a6a", "#4a7a5a"][i % 4]!,
          skin: SKIN[i % 5]!,
          hairStyle: (["bun", "grey", "short", "long"] as const)[i % 4]!,
          hair: ["#ddd", "#bbb", "#3a2a1a", "#7a3a1a"][i % 4]!,
          face: "calm",
          pose: "pray",
          wrinkles: i % 2 === 0,
        }),
      );
    }
    let roses = "";
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      roses += circle(
        300 + Math.cos(a) * 80,
        170 + Math.sin(a) * 30,
        7,
        "#d24a6a",
        stroke("#7a1a3a", 1.5),
      );
    }
    return glow(300, 170, 120, "#fff6d6", 0.9) + roses + cross(300, 170, 0.6) + s;
  }),
  rekolekcje: light("slowo", function rekolekcje() {
    const poster =
      rect(190, 100, 220, 200, "#fbf4e2", 4, stroke("#8a6a40", 3)) +
      rect(204, 114, 192, 70, "#2f7fc4", 3) +
      text(300, 160, "REKOLEKCJE", 26, "#fff") +
      text(300, 220, "pt–nd", 22, "#3a2a14") +
      cross(300, 262, 0.6, "#e2533b") +
      circle(206, 108, 5, "#c62828") +
      circle(394, 108, 5, "#c62828");
    return (
      poster +
      crowd(400, 4, 0.6, 1, 110, 125) +
      path(`M420 180 q30 0 50 -30`, "none", stroke("#fff8d0", 4))
    );
  }),
  spowiedz: light("modlitwa", function spowiedz() {
    const conf =
      path(`M150 372 V170 Q300 80 450 170 V372 Z`, "#6a4022", stroke("#3a2010", 4)) +
      rect(180, 180, 110, 192, "#8a5a36", 2, stroke("#3a2010", 3)) +
      rect(310, 180, 110, 192, "#4a2a16", 2, stroke("#3a2010", 3)) +
      [0, 1, 2, 3, 4]
        .map((i) => line(320, 200 + i * 14, 410, 200 + i * 14, "#8a5a36", 2))
        .join("") +
      cross(300, 130, 0.6);
    const sheet = at(
      240,
      270,
      1,
      rect(-36, -46, 72, 92, "#ffffff", 4, stroke("#9aa4b2", 2.5)) + sparkle(0, 0, 18, "#ffe27a"),
      -6,
    );
    return (
      glow(300, 260, 200, "#fffbe8", 0.6) +
      conf +
      sheet +
      sparkles("spo", 10, "#fff8d8", [160, 100, 440, 300])
    );
  }),
  pielgrzymka: light("modlitwa", function pielgrzymka() {
    const road = path(
      `M220 450 Q300 360 330 300 L350 300 Q360 360 440 450 Z`,
      "#d9b27a",
      'opacity="0.9"',
    );
    let walkers = "";
    for (let i = 0; i < 5; i++)
      walkers += at(
        130 + i * 85,
        400 - (i % 2) * 14,
        0.62,
        person({
          dress: "casual",
          robe: ["#e2533b", "#f6d36a", "#2f7fc4", "#6cbf4a", "#e8672a"][i]!,
          skin: SKIN[i % 5]!,
          hairStyle: (["short", "pony", "curly", "long", "short"] as const)[i]!,
          hair: "#5a3a22",
          face: "joy",
          hat: i % 2 ? cap("#fbf4e2") : "",
          back: backpack(["#34466a", "#7a2a2a", "#4a7a5a"][i % 3]!),
          pose: i === 2 ? "wave" : "down",
          held: i === 0 ? staff(-44, 0, 140) : "",
        }),
      );
    const flag =
      line(300, 170, 300, 320, "#6a4022", 4) +
      path(`M300 170 h70 l-14 22 l14 22 h-70 Z`, "#f6d36a", stroke("#8a6514", 2));
    return (
      road +
      at(
        340,
        300,
        0.4,
        rect(-30, -80, 60, 80, "#f4f1ea", 0, stroke("#777", 2)) +
          path(`M-12 -80 L0 -140 L12 -80 Z`, "#4a7a5a"),
      ) +
      flag +
      walkers
    );
  }),
  zbiorka: light("sluzba", function zbiorka() {
    let boys = "";
    for (let i = 0; i < 4; i++)
      boys += at(
        150 + i * 100,
        396 - (i % 2) * 10,
        0.72,
        person({
          dress: "alb",
          robe: "#ffffff",
          skin: SKIN[(i + 1) % 5]!,
          hairStyle: (["short", "curly", "spiky", "short"] as const)[i]!,
          hair: ["#c58a3a", "#2a1a10", "#5a3a22", "#e8b060"][i]!,
          face: i === 3 ? "surprised" : "joy",
          pose: i === 3 ? "hold" : "up",
        }),
      );
    return (
      boys +
      at(
        420,
        200,
        0.8,
        line(0, -30, 0, -14, "#6a4a2a", 5) +
          path(
            `M-20 10 Q-22 -16 0 -16 Q22 -16 20 10 L26 16 L-26 16 Z`,
            "#e8c15a",
            stroke("#8a6514", 2.5),
          ),
      ) +
      at(
        150,
        200,
        0.6,
        line(0, -60, 0, 0, "#c9a24a", 2.5) +
          path(`M-20 0 h40 Q30 30 0 30 Q-30 30 -20 0 Z`, "#e8c15a", stroke("#8a6514", 2)),
      )
    );
  }),
  rada: light("sluzba", function rada() {
    let s = table(300, "#8a5a36");
    for (let i = 0; i < 5; i++)
      s += at(
        120 + i * 90,
        300,
        0.58,
        person({
          dress: (["coat", "dress", "cassock", "coat", "dress"] as const)[i]!,
          robe: ["#5a6a7a", "#d24a6a", "#1f1f2a", "#7a5a3a", "#2f7fc4"][i]!,
          collar: i === 2,
          skin: SKIN[i % 5]!,
          hairStyle: (["grey", "bun", "short", "spiky", "long"] as const)[i]!,
          hair: "#5a3a22",
          face: (["stern", "talk", "calm", "surprised", "talk"] as const)[i]!,
          pose: (["hold", "point", "pray", "out", "hold"] as const)[i]!,
        }),
      );
    s += [0, 1, 2]
      .map((i) =>
        rect(
          180 + i * 90,
          160,
          60,
          30,
          ["#8a5a36", "#c98a4a", "#5a3a22"][i]!,
          4,
          stroke("#3a2010", 2.5),
        ),
      )
      .join("");
    return s + text(300, 120, "?", 50, "#3a2a14") + chair(510, 420, 0.8);
  }),
  profesor: light("slowo", function profesor() {
    const stack = [0, 1, 2, 3, 4]
      .map((i) =>
        rect(
          110 - (i % 2) * 6,
          340 - i * 22,
          100,
          22,
          ["#7a2a2a", "#2f7fc4", "#4a7a5a", "#8a6514", "#5a3a7a"][i]!,
          3,
          stroke("#222", 2),
        ),
      )
      .join("");
    return (
      stack +
      at(
        320,
        388,
        1.1,
        person({
          dress: "cassock",
          robe: "#1f1f2a",
          collar: true,
          hairStyle: "grey",
          hair: "#eee",
          face: "talk",
          glasses: true,
          wrinkles: true,
          pose: "point",
          hands: { r: [90, -170] },
          held: book(-36, -76, 0.55, "#7a2a2a"),
        }),
      ) +
      text(470, 140, "Patrologia", 24, "#3a2a14", 'font-style="italic"')
    );
  }),
  rzecznik: light("slowo", function rzecznik() {
    let mics = "";
    for (let i = 0; i < 5; i++) mics += mic(220 + i * 40, 280 - (i % 2) * 14, 0.9, -30 + i * 15);
    return (
      at(
        300,
        400,
        1.1,
        person({
          dress: "cassock",
          robe: "#1f1f2a",
          collar: true,
          hairStyle: "short",
          hair: "#3a2a1a",
          face: "talk",
          glasses: true,
          pose: "out",
        }),
      ) +
      mics +
      speech(480, 140, 150, 80, "#ffffff", text(480, 150, "…i jeszcze", 20, "#333"), "l") +
      at(
        110,
        180,
        0.6,
        rect(-40, -26, 80, 52, "#333", 8) +
          circle(0, 0, 18, "#5a6a8a", stroke("#111", 3)) +
          rect(-50, -26, 16, 8, "#c62828"),
      )
    );
  }),
  zapisy: light("sluzba", function zapisy() {
    const sheet =
      rect(220, 100, 160, 210, "#fbf4e2", 4, stroke("#8a6a40", 3)) +
      text(300, 140, "OAZA", 26, "#c62828") +
      [0, 1, 2, 3, 4, 5]
        .map((i) => line(240, 170 + i * 22, 360 - (i % 3) * 30, 170 + i * 22, "#3a3a5a", 2.5))
        .join("") +
      circle(300, 100, 7, "#c62828");
    const pen =
      path(`M420 300 Q400 240 380 230`, "none", stroke("#8a8a8a", 2)) +
      at(
        420,
        300,
        1,
        rect(-5, 0, 10, 60, "#2f7fc4", 3, stroke("#123", 2)) + path(`M-5 60 L0 74 L5 60 Z`, "#333"),
        160,
      );
    return sheet + pen + crowd(400, 3, 0.55, 3, 110, 190);
  }),
  paschal: light("modlitwa", function paschal() {
    return (
      glow(300, 120, 140, "#fff2b0", 0.9) +
      candle(300, 380, 230, 34, "#fbf4e2") +
      cross(300, 260, 1, "#c62828") +
      text(300, 220, "Α", 20, "#c62828") +
      text(300, 322, "Ω", 20, "#c62828") +
      [0, 1, 2, 3, 4]
        .map((i) => circle(286 + (i % 3) * 14, 250 + Math.floor(i / 3) * 34 + 6, 4, "#c62828"))
        .join("") +
      sparkles("pas", 14)
    );
  }),
  marnotrawny: light("sluzba", function marnotrawny() {
    const house =
      rect(420, 230, 140, 140, "#e9dcc4", 0, stroke("#7a6a4a", 3)) +
      path(`M410 230 L490 170 L570 230 Z`, "#9a3a2a", stroke("#5a1a10", 3)) +
      rect(476, 300, 30, 70, "#5a3a22") +
      rect(436, 260, 26, 26, "#f6d36a", 0, stroke("#7a6a4a", 2));
    const father = person({
      dress: "monk",
      robe: "#8a3a5a",
      hairStyle: "grey",
      hair: "#ddd",
      beard: "#ddd",
      face: "joy",
      wrinkles: true,
      pose: "out",
      hands: { l: [-70, -110], r: [70, -110] },
    });
    const son = person({
      dress: "casual",
      robe: "#8a7a5a",
      pants: "#5a4a3a",
      hairStyle: "curly",
      hair: "#3a2a1a",
      face: "calm",
      pose: "out",
      hands: { l: [-60, -100], r: [62, -110] },
    });
    return (
      house + at(240, 390, 1, father) + at(340, 390, 0.95, son) + heart(290, 150, 1.2, "#e2533b")
    );
  }),
  adoracja: light("modlitwa", function adoracja() {
    const altar =
      rect(180, 300, 240, 80, "#fbf4e2", 4, stroke("#8a6a40", 3)) +
      rect(180, 300, 240, 16, "#c9a24a");
    return (
      glow(300, 200, 220, "#fff2b0", 0.95) +
      altar +
      monstrance(300, 180, 1) +
      candle(200, 300, 70, 12) +
      candle(400, 300, 70, 12) +
      at(
        110,
        410,
        0.6,
        person({
          dress: "casual",
          robe: "#6a7a9a",
          face: "calm",
          pose: "pray",
          hairStyle: "long",
          hair: "#5a3a22",
        }),
      ) +
      at(
        500,
        410,
        0.6,
        person({
          dress: "coat",
          robe: "#7a5a3a",
          face: "calm",
          pose: "pray",
          hairStyle: "grey",
          hair: "#ccc",
        }),
      )
    );
  }),
  damaszek: light("slowo", function damaszek() {
    const bolt = path(
      `M330 40 L270 180 L320 180 L260 320 L380 150 L330 150 L380 40 Z`,
      "#fff3a0",
      stroke("#e8a020", 4),
    );
    const horse = at(
      430,
      390,
      1,
      path(
        `M-90 -60 Q-60 -110 20 -100 L60 -150 L90 -140 L70 -96 Q80 -60 60 -40 L64 0 L50 0 L40 -40 L-50 -40 L-56 0 L-70 0 L-76 -46 Q-100 -40 -110 -20 Q-100 -50 -90 -60 Z`,
        "#8a5a36",
        stroke("#3a2010", 3),
      ) + circle(74, -128, 3, ink),
    );
    const saul = at(
      220,
      388,
      1,
      person({
        dress: "uniform",
        robe: "#9a3a2a",
        pants: "#6a4a2a",
        hairStyle: "short",
        hair: "#2a1a10",
        beard: "#2a1a10",
        face: "surprised",
        pose: "up",
      }),
      -40,
    );
    return (
      rays(300, 180, "#ffffff", 20, 500, 0.3, "dam") +
      glow(300, 160, 200, "#ffffff", 0.9) +
      bolt +
      horse +
      saul
    );
  }),
};
