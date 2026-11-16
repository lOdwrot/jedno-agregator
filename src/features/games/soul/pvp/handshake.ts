/** First messages after the WebRTC connection opens: the guest says hello, the host deals. */
import type { DeckList } from "../engine/state";
import type { Link } from "./link";
import { cleanName, PROTOCOL, validDeck, type Msg } from "./protocol";
import { newPvpGame, type Session } from "./session";

const WAIT = 15000;

function next<T extends Msg["t"]>(link: Link, types: T[]): Promise<Extract<Msg, { t: T }>> {
  return new Promise((resolve, reject) => {
    const done = () => (clearTimeout(t), off(), offClose());
    const t = setTimeout(() => (done(), reject(new Error("Rywal nie odpowiada."))), WAIT);
    const off = link.onMessage((m) => {
      if (!types.includes(m.t as T)) return;
      done();
      resolve(m as Extract<Msg, { t: T }>);
    });
    const offClose = link.onClose(
      () => (done(), reject(new Error("Połączenie zostało przerwane."))),
    );
  });
}

export async function hostHandshake(link: Link, name: string, deck: DeckList): Promise<Session> {
  const hello = await next(link, ["hello"]);
  const refuse = (reason: string) => {
    link.send({ t: "refuse", reason });
    setTimeout(() => link.close(), 500);
    return new Error(reason);
  };
  if (hello.v !== PROTOCOL)
    throw refuse("Rywal ma inną wersję gry — odświeżcie oboje stronę i spróbujcie ponownie.");
  if (!validDeck(hello.deck))
    throw refuse("Talia rywala nie spełnia zasad (50 kart, co najmniej 5 postaci podstawowych).");
  const names = { me: cleanName(name, "Gospodarz"), ai: cleanName(hello.name, "Gość") };
  const decks = { me: deck, ai: hello.deck };
  const game = newPvpGame(decks, names);
  link.send({ t: "start", game });
  return { role: "host", link, game, decks, names };
}

export async function guestHandshake(link: Link, name: string, deck: DeckList): Promise<Session> {
  link.send({ t: "hello", v: PROTOCOL, name: cleanName(name, "Gość"), deck });
  const m = await next(link, ["start", "refuse"]);
  if (m.t === "refuse") {
    link.close();
    throw new Error(m.reason);
  }
  const names = m.game.pvp?.names ?? { me: "Gospodarz", ai: "Gość" };
  return { role: "guest", link, game: m.game, names };
}
