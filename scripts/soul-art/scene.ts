import { demonBg, finishLayer, parishBg, resetIds, svgDoc } from "./kit";

export type Scene = () => string;

/** A parish picture: hopeful sky + the motif. */
export const light =
  (
    el: string,
    motif: () => string,
    opts: { hills?: boolean; rays?: boolean; bg?: () => string } = {},
  ): Scene =>
  () => {
    resetIds();
    return svgDoc(
      (opts.bg ? opts.bg() : parishBg(el, motif.name + el, opts)) + motif() + finishLayer(false),
    );
  };

/** A demons' picture: smoky backdrop + the motif. */
export const dark =
  (el: string, motif: () => string, opts: { ground?: boolean; bg?: () => string } = {}): Scene =>
  () => {
    resetIds();
    return svgDoc(
      (opts.bg ? opts.bg() : demonBg(el, motif.name + el, opts)) + motif() + finishLayer(true),
    );
  };
