import { useCallback, useEffect, useRef, useState } from "react";
import { Tabs, usePrefersReducedMotion } from "@/ui";
import { track } from "@/lib/analytics";
import { rollPack } from "./collection/packs";
import {
  deckList,
  deckProblems,
  finishDuel,
  finishTutorial,
  freshFlags,
  grantBooster,
  payFee,
  reward,
  rollPrize,
  type Profile,
} from "./collection/profile";
import { useProfile } from "./collection/useProfile";
import { completeTale, pendingTale, settleStreak, stakeStreak } from "./collection/streak";
import { LazyTaleBook } from "./tales/LazyTaleBook";
import { TaleShelf } from "./tales/TaleShelf";
import { TaleWaiting } from "./tales/TaleWaiting";
import type { Opponent } from "./data/opponents";
import { PatronDialog } from "./rank/PatronDialog";
import { RankMeter } from "./rank/RankMeter";
import { afterDuel, rankIndex } from "./rank/xp";
import { Bestiary } from "./components/Bestiary";
import { recordSighting } from "./collection/bestiary";
import { BoosterShop } from "./components/BoosterShop";
import { DeckBuilder } from "./components/DeckBuilder";
import { DeckSwitcher } from "./components/DeckSwitcher";
import { SoloDuel, type DuelOutcome } from "./components/SoloDuel";
import { FeePayment } from "./components/FeePayment";
import { OpponentPicker } from "./components/OpponentPicker";
import { PrizeTable } from "./components/PrizeTable";
import { Rules } from "./components/Rules";
import { Settings } from "./components/Settings";
import { PvpDuel } from "./pvp/PvpDuel";
import { PvpLobby } from "./pvp/PvpLobby";
import { preloadBoard } from "./board/loadBoard";
import type { Session } from "./pvp/session";
import { deckStats } from "./stats/deckStats";
import { TutorialCard } from "./tutorial/TutorialCard";
import { TutorialDuel } from "./tutorial/TutorialDuel";
import { DeckForge } from "./ideal/DeckForge";
import { toDeckList } from "./ideal/pool";
import type { DeckList } from "./engine/state";

/** Statistics props shared by every solo-duel event (see `@/lib/analytics`). */
const duelStats = (opponent: Opponent, training: boolean, xp: number) => ({
  opponent: opponent.id,
  difficulty: opponent.difficulty,
  mode: training ? "trening" : "nagroda",
  rank: rankIndex(xp) + 1,
});

type Tab =
  | "walka"
  | "opowiesci"
  | "multiplayer"
  | "talia"
  | "boostery"
  | "bestiariusz"
  | "zasady"
  | "ustawienia";
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
    aiDeck?: DeckList;
  } | null>(null);
  /** "Idealny oponent": its deck is being computed (loading screen). */
  const [forging, setForging] = useState<Opponent | null>(null);
  const [pvp, setPvp] = useState<Session | null>(null);
  /** Key of the running tutorial duel (a new key = a fresh start). */
  const [tutorial, setTutorial] = useState<number | null>(null);
  const [paying, setPaying] = useState<Opponent | null>(null);
  const [patron, setPatron] = useState<number | null>(null);
  /** A saint's tale open from the hub: the waiting one, or a finished one read again (no card). */
  const [reading, setReading] = useState<{ cardId: string; replay: boolean } | null>(null);
  const waiting = pendingTale(profile);
  const saints = profile.saints ?? [];
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
    if (!scrollTo.current || duel || pvp || tutorial) return;
    const el = (scrollTo.current === "rank" ? rankRef : tabsRef).current;
    scrollTo.current = null;
    el?.scrollIntoView({ block: "start", behavior: reduced ? "auto" : "smooth" });
  }, [duel, pvp, reduced, tutorial]);

  const startDuel = (opponent: Opponent, training = false, aiDeck?: DeckList) => {
    // a rewarded duel puts the win streak at stake: only a win gives it back (+1)
    if (!training) update(stakeStreak);
    track("duel_start", duelStats(opponent, training, xp));
    setDuel({ opponent, training, key: Date.now(), bestiary: profile.bestiary, aiDeck });
  };

  const onFinish = useCallback(
    (won: boolean, souls: number): DuelOutcome => {
      if (duel) {
        track("duel_end", {
          ...duelStats(duel.opponent, duel.training, xp),
          result: won ? "wygrana" : "przegrana",
          souls,
        });
        // which cards the winning (and losing) decks play — one event per duel, card name → copies
        track(won ? "deck_win" : "deck_loss", {
          difficulty: duel.opponent.difficulty,
          mode: duel.training ? "trening" : "nagroda",
          ...deckStats(deckList(profile)),
        });
      }
      // a practice duel changes nothing in the profile: no talents, booster, record or rank
      if (!duel || duel.training) return { earned: 0, prize: null, rank: { from: xp, to: xp } };
      const t = reward(duel.opponent.reward, won, souls);
      // a victory over a harder opponent brings one free booster, opened right after the duel
      const table = won ? duel.opponent.prize : undefined;
      const pack = table?.length ? rollPrize(table) : null;
      const cards = pack ? rollPack(pack) : [];
      const prize = pack ? { pack, cards, fresh: freshFlags(profile, cards) } : null;
      const rank = { from: xp, to: afterDuel(xp, won, duel.opponent.difficulty) };
      const settled = settleStreak(profile, won);
      const tale = settled.tale ? { cardId: settled.tale } : null;
      update((p) => {
        const next = {
          ...finishDuel(settleStreak(p, won).profile, duel.opponent.id, won, t),
          xp: rank.to,
        };
        return prize ? grantBooster(next, prize.cards) : next;
      });
      return { earned: t, prize, rank, tale };
    },
    [duel, profile, update, xp],
  );

  const onTutorial = useCallback(
    (won: boolean) => {
      track("tutorial_end", { result: won ? "wygrana" : "przegrana" });
      if (!won) return 0;
      const { earned } = finishTutorial(profile);
      update((p) => finishTutorial(p).profile);
      return earned;
    },
    [profile, update],
  );

  const tutorialCard = (
    <TutorialCard
      done={!!profile.tutorial}
      onStart={() => {
        track("tutorial_start");
        setTutorial(Date.now());
      }}
    />
  );

  if (tutorial !== null)
    return (
      <TutorialDuel
        key={tutorial}
        onFinish={onTutorial}
        onAgain={() => setTutorial(Date.now())}
        onExit={() => {
          setTutorial(null);
          setTab("walka");
          scrollTo.current = "rank";
        }}
      />
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
        aiDeck={duel.aiDeck}
        onFinish={onFinish}
        onSighting={(id) => update((p) => recordSighting(p, id))}
        bestiary={duel.bestiary}
        onForfeit={() => {
          track("duel_forfeit", duelStats(duel.opponent, duel.training, xp));
          update((p) => ({
            ...settleStreak(p, false).profile,
            xp: afterDuel(p.xp ?? 0, false, duel.opponent.difficulty),
          }));
        }}
        onTaleWin={(id) => update((p) => completeTale(p, id))}
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
                  {waiting && (
                    <TaleWaiting onOpen={() => setReading({ cardId: waiting, replay: false })} />
                  )}
                  {!profile.tutorial && tutorialCard}
                  <DeckSwitcher profile={profile} update={update} />
                  <OpponentPicker
                    beaten={profile.beaten}
                    talents={profile.talents}
                    problems={deckProblems(profile)}
                    onFight={(opponent) => {
                      if (profile.talents < (opponent.fee ?? 0)) return;
                      if (opponent.adaptive) setForging(opponent);
                      else if (opponent.fee) setPaying(opponent);
                      else startDuel(opponent);
                    }}
                    onTrain={(opponent) => startDuel(opponent, true)}
                    onEditDeck={() => setTab("talia")}
                  />
                  <PrizeTable />
                  {profile.tutorial && tutorialCard}
                </div>
              ),
            },
            ...(saints.length
              ? [
                  {
                    value: "opowiesci",
                    label: "Opowieści",
                    content: (
                      <TaleShelf
                        saints={saints}
                        waiting={waiting}
                        onOpen={(cardId, replay) => setReading({ cardId, replay })}
                      />
                    ),
                  },
                ]
              : []),
            {
              value: "multiplayer",
              label: "Multiplayer",
              content: (
                <div className="flex flex-col gap-6">
                  <DeckSwitcher profile={profile} update={update} />
                  <PvpLobby
                    deck={deckList(profile)}
                    problems={deckProblems(profile)}
                    onEditDeck={() => setTab("talia")}
                    onStart={(session) => {
                      track("pvp_start", { role: session.role });
                      setPvp(session);
                    }}
                  />
                </div>
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
            { value: "ustawienia", label: "Ustawienia", content: <Settings /> },
          ]}
        />
      </div>
      {patron !== null && (
        <PatronDialog xp={xp} index={patron} onSelect={setPatron} onClose={() => setPatron(null)} />
      )}
      {reading && (
        <LazyTaleBook
          key={reading.cardId}
          cardId={reading.cardId}
          replay={reading.replay}
          onWin={() => update((p) => completeTale(p, reading.cardId))}
          onClose={() => setReading(null)}
        />
      )}
      {forging && (
        <DeckForge
          deck={deckList(profile)}
          onCancel={() => setForging(null)}
          onReady={(result) => {
            setForging(null);
            startDuel(forging, false, toDeckList(result.deck));
          }}
        />
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
