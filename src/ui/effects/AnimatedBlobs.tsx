import { cn } from "@/lib/cn";

/** Soft blurred blobs in logo colours drifting slowly. Decorative, CSS-only; static under reduced motion. */
export function AnimatedBlobs({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}
    >
      <span className="absolute -top-24 -left-24 size-96 animate-[ui-blob-a_18s_ease-in-out_infinite] rounded-full bg-logo-orange/30 blur-3xl motion-reduce:animate-none" />
      <span className="absolute top-10 -right-20 size-80 animate-[ui-blob-b_22s_ease-in-out_infinite] rounded-full bg-logo-blue/25 blur-3xl motion-reduce:animate-none" />
      <span className="absolute bottom-0 left-1/3 size-72 animate-[ui-blob-a_26s_ease-in-out_infinite_reverse] rounded-full bg-logo-yellow/30 blur-3xl motion-reduce:animate-none" />
      <span className="absolute right-1/4 -bottom-16 size-64 animate-[ui-blob-b_20s_ease-in-out_infinite] rounded-full bg-logo-red/20 blur-3xl motion-reduce:animate-none" />
    </div>
  );
}
