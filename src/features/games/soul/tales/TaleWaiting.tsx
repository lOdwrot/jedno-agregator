import { Button } from "@/ui";

/** Hub card shown only while an unlocked tale has not been finished yet. */
export function TaleWaiting({ onOpen }: { onOpen: () => void }) {
  return (
    <section
      aria-labelledby="tale-waiting"
      className="relative isolate flex flex-wrap items-center gap-4 overflow-hidden rounded-card bg-navy p-4 text-white shadow-card"
    >
      <span aria-hidden="true" className="soul-foil soul-foil--stained soul-foil--dark" />
      <span aria-hidden="true" className="relative text-4xl">
        📖
      </span>
      <div className="relative min-w-48 flex-1">
        <h3 id="tale-waiting" className="font-display text-lg font-extrabold text-white">
          Opowieść o świętym czeka
        </h3>
        <p className="text-sm text-white/85">Przeczytaj ją i odpowiedz na trzy pytania.</p>
      </div>
      <Button className="relative" onClick={onOpen}>
        Poznaj świętego
      </Button>
    </section>
  );
}
