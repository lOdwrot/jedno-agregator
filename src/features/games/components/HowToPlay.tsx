import { Icon } from "@/ui";
import type { GameInfo } from "../catalog";

/** Controls for touch screens and keyboards. */
export function HowToPlay({ game }: { game: GameInfo }) {
  return (
    <section aria-labelledby="how-to-play" className="rounded-card bg-surface p-6 shadow-card">
      <h2 id="how-to-play" className="font-display text-xl font-extrabold text-navy">
        Jak grać?
      </h2>
      <dl className="mt-3 flex flex-col gap-3">
        <div>
          <dt className="flex items-center gap-2 font-bold text-navy">
            <span aria-hidden="true">👆</span> Telefon (dotyk)
          </dt>
          <dd className="text-ink-muted">{game.controls.touch}</dd>
        </div>
        <div>
          <dt className="flex items-center gap-2 font-bold text-navy">
            <span aria-hidden="true">⌨️</span> Komputer (klawiatura)
          </dt>
          <dd className="text-ink-muted">{game.controls.keyboard}</dd>
        </div>
      </dl>
      <p className="mt-4 flex items-center gap-2 text-sm text-ink-muted">
        <Icon name="sparkle" size={16} /> Najlepszy wynik zapisuje się na tym urządzeniu.
      </p>
    </section>
  );
}
