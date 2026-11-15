import { Button } from "@/ui";

/** Shown over the board when the Pixi canvas could not start; the card buttons still work. */
export function BoardFailure({ kind }: { kind: "load" | "gfx" }) {
  return (
    <div
      role="status"
      className="absolute inset-x-4 top-4 z-[950] flex flex-col items-start gap-2 rounded-card bg-surface p-3 text-sm text-ink shadow-card"
    >
      {kind === "load" ? (
        <>
          <p>
            Nie udało się wczytać grafiki planszy — strona mogła właśnie zostać zaktualizowana.
            Odśwież ją, a karty wciąż możesz wybierać przyciskami (Tab).
          </p>
          <Button size="sm" onClick={() => window.location.reload()}>
            Odśwież stronę
          </Button>
        </>
      ) : (
        <p>
          Nie udało się uruchomić grafiki planszy w tej przeglądarce. Karty wciąż możesz wybierać
          przyciskami (Tab).
        </p>
      )}
    </div>
  );
}
