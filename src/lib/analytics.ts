/**
 * Usage statistics with Umami Cloud (free "Hobby" plan). Pageviews (also SPA route changes) are
 * tracked by Umami's script on its own; game events go through `track`. Off unless
 * `VITE_UMAMI_WEBSITE_ID` is set at build time (a public id, not a secret), and the script only
 * reports from the live domain — dev, preview and e2e send nothing.
 *
 * Without consent the counting stays cookieless (Umami hashes IP + browser, salt rotates monthly).
 * With consent (`@/lib/consent`, banner in the app shell) the browser keeps a random id that is
 * sent as Umami's Distinct ID, and `visitor_new` fires exactly once when that id is created — the
 * count of `visitor_new` events is the number of truly unique (consenting) browsers.
 */
import { ensureVisitorId, getConsent, readVisitorId, subscribeConsent } from "./consent";

type EventData = Record<string, string | number | boolean>;

interface Umami {
  track: (name: string, data?: EventData) => void;
  identify?: (id: string) => void;
}

declare global {
  interface Window {
    umami?: Umami;
  }
}

const SCRIPT_URL = "https://cloud.umami.is/script.js";
const LIVE_DOMAIN = "lodwrot.github.io";
export const NEW_VISITOR_EVENT = "visitor_new";

const WEBSITE_ID = import.meta.env.VITE_UMAMI_WEBSITE_ID as string | undefined;

/** True when statistics are built in (the consent banner is only shown then). */
export const analyticsEnabled = (websiteId = WEBSITE_ID) => !!websiteId;

let unsubscribe: (() => void) | null = null;

/** Runs `fn` once Umami's script is ready (immediately if it already is). */
function whenReady(script: HTMLScriptElement, fn: () => void) {
  if (window.umami) fn();
  else script.addEventListener("load", fn, { once: true });
}

function identify(script: HTMLScriptElement) {
  const visitor = ensureVisitorId();
  if (!visitor) return;
  whenReady(script, () => {
    try {
      window.umami?.identify?.(visitor.id);
    } catch {
      /* ignore */
    }
    if (visitor.created) track(NEW_VISITOR_EVENT);
  });
}

export function initAnalytics(websiteId = WEBSITE_ID) {
  if (!websiteId || typeof document === "undefined") return;
  if (document.querySelector(`script[src="${SCRIPT_URL}"]`)) return;
  const s = document.createElement("script");
  s.defer = true;
  s.src = SCRIPT_URL;
  s.dataset.websiteId = websiteId;
  s.dataset.domains = LIVE_DOMAIN;
  // Known visitor: the id goes with every request, the first pageview included.
  const known = getConsent() === "granted" ? readVisitorId() : null;
  if (known) s.dataset.distinctId = known;
  document.head.appendChild(s);
  // Consent kept but the id was lost (storage cleared partly) → a new one, announced as new.
  if (getConsent() === "granted" && !known) identify(s);

  let identified = getConsent() === "granted";
  unsubscribe?.();
  unsubscribe = subscribeConsent(() => {
    const c = getConsent();
    if (c === "granted" && !identified) {
      identified = true;
      identify(s);
    } else if (c === "denied" && identified) {
      // The tracker keeps the id for this page; reload so nothing more is sent with it.
      identified = false;
      window.location.reload();
    }
  });
}

/** Sends one custom event (name ≤ 50 chars). Never throws — statistics must not break the app. */
export function track(name: string, data?: EventData) {
  try {
    window.umami?.track(name, data);
  } catch {
    // ignore: blocked by an ad blocker, script not loaded yet, offline…
  }
}
