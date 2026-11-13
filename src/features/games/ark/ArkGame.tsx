import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";
import { Button, Heading, Icon } from "@/ui";
import { lowerIsBetter, useBestScore } from "../useBestScore";
import { ArkScene } from "./ArkScene";
import {
  ANIMALS,
  animal,
  createArk,
  flip,
  hideMismatch,
  isFaceUp,
  rank,
  type ArkState,
} from "./engine";

const COLS = 4;

export function ArkGame() {
  const [s, setS] = useState<ArkState>(() => createArk());
  const [record, setRecord] = useState(false);
  const cards = useRef<(HTMLButtonElement | null)[]>([]);
  const best = useBestScore("arka-noego", lowerIsBetter);

  useEffect(() => {
    if (!s.mismatch) return;
    const t = setTimeout(() => setS((x) => hideMismatch(x)), 900);
    return () => clearTimeout(t);
  }, [s.mismatch]);

  const onFlip = (i: number) => {
    const n = flip(s, i);
    if (n.won && !s.won) setRecord(best.submit(n.moves));
    setS(n);
  };
  const restart = () => {
    setS(createArk());
    setRecord(false);
    cards.current[0]?.focus();
  };

  const onCardKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const delta: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -COLS,
      ArrowDown: COLS,
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
        <ArkScene matched={s.matched} won={s.won} />
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
            Pary: {s.matched.length} / {ANIMALS.length} · Ruchy: {s.moves}
          </span>
          {best.best !== null && <span className="text-ink-muted">Rekord: {best.best} ruchów</span>}
        </div>
      </div>

      <div>
        {s.won ? (
          <div className="rounded-card bg-surface p-6 text-center shadow-card">
            <p aria-hidden="true" className="text-5xl">
              🌈
            </p>
            <Heading level={2} size="md" className="mt-2">
              Cała Arka w komplecie!
            </Heading>
            <p className="mt-2 text-ink">
              {s.moves} ruchów. {rank(s.moves)}
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
            className="grid grid-cols-4 gap-2 sm:gap-3"
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
                    <span className="absolute inset-0 grid place-items-center rounded-card bg-navy text-2xl text-white shadow-card backface-hidden group-hover:bg-navy-800 sm:text-3xl">
                      <span aria-hidden="true">🕊️</span>
                    </span>
                    <span
                      className={cn(
                        "absolute inset-0 grid rotate-y-180 place-items-center rounded-card bg-surface text-3xl shadow-card backface-hidden sm:text-4xl",
                        done && "bg-accent-soft ring-2 ring-success",
                      )}
                    >
                      <span aria-hidden="true">{a.emoji}</span>
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
