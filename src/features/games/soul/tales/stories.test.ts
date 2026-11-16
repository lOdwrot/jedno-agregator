import { describe, expect, it } from "vitest";
import { getCard } from "../data/cards";
import { TALE_ORDER } from "../collection/streak";
import { score, TALES } from "./stories";

describe("saints' tales", () => {
  it("every tale saint has a 5–6 page story and a 3-question quiz", () => {
    expect(TALES.map((t) => t.id)).toEqual(TALE_ORDER);
    for (const t of TALES) {
      expect(t.pages.length).toBeGreaterThanOrEqual(5);
      expect(t.pages.length).toBeLessThanOrEqual(6);
      for (const p of t.pages) expect(p.text.length).toBeLessThan(320);
      expect(t.quiz).toHaveLength(3);
      for (const q of t.quiz) expect(q.options[q.answer]).toBeTruthy();
      const who = t.quiz[2];
      expect(who.q).toMatch(/O jakim świętym/);
      expect(who.options[who.answer]).toBe(getCard(t.id).name);
    }
  });

  it("scores the answers", () => {
    const t = TALES[0]!;
    expect(
      score(
        t,
        t.quiz.map((q) => q.answer),
      ),
    ).toBe(3);
    expect(score(t, [9, 9, 9])).toBe(0);
  });
});
