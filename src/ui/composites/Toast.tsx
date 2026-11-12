import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/cn";
import { Icon } from "../icons";
import { ToastContext, type ToastApi, type ToastOptions } from "./toast-context";

interface Item {
  id: number;
  message: string;
  tone: NonNullable<ToastOptions["tone"]>;
}

/** Provides `useToast()`; renders a polite live region at the bottom of the screen. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const nextId = useRef(1);

  const toast = useCallback<ToastApi["toast"]>((message, options) => {
    const id = nextId.current++;
    setItems((l) => [...l.slice(-2), { id, message, tone: options?.tone ?? "default" }]);
    setTimeout(() => setItems((l) => l.filter((t) => t.id !== id)), options?.duration ?? 4000);
  }, []);
  const api = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4 md:bottom-6"
      >
        <AnimatePresence>
          {items.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 380, damping: 26 }}
              className={cn(
                "pointer-events-auto flex items-center gap-2 rounded-pill px-5 py-3 text-sm font-bold text-white shadow-lift",
                t.tone === "success" ? "bg-success" : t.tone === "danger" ? "bg-danger" : "bg-navy",
              )}
            >
              {t.tone === "success" && <Icon name="check" size={18} />}
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
