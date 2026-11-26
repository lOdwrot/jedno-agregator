import { ChipGroup } from "@/ui";
import { cn } from "@/lib/cn";
import { DECK_SIZE } from "../data/cards";
import { activeDeckIndex, deckSlots, shownName, slotSize, switchDeck } from "../collection/decks";
import type { Profile } from "../collection/profile";

/** Pick the active deck (remembered in the saved profile, so it survives a reload). */
export function DeckSwitcher({
  profile,
  update,
  className,
}: {
  profile: Profile;
  update: (fn: (p: Profile) => Profile) => void;
  className?: string;
}) {
  const options = deckSlots(profile).map((s, i) => {
    const name = shownName(s, i);
    const size = slotSize(s);
    return {
      value: String(i),
      label: (
        <>
          {name}{" "}
          <span className="font-normal">
            · {size}/{DECK_SIZE}
          </span>
        </>
      ),
      ariaLabel: `${name}, ${size} z ${DECK_SIZE} kart`,
    };
  });
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <p className="text-sm font-bold text-navy">Aktywna talia</p>
      <ChipGroup
        label="Aktywna talia"
        options={options}
        value={String(activeDeckIndex(profile))}
        onChange={(v) => v !== null && update((p) => switchDeck(p, Number(v)))}
      />
    </div>
  );
}
