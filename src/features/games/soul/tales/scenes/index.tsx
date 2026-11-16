import type { ComponentType } from "react";
import type { SceneId } from "../stories";
import { Candles, Grotto, Meadow, Pilgrims, SpringScene, Wind } from "./bernadetta";
import { Birds, Crib, Stones, SunScene, Town, Wolf } from "./franciszek";
import { Angels, Field, Harvest, Mist, Snow, SpringFields } from "./izydor";

const SCENES: Record<SceneId, ComponentType> = {
  meadow: Meadow,
  wind: Wind,
  grotto: Grotto,
  spring: SpringScene,
  candles: Candles,
  pilgrims: Pilgrims,
  town: Town,
  stones: Stones,
  birds: Birds,
  wolf: Wolf,
  crib: Crib,
  sun: SunScene,
  field: Field,
  mist: Mist,
  angels: Angels,
  snow: Snow,
  harvest: Harvest,
};

/** Spring of Isidore (dry fields) and of Bernadetta (grotto) look different. */
const OVERRIDE: Partial<Record<string, Partial<Record<SceneId, ComponentType>>>> = {
  izydor: { spring: SpringFields },
};

/** Animated illustration of a tale page (decorative: the page text tells the story). */
export function Scene({ id, tale }: { id: SceneId; tale: string }) {
  const S = OVERRIDE[tale]?.[id] ?? SCENES[id];
  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
      className="tale-scene absolute inset-0 size-full"
    >
      <S />
    </svg>
  );
}
