import type { Discoveries } from "../collection/bestiary";
import { getCard } from "../data/cards";

const List = ({ ids }: { ids: string[] }) => (
  <ul className="mt-1 flex flex-wrap gap-1.5">
    {ids.map((id) => {
      const c = getCard(id);
      return (
        <li key={id} className="rounded-full bg-white/10 px-2.5 py-1 text-sm">
          <span aria-hidden="true">{c.emoji}</span> {c.name}
        </li>
      );
    })}
  </ul>
);

/** After a duel: demon cards recognized in it (4th sighting) and cards met for the first time. */
export function DuelDiscoveries({ found }: { found: Discoveries }) {
  if (!found.recognized.length && !found.met.length) return null;
  return (
    <section
      aria-label="Bestiariusz — nowe odkrycia"
      className="flex flex-col gap-2 rounded-card bg-navy p-3 text-left text-white"
    >
      {found.recognized.length > 0 && (
        <div>
          <p className="font-display font-extrabold">
            📖 Rozpoznane pokusy: {found.recognized.length}
          </p>
          <p className="text-xs text-white/80">
            Znasz je już dobrze — w bestiariuszu przeczytasz, jak kuszą i jak się bronić.
          </p>
          <List ids={found.recognized} />
        </div>
      )}
      {found.met.length > 0 && (
        <div>
          <p className="font-display font-extrabold">
            👁️ Spotkane po raz pierwszy: {found.met.length}
          </p>
          <List ids={found.met} />
        </div>
      )}
    </section>
  );
}
