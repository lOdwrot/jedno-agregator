import { useState } from "react";
import { Link, useLocation } from "react-router";
import { motion } from "motion/react";
import { cn } from "@/lib/cn";
import { paths } from "@/app/routes";
import { NotificationsBell } from "@/features/notifications/components/NotificationsBell";
import { Icon, IconButton, JednoLogo } from "@/ui";
import { NAV_ITEMS, isNavActive } from "./nav";
import { MobileMenu } from "./MobileMenu";
import { useScrollState } from "./useScrollState";

/** Sticky header: logo (centered on mobile like the app), desktop nav with sliding indicator, bell. */
export function Header() {
  const { pathname } = useLocation();
  const { scrolled, compact } = useScrollState();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-[background-color,box-shadow,border-color] duration-300",
        scrolled
          ? "border-line bg-surface/85 shadow-card backdrop-blur-lg supports-[not(backdrop-filter:blur(1px))]:bg-surface"
          : "border-transparent bg-surface",
      )}
    >
      <div
        className={cn(
          "mx-auto grid w-full max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 transition-[height] duration-300 sm:px-6 lg:flex lg:gap-8 lg:px-8",
          compact ? "h-14" : "h-16",
        )}
      >
        <div className="flex justify-start lg:hidden">
          <IconButton label="Otwórz menu" variant="ghost" onClick={() => setMenuOpen(true)}>
            <Icon name="menu" size={24} />
          </IconButton>
        </div>

        <Link
          to={paths.home}
          aria-label="Jedno — strona główna"
          className="flex min-h-11 items-center rounded-lg lg:order-first"
        >
          <JednoLogo size={compact ? 30 : 36} className="transition-[transform] duration-300" />
        </Link>

        <nav aria-label="Główna nawigacja" className="hidden flex-1 justify-center lg:flex">
          <ul className="flex items-center gap-1 rounded-pill bg-surface-muted p-1">
            {NAV_ITEMS.map((item) => {
              const active = isNavActive(pathname, item.to);
              return (
                <li key={item.to} className="relative">
                  <Link
                    to={item.to}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative z-10 flex min-h-11 items-center rounded-pill px-4 text-sm font-bold no-underline transition-colors",
                      active ? "text-navy" : "text-ink-muted hover:text-navy",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="header-nav-indicator"
                        aria-hidden="true"
                        className="absolute inset-0 -z-10 rounded-pill bg-surface shadow-card"
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      />
                    )}
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex justify-end">
          <NotificationsBell />
        </div>
      </div>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}
