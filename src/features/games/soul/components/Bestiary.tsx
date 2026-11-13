import { DEMON_CARDS } from "../data/demons";
import { CardFace } from "./CardFace";

/** Educational part: every demon card with "how it tempts" and "how to resist". */
export function Bestiary() {
  const cards = DEMON_CARDS.filter((c) => c.kind !== "energy");
  return (
    <div className="flex flex-col gap-5">
      <div className="max-w-3xl rounded-card bg-surface p-5 shadow-card">
        <h3 className="font-display text-lg font-extrabold text-navy">Bestiariusz pokus</h3>
        <p className="mt-2 text-ink">
          Pomioty w tej grze rzadko kuszą czymś wielkim i strasznym. Częściej podsuwają drobiazgi:
          „jeszcze pięć minut”, jeszcze jeden filmik, jedną plotkę, porównanie z kimś. Właśnie
          dlatego są groźne — małe kroki łatwo przeoczyć.
        </p>
        <p className="mt-2 text-sm text-ink-muted">
          Inspiracja: C.S. Lewis, „Listy starego diabła do młodego” — książka, w której doświadczony
          diabeł radzi bratankowi, jak odciągnąć człowieka od Boga. Czytana „na odwrót” jest
          świetnym poradnikiem duchowej walki. Teksty w grze są nasze, a wuj Siarkowąs i Smołek to
          postacie wymyślone dla tej gry.
        </p>
      </div>
      <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => (
          <li key={c.id}>
            <CardFace cardId={c.id} showLesson className="h-full" />
          </li>
        ))}
      </ul>
    </div>
  );
}
