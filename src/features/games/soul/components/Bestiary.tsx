import { bestiaryGroups, bestiaryTally, RECOGNIZE_AT, type Tally } from "../collection/bestiary";
import type { Profile } from "../collection/profile";
import { BestiaryTeaser } from "./BestiaryTeaser";
import { CardFace } from "./CardFace";

const Counts = ({ t }: { t: Tally }) => (
  <span className="flex flex-wrap gap-x-4 gap-y-1">
    <span>
      👁️ Spotkane: {t.met} / {t.total}
    </span>
    <span>
      📖 Rozpoznane: {t.recognized} / {t.total}
    </span>
  </span>
);

/**
 * Educational part: the demon cards the player has met in duels. A card appears after the first
 * sighting as a greyed-out teaser; after `RECOGNIZE_AT` sightings it shows the full face with the
 * "how it tempts" / "how to resist" lesson. Cards never met are not listed at all.
 */
export function Bestiary({ profile }: { profile: Profile }) {
  const groups = bestiaryGroups(profile);
  const all = bestiaryTally(groups);
  return (
    <div className="flex flex-col gap-5">
      <div className="max-w-3xl rounded-card bg-surface p-5 shadow-card">
        <h3 className="font-display text-lg font-extrabold text-navy">Bestiariusz pokus</h3>
        <p className="mt-3 rounded-lg bg-navy px-4 py-3 text-sm font-bold text-white">
          <Counts t={all} />
        </p>
        <p className="mt-3 text-ink">
          Pomioty w tej grze rzadko kuszą czymś wielkim i strasznym. Częściej podsuwają drobiazgi:
          „jeszcze pięć minut”, jeszcze jeden filmik, jedną plotkę, porównanie z kimś. Właśnie
          dlatego są groźne — małe kroki łatwo przeoczyć.
        </p>
        <p className="mt-2 text-sm text-ink-muted">
          Karta trafia tu, gdy pierwszy raz zobaczysz ją w walce. Gdy spotkasz ją {RECOGNIZE_AT}{" "}
          razy, rozpoznasz ją — poznasz jej moc i dowiesz się, jak kusi i jak się bronić.
        </p>
        <p className="mt-2 text-sm text-ink-muted">
          Inspiracja: C.S. Lewis, „Listy starego diabła do młodego” — książka, w której doświadczony
          diabeł radzi bratankowi, jak odciągnąć człowieka od Boga. Czytana „na odwrót” jest
          świetnym poradnikiem duchowej walki. Teksty w grze są nasze, a wuj Siarkowąs i Smołek to
          postacie wymyślone dla tej gry.
        </p>
      </div>
      {all.met === 0 && (
        <p className="max-w-3xl rounded-card bg-surface p-5 text-ink shadow-card">
          Nie spotkałeś jeszcze żadnej pokusy. Stań do walki — każda karta, którą zagra przeciwnik,
          trafi do bestiariusza.
        </p>
      )}
      {groups.map((g) => (
        <section
          key={g.kind}
          aria-labelledby={`bestiary-${g.kind}`}
          className="flex flex-col gap-3"
        >
          <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h4 id={`bestiary-${g.kind}`} className="font-display text-xl font-extrabold text-navy">
              {g.label}
            </h4>
            <p className="text-sm font-bold text-ink-muted">
              <Counts t={g} />
            </p>
          </header>
          {g.cards.length > 0 ? (
            <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {g.cards.map(({ card, seen, recognized }) => (
                <li key={card.id}>
                  {recognized ? (
                    <CardFace cardId={card.id} showLesson className="h-full" />
                  ) : (
                    <BestiaryTeaser card={card} seen={seen} />
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-muted">Nic tu jeszcze nie spotkałeś.</p>
          )}
        </section>
      ))}
    </div>
  );
}
