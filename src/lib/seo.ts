import { useEffect } from "react";

export const SITE_NAME = "Jedno";
export const HOME_TITLE = "Jedno — Archidiecezja Gdańska";

/** Sets document.title to "{title} · Jedno"; without a title uses the home title. */
export function usePageTitle(title?: string): void {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE_NAME}` : HOME_TITLE;
  }, [title]);
}

/** Sets <meta name="description">; restores the previous value on unmount. */
export function useMetaDescription(description?: string): void {
  useEffect(() => {
    if (!description) return;
    let el = document.head.querySelector<HTMLMetaElement>('meta[name="description"]');
    const created = !el;
    if (!el) {
      el = document.createElement("meta");
      el.name = "description";
      document.head.appendChild(el);
    }
    const previous = el.content;
    el.content = description;
    return () => {
      if (!el) return;
      if (created) el.remove();
      else el.content = previous;
    };
  }, [description]);
}
