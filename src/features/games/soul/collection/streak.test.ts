import { describe, expect, it } from "vitest";
import { getCard, COLLECTIBLE } from "../data/cards";
import { PACKS, rollPack } from "./packs";
import { newProfile, owned, parseKey, type Profile } from "./profile";
import {
  completeTale,
  pendingTale,
  settleStreak,
  stakeStreak,
  streakNeeded,
  TALE_ORDER,
} from "./streak";

function duel(p: Profile, won: boolean) {
  return settleStreak(stakeStreak(p), won);
}
function wins(p: Profile, n: number) {
  let tale: string | null = null;
  for (let i = 0; i < n; i++) ({ profile: p, tale } = duel(p, true));
  return { p, tale };
}

describe("win streak and saints' tales", () => {
  it("unlocks the 1st tale after 5 wins in a row, then needs 10 and 15", () => {
    expect([0, 1, 2].map(streakNeeded)).toEqual([5, 10, 15]);
    let { p, tale } = wins(newProfile(), 4);
    expect(tale).toBeNull();
    ({ p, tale } = wins(p, 1));
    expect(tale).toBe(TALE_ORDER[0]);
    expect(p.streak).toBe(0);
    p = completeTale(p, tale!);
    ({ p, tale } = wins(p, 9));
    expect(tale).toBeNull();
    ({ p, tale } = wins(p, 1));
    expect(tale).toBe(TALE_ORDER[1]);
    p = completeTale(p, tale!);
    ({ p, tale } = wins(p, 15));
    expect(tale).toBe(TALE_ORDER[2]);
    p = completeTale(p, tale!);
    ({ p, tale } = wins(p, 40));
    expect(tale).toBeNull();
    expect(p.saints).toEqual(TALE_ORDER);
  });

  it("a defeat, a forfeit or a reload mid-duel breaks the streak", () => {
    let { p } = wins(newProfile(), 4);
    p = duel(p, false).profile;
    expect(p.streak).toBe(0);
    ({ p } = wins(p, 4));
    p = stakeStreak(p); // page reloaded during the duel: nothing settles it
    expect(p.streak).toBe(0);
    p = stakeStreak(p);
    p = settleStreak(p, true).profile;
    expect(p.streak).toBe(1);
  });

  it("a failed quiz keeps the tale waiting, no new tale meanwhile", () => {
    let { p } = wins(newProfile(), 5);
    expect(pendingTale(p)).toBe(TALE_ORDER[0]);
    ({ p } = wins(p, 30));
    expect(p.tales).toBe(1);
    expect(completeTale(p, TALE_ORDER[1]!)).toBe(p);
    p = completeTale(p, TALE_ORDER[0]!);
    expect(pendingTale(p)).toBeNull();
    expect(owned(p, `${TALE_ORDER[0]!}:stained`)).toBe(1);
  });

  it("tale saints are legendary characters that no booster can give", () => {
    for (const id of TALE_ORDER) {
      expect(getCard(id).kind).toBe("character");
      expect(getCard(id).rarity).toBe("legendary");
      expect(COLLECTIBLE.some((c) => c.id === id)).toBe(false);
    }
    let r = 0.1234;
    const rnd = () => (r = (r * 9301 + 49297) % 233280) / 233280;
    for (const pack of PACKS)
      for (let i = 0; i < 300; i++)
        for (const k of rollPack(pack, rnd)) expect(TALE_ORDER).not.toContain(parseKey(k).cardId);
  });
});
