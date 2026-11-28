import { cn } from "@/lib/cn";
import { getCard } from "../data/cards";
import { ENERGY_LABEL, STATUS_INFO } from "../data/types";
import { hpLeft, maxHp, type Game, type InPlay } from "../engine/state";
import { CardArt } from "./CardArt";

const plural = (n: number, one: string, few: string, many: string) =>
  n === 1 ? one : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? few : many;

/** State of a character on the table: attached energy, HP left, statuses, shield, evolution stack. */
export function InPlayStatus({ g, c, compact = false }: { g: Game; c: InPlay; compact?: boolean }) {
  const def = getCard(c.cardId);
  const energy = ENERGY_LABEL[def.side];
  const max = maxHp(g, c);
  const left = hpLeft(g, c);
  const ratio = max ? left / max : 0;
  const energyWord =
    def.side === "parish"
      ? plural(c.energy, "Łaska", "Łaski", "Łask")
      : plural(c.energy, "Pokusa", "Pokusy", "Pokus");
  return (
    <section
      aria-label="Stan postaci na stole"
      className={cn("flex flex-col rounded-card bg-navy text-white", compact ? "gap-2 p-2" : "gap-3 p-3")}
    >
      <div className="flex items-center gap-3">
        <p
          className={cn(
            "grid min-w-16 place-items-center rounded-xl bg-white/10 px-2 py-1 font-display font-extrabold text-logo-yellow",
            compact ? "text-xl" : "text-3xl",
          )}
          aria-hidden="true"
        >
          {energy.emoji}×{c.energy}
        </p>
        <p className="text-sm">
          <strong className={cn("block font-display", compact ? "text-base" : "text-lg")}>
            {c.energy ? `${c.energy} ${energyWord}` : `Brak dołączonej energii`}
          </strong>
          {c.energy
            ? "dołączone do tej postaci"
            : `Dołącz ${energy.name} ${energy.emoji}, by atakować`}
        </p>
      </div>
      <div>
        <p className="flex justify-between text-sm font-bold">
          <span>Wytrwałość</span>
          <span>
            {left} / {max}
          </span>
        </p>
        <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-white/20" aria-hidden="true">
          <div
            className={cn("h-full rounded-full", ratio > 0.35 ? "bg-success" : "bg-danger")}
            style={{ width: `${ratio * 100}%` }}
          />
        </div>
      </div>
      {(c.statuses.length > 0 || c.shield > 0) && (
        <ul className="flex flex-wrap gap-2 text-sm">
          {c.statuses.map((s) => (
            <li key={s} className="rounded-full bg-white/10 px-3 py-1">
              <span aria-hidden="true">{STATUS_INFO[s].emoji} </span>
              {STATUS_INFO[s].label}
            </li>
          ))}
          {c.shield > 0 && (
            <li className="rounded-full bg-logo-blue/40 px-3 py-1">
              <span aria-hidden="true">🛡️ </span>Osłona −{c.shield}
            </li>
          )}
        </ul>
      )}
      {c.under.length > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <span>Pod spodem:</span>
          {c.under.map((u) => (
            <span key={u.uid} className="flex items-center gap-1.5">
              <span className="relative grid size-8 place-items-center overflow-hidden rounded-full bg-white/10">
                <CardArt cardId={u.cardId} emojiClass="text-base" />
              </span>
              {getCard(u.cardId).name}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
