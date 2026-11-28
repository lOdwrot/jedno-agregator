import { demonBg, finishLayer, parishBg, resetIds, svgDoc } from "./kit";

/** A card picture; `layers` splits it into the backdrop, the figure and the effects in front (for the album's parallax). */
export type Scene = (() => string) & {
  layers?: { bg: () => string; fg: () => string; fx: () => string };
};

/** Figure layer: everything but the effects. */
const FIGURE_ONLY = "<style>[data-fx]{display:none}</style>";
/** Effects layer: only what `fx()` marked (hidden parents, visible marked children). */
const FX_ONLY = "<style>*{visibility:hidden}[data-fx],[data-fx] *{visibility:visible}</style>";

const scene = (bg: () => string, motif: () => string, dark: boolean): Scene =>
  Object.assign(
    () => {
      resetIds();
      return svgDoc(bg() + motif() + finishLayer(dark));
    },
    {
      layers: {
        bg: () => {
          resetIds();
          return svgDoc(bg() + finishLayer(dark));
        },
        fg: () => {
          resetIds();
          return svgDoc(FIGURE_ONLY + motif());
        },
        fx: () => {
          resetIds();
          return svgDoc(FX_ONLY + motif());
        },
      },
    },
  );

/** A parish picture: hopeful sky + the motif. */
export const light = (
  el: string,
  motif: () => string,
  opts: { hills?: boolean; rays?: boolean; bg?: () => string } = {},
): Scene => scene(() => (opts.bg ? opts.bg() : parishBg(el, motif.name + el, opts)), motif, false);

/** A demons' picture: smoky backdrop + the motif. */
export const dark = (
  el: string,
  motif: () => string,
  opts: { ground?: boolean; bg?: () => string } = {},
): Scene => scene(() => (opts.bg ? opts.bg() : demonBg(el, motif.name + el, opts)), motif, true);
