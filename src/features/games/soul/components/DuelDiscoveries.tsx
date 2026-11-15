import { useState } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/ui";
import type { Discoveries } from "../collection/bestiary";
import { getCard } from "../data/cards";
import { BestiaryTeaser } from "./BestiaryTeaser";
import { CardFace } from "./CardFace";

const DETAILS_ID = "duel-discovery-details";

function Badges({
  ids,
  recognized,
  open,
  read,
  onToggle,
}: {
  ids: string[];
  recognized: boolean;
  open: string | null;
  /** Cards already unfolded once — no more "NOWE" tag. */
  read: ReadonlySet<string>;
  onToggle: (id: string) => void;
}) {
  return (
    <ul className="mt-2 flex flex-wrap gap-2">
      {ids.map((id) => {
        const c = getCard(id);
        const isOpen = open === id;
        return (
          <li key={id}>
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={DETAILS_ID}
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
              <span aria-hidden="true">{c.emoji}</span>
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
        );
      })}
    </ul>
  );
}

/**
 * After a duel: demon cards recognized in it (4th sighting) and cards met for the first time.
 * Every badge is a button that unfolds the card below the list: the full face with the lesson
 * for a recognized card, the greyed-out teaser (sightings so far) for a card met for the first time.
 */
export function DuelDiscoveries({ found }: { found: Discoveries }) {
  const [open, setOpen] = useState<string | null>(null);
  const [read, setRead] = useState<ReadonlySet<string>>(new Set());
  if (!found.recognized.length && !found.met.length) return null;
  const toggle = (id: string) => {
    setOpen((o) => (o === id ? null : id));
    setRead((r) => new Set(r).add(id));
  };
  const isRecognized = open !== null && found.recognized.includes(open);
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
          <Badges ids={found.recognized} recognized open={open} read={read} onToggle={toggle} />
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
          <Badges ids={found.met} recognized={false} open={open} read={read} onToggle={toggle} />
        </div>
      )}
      <div id={DETAILS_ID} aria-live="polite">
        {open &&
          (isRecognized ? (
            <CardFace cardId={open} showLesson />
          ) : (
            <BestiaryTeaser card={getCard(open)} seen={found.seen[open] ?? 1} />
          ))}
      </div>
    </section>
  );
}
