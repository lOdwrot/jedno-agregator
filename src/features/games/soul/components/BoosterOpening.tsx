import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/cn";
import { Button, usePrefersReducedMotion } from "@/ui";
import { Confetti } from "../../fx/Confetti";
import { shake } from "../../fx/shake";
import { noise, tone } from "../audio/context";
import { sfx } from "../audio/sfx";
import type { PackType } from "../collection/packs";
import { parseKey, type CardKey } from "../collection/profile";
import { getCard } from "../data/cards";
import { FINISH_LABEL, RARITY_LABEL } from "../data/types";
import { BoosterPack } from "./BoosterPack";
import { CardFace } from "./CardFace";
import { CardMini } from "./CardMini";

type Phase = "charge" | "tear" | "rise" | "reveal";

interface Props {
  pack: PackType;
  cards: CardKey[];
  fresh: boolean[];
  onClose: () => void;
  onAgain: (() => void) | null;
}

const rank = (k: CardKey) =>
  ({ common: 0, uncommon: 1, rare: 2, legendary: 3 })[getCard(parseKey(k).cardId).rarity];

/** Full-screen booster opening: charge → tear → cards rise → flip one by one with rarity effects. */
export function BoosterOpening({ pack, cards, fresh, onClose, onAgain }: Props) {
  const reduce = usePrefersReducedMotion();
  const [phase, setPhase] = useState<Phase>("charge");
  const [shown, setShown] = useState(0);
  const [zoom, setZoom] = useState<number | null>(null);
  const [party, setParty] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const board = useRef<HTMLUListElement>(null);
  const zoomClose = useRef<HTMLElement>(null);
  useEffect(() => {
    if (zoom !== null) zoomClose.current?.focus();
  }, [zoom]);

  useEffect(() => {
    root.current?.focus();
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = prev;
    };
  }, []);

  // charge: rising rumble, then the pack bursts open
  useEffect(() => {
    if (phase === "charge") {
      for (let i = 0; i < 8; i++)
        tone(80 + i * 25, 0.25, {
          type: "sawtooth",
          gain: 0.02 + i * 0.006,
          delay: i * 0.11,
          cutoff: 600 + i * 150,
        });
      const t = setTimeout(() => setPhase("tear"), reduce ? 200 : 1100);
      return () => clearTimeout(t);
    }
    if (phase === "tear") {
      noise(0.45, { cutoff: 6000, gain: 0.25, highpass: true });
      sfx.soul();
      const t = setTimeout(() => setPhase("rise"), reduce ? 150 : 700);
      return () => clearTimeout(t);
    }
    if (phase === "rise") {
      sfx.shuffle();
      const t = setTimeout(() => setPhase("reveal"), reduce ? 150 : 900);
      return () => clearTimeout(t);
    }
  }, [phase, reduce]);

  const shownRef = useRef(0);
  const reveal = (i: number) => {
    if (i !== shownRef.current) return;
    shownRef.current = i + 1;
    const k = cards[i]!;
    const r = rank(k);
    if (r === 3) {
      sfx.win();
      setParty(true);
      shake(root.current, 10, 500);
    } else if (r === 2) sfx.soul();
    else sfx.draw();
    if (parseKey(k).finish !== "plain") sfx.heal();
    setShown(i + 1);
  };
  const revealAll = () => {
    const from = shownRef.current;
    for (let i = from; i < cards.length; i++)
      setTimeout(() => reveal(i), (i - from) * (reduce ? 0 : 260));
  };
  useEffect(() => {
    if (phase !== "reveal" || !board.current) return;
    board.current.querySelector<HTMLButtonElement>("button")?.focus();
  }, [phase]);

  const done = shown >= cards.length;
  const best = cards.reduce((b, k, i) => (rank(k) > rank(cards[b]!) ? i : b), 0);

  return (
    <div
      ref={root}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={`Otwieranie boostera: ${pack.name}`}
      className="fixed inset-0 z-50 flex h-dvh flex-col items-center justify-center overflow-hidden bg-navy p-4 text-white outline-none"
    >
      {party && <Confetti count={70} />}
      <AnimatePresence>
        {(phase === "tear" || phase === "rise") && !reduce && (
          <motion.span
            key="rays"
            aria-hidden="true"
            className="soul-rays pointer-events-none absolute size-[160vmax]"
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </AnimatePresence>

      {phase !== "reveal" && (
        <div className="relative">
          {phase === "charge" && (
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full bg-logo-yellow/40 blur-3xl"
            />
          )}
          <motion.div
            className={cn(phase === "charge" && "soul-pack-shake")}
            initial={{ scale: 0.6, y: 60, opacity: 0 }}
            animate={
              phase === "rise"
                ? { y: 260, opacity: 0, scale: 0.9 }
                : { scale: 1.25, y: 0, opacity: 1 }
            }
            transition={{ duration: phase === "rise" ? 0.7 : 0.45, ease: "easeOut" }}
          >
            <BoosterPack pack={pack} torn={phase !== "charge"} />
          </motion.div>
          {phase === "tear" && (
            <motion.div
              aria-hidden="true"
              className={cn(
                "soul-crimp absolute inset-x-0 top-0 h-[9%] bg-gradient-to-r",
                pack.foil,
              )}
              initial={{ y: 0, rotate: 0, opacity: 1 }}
              animate={{ y: -220, x: 120, rotate: 35, opacity: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
          )}
          {phase !== "charge" && (
            <motion.span
              aria-hidden="true"
              className="absolute inset-0 rounded-full bg-surface"
              initial={{ opacity: 0.9, scale: 0.4 }}
              animate={{ opacity: 0, scale: 3 }}
              transition={{ duration: 0.6 }}
            />
          )}
        </div>
      )}

      {phase === "reveal" && (
        <div className="flex w-full max-w-4xl flex-col items-center gap-4">
          <h2 className="font-display text-2xl font-extrabold text-white">{pack.name}</h2>
          <ul
            ref={board}
            className="grid w-full grid-cols-3 justify-center gap-3 sm:grid-cols-5"
            aria-label="Karty z boostera"
          >
            {cards.map((k, i) => {
              const { cardId, finish } = parseKey(k);
              const c = getCard(cardId);
              const up = i < shown;
              const r = rank(k);
              return (
                <motion.li
                  key={i}
                  initial={{ y: 180, opacity: 0, rotate: (i - 2) * 6 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  transition={{
                    delay: reduce ? 0 : i * 0.08,
                    type: "spring",
                    stiffness: 220,
                    damping: 20,
                  }}
                  className="relative"
                >
                  {up && r >= 2 && !reduce && (
                    <span
                      aria-hidden="true"
                      className={cn(
                        "pointer-events-none absolute -inset-6 rounded-full blur-xl",
                        r === 3 ? "bg-logo-yellow/70" : "bg-logo-blue/60",
                      )}
                    />
                  )}
                  {up && r === 3 && !reduce && (
                    <span
                      aria-hidden="true"
                      className="soul-rays pointer-events-none absolute -inset-16"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => (up ? setZoom(i) : reveal(i))}
                    aria-disabled={!up && i !== shown ? true : undefined}
                    className="relative block aspect-[5/7] w-full rounded-card perspective-[900px]"
                  >
                    <span
                      className={cn(
                        "relative block size-full transition-transform duration-700 ease-out transform-3d",
                        up && "rotate-y-180",
                      )}
                    >
                      <span
                        className={cn(
                          "absolute inset-0 grid place-items-center rounded-card bg-gradient-to-br text-4xl shadow-lift backface-hidden",
                          pack.foil,
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className="grid size-16 place-items-center rounded-full bg-navy/80"
                        >
                          🕊️
                        </span>
                        {!up && (
                          <span className="sr-only">
                            Zakryta karta {i + 1}
                            {i === shown ? " — odkryj" : ""}
                          </span>
                        )}
                      </span>
                      <span className="absolute inset-0 rotate-y-180 backface-hidden">
                        {up && (
                          <>
                            <CardMini cardId={cardId} finish={finish} fresh={fresh[i]} />
                            <span className="sr-only">
                              {c.name}, {RARITY_LABEL[c.rarity]}, {FINISH_LABEL[finish]}. Pokaż
                              kartę
                            </span>
                          </>
                        )}
                      </span>
                    </span>
                  </button>
                </motion.li>
              );
            })}
          </ul>
          <p aria-live="polite" className="min-h-6 text-center font-bold text-logo-yellow">
            {shown > 0 &&
              (() => {
                const c = getCard(parseKey(cards[shown - 1]!).cardId);
                return `${c.name} — ${RARITY_LABEL[c.rarity]}${rank(cards[shown - 1]!) === 3 ? "! 👑" : ""}`;
              })()}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {!done ? (
              <Button onClick={revealAll}>Odkryj wszystkie</Button>
            ) : (
              <>
                <Button onClick={() => setZoom(best)}>Pokaż najlepszą</Button>
                {onAgain && (
                  <Button variant="soft" onClick={onAgain}>
                    Otwórz kolejny
                  </Button>
                )}
                <Button variant="outline" className="border-white/40 text-white" onClick={onClose}>
                  Gotowe
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      <AnimatePresence>
        {zoom !== null && cards[zoom] && (
          <motion.div
            className="absolute inset-0 z-30 grid place-items-center bg-navy/80 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.7, rotateY: 90 }}
              animate={{ scale: 1, rotateY: 0 }}
              className="w-full max-w-xs"
            >
              <CardFace
                cardId={parseKey(cards[zoom]).cardId}
                finish={parseKey(cards[zoom]).finish}
              />
              <Button
                ref={zoomClose}
                fullWidth
                className="mt-3"
                variant="soft"
                onClick={() => setZoom(null)}
              >
                Zamknij
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
