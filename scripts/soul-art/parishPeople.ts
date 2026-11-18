import {
  at,
  book,
  candle,
  circle,
  cross,
  ell,
  line,
  path,
  person,
  rect,
  sparkles,
  stroke,
  ink,
} from "./kit";
import { light, type Scene } from "./scene";
import { MORE_PEOPLE } from "./parishPeople2";

const bell = (x: number, y: number, s = 1) =>
  at(
    x,
    y,
    s,
    line(0, -30, 0, -14, "#6a4a2a", 5) +
      path(
        `M-20 10 Q-22 -16 0 -16 Q22 -16 20 10 L26 16 L-26 16 Z`,
        "#e8c15a",
        stroke("#8a6514", 2.5),
      ) +
      circle(0, 20, 5, "#8a6514"),
  );

export const PARISH_PEOPLE: Record<string, Scene> = {
  ministrant: light("sluzba", function ministrant() {
    return (
      at(
        300,
        372,
        1,
        person({
          dress: "alb",
          robe: "#ffffff",
          hairStyle: "curly",
          hair: "#c58a3a",
          face: "joy",
          pose: "wave",
          hands: { r: [70, -176] },
        }),
      ) +
      bell(370, 196, 1.1) +
      path(
        `M396 172 q14 -6 18 -20 M402 190 q18 0 26 -10 M340 160 q-8 -12 -4 -26`,
        "none",
        stroke("#fff8d0", 3),
      )
    );
  }),
  lektor: light("slowo", function lektor() {
    return (
      rect(236, 270, 128, 100, "#8a5a36", 4, stroke("#4a2a16", 3)) +
      path(`M222 262 L378 262 L364 286 L236 286 Z`, "#a86e44", stroke("#4a2a16", 3)) +
      cross(300, 326, 0.6, "#e8c15a") +
      at(
        300,
        268,
        0.9,
        person({
          dress: "alb",
          robe: "#fbfbf6",
          hairStyle: "short",
          hair: "#3a2a1a",
          face: "talk",
          pose: "book",
          glasses: true,
        }),
      ) +
      book(300, 196, 0.85, "#7a2a2a", true) +
      sparkles("lek", 6, "#fff8d8", [180, 120, 420, 200])
    );
  }),
  ceremoniarz: light("sluzba", function ceremoniarz() {
    const compass =
      circle(0, 0, 36, "#e8c15a", stroke("#8a6514", 3)) +
      circle(0, 0, 28, "#fbf4e2", stroke("#8a6514", 2)) +
      path(`M0 -24 L7 0 L0 24 L-7 0 Z`, "#c62828") +
      path(`M0 24 L7 0 L-7 0 Z`, "#34466a");
    return (
      candle(170, 360, 110, 14) +
      candle(430, 360, 70, 14) +
      path(`M424 290 L436 290`, "none", stroke("#c62828", 3)) +
      at(
        300,
        372,
        1,
        person({
          dress: "alb",
          robe: "#ffffff",
          belt: "#c62828",
          hairStyle: "short",
          hair: "#222",
          face: "stern",
          pose: "point",
          hands: { r: [96, -110] },
        }),
      ) +
      at(396, 262, 0.8, compass)
    );
  }),
  kleryk: light("slowo", function kleryk() {
    const cat = at(
      410,
      372,
      0.9,
      ell(0, -20, 34, 24, "#f2a040", stroke("#8a4a14", 3)) +
        circle(-26, -50, 20, "#f2a040", stroke("#8a4a14", 3)) +
        path(
          `M-42 -62 l2 -20 l12 12 Z M-14 -64 l6 -18 l8 16 Z`,
          "#f2a040",
          stroke("#8a4a14", 2.5),
        ) +
        circle(-33, -52, 3, ink) +
        circle(-20, -52, 3, ink) +
        path(`M30 -22 q30 -10 20 -44`, "none", stroke("#8a4a14", 7)),
    );
    return (
      at(
        270,
        372,
        1,
        person({
          dress: "cassock",
          robe: "#1f1f2a",
          collar: true,
          hairStyle: "short",
          hair: "#6a4a2a",
          face: "talk",
          pose: "out",
          hands: { r: [82, -120] },
        }),
      ) +
      cat +
      `<text x="420" y="200" font-family="Georgia, serif" font-style="italic" font-size="22" text-anchor="middle" fill="#3a2a14">Dominus vobiscum</text>`
    );
  }),
  ...MORE_PEOPLE,
};
