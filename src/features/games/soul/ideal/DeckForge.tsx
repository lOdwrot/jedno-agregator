import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Button, usePrefersReducedMotion, VisuallyHidden } from "@/ui";
import { getCard, isCharacter } from "../data/cards";
import type { DeckList } from "../engine/state";
import { CardMini } from "../components/CardMini";
import type { ForgeResult } from "./forge";
import { toRecord } from "./pool";
import { PHASE_LABEL, quip } from "./quips";
import { useForge } from "./useForge";

interface Props {
  /** The player's current deck — the one the demons are tuned against. */
  deck: DeckList;
  onReady: (result: ForgeResult) => void;
  onCancel: () => void;
}

/** The loading screen stays at least this long, so the jokes can be read. */
const MIN_MS = 4500;
const QUIP_MS = 2600;
/** A new set of flying cards at most this often (progress comes ~10× a second). */
const CARDS_MS = 1300;
const BUBBLES = 7;

const pct = (x: number) => `${Math.round(x * 100)}%`;

/** The strongest characters of the computed deck (legendary first), for the "ready" screen. */
function headliners(result: ForgeResult): string[] {
  const order = { legendary: 0, rare: 1, uncommon: 2, common: 3 } as const;
  return Object.keys(result.deck)
    .filter((id) => isCharacter(getCard(id)))
    .sort((a, b) => order[getCard(a).rarity] - order[getCard(b).rarity])
    .slice(0, 6);
}

/**
 * "Idealny oponent" — the laboratory of the abyss puts the demons' deck together while the player
 * watches: a bubbling flask, cards flying in, a progress bar and jokes about what is going on.
 * The search runs in a Web Worker (see `useForge`). Reduced motion: no bubbles or flying cards.
 */
export function DeckForge({ deck, onReady, onCancel }: Props) {
  const reduce = usePrefersReducedMotion();
  const [seed] = useState(() => Date.now() % 1e9);
  const [list] = useState(deck);
  const { progress, result } = useForge(list, seed);
  const [line, setLine] = useState(0);
  const [minDone, setMinDone] = useState(false);
  const [flying, setFlying] = useState<{ key: number; ids: string[] }>({ key: 0, ids: [] });
  const latest = useRef<string[]>([]);
  useEffect(() => {
    latest.current = progress?.spotlight ?? [];
  }, [progress]);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const fightRef = useRef<HTMLButtonElement>(null);
  const ready = !!result && minDone;
  const phase = ready
    ? "done"
    : ((progress?.phase === "done" ? "verify" : progress?.phase) ?? "scout");

  useEffect(() => {
    cancelRef.current?.focus();
    const t = setTimeout(() => setMinDone(true), MIN_MS);
    const q = setInterval(() => setLine((i) => i + 1), QUIP_MS);
    const c = setInterval(
      () => setFlying((f) => ({ key: f.key + 1, ids: latest.current.slice(0, 3) })),
      CARDS_MS,
    );
    return () => {
      clearTimeout(t);
      clearInterval(q);
      clearInterval(c);
    };
  }, []);
  useEffect(() => {
    if (ready) fightRef.current?.focus();
  }, [ready]);

  const fraction = ready ? 1 : (progress?.fraction ?? 0) * 0.98;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="forge-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-navy p-4 text-white"
    >
      <div className="mx-auto flex min-h-full w-full max-w-md flex-col items-center justify-center gap-4 py-6 text-center">
        <p className="rounded-full bg-logo-yellow px-3 py-0.5 text-xs font-bold tracking-wide text-navy uppercase">
          🧪 Tryb eksperymentalny
        </p>
        <h2 id="forge-title" className="font-display text-2xl font-extrabold text-white">
          {ready ? "Talia Idealnego Oponenta gotowa" : "Laboratorium Otchłani składa talię"}
        </h2>
        <VisuallyHidden>
          <p role="status">{PHASE_LABEL[phase]}</p>
        </VisuallyHidden>

        {!ready ? (
          <>
            <div aria-hidden="true" className="relative h-44 w-full overflow-hidden">
              {!reduce &&
                Array.from({ length: BUBBLES }, (_, i) => (
                  <motion.span
                    key={i}
                    className="absolute bottom-14 left-1/2 size-3 rounded-full bg-logo-yellow/70"
                    initial={{ x: (i - BUBBLES / 2) * 6, y: 0, opacity: 0, scale: 0.4 }}
                    animate={{
                      y: -110 - (i % 3) * 14,
                      x: (i - BUBBLES / 2) * 6 + ((i % 2) * 2 - 1) * 18,
                      opacity: [0, 1, 0],
                      scale: [0.4, 1, 1.4],
                    }}
                    transition={{
                      duration: 1.6 + (i % 3) * 0.3,
                      repeat: Infinity,
                      delay: i * 0.25,
                      ease: "easeOut",
                    }}
                  />
                ))}
              <motion.span
                className="absolute bottom-2 left-1/2 block -translate-x-1/2 text-7xl"
                animate={reduce ? undefined : { rotate: [-6, 6, -6] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              >
                🧪
              </motion.span>
              <AnimatePresence>
                {!reduce &&
                  flying.ids.map((id, i) => (
                    <motion.span
                      key={`${flying.key}-${id}-${i}`}
                      className="absolute top-2 left-1/2 block aspect-[5/7] w-14"
                      initial={{
                        x: (i - 1) * 140 - 28,
                        y: -20,
                        rotate: (i - 1) * 25,
                        opacity: 0,
                        scale: 0.8,
                      }}
                      animate={{
                        x: (i - 1) * 56 - 28,
                        y: 10,
                        rotate: (i - 1) * 8,
                        opacity: 1,
                        scale: 1,
                      }}
                      exit={{ x: -28, y: 110, rotate: 0, opacity: 0, scale: 0.3 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                      <CardMini cardId={id} finish="plain" />
                    </motion.span>
                  ))}
              </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
              <motion.p
                key={line}
                className="min-h-14 font-serif text-xl italic"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                {quip(phase, line)}
              </motion.p>
            </AnimatePresence>
          </>
        ) : (
          <Ready result={result} />
        )}

        <div className="w-full">
          <p className="mb-1 flex justify-between text-sm font-bold">
            <span>{PHASE_LABEL[phase]}</span>
            <span className="tabular-nums">{pct(fraction)}</span>
          </p>
          <div
            role="progressbar"
            aria-label="Postęp składania talii"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(fraction * 100)}
            className="h-3 w-full overflow-hidden rounded-full bg-white/15"
          >
            <span
              className="block h-full origin-left rounded-full bg-logo-yellow transition-transform duration-300"
              style={{ transform: `scaleX(${fraction})` }}
            />
          </div>
          <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
            <Stat
              label="Symulowane pojedynki"
              value={String(result?.games ?? progress?.games ?? 0)}
            />
            <Stat
              label="Zmiany zostawione / sprawdzone"
              value={`${progress?.kept ?? 0} / ${progress?.tried ?? 0}`}
            />
            <Stat
              label="Demony wygrywają"
              value={pct(result && ready ? result.winRate : (progress?.best ?? 0))}
            />
          </dl>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {ready && (
            <Button ref={fightRef} size="lg" onClick={() => onReady(result)}>
              Do walki!
            </Button>
          )}
          <Button ref={cancelRef} variant="soft" onClick={onCancel}>
            Wycofaj się
          </Button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card bg-white/10 p-2">
      <dt className="text-white/80">{label}</dt>
      <dd className="font-display text-lg font-extrabold tabular-nums">{value}</dd>
    </div>
  );
}

function Ready({ result }: { result: ForgeResult }) {
  const record = toRecord(result.deck);
  const energy = record.pokusa ?? 0;
  const cards = headliners(result);
  return (
    <motion.div
      className="flex w-full flex-col items-center gap-3"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <p className="text-base">
        W ostatniej serii symulacji ta talia pokonała Twoją w{" "}
        <strong className="text-logo-yellow">{pct(result.winRate)}</strong> pojedynków. Pokaż, że
        symulacje się mylą!
      </p>
      <ul
        className="grid grid-cols-3 gap-2 sm:grid-cols-6"
        aria-label="Najgroźniejsze karty w talii"
      >
        {cards.map((id, i) => (
          <motion.li
            key={id}
            className="aspect-[5/7] w-20 sm:w-16"
            initial={{ opacity: 0, y: 20, rotate: -6 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ delay: 0.1 * i, duration: 0.35 }}
          >
            <CardMini cardId={id} finish="plain" />
          </motion.li>
        ))}
      </ul>
      <p className="text-sm text-white/80">
        {Object.values(result.deck).reduce((a, b) => a + b, 0)} kart demonów + {energy} Pokus.
        Zwykłe druki, jedna karta na turę — bez forów.
      </p>
    </motion.div>
  );
}
