import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "../icons";
import { Button } from "../primitives/Button";
import { Heading, Text } from "../primitives/Typography";
import { Spinner } from "../primitives/Spinner";

export interface EmptyStateProps {
  title: string;
  description?: ReactNode;
  icon?: IconName;
  /** Optional action, e.g. a Button "Wyczyść filtry". */
  action?: ReactNode;
  className?: string;
}

/** "Nothing here" placeholder. */
export function EmptyState({
  title,
  description,
  icon = "search",
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-card bg-surface px-6 py-14 text-center shadow-card",
        className,
      )}
    >
      <span className="grid size-16 place-items-center rounded-full bg-accent-soft text-accent-ink">
        <Icon name={icon} size={30} />
      </span>
      <Heading level={2} size="md">
        {title}
      </Heading>
      {description && <Text className="max-w-md text-ink-muted">{description}</Text>}
      {action}
    </div>
  );
}

export interface ErrorStateProps {
  title?: string;
  message?: ReactNode;
  /** Shows the "Spróbuj ponownie" button when provided. */
  onRetry?: () => void;
  className?: string;
}

/** Error panel with retry (role=alert). */
export function ErrorState({
  title = "Coś poszło nie tak",
  message = "Nie udało się pobrać danych.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center gap-3 rounded-card bg-surface px-6 py-14 text-center shadow-card",
        className,
      )}
    >
      <span className="grid size-16 place-items-center rounded-full bg-danger/10 text-danger">
        <Icon name="info" size={30} />
      </span>
      <Heading level={2} size="md">
        {title}
      </Heading>
      <Text className="max-w-md text-ink-muted">{message}</Text>
      {onRetry && (
        <Button variant="navy" onClick={onRetry} className="mt-2">
          Spróbuj ponownie
        </Button>
      )}
    </div>
  );
}

export interface LoadingStateProps {
  /** Announced text, default "Ładowanie…". */
  label?: string;
  className?: string;
  /** Optional skeleton content rendered visually (aria-hidden by Skeleton). */
  children?: ReactNode;
}

/** Polite live region announcing loading, with a spinner or custom skeletons. */
export function LoadingState({ label = "Ładowanie…", className, children }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        !children && "flex items-center justify-center gap-3 py-16 text-ink-muted",
        className,
      )}
    >
      {children ?? <Spinner className="size-6 text-accent" />}
      <span className={children ? "sr-only" : "font-semibold"}>{label}</span>
    </div>
  );
}
