import { Outlet, ScrollRestoration } from "react-router";

/**
 * App shell. PLACEHOLDER — the shell agent replaces this with
 * Header (logo, nav, notifications bell), BottomNav (mobile), Footer, skip link,
 * route focus management and page transitions.
 */
export function Layout() {
  return (
    <>
      <main id="main">
        <Outlet />
      </main>
      <ScrollRestoration />
    </>
  );
}
