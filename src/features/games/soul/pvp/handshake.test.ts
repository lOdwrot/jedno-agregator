import { describe, expect, it } from "vitest";
import { deckList, newProfile } from "../collection/profile";
import { guestHandshake, hostHandshake } from "./handshake";
import { memoryPair } from "./link";

const deck = () => deckList(newProfile());

describe("handshake", () => {
  it("deals the same game to both and keeps the names", async () => {
    const [h, g] = memoryPair();
    const [host, guest] = await Promise.all([
      hostHandshake(h, "  Ania  ", deck()),
      guestHandshake(g, "Bartek", deck()),
    ]);
    expect(guest.game).toEqual(host.game);
    expect(host.names).toEqual({ me: "Ania", ai: "Bartek" });
    expect(guest.names).toEqual(host.names);
    expect(host.game.players.ai.side).toBe("parish");
  });

  it("turns away a guest with an invalid deck", async () => {
    const [h, g] = memoryPair();
    const [host, guest] = await Promise.allSettled([
      hostHandshake(h, "Ania", deck()),
      guestHandshake(g, "Bartek", deck().slice(5)),
    ]);
    expect(host.status).toBe("rejected");
    expect(guest.status === "rejected" && String(guest.reason)).toMatch(/Talia rywala/);
  });
});
