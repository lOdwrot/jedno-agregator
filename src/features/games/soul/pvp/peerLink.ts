/**
 * WebRTC connection through PeerJS. The free PeerJS broker only introduces the two browsers
 * (the host registers `jedno-wod-<code>`); the game itself then flows peer-to-peer.
 * `VITE_PEER_SERVER` (e.g. `http://localhost:9000/peerjs`) points to another broker — handy for tests.
 */
import type { DataConnection, Peer as PeerType, PeerOptions } from "peerjs";
import { Listeners, type Link } from "./link";
import { asMsg } from "./protocol";

const PREFIX = "jedno-wod-";
const TIMEOUT = 15000;

export const randomCode = () => String(Math.floor(Math.random() * 10000)).padStart(4, "0");
export const isCode = (s: string) => /^\d{4}$/.test(s);

export class LinkError extends Error {}

function options(): Partial<PeerOptions> {
  const url = import.meta.env.VITE_PEER_SERVER as string | undefined;
  if (!url) return { debug: 0 };
  const u = new URL(url);
  return {
    debug: 0,
    host: u.hostname,
    port: Number(u.port) || (u.protocol === "https:" ? 443 : 80),
    path: u.pathname,
    secure: u.protocol === "https:",
  };
}

async function newPeer(id?: string): Promise<PeerType> {
  const { Peer } = await import("peerjs");
  return id ? new Peer(id, options()) : new Peer(options());
}

const message = (type: string) =>
  type === "peer-unavailable"
    ? "Nie ma gry o takim kodzie. Sprawdź cyfry i czy gospodarz nadal czeka."
    : type === "browser-incompatible"
      ? "Ta przeglądarka nie obsługuje gry przez sieć (WebRTC)."
      : "Nie udało się połączyć. Sprawdź internet i spróbuj jeszcze raz.";

/** Wraps an open PeerJS data connection. `peer` is destroyed together with the link. */
function wrap(conn: DataConnection, peer: PeerType): Link {
  const msg = new Listeners<[import("./protocol").Msg]>();
  const closed = new Listeners<[]>();
  let open = true;
  const end = () => {
    if (!open) return;
    open = false;
    closed.emit();
    peer.destroy();
  };
  conn.on("data", (d) => {
    const m = asMsg(d);
    if (m) msg.emit(m);
  });
  conn.on("close", end);
  conn.on("error", end);
  peer.on("error", (e) => e.type !== "peer-unavailable" && end());
  // the code was only needed to find each other — free it
  peer.disconnect();
  return {
    send: (m) => {
      if (open) void conn.send(m);
    },
    onMessage: (fn) => msg.add(fn),
    onClose: (fn) => closed.add(fn),
    close: () => {
      if (!open) return;
      try {
        conn.close();
      } finally {
        end();
      }
    },
  };
}

export interface Hosting {
  code: string;
  cancel(): void;
}

/** Registers a free 4-digit code; `onGuest` fires once, with the link to whoever joins first. */
export async function hostGame(onGuest: (link: Link) => void): Promise<Hosting> {
  for (let tries = 0; tries < 5; tries++) {
    const code = randomCode();
    const peer = await newPeer(PREFIX + code);
    const ok = await new Promise<boolean>((resolve, reject) => {
      const t = setTimeout(() => reject(new LinkError(message("network"))), TIMEOUT);
      peer.once("open", () => (clearTimeout(t), resolve(true)));
      peer.once("error", (e) => {
        clearTimeout(t);
        if (e.type === "unavailable-id") resolve(false);
        else reject(new LinkError(message(e.type)));
      });
    }).catch((e: unknown) => {
      peer.destroy();
      throw e;
    });
    if (!ok) {
      peer.destroy();
      continue;
    }
    let taken = false;
    peer.on("connection", (conn) => {
      if (taken) return void conn.close();
      taken = true;
      conn.once("open", () => onGuest(wrap(conn, peer)));
    });
    return { code, cancel: () => !taken && peer.destroy() };
  }
  throw new LinkError("Nie udało się założyć gry. Spróbuj jeszcze raz.");
}

/** Joins the game with the given code. */
export async function joinGame(code: string): Promise<Link> {
  const peer = await newPeer();
  return new Promise<Link>((resolve, reject) => {
    const fail = (text: string) => {
      clearTimeout(t);
      peer.destroy();
      reject(new LinkError(text));
    };
    const t = setTimeout(() => fail(message("network")), TIMEOUT);
    peer.once("error", (e) => fail(message(e.type)));
    peer.once("open", () => {
      const conn = peer.connect(PREFIX + code, { reliable: true, serialization: "json" });
      conn.once("open", () => {
        clearTimeout(t);
        resolve(wrap(conn, peer));
      });
    });
  });
}
