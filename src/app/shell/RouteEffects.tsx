import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";

/**
 * On client-side navigation: moves focus to the page's h1 (or main) and announces the new page
 * via a polite live region. Skipped on the initial load.
 */
export function RouteEffects() {
  const { pathname } = useLocation();
  const first = useRef(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    // wait one frame (and a tick) so the new page has rendered its h1
    const t = window.setTimeout(() => {
      const main = document.getElementById("main");
      const target = main?.querySelector<HTMLElement>("h1") ?? main;
      if (target) {
        if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }
      const title = (main?.querySelector("h1")?.textContent ?? document.title).trim();
      setMessage(`Przejście do strony: ${title}`);
    }, 120);
    return () => window.clearTimeout(t);
  }, [pathname]);

  return (
    <div aria-live="polite" role="status" className="sr-only">
      {message}
    </div>
  );
}
