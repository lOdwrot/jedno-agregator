/**
 * Holographic frame of a stained print: rainbow bands and a bright glint that slide across the
 * frame. Idle they drift slowly; in the album's 3D view they follow the card's tilt
 * (`--tilt-x` / `--tilt-y` set by `TiltCard`), so the frame shimmers while you turn the card.
 * Lies under the card's <article>; only the frame strip around it shows.
 */
export function HoloFrame() {
  return (
    <span aria-hidden="true" className="soul-holo-frame">
      <span className="soul-holo-frame__drift" />
    </span>
  );
}
