/** Hats and bigger props shared by several card pictures. Head centre of `person`/`demon` is (0,-152)/(0,-140). */
import { at, circle, ell, line, path, rect, shade, stroke } from "./kit";

export const zucchetto = (c = "#1d1d2a") => ell(0, -188, 26, 10, c, stroke(shade(c, -0.5), 2));
export const biretta = (c = "#1d1d2a") =>
  path(`M-34 -178 L34 -178 L30 -210 L-30 -210 Z`, c, stroke("#000", 2.5)) +
  line(-10, -208, -12, -180, "#444", 2) +
  line(10, -208, 12, -180, "#444", 2) +
  circle(0, -214, 7, c === "#1d1d2a" ? "#2a2a3a" : shade(c, -0.2), stroke("#000", 2));
export const cap = (c = "#2f6fc4", flip = false) =>
  path(`M-40 -170 Q-40 -208 0 -208 Q40 -208 40 -170 Z`, c, stroke(shade(c, -0.5), 2.5)) +
  path(
    flip ? `M-40 -172 Q-70 -176 -78 -166 L-36 -164 Z` : `M40 -172 Q70 -176 78 -166 L36 -164 Z`,
    shade(c, -0.15),
    stroke(shade(c, -0.5), 2.5),
  ) +
  circle(0, -208, 4, shade(c, 0.3));
export const scoutHat = (c = "#6a7a3a") =>
  ell(0, -184, 62, 12, c, stroke(shade(c, -0.5), 2.5)) +
  path(`M-30 -186 Q-28 -222 0 -224 Q28 -222 30 -186 Z`, c, stroke(shade(c, -0.5), 2.5)) +
  path(`M-8 -222 L0 -210 L8 -222`, "none", stroke(shade(c, -0.4), 2.5)) +
  rect(-30, -194, 60, 7, "#4a2a16");
export const helmet = (c = "#e2533b") =>
  path(`M-44 -160 Q-46 -210 0 -212 Q46 -210 44 -160 Z`, c, stroke(shade(c, -0.5), 2.5)) +
  path(`M-30 -200 Q0 -214 30 -200`, "none", stroke("#fff", 4)) +
  rect(-44, -164, 88, 8, shade(c, -0.25), 3);
export const mitre = (c = "#fbf4e2", trim = "#c9a24a") =>
  path(`M-34 -178 L-30 -240 L0 -268 L30 -240 L34 -178 Z`, c, stroke(shade(trim, -0.4), 2.5)) +
  rect(-34, -186, 68, 10, trim) +
  line(0, -266, 0, -186, trim, 6) +
  path(`M-10 -226 h20 M0 -236 v20`, "none", stroke("#c62828", 4));
export const tiara = () =>
  path(`M-34 -178 Q-36 -238 0 -252 Q36 -238 34 -178 Z`, "#fbf4e2", stroke("#8a6514", 2.5)) +
  [0, 1, 2]
    .map((i) =>
      rect(-35 + i * 2, -192 - i * 22, 70 - i * 4, 8, "#e8c15a", 3, stroke("#8a6514", 1.5)),
    )
    .join("") +
  circle(0, -256, 7, "#e8c15a", stroke("#8a6514", 2));
export const crown = (c = "#e8c15a", y = -186) =>
  path(
    `M-36 ${y} L-40 ${y - 40} L-20 ${y - 20} L0 ${y - 50} L20 ${y - 20} L40 ${y - 40} L36 ${y} Z`,
    c,
    stroke(shade(c, -0.55), 2.5),
  ) +
  circle(0, y - 50, 5, "#c62828") +
  circle(-40, y - 40, 4, "#2f7fc4") +
  circle(40, y - 40, 4, "#2f7fc4");
export const headband = (c = "#d9483a") => path(`M-40 -166 Q0 -184 40 -166`, "none", stroke(c, 8));
export const beret = (c = "#c62828") =>
  path(
    `M-44 -170 Q-40 -206 4 -206 Q48 -204 42 -172 Q0 -180 -44 -170 Z`,
    c,
    stroke(shade(c, -0.5), 2.5),
  ) + line(4, -206, 6, -214, shade(c, -0.4), 4);

export const guitar = (x: number, y: number, s = 1, rot = -30) =>
  at(
    x,
    y,
    s,
    rect(-6, -110, 12, 80, "#6a4022", 2, stroke("#3a2010", 2)) +
      rect(-10, -126, 20, 18, "#4a2a16", 3) +
      path(
        `M0 -40 C-40 -40 -40 0 -26 10 C-46 30 -36 70 0 70 C36 70 46 30 26 10 C40 0 40 -40 0 -40 Z`,
        "#e0a050",
        stroke("#7a4a1a", 3),
      ) +
      circle(0, 14, 12, "#3a2010") +
      [-3, 0, 3].map((d) => line(d, -120, d, 50, "#f3e6c8", 1)).join(""),
    rot,
  );
export const baton = (x: number, y: number, rot = -40) =>
  at(x, y, 1, line(0, 0, 0, -60, "#fbf4e2", 4) + circle(0, 0, 5, "#8a5a36"), rot);
export const mic = (x: number, y: number, s = 1, rot = 20) =>
  at(
    x,
    y,
    s,
    rect(-5, -4, 10, 46, "#333", 3) +
      circle(0, -14, 14, "#9aa4b2", stroke("#444", 2.5)) +
      path(`M-10 -20 h20 M-12 -12 h24 M-10 -4 h20`, "none", stroke("#5d6776", 1.5)),
    rot,
  );
export const megaphone = (x: number, y: number, s = 1, rot = -20) =>
  at(
    x,
    y,
    s,
    path(`M0 -10 L60 -34 L60 34 L0 10 Z`, "#e2533b", stroke("#7a1a10", 3)) +
      ell(60, 0, 8, 34, "#f6d36a", stroke("#7a1a10", 3)) +
      rect(-14, -12, 16, 24, "#333", 3),
    rot,
  );
export const staff = (x: number, y: number, h = 220, c = "#8a5a36") =>
  line(x, y, x, y - h, c, 8) + line(x, y, x, y - h, shade(c, 0.25), 3);
export const crozier = (x: number, y: number) =>
  line(x, y, x, y - 250, "#c9a24a", 8) +
  path(`M${x} ${y - 250} q0 -40 30 -40 q30 0 26 30 q-4 22 -24 14`, "none", stroke("#c9a24a", 8));
export const backpack = (c = "#2f7fc4") =>
  rect(-38, -120, 76, 90, c, 14, stroke(shade(c, -0.5), 3)) +
  rect(-24, -70, 48, 30, shade(c, -0.15), 8, stroke(shade(c, -0.5), 2));
export const box = (x: number, y: number, s = 1, c = "#c98a4a", label = "") =>
  at(
    x,
    y,
    s,
    rect(-40, -60, 80, 60, c, 3, stroke(shade(c, -0.5), 3)) +
      path(`M-40 -60 L-30 -74 L30 -74 L40 -60 Z`, shade(c, 0.15), stroke(shade(c, -0.5), 3)) +
      label,
  );
