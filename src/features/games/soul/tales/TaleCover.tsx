import { Button } from "@/ui";

/** The leather cover of the book with the gilt title; opening it turns it like a page. */
export function TaleCover({
  title,
  replay,
  onOpen,
}: {
  title: string;
  replay: boolean;
  onOpen: () => void;
}) {
  return (
    <div className="tale-cover flex h-full min-h-[30rem] flex-col items-center justify-center gap-5 px-8 py-10 text-center sm:min-h-[34rem] sm:px-14">
      <p aria-hidden="true" className="font-serif text-3xl text-gilt">
        ✠
      </p>
      <p className="tale-cover-title font-serif text-sm tracking-[0.35em] uppercase">
        Opowieści o świętych
      </p>
      <p className="tale-cover-title font-serif text-4xl italic sm:text-5xl">
        {replay ? title : "Nowa opowieść o świętym!"}
      </p>
      <p aria-hidden="true" className="font-serif text-2xl text-gilt">
        ❧ ✦ ☙
      </p>
      <p className="max-w-prose text-lg text-gilt-light">
        {replay
          ? "Otwórz księgę jeszcze raz i przeżyj tę opowieść od nowa. Na końcu znów czekają trzy pytania — tym razem bez karty, bo kartę świętego masz już w kolekcji."
          : "Twoja wytrwałość otworzyła starą księgę. Na jej kartach czeka opowieść o pewnym świętym. Przeczytaj ją uważnie — na końcu są trzy pytania, a kto odpowie dobrze na wszystkie, otrzyma wyjątkową kartę, której nie ma w żadnym boosterze."}
      </p>
      <Button size="lg" onClick={onOpen}>
        {replay ? "📖 Przeżyj opowieść ponownie" : "📖 Poznaj świętego"}
      </Button>
    </div>
  );
}
