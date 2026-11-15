import { useCallback, useEffect, useRef, useState } from "react";
import { Tabs, usePrefersReducedMotion } from "@/ui";
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
  type Profile,
} from "./collection/profile";
import { useProfile } from "./collection/useProfile";
import type { Opponent } from "./data/opponents";
import { PatronDialog } from "./rank/PatronDialog";
import { RankMeter } from "./rank/RankMeter";
import { afterDuel, rankIndex } from "./rank/xp";
import { Bestiary } from "./components/Bestiary";
import { recordSighting } from "./collection/bestiary";
import { BoosterShop } from "./components/BoosterShop";
import { DeckBuilder } from "./components/DeckBuilder";
import { SoloDuel, type DuelOutcome } from "./components/SoloDuel";
import { FeePayment } from "./components/FeePayment";
import { OpponentPicker } from "./components/OpponentPicker";
import { PrizeTable } from "./components/PrizeTable";
import { Rules } from "./components/Rules";
import { PvpDuel } from "./pvp/PvpDuel";
import { PvpLobby } from "./pvp/PvpLobby";
import { preloadBoard } from "./board/loadBoard";
import type { Session } from "./pvp/session";

type Tab = "walka" | "multiplayer" | "talia" | "boostery" | "bestiariusz" | "zasady";
/** Where the hub scrolls after leaving a duel: the rank (new duel) or the menu tabs (boosters, multiplayer). */
type ScrollTarget = "rank" | "tabs";

/** "Walka o duszę" — card duel vs the computer or a friend (WebRTC): hub (deck, boosters, bestiary) + the duel. */
export function SoulGame() {
  const { profile, update } = useProfile();
  const [tab, setTab] = useState<Tab>("walka");
  const [duel, setDuel] = useState<{
    opponent: Opponent;
    training: boolean;
    key: number;
    bestiary: Profile["bestiary"];
  } | null>(null);
  const [pvp, setPvp] = useState<Session | null>(null);
  const [paying, setPaying] = useState<Opponent | null>(null);
  const [patron, setPatron] = useState<number | null>(null);
  const scrollTo = useRef<ScrollTarget | null>(null);
  const rankRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const xp = profile.xp ?? 0;
  // fetch the duel board while the player is still in the hub, not when the duel starts
  useEffect(preloadBoard, []);

  // Back from a duel the page would stay scrolled where the fight button was — bring the rank
  // (result of the duel, next opponent below) or the boosters / multiplayer tab into view.
  useEffect(() => {
    if (!scrollTo.current || duel || pvp) return;
    const el = (scrollTo.current === "rank" ? rankRef : tabsRef).current;
    scrollTo.current = null;
    el?.scrollIntoView({ block: "start", behavior: reduced ? "auto" : "smooth" });
  }, [duel, pvp, reduced]);

  const startDuel = (opponent: Opponent, training = false) =>
    setDuel({ opponent, training, key: Date.now(), bestiary: profile.bestiary });

  const onFinish = useCallback(
    (won: boolean, souls: number): DuelOutcome => {
      // a practice duel changes nothing in the profile: no talents, booster, record or rank
      if (!duel || duel.training) return { earned: 0, prize: null, rank: { from: xp, to: xp } };
      const t = reward(duel.opponent.reward, won, souls);
      // a victory over a harder opponent brings one free booster, opened right after the duel
      const table = won ? duel.opponent.prize : undefined;
      const pack = table?.length ? rollPrize(table) : null;
      const cards = pack ? rollPack(pack) : [];
      const prize = pack ? { pack, cards, fresh: freshFlags(profile, cards) } : null;
      const rank = { from: xp, to: afterDuel(xp, won, duel.opponent.difficulty) };
      update((p) => {
        const next = { ...finishDuel(p, duel.opponent.id, won, t), xp: rank.to };
        return prize ? grantBooster(next, prize.cards) : next;
      });
      return { earned: t, prize, rank };
    },
    [duel, profile, update, xp],
  );

  if (pvp)
    return (
      <PvpDuel
        session={pvp}
        onExit={() => {
          setPvp(null);
          setTab("multiplayer");
          scrollTo.current = "tabs";
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
        onSighting={(id) => update((p) => recordSighting(p, id))}
        bestiary={duel.bestiary}
        onForfeit={() =>
          update((p) => ({ ...p, xp: afterDuel(p.xp ?? 0, false, duel.opponent.difficulty) }))
        }
        onExit={(booster) => {
          setDuel(null);
          setTab(booster ? "boostery" : "walka");
          scrollTo.current = booster ? "tabs" : "rank";
        }}
      />
    );

  return (
    <div className="flex flex-col gap-4">
      <div ref={rankRef} className="scroll-mt-24">
        <RankMeter xp={xp} onPatron={() => setPatron(rankIndex(xp))} />
      </div>
      <p className="flex flex-wrap gap-x-5 gap-y-1 rounded-card bg-navy px-4 py-3 text-sm font-bold text-white">
        <span>🪙 Talenty: {profile.talents}</span>
        <span>🎁 Boostery do otwarcia: {profile.packs}</span>
        <span>
          🕊️ Wygrane: {profile.wins} · Przegrane: {profile.losses}
        </span>
      </p>
      <div ref={tabsRef} className="scroll-mt-24">
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
            { value: "bestiariusz", label: "Bestiariusz", content: <Bestiary profile={profile} /> },
            { value: "zasady", label: "Zasady", content: <Rules /> },
          ]}
        />
      </div>
      {patron !== null && (
        <PatronDialog xp={xp} index={patron} onSelect={setPatron} onClose={() => setPatron(null)} />
      )}
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
