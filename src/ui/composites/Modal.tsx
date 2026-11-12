import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "../icons";
import { IconButton } from "../primitives/IconButton";

let lockCount = 0;
function lockScroll() {
  if (lockCount++ === 0) document.body.style.overflow = "hidden";
}
function unlockScroll() {
  if (--lockCount <= 0) {
    lockCount = 0;
    document.body.style.overflow = "";
  }
}

export interface ModalBaseProps {
  open: boolean;
  onClose: () => void;
  /** Visible heading; also the accessible name (aria-labelledby). */
  title: string;
  /** Visually hide the title but keep it as the accessible name. */
  hideTitle?: boolean;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
}

interface Props extends ModalBaseProps {
  kind: "dialog" | "sheet";
  side?: "right" | "left";
  panelClassName?: string;
}

/** Shared native-<dialog> implementation: focus trap, Esc, scroll lock, focus restore, animated exit. */
export function Modal({
  open,
  onClose,
  title,
  hideTitle,
  description,
  children,
  className,
  kind,
  side = "right",
  panelClassName,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);
  const titleId = useId();
  const descId = useId();

  if (open && !mounted) setMounted(true);
  if (open && closing) setClosing(false);
  if (!open && mounted && !closing) setClosing(true);

  useEffect(() => {
    if (!mounted || !open) return;
    const el = ref.current;
    if (!el) return;
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (typeof el.showModal === "function") {
      if (!el.open) el.showModal();
    } else el.setAttribute("open", "");
    if (!el.contains(document.activeElement)) {
      el.querySelector<HTMLElement>(
        '[autofocus], a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )?.focus();
    }
    lockScroll();
    return () => unlockScroll();
  }, [mounted, open]);

  useEffect(() => {
    if (!closing) return;
    const t = setTimeout(() => {
      const el = ref.current;
      if (el?.open && typeof el.close === "function") el.close();
      else el?.removeAttribute("open");
      setMounted(false);
      setClosing(false);
      opener.current?.focus?.();
    }, 220);
    return () => clearTimeout(t);
  }, [closing]);

  if (!mounted) return null;
  const state = open ? "open" : "closed";

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={ref}
      data-state={state}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          onClose();
        }
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.backdrop) onClose();
      }}
      className={cn(
        "ui-modal fixed inset-0 m-0 h-full max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-navy/55 backdrop:backdrop-blur-sm",
        className,
      )}
    >
      <div
        data-backdrop="1"
        className={cn(
          "flex h-full w-full",
          kind === "dialog"
            ? "items-end justify-center p-0 sm:items-center sm:p-6"
            : cn(
                "items-end justify-center md:items-stretch",
                side === "right" ? "md:justify-end" : "md:justify-start",
              ),
        )}
      >
        <div
          data-state={state}
          data-side={side}
          className={cn(
            "relative flex max-h-full w-full flex-col bg-surface shadow-lift",
            kind === "dialog"
              ? "ui-panel-dialog rounded-t-3xl sm:rounded-card"
              : "ui-panel-sheet max-h-[90dvh] rounded-t-3xl md:max-h-full md:max-w-md md:rounded-none md:rounded-l-3xl",
            panelClassName,
          )}
        >
          {kind === "sheet" && (
            <span
              aria-hidden="true"
              className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-[#D2D9DF] md:hidden"
            />
          )}
          <header
            className={cn(
              "flex items-start justify-between gap-4 px-5 pt-4 pb-2 sm:px-6",
              hideTitle && "absolute top-2 right-2 z-10 p-0",
            )}
          >
            <h2
              id={titleId}
              className={cn(
                "font-display text-xl font-extrabold text-navy",
                hideTitle && "sr-only",
              )}
            >
              {title}
            </h2>
            <IconButton label="Zamknij" variant="soft" onClick={onClose} className="-mt-1 -mr-2">
              <Icon name="close" />
            </IconButton>
          </header>
          {description && (
            <p id={descId} className="px-5 text-sm text-ink-muted sm:px-6">
              {description}
            </p>
          )}
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-3 pb-6 sm:px-6">{children}</div>
        </div>
      </div>
    </dialog>
  );
}
