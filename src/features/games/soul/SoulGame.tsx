import { useCallback, useState } from "react";
import { Tabs } from "@/ui";
import { deckList, deckProblems, finishDuel, reward } from "./collection/profile";
import { useProfile } from "./collection/useProfile";
import type { Opponent } from "./data/opponents";
import { Bestiary } from "./components/Bestiary";
import { BoosterShop } from "./components/BoosterShop";
import { DeckBuilder } from "./components/DeckBuilder";
import { DuelView } from "./components/DuelView";
import { OpponentPicker } from "./components/OpponentPicker";
import { Rules } from "./components/Rules";

type Tab = "walka" | "talia" | "boostery" | "bestiariusz" | "zasady";

/** "Walka o duszę" — single-player card duel: hub (deck, boosters, bestiary) + the duel itself. */
export function SoulGame() {
  const { profile, update } = useProfile();
  const [tab, setTab] = useState<Tab>("walka");
  const [duel, setDuel] = useState<{ opponent: Opponent; key: number } | null>(null);

  const onFinish = useCallback(
    (won: boolean, souls: number) => {
      if (!duel) return 0;
      const t = reward(duel.opponent.reward, won, souls);
      update((p) => finishDuel(p, duel.opponent.id, won, t));
      return t;
    },
    [duel, update],
  );

  if (duel)
    return (
      <DuelView
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
                problems={deckProblems(profile)}
                onFight={(opponent) => setDuel({ opponent, key: Date.now() })}
                onEditDeck={() => setTab("talia")}
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
