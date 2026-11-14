import { useCallback, useState } from "react";
import { Tabs } from "@/ui";
import { rollPack } from "./collection/packs";
import {
  deckList,
  deckProblems,
  finishDuel,
  freshFlags,
  grantBooster,
  payFee,
  reward,
  rollPrize,
} from "./collection/profile";
import { useProfile } from "./collection/useProfile";
import type { Opponent } from "./data/opponents";
import { Bestiary } from "./components/Bestiary";
import { BoosterShop } from "./components/BoosterShop";
import { DeckBuilder } from "./components/DeckBuilder";
import { SoloDuel, type DuelOutcome } from "./components/SoloDuel";
import { OpponentPicker } from "./components/OpponentPicker";
import { Rules } from "./components/Rules";
import { PvpDuel } from "./pvp/PvpDuel";
import { PvpLobby } from "./pvp/PvpLobby";
import type { Session } from "./pvp/session";

type Tab = "walka" | "multiplayer" | "talia" | "boostery" | "bestiariusz" | "zasady";

/** "Walka o duszę" — card duel vs the computer or a friend (WebRTC): hub (deck, boosters, bestiary) + the duel. */
export function SoulGame() {
  const { profile, update } = useProfile();
  const [tab, setTab] = useState<Tab>("walka");
  const [duel, setDuel] = useState<{ opponent: Opponent; key: number } | null>(null);
  const [pvp, setPvp] = useState<Session | null>(null);

  const onFinish = useCallback(
    (won: boolean, souls: number): DuelOutcome => {
      if (!duel) return { earned: 0, prize: null };
      const t = reward(duel.opponent.reward, won, souls);
      // a victory over a harder opponent brings one free booster, opened right after the duel
      const table = won ? duel.opponent.prize : undefined;
      const pack = table?.length ? rollPrize(table) : null;
      const cards = pack ? rollPack(pack) : [];
      const prize = pack ? { pack, cards, fresh: freshFlags(profile, cards) } : null;
      update((p) => {
        const next = finishDuel(p, duel.opponent.id, won, t);
        return prize ? grantBooster(next, prize.cards) : next;
      });
      return { earned: t, prize };
    },
    [duel, profile, update],
  );

  if (pvp)
    return (
      <PvpDuel
        session={pvp}
        onExit={() => {
          setPvp(null);
          setTab("multiplayer");
        }}
      />
    );

  if (duel)
    return (
      <SoloDuel
        key={duel.key}
        opponent={duel.opponent}
        deck={deckList(profile)}
        onFinish={onFinish}
        onExit={(booster) => {
          setDuel(null);
          setTab(booster ? "boostery" : "walka");
        }}
      />
    );

  return (
    <div className="flex flex-col gap-4">
      <p className="flex flex-wrap gap-x-5 gap-y-1 rounded-card bg-navy px-4 py-3 text-sm font-bold text-white">
        <span>🪙 Talenty: {profile.talents}</span>
        <span>🎁 Boostery do otwarcia: {profile.packs}</span>
        <span>
          🕊️ Wygrane: {profile.wins} · Przegrane: {profile.losses}
        </span>
      </p>
      <Tabs
        label="Walka o duszę — menu"
        value={tab}
        onChange={(v) => setTab(v as Tab)}
        items={[
          {
            value: "walka",
            label: "Pojedynek",
            content: (
              <OpponentPicker
                beaten={profile.beaten}
                talents={profile.talents}
                problems={deckProblems(profile)}
                onFight={(opponent) => {
                  if (profile.talents < (opponent.fee ?? 0)) return;
                  update((p) => payFee(p, opponent.fee));
                  setDuel({ opponent, key: Date.now() });
                }}
                onEditDeck={() => setTab("talia")}
              />
            ),
          },
          {
            value: "multiplayer",
            label: "Multiplayer",
            content: (
              <PvpLobby
                deck={deckList(profile)}
                problems={deckProblems(profile)}
                onEditDeck={() => setTab("talia")}
                onStart={setPvp}
              />
            ),
          },
          {
            value: "talia",
            label: "Talia",
            content: <DeckBuilder profile={profile} update={update} />,
          },
          {
            value: "boostery",
            label: `Boostery${profile.packs ? ` (${profile.packs})` : ""}`,
            content: <BoosterShop profile={profile} update={update} />,
          },
          { value: "bestiariusz", label: "Bestiariusz", content: <Bestiary /> },
          { value: "zasady", label: "Zasady", content: <Rules /> },
        ]}
      />
    </div>
  );
}
