import { createContext, useContext } from "react";

export interface ToastOptions {
  tone?: "default" | "success" | "danger";
  /** ms, default 4000. */
  duration?: number;
}
export interface ToastApi {
  toast: (message: string, options?: ToastOptions) => void;
}

export const ToastContext = createContext<ToastApi | null>(null);

/** Returns `{ toast(message, { tone?, duration? }) }`. Requires `<ToastProvider>`. */
export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
