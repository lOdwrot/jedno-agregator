/** Shakes an element (transform only, Web Animations API). Skipped for reduced motion. */
export function shake(el: Element | null | undefined, strength = 6, duration = 380): void {
  if (!el || typeof el.animate !== "function") return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  const s = strength;
  el.animate(
    [
      { transform: "translate(0, 0)" },
      { transform: `translate(${-s}px, ${s * 0.4}px)` },
      { transform: `translate(${s * 0.8}px, ${-s * 0.5}px)` },
      { transform: `translate(${-s * 0.5}px, ${s * 0.3}px)` },
      { transform: `translate(${s * 0.3}px, 0)` },
      { transform: "translate(0, 0)" },
    ],
    { duration, easing: "ease-out" },
  );
}

/** A quick "pop" (scale up and back). */
export function pop(el: Element | null | undefined, scale = 1.15, duration = 320): void {
  if (!el || typeof el.animate !== "function") return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  el.animate(
    [{ transform: "scale(1)" }, { transform: `scale(${scale})` }, { transform: "scale(1)" }],
    { duration, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" },
  );
}

/** A "no!" wobble, e.g. for a wrong pair of cards. */
export function wobble(el: Element | null | undefined, delay = 0): void {
  if (!el || typeof el.animate !== "function") return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  el.animate(
    [
      { transform: "translateX(0)" },
      { transform: "translateX(-7px) rotate(-3deg)" },
      { transform: "translateX(6px) rotate(2deg)" },
      { transform: "translateX(-4px)" },
      { transform: "translateX(0)" },
    ],
    { duration: 420, delay, easing: "ease-out" },
  );
}
