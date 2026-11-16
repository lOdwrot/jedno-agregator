import { Button } from "@/ui";
import { TALE_CARDS } from "../data/tales";
import { CardFace } from "../components/CardFace";
import { taleOf } from "./stories";

/**
 * Hub tab "Opowieści" (shown once at least one tale is finished): every finished tale with its
 * saint's card and "Przeżyj ponownie" (a replay, no card), the waiting one and the locked rest.
 */
export function TaleShelf({
  saints,
  waiting,
  onOpen,
}: {
  /** Saints whose cards were won, in order. */
  saints: readonly string[];
  /** The unlocked tale not finished yet. */
  waiting: string | null;
  onOpen: (cardId: string, replay: boolean) => void;
}) {
  const locked = TALE_CARDS.length - saints.length - (waiting ? 1 : 0);
  return (
    <div className="flex flex-col gap-4">
      <p className="max-w-prose text-ink">
        Księgi, które już przeczytano. Możesz przeżyć każdą opowieść jeszcze raz i znów odpowiedzieć
        na pytania — kartę świętego zdobywa się jednak tylko raz.
      </p>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {saints.map((id) => (
          <li
            key={id}
            className="flex flex-col items-center gap-3 rounded-card bg-surface p-4 shadow-card"
          >
            <h3 className="text-center font-display text-lg font-extrabold text-navy">
              {taleOf(id)?.title}
            </h3>
            <div className="w-full max-w-56">
              <CardFace cardId={id} finish="stained" />
            </div>
            <p className="text-sm font-bold text-success">✓ Karta zdobyta</p>
            <Button onClick={() => onOpen(id, true)}>📖 Przeżyj ponownie</Button>
          </li>
        ))}
        {waiting && (
          <li className="flex flex-col items-center justify-center gap-3 rounded-card bg-navy p-4 text-center text-white shadow-card">
            <span aria-hidden="true" className="text-5xl">
              📖
            </span>
            <h3 className="font-display text-lg font-extrabold text-white">Nowa opowieść czeka</h3>
            <p className="text-sm text-white/85">
              Odpowiedz dobrze na trzy pytania i zdobądź kartę.
            </p>
            <Button onClick={() => onOpen(waiting, false)}>Poznaj świętego</Button>
          </li>
        )}
        {locked > 0 && (
          <li className="flex flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed border-line p-4 text-center text-ink-muted">
            <span aria-hidden="true" className="text-4xl">
              🔒
            </span>
            <p className="font-bold">
              {locked === 1 ? "Jeszcze 1 opowieść" : `Jeszcze ${locked} opowieści`} do odkrycia
            </p>
            <p className="text-sm">Wygrywaj pojedynki z rzędu albo po prostu dużo graj.</p>
          </li>
        )}
      </ul>
    </div>
  );
}
