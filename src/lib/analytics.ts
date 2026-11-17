/**
 * Cookieless usage statistics with Umami Cloud (free "Hobby" plan, no cookie banner needed).
 * Pageviews (also SPA route changes) are tracked by Umami's script on its own; game events go
 * through `track`. Off unless `VITE_UMAMI_WEBSITE_ID` is set at build time (a public id, not a
 * secret), and the script only reports from the live domain — dev, preview and e2e send nothing.
 */
type EventData = Record<string, string | number | boolean>;

interface Umami {
  track: (name: string, data?: EventData) => void;
}

declare global {
  interface Window {
    umami?: Umami;
  }
}

const SCRIPT_URL = "https://cloud.umami.is/script.js";
const LIVE_DOMAIN = "lodwrot.github.io";

export function initAnalytics(
  websiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID as string | undefined,
) {
  if (!websiteId || typeof document === "undefined") return;
  if (document.querySelector(`script[src="${SCRIPT_URL}"]`)) return;
  const s = document.createElement("script");
  s.defer = true;
  s.src = SCRIPT_URL;
  s.dataset.websiteId = websiteId;
  s.dataset.domains = LIVE_DOMAIN;
  document.head.appendChild(s);
}

/** Sends one custom event (name ≤ 50 chars). Never throws — statistics must not break the app. */
export function track(name: string, data?: EventData) {
  try {
    window.umami?.track(name, data);
  } catch {
    // ignore: blocked by an ad blocker, script not loaded yet, offline…
  }
}
