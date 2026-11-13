import { describe, expect, it } from "vitest";
import {
  GOOD,
  accuracySoFar,
  LAPS,
  PATTERNS,
  PERFECT,
  blow,
  createNotes,
  hitRate,
  lapAt,
  startJericho,
  stepJericho,
  type JerichoState,
} from "./engine";

const DT = 1 / 120;

/** Plays the whole song; `offset(note)` = how late the player taps (null = skip the note). */
function play(offset: (i: number) => number | null) {
  let s: JerichoState = startJericho();
  const taps = s.notes
    .map((n, i) => ({ at: offset(i) === null ? null : n.t + (offset(i) as number) }))
    .map((x) => x.at)
    .filter((x): x is number => x !== null)
    .sort((a, b) => a - b);
  let k = 0;
  for (let i = 0; i < 60 * 120 && (s.phase === "playing" || s.phase === "collapse"); i++) {
    s = stepJericho(s, DT);
    while (k < taps.length && s.time >= taps[k]!) {
      s = blow(s);
      k++;
    }
  }
  return s;
}

describe("Jericho engine", () => {
  it("has 7 laps and ends with one shout", () => {
    const notes = createNotes();
    expect(PATTERNS).toHaveLength(LAPS);
    expect(notes.filter((n) => n.kind === "shout")).toHaveLength(1);
    expect(notes.at(-1)!.kind).toBe("shout");
    expect(lapAt(0)).toBe(0);
    expect(lapAt(notes[0]!.t + 0.01)).toBe(1);
    expect(lapAt(notes.at(-1)!.t + 0.01)).toBe(LAPS + 1);
  });

  it("perfect play brings the walls down", () => {
    const s = play(() => 0);
    expect(s.phase).toBe("won");
    expect(hitRate(s)).toBe(1);
    expect(s.maxCombo).toBe(s.notes.length);
  });

  it("judges timing windows", () => {
    let s = startJericho();
    const first = s.notes[0]!;
    s = { ...s, time: first.t + PERFECT / 2 };
    expect(blow(s).notes[0]!.result).toBe("perfect");
    s = { ...s, time: first.t + (PERFECT + GOOD) / 2 };
    expect(blow(s).notes[0]!.result).toBe("good");
  });

  it("a blast with no note resets the combo", () => {
    const s = { ...startJericho(), combo: 5, time: 0.1 };
    const n = blow(s);
    expect(n.combo).toBe(0);
    expect(n.feedback?.kind).toBe("early");
    expect(accuracySoFar(startJericho())).toBe(1);
    expect(accuracySoFar(n)).toBe(0);
  });

  it("missing too many notes keeps the walls standing", () => {
    const s = play((i) => (i % 2 === 0 ? null : 0));
    expect(s.phase).toBe("lost");
  });

  it("spamming the button does not bring the walls down", () => {
    let s: JerichoState = startJericho();
    for (let i = 0; i < 60 * 120 && s.phase === "playing"; i++) {
      s = stepJericho(s, DT);
      if (i % 12 === 0) s = blow(s); // 10 blasts per second
    }
    expect(s.phase).toBe("lost");
  });

  it("skipping the final shout loses even with good rhythm", () => {
    const total = createNotes().length;
    const s = play((i) => (i === total - 1 ? null : 0));
    expect(s.phase).toBe("lost");
  });
});
