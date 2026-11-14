import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/cn";
import { Button, usePrefersReducedMotion } from "@/ui";
import { Confetti } from "../../fx/Confetti";
import { shake } from "../../fx/shake";
import { packSfx } from "../audio/packSfx";
import { sfx } from "../audio/sfx";
import type { PackType } from "../collection/packs";
import { parseKey, type CardKey } from "../collection/profile";
import { getCard } from "../data/cards";
import { FINISH_LABEL, RARITY_LABEL } from "../data/types";
import { BoosterIntro } from "./BoosterIntro";
import { INTRO_MS } from "./boosterTimeline";
import { CardBack } from "./CardBack";
import { CardFace } from "./CardFace";
import { CardMini } from "./CardMini";

type Phase = "charge" | "tear" | "burst" | "reveal";

interface Props {
  pack: PackType;
  cards: CardKey[];
  fresh: boolean[];
  onClose: () => void;
  onAgain: (() => void) | null;
}

const rank = (k: CardKey) =>
  ({ common: 0, uncommon: 1, rare: 2, legendary: 3 })[getCard(parseKey(k).cardId).rarity];

/**
 * Full-screen booster opening: the pack is squeezed, its top tears off, the cards pop out into a fan
 * and glide into the grid, where they flip one by one with rarity effects.
 */
export function BoosterOpening({ pack, cards, fresh, onClose, onAgain }: Props) {
  const reduce = usePrefersReducedMotion();
  const [phase, setPhase] = useState<Phase>("charge");
  const [shown, setShown] = useState(0);
  const [zoom, setZoom] = useState<number | null>(null);
  const [party, setParty] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const board = useRef<HTMLUListElement>(null);
  const zoomClose = useRef<HTMLElement>(null);
  const layoutPrefix = `booster-card-${useId()}`;
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

  // charge → tear → burst → reveal (sounds of each step live in BoosterIntro)
  useEffect(() => {
    if (phase === "reveal") return;
    const next: Record<Exclude<Phase, "reveal">, Phase> = {
      charge: "tear",
      tear: "burst",
      burst: "reveal",
    };
    if (reduce) packSfx.rip(0.3);
    const t = setTimeout(() => setPhase(next[phase]), reduce ? 150 : INTRO_MS[phase]);
    return () => clearTimeout(t);
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
        {(phase === "tear" || phase === "burst") && !reduce && (
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
        <>
          {phase === "charge" && (
            <span
              aria-hidden="true"
              className="absolute size-72 rounded-full bg-logo-yellow/30 blur-3xl"
            />
          )}
          <BoosterIntro
            pack={pack}
            count={cards.length}
            phase={phase}
            layoutPrefix={layoutPrefix}
          />
          <Button
            variant="ghost"
            className="absolute right-4 bottom-4 text-white/80"
            onClick={() => setPhase("reveal")}
          >
            Pomiń
          </Button>
        </>
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
                <li key={i} className="relative">
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
                  <motion.button
                    type="button"
                    layoutId={reduce ? undefined : `${layoutPrefix}-${i}`}
                    transition={{ type: "spring", stiffness: 260, damping: 26 }}
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
                      <span className="absolute inset-0 backface-hidden">
                        <CardBack foil={pack.foil} className="size-full" />
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
                  </motion.button>
                </li>
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
                active
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
