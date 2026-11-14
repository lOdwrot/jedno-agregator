import { Dialog } from "@/ui";
import { cn } from "@/lib/cn";
import { ART, artSrc } from "../data/art";
import { OPPONENTS } from "../data/opponents";
import { RANKS } from "./ranks";
import { lossXp, THRESHOLDS, WIN_XP } from "./xp";

interface Props {
  xp: number;
  /** Rank whose patron is shown. */
  index: number;
  onSelect: (index: number) => void;
  onClose: () => void;
}

/** The patron's story, the whole rank ladder (each patron can be read) and how points are counted. */
export function PatronDialog({ xp, index, onSelect, onClose }: Props) {
  const rank = RANKS[index]!;
  const { patron } = rank;
  const src = artSrc(patron.art);
  const credit = ART[patron.art];
  return (
    <Dialog open onClose={onClose} title={`${rank.emoji} ${rank.name} — ${patron.name}`} size="md">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          {src && (
            <img
              src={src}
              alt={patron.name}
              className="h-48 w-full rounded-card object-cover sm:w-40 sm:shrink-0"
              style={{ objectPosition: `50% ${(credit?.focus ?? 0.25) * 100}%` }}
            />
          )}
          <div className="flex flex-col gap-2 text-ink">
            <p className="text-sm text-ink-muted">
              {patron.life} · wspomnienie: {patron.feast}
            </p>
            <p className="font-serif text-xl italic">„{patron.motto}”</p>
            {patron.bio.map((t) => (
              <p key={t}>{t}</p>
            ))}
            {credit && (
              <p className="text-xs text-ink-muted">
                Ilustracja: {credit.author}, {credit.license}
              </p>
            )}
          </div>
        </div>

        <section aria-labelledby="rank-ladder" className="flex flex-col gap-2">
          <h3 id="rank-ladder" className="font-display text-lg font-bold text-navy">
            Drabina rang
          </h3>
          <ol className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            {RANKS.map((r, i) => {
              const reached = xp >= THRESHOLDS[i]!;
              return (
                <li key={r.name}>
                  <button
                    type="button"
                    onClick={() => onSelect(i)}
                    aria-current={i === index ? "true" : undefined}
                    className={cn(
                      "flex min-h-11 w-full items-center gap-2 rounded-card px-2 py-1 text-left text-sm",
                      i === index ? "bg-accent-soft" : "hover:bg-surface-muted",
                    )}
                  >
                    <img
                      src={artSrc(r.patron.art) ?? undefined}
                      alt=""
                      className={cn(
                        "size-9 shrink-0 rounded-full object-cover",
                        !reached && "opacity-50 grayscale",
                      )}
                    />
                    <span className="flex flex-col">
                      <strong className="text-ink">
                        {i + 1}. {r.name}
                      </strong>
                      <span className="text-xs text-ink-muted">
                        {r.patron.name} · od {THRESHOLDS[i]} pkt{reached ? "" : " 🔒"}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </section>

        <section aria-labelledby="rank-points" className="flex flex-col gap-1 text-sm text-ink">
          <h3 id="rank-points" className="font-display text-lg font-bold text-navy">
            Punkty rangi
          </h3>
          <p>
            Zwycięstwo: {OPPONENTS.map((o) => `${o.emoji} +${WIN_XP[o.difficulty]}`).join(" · ")}.
          </p>
          <p>
            Porażka (także poddanie się) zabiera tyle samo punktów niezależnie od przeciwnika — im
            wyższa ranga, tym więcej: teraz −{lossXp(xp)} pkt. Można spaść do niższej rangi.
          </p>
        </section>
      </div>
    </Dialog>
  );
}
