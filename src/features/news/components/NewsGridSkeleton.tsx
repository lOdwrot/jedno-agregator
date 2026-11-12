import { LoadingState, SkeletonCard } from "@/ui";

export function NewsGridSkeleton() {
  return (
    <LoadingState label="Ładowanie aktualności…">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </LoadingState>
  );
}
