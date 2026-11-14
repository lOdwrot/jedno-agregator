import { cn } from "@/lib/cn";
import { artSrc } from "../data/art";
import type { PackType } from "../collection/packs";

/** Front of a sealed booster: foil, crimped edges, illustration, title and a sticker. */
export function BoosterPack({
  pack,
  className,
  torn = false,
}: {
  pack: PackType;
  className?: string;
  torn?: boolean;
}) {
  const img = artSrc(pack.art);
  return (
    <div
      className={cn("relative aspect-[5/8] w-40 select-none sm:w-48", className)}
      aria-hidden="true"
    >
      {!torn && (
        <div
          className={cn(
            "soul-crimp absolute inset-x-0 top-0 z-10 h-[9%] bg-gradient-to-r",
            pack.foil,
          )}
        />
      )}
      <div
        className={cn(
          "soul-crimp absolute inset-x-0 bottom-0 z-10 h-[7%] bg-gradient-to-r",
          pack.foil,
        )}
      />
      <div
        className={cn(
          "absolute inset-x-0 top-[7%] bottom-[5%] overflow-hidden rounded-sm bg-gradient-to-br p-2 shadow-lift",
          pack.foil,
        )}
      >
        <div className="flex h-full flex-col items-center gap-1.5 rounded-sm bg-navy/85 p-2 text-center text-white">
          <p className="font-display text-[0.6rem] font-extrabold tracking-[0.2em] text-logo-yellow">
            WALKA O DUSZĘ
          </p>
          <div className="relative grid w-full flex-1 place-items-center overflow-hidden rounded-md bg-gradient-to-b from-logo-blue/60 to-navy-800">
            {img ? (
              <img
                src={img}
                alt=""
                className="absolute inset-0 size-full object-cover"
                loading="lazy"
              />
            ) : (
              <span className="text-6xl">{pack.emoji}</span>
            )}
            <span className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-navy to-transparent" />
          </div>
          <p className="font-display text-lg leading-none font-extrabold sm:text-xl">{pack.name}</p>
          <p className="text-[0.65rem] font-bold text-white/80">{pack.subtitle}</p>
          <p className="rounded-full bg-surface/15 px-2 py-0.5 text-[0.6rem] font-extrabold tracking-wider">
            5 KART
          </p>
        </div>
        <span className="soul-shine absolute inset-0" />
      </div>
      <span className="absolute -top-1 -right-2 z-20 grid size-16 rotate-12 place-items-center rounded-full bg-accent-strong p-1 text-center text-[0.55rem] leading-tight font-extrabold text-white shadow-lift sm:size-[4.5rem]">
        {pack.sticker}
      </span>
    </div>
  );
}
