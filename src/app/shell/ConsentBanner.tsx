import { useEffect, useRef } from "react";
import { analyticsEnabled } from "@/lib/analytics";
import { resetConsent, setConsent, useConsent } from "@/lib/consent";
import { Button } from "@/ui";

/** Set by the footer's "Ustawienia statystyk" so the reopened banner takes the focus. */
let focusOnOpen = false;

export function reopenConsent() {
  focusOnOpen = true;
  resetConsent();
}

/**
 * Asks once for the persistent statistics id (see `@/lib/consent`). Not modal: the page stays
 * usable. Both answers are stored and the banner never comes back on its own; the footer link
 * reopens it to change the decision.
 */
export function ConsentBanner({ enabled = analyticsEnabled() }: { enabled?: boolean }) {
  const consent = useConsent();
  const heading = useRef<HTMLHeadingElement>(null);
  const open = enabled && consent === null;

  useEffect(() => {
    if (open && focusOnOpen) {
      focusOnOpen = false;
      heading.current?.focus();
    }
  }, [open]);

  if (!open) return null;
  return (
    <section
      aria-labelledby="consent-title"
      className="fixed inset-x-3 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-[70] mx-auto max-w-2xl rounded-card border border-navy/10 bg-surface p-4 text-ink shadow-lift sm:p-5 lg:bottom-6"
    >
      <h2
        id="consent-title"
        ref={heading}
        tabIndex={-1}
        className="font-display text-lg font-bold outline-none"
      >
        Czy możemy policzyć Cię tylko raz?
      </h2>
      <p className="mt-2 text-sm">
        Odwiedziny liczymy anonimowo i bez plików cookie (Umami). Za Twoją zgodą zapiszemy w tej
        przeglądarce losowy identyfikator i dołączymy go do statystyk — wtedy wiemy, ile osób
        naprawdę korzysta ze strony i gier, a nie ile było wejść. Nie wiemy, kim jesteś, nie
        używamy go do reklam ani nie przekazujemy nikomu poza Umami. Zgodę możesz wycofać w każdej
        chwili w stopce („Ustawienia statystyk”) — identyfikator zostanie wtedy usunięty.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button variant="navy" size="sm" onClick={() => setConsent("granted")}>
          Zgadzam się
        </Button>
        <Button variant="navy" size="sm" onClick={() => setConsent("denied")}>
          Nie zgadzam się
        </Button>
      </div>
    </section>
  );
}
