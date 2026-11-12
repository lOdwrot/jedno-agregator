import { cn } from "@/lib/cn";

export function Divider({ className, vertical }: { className?: string; vertical?: boolean }) {
  return (
    <hr
      aria-orientation={vertical ? "vertical" : undefined}
      className={cn(vertical ? "h-full w-px border-0 bg-line" : "h-px w-full border-0 bg-line", className)}
    />
  );
}
