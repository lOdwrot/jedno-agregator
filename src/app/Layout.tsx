import { Outlet, ScrollRestoration, useLocation } from "react-router";
import { motion } from "motion/react";
import { BottomNav } from "./shell/BottomNav";
import { Footer } from "./shell/Footer";
import { Header } from "./shell/Header";
import { RouteEffects } from "./shell/RouteEffects";

/** App shell: skip link, header, animated main, footer, mobile bottom nav. */
export function Layout() {
  const { pathname } = useLocation();
  return (
    <div className="flex min-h-dvh flex-col pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:pb-0">
      <a
        href="#main"
        className="sr-only z-50 rounded-pill bg-navy px-5 py-3 font-bold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        onClick={(e) => {
          // hash links would be intercepted by the router base path; focus manually
          e.preventDefault();
          const main = document.getElementById("main");
          main?.focus();
          main?.scrollIntoView();
        }}
      >
        Przejdź do treści
      </a>
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        >
          <Outlet />
        </motion.div>
      </main>
      <Footer />
      <BottomNav />
      <RouteEffects />
      <ScrollRestoration />
    </div>
  );
}
