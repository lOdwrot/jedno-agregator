import { Link, useLocation } from "react-router";
import { motion } from "motion/react";
import { cn } from "@/lib/cn";
import { Icon } from "@/ui";
import { NAV_ITEMS, isNavActive } from "./nav";

/** Mobile bottom tab bar (hidden from lg), mirrors the Jedno app. */
export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav
      aria-label="Menu główne"
      className="fixed inset-x-0 bottom-0 z-40 rounded-t-3xl border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] shadow-lift backdrop-blur-lg lg:hidden"
    >
      <ul className="mx-auto flex max-w-xl items-stretch justify-around px-1 pt-1.5">
        {NAV_ITEMS.map((item) => {
          const active = isNavActive(pathname, item.to);
          return (
            <li key={item.to} className="min-w-0 flex-1">
              <Link
                to={item.to}
                aria-current={active ? "page" : undefined}
                className="group flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 no-underline"
              >
                <span
                  className={cn(
                    "relative grid h-8 w-14 place-items-center rounded-pill transition-colors",
                    active ? "text-accent-ink" : "text-ink-muted group-hover:text-navy",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="bottom-nav-pill"
                      aria-hidden="true"
                      className="absolute inset-0 rounded-pill bg-accent-soft"
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    />
                  )}
                  <Icon name={item.icon} size={22} className="relative" />
                </span>
                <span
                  className={cn(
                    "max-w-full truncate text-[0.6875rem] leading-tight",
                    active ? "font-extrabold text-accent-ink" : "font-semibold text-ink-muted",
                  )}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
