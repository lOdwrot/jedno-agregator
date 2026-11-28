import { useMemo, useState } from "react";
import { ChipGroup } from "@/ui";
import { cn } from "@/lib/cn";
import { getCard } from "../data/cards";
import { formatNumber } from "../data/numbers";
import { FINISH_LABEL, type Finish } from "../data/types";
import { albumEntries, albumTally, type AlbumEntry } from "../collection/album";
import type { Profile } from "../collection/profile";
import { CardMini } from "../components/CardMini";
import { AlbumCardDialog } from "./AlbumCardDialog";

type Filter = "all" | "owned" | "missing" | "prestige";
const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Wszystkie" },
  { value: "owned", label: "Zdobyte" },
  { value: "missing", label: "Brakujące" },
  { value: "prestige", label: "✦ Złocone i ❖ witrażowe" },
];
const keep: Record<Filter, (e: AlbumEntry) => boolean> = {
  all: () => true,
  owned: (e) => !!e.best,
  missing: (e) => !e.best,
  prestige: (e) => e.copies.gilded + e.copies.stained > 0,
};

/** Edge of a lower print peeking out from under the top one (the stack of owned versions). */
const UNDER: Record<Finish, string> = {
  stained: "bg-gradient-to-br from-logo-blue via-logo-red to-logo-yellow",
  gilded: "bg-gradient-to-br from-logo-yellow via-surface to-logo-orange",
  plain: "bg-surface ring-1 ring-line",
};

function Slot({ entry, onOpen }: { entry: AlbumEntry; onOpen: () => void }) {
  const no = formatNumber(entry.number);
  if (!entry.best)
    return (
      <div className="grid aspect-[5/7] place-items-center rounded-card bg-surface-muted shadow-[inset_0_2px_6px_rgb(0_0_0/0.08)] ring-1 ring-line">
        <span
          aria-hidden="true"
          className="font-display text-2xl font-extrabold text-ink-muted sm:text-3xl"
        >
          {no}
        </span>
        <span className="sr-only">Nr {no} — tej karty jeszcze nie masz</span>
      </div>
    );
  const c = getCard(entry.cardId);
  const under = entry.finishes.slice(1);
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Nr ${no}: ${c.name} — ${entry.finishes.map((f) => FINISH_LABEL[f]).join(", ")}, ${entry.total} szt. Obejrzyj z bliska.`}
      className="group relative block aspect-[5/7] w-full rounded-card"
    >
      {under.map((f, i) => (
        <span
          key={f}
          aria-hidden="true"
          className={cn("absolute inset-0 rounded-card shadow-card", UNDER[f])}
          style={{
            transform: `translate(${(i + 1) * 4}px, ${(i + 1) * 4}px) rotate(${(i + 1) * 2.5}deg)`,
          }}
        />
      ))}
      <span className="relative block size-full transition-transform group-hover:-translate-y-1 group-hover:scale-[1.03]">
        <CardMini cardId={entry.cardId} finish={entry.best} />
      </span>
      {entry.total > 1 && (
        <span
          aria-hidden="true"
          className="absolute -right-1.5 -bottom-1.5 rounded-full bg-navy px-2 py-0.5 text-xs font-extrabold text-white shadow-card"
        >
          ×{entry.total}
        </span>
      )}
    </button>
  );
}

/**
 * "Album" tab: every numbered card of the game in a binder grid. Missing cards are empty slots
 * with their number; owned ones show the rarest print, the other prints stacked underneath.
 * Tap a card to turn it in your hand (`TiltCard`).
 */
export function Album({ profile }: { profile: Profile }) {
  const entries = useMemo(() => albumEntries(profile), [profile]);
  const t = albumTally(entries);
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<AlbumEntry | null>(null);
  const shown = entries.filter(keep[filter]);
  const pct = Math.round((t.owned / t.total) * 100);
  return (
    <div className="flex flex-col gap-5">
      <section
        aria-labelledby="soul-album"
        className="flex max-w-3xl flex-col gap-3 rounded-card bg-surface p-5 shadow-card"
      >
        <h3 id="soul-album" className="font-display text-lg font-extrabold text-navy">
          Album kart
        </h3>
        <p className="flex flex-wrap gap-x-5 gap-y-1 rounded-lg bg-navy px-4 py-3 text-sm font-bold text-white">
          <span>
            📇 Zebrane: {t.owned} / {t.total}
          </span>
          <span>✦ Złocone: {t.gilded}</span>
          <span>❖ Witrażowe: {t.stained}</span>
        </p>
        <div
          role="progressbar"
          aria-label="Postęp kolekcji"
          aria-valuemin={0}
          aria-valuemax={t.total}
          aria-valuenow={t.owned}
          aria-valuetext={`${pct}%`}
          className="h-2 overflow-hidden rounded-full bg-surface-muted"
        >
          <span
            className="block h-full origin-left rounded-full bg-gradient-to-r from-logo-blue via-logo-red to-logo-yellow"
            style={{ transform: `scaleX(${t.owned / t.total})` }}
          />
        </div>
        <p className="text-sm text-ink-muted">
          Każda karta ma swój numer. Gdy masz kilka wersji tej samej karty, na wierzchu leży
          najrzadsza (witrażowa, potem złocona), a pozostałe wystają spod spodu. Dotknij karty, aby
          wziąć ją do ręki i obejrzeć pod różnymi kątami.
        </p>
      </section>
      <ChipGroup
        label="Pokaż karty"
        value={filter}
        onChange={(v) => setFilter((v as Filter | null) ?? "all")}
        options={FILTERS}
      />
      {shown.length ? (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {shown.map((e) => (
            <li key={e.cardId}>
              <Slot entry={e} onOpen={() => setOpen(e)} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-ink-muted">Nie ma tu jeszcze żadnej karty.</p>
      )}
      <AlbumCardDialog entry={open} onClose={() => setOpen(null)} />
    </div>
  );
}
