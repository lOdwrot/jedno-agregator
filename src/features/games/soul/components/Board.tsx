import { cn } from "@/lib/cn";
import { BENCH_SIZE, getCard, SOULS_TO_WIN } from "../data/cards";
import type { Game, PlayerId } from "../engine/state";
import { EmptySlot, MiniCard } from "./MiniCard";
import type { Selection } from "./CardActions";

function Souls({ n, label }: { n: number; label: string }) {
  return (
    <span
      role="img"
      className="inline-flex items-center gap-1"
      aria-label={`${label}: ${n} z ${SOULS_TO_WIN}`}
    >
      {Array.from({ length: SOULS_TO_WIN }, (_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={cn("text-base", i < n ? "opacity-100" : "opacity-25 grayscale")}
        >
          🕊️
        </span>
      ))}
    </span>
  );
}

function Side({
  g,
  pid,
  onSelect,
  highlightBench,
}: {
  g: Game;
  pid: PlayerId;
  onSelect: (s: Selection) => void;
  highlightBench?: boolean;
}) {
  const p = g.players[pid];
  const mine = pid === "me";
  const zone = mine ? "field" : "opp";
  const bench = (
    <ul aria-label={mine ? "Twoja ławka" : "Ławka pomiotów"} className="flex justify-center gap-2">
      {Array.from({ length: BENCH_SIZE }, (_, i) => {
        const c = p.bench[i];
        return (
          <li key={c?.uid ?? `e${i}`}>
            {c ? (
              <MiniCard
                c={c}
                g={g}
                role={mine ? "Na Twojej ławce" : "Na ławce pomiotów"}
                highlight={highlightBench}
                onSelect={() => onSelect({ zone, uid: c.uid })}
              />
            ) : (
              <EmptySlot label="wolne miejsce" dark={!mine} />
            )}
          </li>
        );
      })}
    </ul>
  );
  const active = (
    <div className="flex justify-center">
      {p.active ? (
        <MiniCard
          c={p.active}
          g={g}
          big
          role={mine ? "Twoja aktywna postać" : "Aktywny pomiot"}
          onSelect={() => onSelect({ zone, uid: p.active!.uid })}
        />
      ) : (
        <EmptySlot big dark={!mine} label={mine ? "wybierz postać" : "pusto"} />
      )}
    </div>
  );
  const stats = (
    <p
      className={cn(
        "flex flex-wrap items-center justify-between gap-2 text-xs font-bold",
        mine ? "text-navy" : "text-white",
      )}
    >
      <span>{mine ? "Parafia (Ty)" : "Pomioty"}</span>
      <Souls n={p.souls} label={mine ? "Ocalone dusze" : "Dusze przejęte przez pomioty"} />
      <span>
        Talia {p.deck.length} · Ręka {p.hand.length} · Odrzucone {p.discard.length}
      </span>
    </p>
  );
  return (
    <section
      aria-label={mine ? "Twoja strona stołu" : "Strona pomiotów"}
      className={cn(
        "flex flex-col gap-2 rounded-card p-2 sm:gap-3 sm:p-3",
        mine ? "bg-accent-soft" : "bg-navy",
      )}
    >
      {mine ? (
        <>
          {active}
          {bench}
          {stats}
        </>
      ) : (
        <>
          {stats}
          {bench}
          {active}
        </>
      )}
    </section>
  );
}

/** The table: demons on top, the parish below, the current place in between. */
export function Board({ g, onSelect }: { g: Game; onSelect: (s: Selection) => void }) {
  const place = g.place ? getCard(g.place.cardId) : null;
  return (
    <div className="flex flex-col gap-2">
      <Side g={g} pid="ai" onSelect={onSelect} />
      <p className="text-center text-xs font-bold text-navy sm:text-sm">
        {place ? (
          <>
            <span aria-hidden="true">{place.emoji} </span>
            Miejsce: {place.name} ({g.place!.owner === "me" ? "Twoje" : "pomiotów"}) —{" "}
            {"text" in place ? place.text : ""}
          </>
        ) : (
          <span className="text-ink-muted">Brak miejsca w grze</span>
        )}
      </p>
      <Side
        g={g}
        pid="me"
        onSelect={onSelect}
        highlightBench={g.phase === "promote" && g.promote?.who === "me"}
      />
    </div>
  );
}
