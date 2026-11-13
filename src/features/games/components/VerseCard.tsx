import { Eyebrow } from "@/ui";
import type { GameInfo } from "../catalog";

/** "Word for the road": the verse behind the game, a short reflection and a one-line prayer. */
export function VerseCard({ game }: { game: GameInfo }) {
  return (
    <aside
      aria-labelledby={`verse-${game.slug}`}
      className="relative isolate overflow-hidden rounded-card bg-navy p-6 text-white shadow-lift sm:p-8"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-6 -right-2 -z-10 font-serif text-[10rem] leading-none text-white/10"
      >
        ”
      </span>
      <Eyebrow as="h2" id={`verse-${game.slug}`} className="text-logo-yellow">
        Słowo na drogę
      </Eyebrow>
      <blockquote className="mt-3">
        <p className="font-serif text-2xl leading-snug italic sm:text-3xl">„{game.verse.text}”</p>
        <footer className="mt-2 text-sm font-bold text-white/80">— {game.verse.ref}</footer>
      </blockquote>
      <p className="mt-5 max-w-2xl text-white/90">{game.reflection}</p>
      <p className="mt-4 max-w-2xl rounded-card bg-white/10 p-4 text-white">
        <span aria-hidden="true">🙏 </span>
        <strong>Modlitwa:</strong> {game.prayer}
      </p>
    </aside>
  );
}
