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
import { FeePayment } from "./components/FeePayment";
import { OpponentPicker } from "./components/OpponentPicker";
import { PrizeTable } from "./components/PrizeTable";
import { Rules } from "./components/Rules";
import { PvpDuel } from "./pvp/PvpDuel";
import { PvpLobby } from "./pvp/PvpLobby";
import type { Session } from "./pvp/session";

type Tab = "walka" | "multiplayer" | "talia" | "boostery" | "bestiariusz" | "zasady";

/** "Walka o duszę" — card duel vs the computer or a friend (WebRTC): hub (deck, boosters, bestiary) + the duel. */
export function SoulGame() {
  const { profile, update } = useProfile();
  const [tab, setTab] = useState<Tab>("walka");
  const [duel, setDuel] = useState<{
    opponent: Opponent;
    training: boolean;
    key: number;
  } | null>(null);
  const [pvp, setPvp] = useState<Session | null>(null);
  const [paying, setPaying] = useState<Opponent | null>(null);

  const startDuel = (opponent: Opponent, training = false) =>
    setDuel({ opponent, training, key: Date.now() });

  const onFinish = useCallback(
    (won: boolean, souls: number): DuelOutcome => {
      // a practice duel changes nothing in the profile: no talents, booster or record
      if (!duel || duel.training) return { earned: 0, prize: null };
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
        training={duel.training}
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
              <div className="flex flex-col gap-6">
                <OpponentPicker
                  beaten={profile.beaten}
                  talents={profile.talents}
                  problems={deckProblems(profile)}
                  onFight={(opponent) => {
                    if (profile.talents < (opponent.fee ?? 0)) return;
                    if (opponent.fee) setPaying(opponent);
                    else startDuel(opponent);
                  }}
                  onTrain={(opponent) => startDuel(opponent, true)}
                  onEditDeck={() => setTab("talia")}
                />
                <PrizeTable />
              </div>
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
      {paying && (
        <FeePayment
          opponent={paying}
          fee={paying.fee ?? 0}
          talents={profile.talents}
          onDone={() => {
            update((p) => payFee(p, paying.fee));
            setPaying(null);
            startDuel(paying);
          }}
        />
      )}
    </div>
  );
}
