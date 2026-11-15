/** Signature attacks: a unique visual sequence + unique sound for iconic or strong attacks. */
import { signatureSound } from "../audio/signatures";
import { impact, pillar, rain, shards, stream, sweep, type Pt } from "./attackFx";
import type { BoardRenderer } from "./BoardRenderer";
import { shake } from "./fx";
import { palette } from "./palette";
import { ABYSS_SIG } from "./signaturesAbyss";
import { SLOTH_SIG } from "./signaturesSloth";

export interface Ctx {
  r: BoardRenderer;
  from: Pt;
  to: Pt;
}
export type Play = (c: Ctx) => Promise<void>;

const P = () => palette();
const both = (...jobs: Promise<unknown>[]) => Promise.all(jobs).then(() => undefined);

const SIG: Record<string, { sound: keyof typeof signatureSound; play: Play }> = {
  "Klucze Królestwa": {
    sound: "keys",
    play: ({ r, from, to }) =>
      both(stream(r.fx, r.tw, from, to, "🗝️", 4, 44), pillar(r.fx, r.tw, to, P()["logo-yellow"])),
  },
  "Zatrzymanie Attyli": {
    sound: "gong",
    play: async ({ r, to }) => {
      r.fx.emojis(to.x, to.y, "🛡️", 1, false, 110);
      await impact(r.fx, r.tw, to, P()["logo-yellow"], 1.6);
      await shake(r.tw, r.stage, 10, r.reduced);
    },
  },
  "List do Flawiana": {
    sound: "scroll",
    play: ({ r, from, to }) =>
      both(
        stream(r.fx, r.tw, from, to, "📜", 3, 50),
        r.tw.wait(500).then(() => impact(r.fx, r.tw, to, P().danger, 1.3)),
      ),
  },
  "Bulla przebaczenia": {
    sound: "pardon",
    play: async ({ r, from, to }) => {
      await stream(r.fx, r.tw, from, to, "📜", 2, 52, 900);
      await both(
        pillar(r.fx, r.tw, to, P().surface, 150),
        impact(r.fx, r.tw, to, P()["logo-yellow"], 1.4),
      );
    },
  },
  "Sobór Watykański I": {
    sound: "council",
    play: async ({ r, from, to }) => {
      await both(
        rain(r.fx, r.tw, to, "🕯️", 10, 30),
        stream(r.fx, r.tw, from, to, "🔑", 3, 40, 1000),
      );
      await both(impact(r.fx, r.tw, to, P()["logo-red"], 1.8), shake(r.tw, r.stage, 12, r.reduced));
    },
  },
  "Chorał gregoriański": {
    sound: "chant",
    play: ({ r, from, to }) =>
      both(
        stream(r.fx, r.tw, from, to, "🎵", 10, 30, 1200),
        pillar(r.fx, r.tw, from, P()["logo-yellow"], 160),
      ),
  },
  "Odsiecz wiedeńska": {
    sound: "hussars",
    play: async ({ r, to }) => {
      await both(
        sweep(r.fx, r.tw, r.w, to.y, "🐎", 96, true, 900),
        r.tw.wait(150).then(() => sweep(r.fx, r.tw, r.w, to.y + 50, "🪽", 70, true, 900)),
      );
      await impact(r.fx, r.tw, to, P()["logo-red"], 1.8);
    },
  },
  "Liga Święta": {
    sound: "drums",
    play: ({ r, from, to }) => stream(r.fx, r.tw, from, to, "🚩", 6, 34),
  },
  Katechizm: {
    sound: "book",
    play: ({ r, from, to }) => stream(r.fx, r.tw, from, to, "📖", 2, 60, 500),
  },
  "Otwórzcie okna": {
    sound: "window",
    play: async ({ r, from, to }) => {
      await both(
        pillar(r.fx, r.tw, to, P().surface, 160),
        stream(r.fx, r.tw, from, to, "🕊️", 6, 34),
      );
    },
  },
  "Swoje Westerplatte": {
    sound: "westerplatte",
    play: async ({ r, from, to }) => {
      void pillar(r.fx, r.tw, from, P()["logo-yellow"], 200);
      await r.tw.wait(350);
      await stream(r.fx, r.tw, from, to, "🇵🇱", 5, 44, 800);
      await both(
        pillar(r.fx, r.tw, to, P().surface, 220),
        impact(r.fx, r.tw, to, P()["logo-yellow"], 2.2),
        shake(r.tw, r.stage, 20, r.reduced),
      );
    },
  },
  "Nie lękajcie się!": {
    sound: "fear_not",
    play: async ({ r, from }) => void (await impact(r.fx, r.tw, from, P()["logo-yellow"], 2.4)),
  },
  "Deus caritas est": {
    sound: "love",
    play: ({ r, from, to }) => stream(r.fx, r.tw, from, to, "❤️", 10, 30),
  },
  "Hagan lío!": {
    sound: "drums",
    play: async ({ r, from, to }) => {
      await both(
        stream(r.fx, r.tw, from, to, "🥁", 3, 44),
        stream(r.fx, r.tw, from, to, "🎉", 8, 30),
      );
      r.fx.emojis(to.x, to.y, "🎊", 12, true, 28);
    },
  },
  "Szpital polowy": {
    sound: "love",
    play: ({ r, from }) => pillar(r.fx, r.tw, from, P().success, 200),
  },
  "Remont dachu": {
    sound: "hammer",
    play: async ({ r, to }) => {
      await both(rain(r.fx, r.tw, to, "🧱", 12, 34), rain(r.fx, r.tw, to, "🔨", 3, 40));
      shards(r.fx, to, P()["logo-red"], 16, 1.2);
    },
  },
  "Procesja wejścia": {
    sound: "procession",
    play: ({ r, from, to }) =>
      both(stream(r.fx, r.tw, from, to, "🔔", 5, 34), stream(r.fx, r.tw, from, to, "💨", 8, 30)),
  },
  "Toccata na pełnych registrach": {
    sound: "organ",
    play: async ({ r, from, to }) => {
      for (let i = 0; i < 3; i++)
        void r.fx.ring(from.x, from.y, P()["logo-yellow"], 140 + i * 60, 6);
      await stream(r.fx, r.tw, from, to, "🎶", 9, 34, 1000);
      await shake(r.tw, r.stage, 12, r.reduced);
    },
  },
  "Misja do Prusów": {
    sound: "sea",
    play: ({ r, to }) =>
      both(sweep(r.fx, r.tw, r.w, to.y, "⛵", 90, true, 1000), rain(r.fx, r.tw, to, "🌊", 6, 30)),
  },
  "Zło dobrem zwyciężaj": {
    sound: "overcome",
    play: async ({ r, from, to }) => {
      r.fx.emojis(to.x, to.y, "🌑", 6, true, 34);
      await pillar(r.fx, r.tw, from, P().surface, 180);
      await stream(r.fx, r.tw, from, to, "🤍", 8, 32);
    },
  },
  "Psalm responsoryjny": {
    sound: "chant",
    play: ({ r, from, to }) => stream(r.fx, r.tw, from, to, "🎵", 7, 30),
  },
  "Namiot spotkania": {
    sound: "campfire",
    play: ({ r, from, to }) =>
      both(stream(r.fx, r.tw, from, to, "🔥", 6, 32), stream(r.fx, r.tw, from, to, "🎸", 2, 44)),
  },
  "Wysokie C": {
    sound: "high_c",
    play: async ({ r, from }) => void (await impact(r.fx, r.tw, from, P()["logo-blue"], 1.4)),
  },
  "Organy oliwskie": {
    sound: "abbey",
    play: async ({ r, from, to }) => {
      for (let i = 0; i < 4; i++)
        void r.fx.ring(from.x, from.y, P()["logo-yellow"], 120 + i * 50, 5);
      await both(
        stream(r.fx, r.tw, from, to, "🎶", 10, 32, 1100),
        pillar(r.fx, r.tw, from, P().surface, 150),
      );
      await both(
        impact(r.fx, r.tw, to, P()["logo-yellow"], 1.7),
        shake(r.tw, r.stage, 10, r.reduced),
      );
    },
  },
  "Wielka watra": {
    sound: "bonfire",
    play: async ({ r, from, to }) => {
      await both(
        pillar(r.fx, r.tw, from, P()["logo-orange"], 140),
        stream(r.fx, r.tw, from, to, "🔥", 9, 36, 1000),
      );
      await both(
        rain(r.fx, r.tw, to, "✨", 10, 28),
        impact(r.fx, r.tw, to, P()["logo-orange"], 1.8),
        shake(r.tw, r.stage, 12, r.reduced),
      );
    },
  },
  // demons
  Rój: {
    sound: "swarm",
    play: async ({ r, from, to }) => {
      await stream(r.fx, r.tw, from, to, "🪰", 22, 26, 1300);
      await impact(r.fx, r.tw, to, P()["logo-dark"], 1.6);
    },
  },
  "Ja, ja i jeszcze raz ja": {
    sound: "roar",
    play: async ({ r, from, to }) => {
      r.fx.emojis(from.x, from.y, "🐉", 3, true, 60);
      await rain(r.fx, r.tw, to, "👑", 10, 34);
      await shake(r.tw, r.stage, 16, r.reduced);
    },
  },
  "Jeszcze tylko to jedno": {
    sound: "coins",
    play: ({ r, to }) =>
      both(rain(r.fx, r.tw, to, "🪙", 16, 28), rain(r.fx, r.tw, to, "💸", 5, 34)),
  },
  "Promocja −70%": {
    sound: "coins",
    play: ({ r, from, to }) => stream(r.fx, r.tw, from, to, "🏷️", 6, 34),
  },
  "Sami hipokryci": {
    sound: "boo",
    play: ({ r, from, to }) => stream(r.fx, r.tw, from, to, "🗯️", 6, 36),
  },
  "Kiedyś się nawrócę": {
    sound: "clock",
    play: ({ r, from, to }) => stream(r.fx, r.tw, from, to, "📆", 8, 32),
  },
  "Szeptanka na parafii": {
    sound: "boo",
    play: ({ r, from, to }) => stream(r.fx, r.tw, from, to, "🤫", 8, 30),
  },
  "Bzyczenie w głowie": {
    sound: "swarm",
    play: ({ r, from, to }) => stream(r.fx, r.tw, from, to, "🪰", 8, 24),
  },
  "Upadek gwiazdy zarannej": {
    sound: "fall",
    play: async ({ r, from, to }) => {
      await pillar(r.fx, r.tw, from, P()["logo-dark"], 220);
      await stream(r.fx, r.tw, from, to, "🌠", 4, 56, 900);
      await both(
        impact(r.fx, r.tw, to, P().danger, 2.4),
        rain(r.fx, r.tw, to, "🌑", 8, 40),
        shake(r.tw, r.stage, 24, r.reduced),
      );
    },
  },
  "Nienawiść bez końca": {
    sound: "inferno",
    play: async ({ r, from, to }) => {
      await stream(r.fx, r.tw, from, to, "🔥", 16, 34, 1100);
      shards(r.fx, to, P()["logo-red"], 22, 1.6);
      await shake(r.tw, r.stage, 18, r.reduced);
    },
  },
  "Spalone mosty": {
    sound: "inferno",
    play: ({ r, to }) =>
      both(rain(r.fx, r.tw, to, "🔥", 10, 32), rain(r.fx, r.tw, to, "🌉", 2, 48)),
  },
  "Nic nie ma sensu": {
    sound: "void",
    play: async ({ r, from, to }) => {
      r.fx.emojis(to.x, to.y, "🌫️", 8, true, 40);
      await stream(r.fx, r.tw, from, to, "🕳️", 5, 44, 1000);
      await impact(r.fx, r.tw, to, P()["logo-dark"], 1.8);
    },
  },
  "Gloria in excelsis": {
    sound: "fear_not",
    play: async ({ r, from, to }) => {
      await pillar(r.fx, r.tw, from, P()["logo-yellow"], 200);
      await stream(r.fx, r.tw, from, to, "🎶", 12, 32, 1100);
    },
  },
  "Oaza Nowego Życia": {
    sound: "campfire",
    play: async ({ r, from, to }) => {
      await stream(r.fx, r.tw, from, to, "🕊️", 6, 40);
      await impact(r.fx, r.tw, to, P()["logo-yellow"], 1.8);
    },
  },
  "Zmarnowane lata": {
    sound: "clock",
    play: async ({ r, from, to }) => {
      await stream(r.fx, r.tw, from, to, "⏳", 6, 40, 1000);
      await impact(r.fx, r.tw, to, P()["logo-dark"], 1.6);
    },
  },
  "Burza w komentarzach": {
    sound: "boo",
    play: async ({ r, to }) => {
      await both(rain(r.fx, r.tw, to, "💬", 16, 30), rain(r.fx, r.tw, to, "⚡", 5, 40));
      await shake(r.tw, r.stage, 14, r.reduced);
    },
  },
  "Ogon zmiatający gwiazdy": {
    sound: "roar",
    play: async ({ r, to }) => {
      await sweep(r.fx, r.tw, r.w, to.y, "🐲", 110, false, 900);
      await both(
        rain(r.fx, r.tw, to, "⭐", 10, 30),
        impact(r.fx, r.tw, to, P().danger, 2.2),
        shake(r.tw, r.stage, 22, r.reduced),
      );
    },
  },
  "Megafon na deptaku": {
    sound: "drums",
    play: async ({ r, from, to }) => {
      for (let i = 0; i < 3; i++)
        void r.fx.ring(from.x, from.y, P()["logo-yellow"], 90 + i * 50, 5);
      await stream(r.fx, r.tw, from, to, "📢", 4, 44);
      await impact(r.fx, r.tw, to, P()["logo-yellow"], 1.5);
    },
  },
  "Ostatnie 30 kilometrów": {
    sound: "procession",
    play: async ({ r, from, to }) => {
      await stream(r.fx, r.tw, from, to, "👣", 10, 30, 1100);
      await both(
        pillar(r.fx, r.tw, to, P().surface, 160),
        impact(r.fx, r.tw, to, P()["logo-yellow"], 2),
      );
    },
  },
  "Oddaję życie za brata": {
    sound: "overcome",
    play: async ({ r, from, to }) => {
      await pillar(r.fx, r.tw, from, P().surface, 220);
      await stream(r.fx, r.tw, from, to, "🤍", 10, 34, 1100);
      await both(
        impact(r.fx, r.tw, to, P()["logo-yellow"], 2.4),
        shake(r.tw, r.stage, 16, r.reduced),
      );
    },
  },
};

Object.assign(SIG, ABYSS_SIG, SLOTH_SIG);

export function signatureFor(name: string) {
  return SIG[name] ?? null;
}

export async function playSignature(name: string, c: Ctx): Promise<boolean> {
  const s = SIG[name];
  if (!s) return false;
  signatureSound[s.sound]?.();
  await s.play(c);
  return true;
}
