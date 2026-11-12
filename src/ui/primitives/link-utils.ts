/** True for absolute URLs pointing at a different origin (opens in a new tab). */
export function isExternalHref(href: string): boolean {
  if (/^(mailto:|tel:)/i.test(href)) return false;
  if (!/^(https?:)?\/\//i.test(href)) return false;
  try {
    return new URL(href, window.location.href).origin !== window.location.origin;
  } catch {
    return true;
  }
}

export const NEW_TAB_HINT = "(otwiera się w nowej karcie)";
