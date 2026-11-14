import { Badge, Heading } from "@/ui";
import { findPack } from "../collection/packs";
import { OPPONENTS } from "../data/opponents";

/** Mini section: the free booster a victory brings — edition odds for every opponent. */
export function PrizeTable() {
  return (
    <section
      aria-labelledby="soul-prizes"
      className="rounded-card bg-surface p-4 shadow-card sm:p-5"
    >
      <Heading level={3} size="sm" id="soul-prizes">
        🎁 Boostery za zwycięstwo
      </Heading>
      <p className="mt-1 text-sm text-ink-muted">
        Najtrudniejsi przeciwnicy pobierają wpisowe, ale wygrana z nimi daje — oprócz talentów —
        jeden darmowy booster, otwierany od razu po walce. Jego edycję losuje tabela szans.
      </p>
      <ul className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {OPPONENTS.map((o) => (
          <li key={o.id} className="flex flex-col gap-2 rounded-card bg-surface-muted p-3">
            <p className="flex flex-wrap items-center gap-2">
              <span className="font-display font-extrabold text-navy">
                <span aria-hidden="true">{o.emoji} </span>
                {o.name}
              </span>
              {o.fee ? (
                <Badge tone="accentSolid">🪙 wpisowe {o.fee}</Badge>
              ) : (
                <Badge>bez wpisowego</Badge>
              )}
            </p>
            {o.prize ? (
              <ul className="flex flex-col gap-1.5" aria-label={`Szanse na booster: ${o.name}`}>
                {o.prize.map(({ pack, chance }) => {
                  const p = findPack(pack);
                  const pct = Math.round(chance * 100);
                  return (
                    <li key={pack} className="text-sm text-ink">
                      <span className="flex justify-between gap-2">
                        <span>
                          <span aria-hidden="true">{p.emoji} </span>
                          {p.name}
                        </span>
                        <strong className="tabular-nums">{pct}%</strong>
                      </span>
                      <span
                        aria-hidden="true"
                        className="mt-0.5 block h-1.5 rounded-full bg-surface"
                      >
                        <span
                          className="block h-full origin-left rounded-full bg-accent"
                          style={{ transform: `scaleX(${chance})` }}
                        />
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-ink-muted">
                Bez darmowego boostera — tylko talenty i prawo do otwarcia paczki w sklepie.
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
