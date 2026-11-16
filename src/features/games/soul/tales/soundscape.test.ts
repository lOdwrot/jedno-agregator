import { describe, expect, it } from "vitest";
import { CUES } from "../audio/taleCues";
import { LULLABY, lullabyBar, soundscapeOf } from "./soundscape";
import { TALES } from "./stories";

describe("tale soundscapes", () => {
  it("every page of every tale has sound: a bed or a cue, all of them synthesized", () => {
    for (const tale of TALES)
      for (const page of tale.pages) {
        const s = soundscapeOf(page.scene, tale.id);
        expect(s.beds.length + s.cues.length, `${tale.id}/${page.scene}`).toBeGreaterThan(0);
        for (const c of s.cues) {
          expect(CUES[c.cue]).toBeTypeOf("function");
          expect(c.every[0]).toBeGreaterThan(0);
          expect(c.every[1]).toBeGreaterThanOrEqual(c.every[0]);
        }
      }
  });

  it("the sheep bleat on the meadow and the wolf howls in Gubbio", () => {
    expect(soundscapeOf("meadow", "bernadetta").cues.map((c) => c.cue)).toContain("bleat");
    expect(soundscapeOf("wolf", "biedaczyna").cues.map((c) => c.cue)).toContain("howl");
    expect(soundscapeOf("wind", "bernadetta").beds.map((b) => b.bed)).toContain("gale");
  });

  it("Isidore's spring is a dry summer field, not Bernadetta's grotto", () => {
    expect(soundscapeOf("spring", "izydor").cues.map((c) => c.cue)).toContain("crickets");
    expect(soundscapeOf("spring", "bernadetta").cues.map((c) => c.cue)).not.toContain("crickets");
  });

  it("the lullaby stays calm: pentatonic notes, slow bars, small steps", () => {
    expect(LULLABY.bar).toBeGreaterThanOrEqual(3);
    for (let n = 0; n < 64; n++) {
      const bar = lullabyBar(n);
      expect(bar.length).toBeGreaterThan(0);
      bar.forEach(([i, beat], k) => {
        expect(LULLABY.scale[i]).toBeDefined();
        expect(beat).toBeLessThan(4);
        if (k > 0) expect(Math.abs(i - bar[k - 1]![0])).toBeLessThanOrEqual(2);
      });
    }
  });
});
