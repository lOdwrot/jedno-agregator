/** Design tokens for the canvas, read from the CSS custom properties of `src/styles/index.css`. */
const TOKENS = [
  "navy",
  "navy-800",
  "navy-600",
  "accent",
  "accent-strong",
  "accent-soft",
  "logo-orange",
  "logo-blue",
  "logo-yellow",
  "logo-red",
  "logo-dark",
  "canvas",
  "surface",
  "surface-muted",
  "ink",
  "ink-muted",
  "line",
  "success",
  "danger",
  "hell-950",
  "hell-800",
  "hell-600",
  "ember",
  "meadow-800",
  "meadow-600",
  "meadow-400",
  "meadow-200",
  "river",
  "river-light",
  "gold-100",
  "gold-300",
  "gold-500",
  "gold-700",
  "silver-100",
  "silver-300",
  "silver-500",
  "silver-700",
] as const;

export type Token = (typeof TOKENS)[number];
export type Palette = Record<Token, string>;

let cached: Palette | null = null;

export function palette(): Palette {
  if (cached) return cached;
  const css = typeof document !== "undefined" ? getComputedStyle(document.documentElement) : null;
  const out = {} as Palette;
  for (const t of TOKENS) out[t] = css?.getPropertyValue(`--color-${t}`).trim() || "white";
  cached = out;
  return out;
}

export const FONT_DISPLAY = '"Bricolage Grotesque Variable", Lato, system-ui, sans-serif';
export const FONT_SANS = "Lato, system-ui, sans-serif";
