import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useSearchParams } from "react-router";
import { cn } from "@/lib/cn";
import { Button, ChipGroup, Heading, Icon } from "@/ui";
import { lowerIsBetter, useBestScore } from "../useBestScore";
import { sfx } from "../audio/sfx";
import { Confetti } from "../fx/Confetti";
import { pop, wobble } from "../fx/shake";
import { ArkScene } from "./ArkScene";
import {
  ANIMALS,
  animal,
  createArk,
  flip,
  hideMismatch,
  isFaceUp,
  isLevel,
  LEVELS,
  rank,
  type ArkState,
  type Level,
} from "./engine";

const PARAM = "poziom";
const GRID_COLS = { 4: "grid-cols-4", 6: "grid-cols-6" } as const;

/** Level picker (kept in the URL) + a fresh board per level. */
export function ArkGame() {
  const [params, setParams] = useSearchParams();
  const raw = params.get(PARAM);
  const level: Level = isLevel(raw) ? raw : "latwy";
  const setLevel = (v: string | null) => {
    if (!isLevel(v)) return;
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (v === "latwy") next.delete(PARAM);
        else next.set(PARAM, v);
        return next;
      },
      { replace: true },
    );
  };
  return (
    <div className="flex flex-col gap-4">
      <ChipGroup
        label="Poziom trudności"
        value={level}
        onChange={setLevel}
        options={(Object.keys(LEVELS) as Level[]).map((l) => ({
          value: l,
          label: `${LEVELS[l].label} · ${LEVELS[l].pairs} par`,
        }))}
      />
      <ArkBoard key={level} level={level} />
    </div>
  );
}

function ArkBoard({ level }: { level: Level }) {
  const [s, setS] = useState<ArkState>(() => createArk(level));
  const [record, setRecord] = useState(false);
  const cards = useRef<(HTMLButtonElement | null)[]>([]);
  const best = useBestScore(`arka-noego-${level}`, lowerIsBetter);
  const cols = LEVELS[level].cols;

  useEffect(() => {
    if (!s.mismatch) return;
    const t = setTimeout(() => setS((x) => hideMismatch(x)), 900);
    return () => clearTimeout(t);
  }, [s.mismatch]);

  const onFlip = (i: number) => {
    const n = flip(s, i);
    if (n === s) return;
    sfx.unlock();
    sfx.flip();
    const pair = [...s.open, i].map((k) => cards.current[k]);
    if (n.matched.length > s.matched.length) {
      sfx.chime(n.matched.length - 1);
      setTimeout(() => pair.forEach((el) => pop(el, 1.12)), 380);
    } else if (n.mismatch) {
      setTimeout(() => sfx.boing(), 420);
      pair.forEach((el) => wobble(el, 480));
    }
    if (n.won && !s.won) {
      setRecord(best.submit(n.moves));
      setTimeout(() => sfx.fanfare(), 500);
      setTimeout(() => sfx.coo(), 1500);
    }
    setS(n);
  };
  const restart = () => {
    sfx.click();
    setS(createArk(level));
    setRecord(false);
    cards.current[0]?.focus();
  };

  const onCardKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const delta: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -cols,
      ArrowDown: cols,
    };
    const d = delta[e.key];
    if (d === undefined) return;
    e.preventDefault();
    const next = (i + d + s.deck.length) % s.deck.length;
    cards.current[next]?.focus();
  };

  const last = s.lastMatch ? animal(s.lastMatch) : null;
  const status = s.won
    ? `Wszystkie zwierzęta na Arce! Ruchy: ${s.moves}.`
    : s.mismatch
      ? "To nie para. Zapamiętaj i spróbuj jeszcze raz."
      : last
        ? `Para: ${last.name}! ${last.joke}`
        : "";

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-start">
      <div className="flex flex-col gap-4">
        <ArkScene
          animals={ANIMALS.slice(0, s.pairs).map((a) => a.id)}
          matched={s.matched}
          won={s.won}
        />
        <div className="flex gap-3 rounded-card bg-surface p-4 shadow-card">
          <span aria-hidden="true" className="text-3xl leading-none">
            🧔🏻
          </span>
          <div>
            <p className="text-sm font-extrabold text-navy">Noe mówi:</p>
            <p className="text-ink">
              {s.won
                ? "Drzwi zamknięte, wszyscy na pokładzie. Teraz tylko 40 dni deszczu… kto ma karty do gry?"
                : last
                  ? last.joke
                  : "Szybko, chmury już się zbierają! Wprowadź zwierzęta po dwoje."}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm font-bold text-navy">
          <span>
            Pary: {s.matched.length} / {s.pairs} · Ruchy: {s.moves}
          </span>
          {best.best !== null && <span className="text-ink-muted">Rekord: {best.best} ruchów</span>}
        </div>
      </div>

      <div>
        {s.won ? (
          <div className="relative overflow-hidden rounded-card bg-surface p-6 text-center shadow-card">
            <Confetti count={30} />
            <p
              aria-hidden="true"
              className="text-5xl motion-safe:animate-[game-pop-in_0.7s_var(--ease-spring)_both]"
            >
              🌈
            </p>
            <Heading level={2} size="md" className="mt-2">
              Cała Arka w komplecie!
            </Heading>
            <p className="mt-2 text-ink">
              {s.moves} ruchów. {rank(s.moves, s.pairs)}
            </p>
            {record && <p className="mt-2 font-bold text-success">Nowy rekord! 🎉</p>}
            <Button
              className="mt-4"
              size="lg"
              onClick={restart}
              leftIcon={<Icon name="play" size={18} />}
            >
              Zagraj jeszcze raz
            </Button>
          </div>
        ) : (
          <div
            role="group"
            aria-label="Karty ze zwierzętami. Strzałki przenoszą między kartami, Enter odkrywa."
            className={cn("grid gap-2", GRID_COLS[cols], cols === 4 && "sm:gap-3")}
          >
            {s.deck.map((id, i) => {
              const up = isFaceUp(s, i);
              const done = s.matched.includes(id);
              const a = animal(id);
              return (
                <button
                  key={i}
                  ref={(el) => {
                    cards.current[i] = el;
                  }}
                  type="button"
                  onClick={() => onFlip(i)}
                  onKeyDown={(e) => onCardKey(e, i)}
                  aria-label={`Karta ${i + 1}: ${up ? a.name : "zakryta"}${done ? " (para znaleziona)" : ""}`}
                  aria-disabled={up || undefined}
                  className="group aspect-square min-h-11 rounded-card perspective-[600px]"
                >
                  <span
                    className={cn(
                      "relative block size-full transition-transform duration-500 ease-out transform-3d",
                      up && "rotate-y-180",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute inset-0 grid place-items-center rounded-card bg-navy text-white shadow-card backface-hidden group-hover:bg-navy-800",
                        cols === 4 ? "text-2xl sm:text-3xl" : "text-lg sm:text-2xl",
                      )}
                    >
                      <span aria-hidden="true">🕊️</span>
                    </span>
                    <span
                      className={cn(
                        "absolute inset-0 grid rotate-y-180 place-items-center rounded-card bg-surface shadow-card backface-hidden",
                        cols === 4 ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl",
                        done && "bg-accent-soft ring-2 ring-success",
                      )}
                    >
                      <span aria-hidden="true">{a.emoji}</span>
                      {id === s.lastMatch && (
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute -top-1 -right-1 text-xl motion-safe:animate-[game-sparkle_0.9s_ease-out_0.4s_both] motion-reduce:hidden"
                        >
                          ✨
                        </span>
                      )}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {status}
      </p>
    </div>
  );
}
