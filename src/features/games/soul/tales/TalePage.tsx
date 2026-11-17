import type { TalePage as Page } from "./stories";
import { Scene } from "./scenes";

/** One leaf of the book: the animated scene as a framed plate, the text with an illuminated initial. */
export function TalePage({
  tale,
  page,
  index,
  total,
}: {
  tale: string;
  page: Page;
  index: number;
  total: number;
}) {
  return (
    <article className="tale-paper flex h-full flex-col gap-4 py-5 pr-5 pl-7 sm:gap-5 sm:py-7 sm:pr-8 sm:pl-10">
      <div className="tale-frame relative aspect-[4/3] shrink-0 sm:aspect-[16/9]">
        <Scene id={page.scene} tale={tale} />
      </div>
      <p className="tale-dropcap text-xl leading-relaxed text-sepia sm:text-2xl sm:leading-relaxed">
        {page.text}
      </p>
      <p
        aria-hidden="true"
        className="mt-auto text-center font-serif text-lg text-sepia-muted italic"
      >
        ❦ {index + 1} / {total} ❦
      </p>
    </article>
  );
}
