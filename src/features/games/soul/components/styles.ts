import type { Element } from "../data/types";

/** Token-based colours of each element (art backgrounds, bands). */
export const ELEMENT_ART: Record<Element, string> = {
  modlitwa: "from-logo-blue/80 to-logo-blue/20",
  slowo: "from-logo-yellow/90 to-logo-yellow/25",
  sluzba: "from-logo-orange/85 to-logo-orange/20",
  pycha: "from-logo-red/80 to-navy-600/60",
  gniew: "from-danger/80 to-navy-800/60",
  lenistwo: "from-navy-600 to-logo-blue/40",
};
export const ELEMENT_BAND: Record<Element, string> = {
  modlitwa: "bg-logo-blue",
  slowo: "bg-logo-yellow",
  sluzba: "bg-logo-orange",
  pycha: "bg-logo-red",
  gniew: "bg-danger",
  lenistwo: "bg-navy-600",
};
/** Card frame of each print: silver for plain cards, gold for gilded, a holographic frame for
 *  stained ones (the shimmering layer is `HoloFrame`, the gradient here is its fallback). */
export const FINISH_FRAME = {
  plain: "bg-gradient-to-br from-silver-300 via-silver-500 to-silver-700 p-1",
  gilded: "bg-gradient-to-br from-logo-yellow via-surface to-logo-yellow p-1",
  stained: "bg-gradient-to-br from-logo-blue via-logo-red to-logo-yellow p-1.5",
} as const;
