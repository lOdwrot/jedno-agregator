import { Fragment, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Icon, usePrefersReducedMotion } from "@/ui";
import type { Discoveries } from "../collection/bestiary";
import { getCard } from "../data/cards";
import { BestiaryTeaser } from "./BestiaryTeaser";
import { CardThumb } from "./CardArt";
import { CardFace } from "./CardFace";

const detailsId = (id: string) => `duel-discovery-${id}`;

/** The unfolded card, right under its badge; scrolled into view when it opens. */
function Details({ id, recognized, seen }: { id: string; recognized: boolean; seen: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    ref.current?.scrollIntoView?.({ block: "nearest", behavior: reduced ? "auto" : "smooth" });
  }, [id, reduced]);
  return (
    <div ref={ref} id={detailsId(id)} className="motion-safe:animate-[soul-unfold_0.25s_ease-out]">
      {recognized ? (
        <CardFace cardId={id} showLesson />
      ) : (
        <BestiaryTeaser card={getCard(id)} seen={seen} />
      )}
    </div>
  );
}

function Badges({
  ids,
  recognized,
  open,
  read,
  seen,
  onToggle,
}: {
  ids: string[];
  recognized: boolean;
  open: string | null;
  /** Cards already unfolded once — no more "NOWE" tag. */
  read: ReadonlySet<string>;
  seen: Discoveries["seen"];
  onToggle: (id: string) => void;
}) {
  return (
    <ul className="mt-2 flex flex-wrap gap-2">
      {ids.map((id) => {
        const c = getCard(id);
        const isOpen = open === id;
        return (
          <Fragment key={id}>
            <li>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={isOpen ? detailsId(id) : undefined}
                onClick={() => onToggle(id)}
                className={cn(
                  "relative inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold transition-transform motion-safe:hover:-translate-y-0.5 motion-safe:active:scale-95",
                  recognized
                    ? "bg-accent-strong text-white shadow-lift"
                    : "bg-white/10 text-white ring-1 ring-white/30 hover:bg-white/20",
                  isOpen && "ring-2 ring-white",
                )}
              >
                {recognized && !isOpen && !read.has(id) && (
                  <span className="absolute -top-2 -right-1 rounded-full bg-logo-yellow px-1.5 text-[0.65rem] leading-4 font-extrabold text-navy motion-safe:animate-pulse">
                    NOWE
                  </span>
                )}
                <CardThumb cardId={id} />
                {c.name}
                <span className="flex items-center gap-0.5 text-xs font-extrabold uppercase opacity-90">
                  {recognized ? "Czytaj" : "Podejrzyj"}
                  <Icon
                    name="chevronDown"
                    size={14}
                    className={cn("transition-transform", isOpen && "rotate-180")}
                  />
                </span>
              </button>
            </li>
            {/* a full-width row right after the opened badge: the card unfolds directly below it */}
            {isOpen && (
              <li className="basis-full">
                <Details id={id} recognized={recognized} seen={seen[id] ?? 1} />
              </li>
            )}
          </Fragment>
        );
      })}
    </ul>
  );
}

/**
 * After a duel: demon cards recognized in it (4th sighting) and cards met for the first time.
 * Every badge is a button that unfolds the card directly below itself: the full face with the
 * lesson for a recognized card, the greyed-out teaser (sightings so far) for a card met for the first time.
 */
export function DuelDiscoveries({ found }: { found: Discoveries }) {
  const [open, setOpen] = useState<string | null>(null);
  const [read, setRead] = useState<ReadonlySet<string>>(new Set());
  if (!found.recognized.length && !found.met.length) return null;
  const toggle = (id: string) => {
    setOpen((o) => (o === id ? null : id));
    setRead((r) => new Set(r).add(id));
  };
  const props = { open, read, seen: found.seen, onToggle: toggle };
  return (
    <section
      aria-label="Bestiariusz — nowe odkrycia"
      className="flex flex-col gap-3 rounded-card bg-navy p-3 text-left text-white"
    >
      {found.recognized.length > 0 && (
        <div>
          <p className="font-display font-extrabold">
            📖 Rozpoznane pokusy: {found.recognized.length}
          </p>
          <p className="text-sm text-white/85">
            Odkryłeś ich sekret! <strong>Stuknij kartę</strong> i przeczytaj, jak kusi i jak się
            przed nią bronić — to najcenniejsza nagroda tej walki.
          </p>
          <Badges ids={found.recognized} recognized {...props} />
        </div>
      )}
      {found.met.length > 0 && (
        <div>
          <p className="font-display font-extrabold">
            👁️ Spotkane po raz pierwszy: {found.met.length}
          </p>
          <p className="text-sm text-white/85">
            Stuknij, by podejrzeć. Szczegóły odsłonią się, gdy spotkasz kartę 4 razy.
          </p>
          <Badges ids={found.met} recognized={false} {...props} />
        </div>
      )}
    </section>
  );
}
