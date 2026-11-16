import type { SceneId } from "../stories";

/** Colour of the ground at the bottom of each scene: the page continues it under the text. */
const GROUND: Record<SceneId, string> = {
  meadow: "bg-meadow-600",
  wind: "bg-meadow-600",
  grotto: "bg-meadow-800",
  spring: "bg-tale-earth",
  candles: "bg-navy-600",
  pilgrims: "bg-navy-600",
  town: "bg-meadow-600",
  stones: "bg-meadow-400",
  birds: "bg-meadow-400",
  wolf: "bg-meadow-400",
  crib: "bg-tale-earth",
  sun: "bg-meadow-400",
  field: "bg-tale-earth",
  mist: "bg-tale-earth",
  angels: "bg-tale-earth",
  snow: "bg-tale-snow",
  harvest: "bg-tale-wheat",
};
export const groundOf = (id: SceneId, tale: string) =>
  tale === "izydor" && id === "spring" ? "bg-tale-wheat" : GROUND[id];
