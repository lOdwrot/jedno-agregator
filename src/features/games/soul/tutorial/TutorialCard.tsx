import { Badge, Button } from "@/ui";
import { TUTORIAL_REWARD } from "../collection/profile";

/** Hub entry of the tutorial — highlighted until it is finished once on this device. */
export function TutorialCard({ done, onStart }: { done: boolean; onStart: () => void }) {
  return (
    <section
      aria-labelledby="soul-tutorial"
      className="flex flex-col gap-3 rounded-card bg-surface p-4 shadow-card sm:flex-row sm:items-center"
    >
      <span
        aria-hidden="true"
        className="grid size-12 shrink-0 place-items-center rounded-full bg-navy text-2xl"
      >
        🎓
      </span>
      <div className="min-w-0 flex-1">
        <h2 id="soul-tutorial" className="font-display text-lg font-extrabold text-navy">
          Samouczek: pierwsza walka krok po kroku
        </h2>
        <p className="text-sm text-ink">
          Gotowa talia i zawsze ten sam przebieg. Poznasz wystawianie postaci, ławkę, Łaskę,
          przedmioty, pomocników, ewolucje, moce, słabość, wycofanie i miejsca — a o dwie ostatnie
          dusze zawalczysz już sam.
        </p>
        <p className="mt-1">
          {done ? (
            <Badge tone="navy">ukończony ✓</Badge>
          ) : (
            <Badge tone="accent">🪙 {TUTORIAL_REWARD} talentów za pierwsze ukończenie</Badge>
          )}
        </p>
      </div>
      <Button variant={done ? "outline" : "solid"} onClick={onStart} className="shrink-0">
        {done ? "Zagraj ponownie" : "Rozpocznij samouczek"}
      </Button>
    </section>
  );
}
