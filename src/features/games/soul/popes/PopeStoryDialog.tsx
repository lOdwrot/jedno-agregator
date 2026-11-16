import { useEffect, useRef } from "react";
import { Button, Dialog } from "@/ui";
import { cn } from "@/lib/cn";
import { getCard } from "../data/cards";
import { CardArt } from "../components/CardArt";
import { PapalKeys } from "./PapalKeys";
import { PopeTimeline } from "./PopeTimeline";
import { markRead, useReadStories } from "./readStories";
import { POPE_STORIES, popeStory } from "./stories";

const Stat = ({ label, value, wide }: { label: string; value: string; wide?: boolean }) => (
  <div className={cn("rounded-xl bg-surface-muted px-3 py-2", wide && "col-span-2 sm:col-span-1")}>
    <dt className="text-xs font-bold tracking-wide text-ink-muted uppercase">{label}</dt>
    <dd className="font-display font-extrabold text-navy">{value}</dd>
  </div>
);

/** The story of one pope: portrait, numbers, "Czy wiesz, że…", a quote, today's step, the timeline. */
function Story({ id, onSelect }: { id: string; onSelect: (id: string) => void }) {
  const s = popeStory(id);
  const read = useReadStories();
  const top = useRef<HTMLDivElement>(null);
  useEffect(() => {
    markRead(id);
    top.current?.scrollIntoView?.({ block: "start" });
  }, [id]);
  if (!s) return null;
  const card = getCard(id);
  const subtitle = card.kind === "character" ? card.subtitle : undefined;
  return (
    <div ref={top} className="flex scroll-mt-16 flex-col gap-5">
      <div className="relative -mx-5 -mt-3 grid h-64 items-end overflow-hidden bg-navy sm:-mx-6 sm:h-72">
        <CardArt cardId={id} emojiClass="text-8xl" className="opacity-90" />
        <span className="absolute inset-0 bg-gradient-to-t from-navy via-navy/50 to-transparent" />
        <PapalKeys className="absolute top-3 left-3 drop-shadow-lg" />
        <div className="relative p-5 text-white sm:p-6">
          <p className="text-xs font-bold tracking-widest text-logo-yellow uppercase">
            {subtitle ?? "papież"}
          </p>
          <p className="font-display text-3xl leading-tight font-extrabold">{card.name}</p>
          <p className="mt-1 font-serif text-lg leading-snug italic">{s.hook}</p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stat label="Pontyfikat" value={s.reign} />
        <Stat label="W kolejce od Piotra" value={`${s.number}. papież`} />
        <Stat label="Urodzony" value={s.born} wide />
      </dl>

      <section aria-labelledby="pope-facts">
        <h3 id="pope-facts" className="font-display text-xl font-extrabold text-navy">
          Czy wiesz, że…
        </h3>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {s.facts.map((f) => (
            <li key={f.title} className="flex gap-3 rounded-card bg-surface p-3 shadow-card">
              <span
                aria-hidden="true"
                className="grid size-12 shrink-0 place-items-center rounded-full bg-accent-soft text-2xl"
              >
                {f.emoji}
              </span>
              <div>
                <p className="font-bold text-navy">{f.title}</p>
                <p className="text-sm text-ink">{f.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {s.quote && (
        <figure className="relative overflow-hidden rounded-card bg-accent-soft px-5 pt-10 pb-4">
          <span
            aria-hidden="true"
            className="absolute -top-3 left-3 font-serif text-8xl leading-none text-accent"
          >
            “
          </span>
          <blockquote className="relative font-serif text-2xl leading-snug text-navy italic">
            {s.quote.text}
          </blockquote>
          <figcaption className="relative mt-2 text-sm font-bold text-ink-muted">
            — {s.quote.source}
          </figcaption>
        </figure>
      )}

      <div className="flex gap-3 rounded-card bg-navy p-4 text-white">
        <span aria-hidden="true" className="text-3xl">
          👣
        </span>
        <div>
          <p className="font-display font-extrabold text-logo-yellow">Twój krok na dziś</p>
          <p>{s.today}</p>
        </div>
      </div>

      <section aria-labelledby="pope-line">
        <h3 id="pope-line" className="font-display text-xl font-extrabold text-navy">
          2000 lat na jednym sznurze
        </h3>
        <p className="text-sm text-ink-muted">
          📖 Poznane historie: {read.length} / {POPE_STORIES.length}. Stuknij portret, by przeczytać
          kolejną.
        </p>
        <PopeTimeline current={id} read={read} onSelect={onSelect} />
      </section>
    </div>
  );
}

/** Dialog with a pope's story; the timeline at the bottom switches to another pope. */
export function PopeStoryDialog({
  id,
  onSelect,
  onClose,
}: {
  id: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  return (
    // a pope story can open from inside another dialog (card details): keep its clicks and
    // Esc from reaching the outer one
    <span
      role="presentation"
      className="contents"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <Dialog
        open={!!id}
        onClose={onClose}
        title={id ? `Historia: ${getCard(id).name}` : "Historia papieża"}
        hideTitle
        size="lg"
      >
        {id && (
          <div className="flex flex-col gap-5">
            <Story id={id} onSelect={onSelect} />
            <Button variant="navy" fullWidth onClick={onClose}>
              Wracam do gry
            </Button>
          </div>
        )}
      </Dialog>
    </span>
  );
}
