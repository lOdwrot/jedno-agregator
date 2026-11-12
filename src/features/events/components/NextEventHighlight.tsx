import { Link as RouterLink } from "react-router";
import type { Event } from "@/data/schemas";
import { paths } from "@/app/routes";
import { formatEventRange } from "@/lib/dates";
import { Counter, Eyebrow, Icon, Spotlight } from "@/ui";
import { useNow } from "../useNow";
import { countdownParts, eventStatus, pluralPl } from "../utils";

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="min-w-14 rounded-xl bg-white/10 px-3 py-2 text-center ring-1 ring-white/15 sm:min-w-16">
      <div className="font-display text-2xl font-extrabold tabular-nums sm:text-3xl">{String(value).padStart(2, "0")}</div>
      <div className="text-xs font-semibold uppercase tracking-wide text-white/80">{label}</div>
    </div>
  );
}

/** Navy hero card: next event with a live countdown + weekly summary. */
export function NextEventHighlight({ next, weekCount }: { next: Event | null; weekCount: number }) {
  const now = useNow(1000);
  if (!next) return null;
  const live = eventStatus(next, now) === "live";
  const p = countdownParts(new Date(next.start).getTime() - now.getTime());
  return (
    <Spotlight className="relative isolate overflow-hidden rounded-card bg-navy text-white shadow-lift">
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 -z-10 size-64 rounded-full bg-accent/30 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-20 left-1/3 -z-10 size-56 rounded-full bg-logo-blue/30 blur-3xl" />
      <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="min-w-0">
          <Eyebrow className="text-logo-yellow">{live ? "Trwa teraz" : "Najbliższe wydarzenie"}</Eyebrow>
          <h2 className="mt-2 font-display text-2xl font-extrabold leading-tight text-white sm:text-3xl">
            <RouterLink
              to={paths.eventDetail(next.id)}
              viewTransition
              className="rounded underline-offset-4 hover:underline focus-visible:outline-white"
            >
              {next.title}
            </RouterLink>
          </h2>
          <p className="mt-2 flex items-center gap-2 text-base font-semibold text-white/90">
            <Icon name="calendar" size={18} className="text-logo-yellow" />
            {formatEventRange(next.start, next.end)}
          </p>
          <p className="mt-4 text-sm text-white/80">
            <Counter value={weekCount} className="font-display text-lg font-extrabold text-white" />{" "}
            {pluralPl(weekCount, "wydarzenie", "wydarzenia", "wydarzeń")} w tym tygodniu
          </p>
        </div>
        {!live && (
          <div role="timer" aria-label={`Do początku: ${p.days} dni, ${p.hours} godzin, ${p.minutes} minut`} className="flex gap-2">
            <Unit value={p.days} label="dni" />
            <Unit value={p.hours} label="godz." />
            <Unit value={p.minutes} label="min" />
            <Unit value={p.seconds} label="sek" />
          </div>
        )}
      </div>
    </Spotlight>
  );
}

