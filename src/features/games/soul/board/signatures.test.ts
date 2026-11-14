import { describe, expect, it } from "vitest";
import { ALL_CARDS, isCharacter } from "../data/cards";
import { signatureSound } from "../audio/signatures";
import { signatureFor } from "./signatures";

const SIGNED = [
  "Klucze Królestwa",
  "Zatrzymanie Attyli",
  "Odsiecz wiedeńska",
  "Swoje Westerplatte",
  "Remont dachu",
  "Rój",
  "Ja, ja i jeszcze raz ja",
  "Jeszcze tylko to jedno",
];

describe("signature attacks", () => {
  const attacks = new Set(
    ALL_CARDS.filter(isCharacter).flatMap((c) => c.attacks.map((a) => a.name)),
  );

  it("are attached to existing attacks and have a sound", () => {
    for (const name of SIGNED) {
      expect(attacks).toContain(name);
      const s = signatureFor(name)!;
      expect(s).not.toBeNull();
      expect(typeof signatureSound[s.sound]).toBe("function");
    }
  });

  it("every attack of 80+ damage has its own signature", () => {
    const strong = ALL_CARDS.filter(isCharacter).flatMap((c) =>
      c.attacks.filter((a) => a.damage >= 80).map((a) => a.name),
    );
    for (const name of strong) expect(signatureFor(name), name).not.toBeNull();
  });
});
