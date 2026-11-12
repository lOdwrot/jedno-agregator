import { Link, useLocation } from "react-router";
import { cn } from "@/lib/cn";
import { paths } from "@/app/routes";
import { useInfos } from "@/features/infos/api";
import { Icon, Sheet } from "@/ui";
import { NAV_ITEMS, isNavActive } from "./nav";

const linkClass =
  "flex min-h-12 items-center gap-3 rounded-card px-3 text-base font-bold no-underline transition-colors";

/** Hamburger sheet (mobile): navigation + info pages. */
export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { pathname } = useLocation();
  const infos = useInfos();
  return (
    <Sheet open={open} onClose={onClose} title="Menu" side="left">
      <nav aria-label="Menu">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = isNavActive(pathname, item.to);
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={onClose}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    linkClass,
                    active ? "bg-accent-soft text-accent-ink" : "text-navy hover:bg-surface-muted",
                  )}
                >
                  <Icon name={item.icon} size={22} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
        {infos.data && infos.data.length > 0 && (
          <>
            <p className="mt-5 mb-1 px-3 text-xs font-bold tracking-wider text-ink-muted uppercase">
              Informacje
            </p>
            <ul className="flex flex-col gap-1">
              {infos.data.map((info) => (
                <li key={info.id}>
                  <Link
                    to={paths.info(info.slug)}
                    onClick={onClose}
                    aria-current={pathname === paths.info(info.slug) ? "page" : undefined}
                    className={cn(linkClass, "font-semibold text-ink hover:bg-surface-muted")}
                  >
                    <Icon name="info" size={22} />
                    {info.title}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </nav>
    </Sheet>
  );
}
