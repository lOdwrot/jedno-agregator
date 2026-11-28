import { demonBg, finishLayer, parishBg, resetIds, svgDoc } from "./kit";

/** A card picture; `layers` splits it into the backdrop and the motif (for the album's parallax). */
export type Scene = (() => string) & { layers?: { bg: () => string; fg: () => string } };

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
          return svgDoc(motif());
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
