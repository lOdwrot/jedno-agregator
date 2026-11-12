import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Snapshots change at most every ~30 min.
      staleTime: 5 * 60 * 1000,
      gcTime: 60 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: true,
    },
  },
});

/** Query keys — one per snapshot file. Features derive filtered views client-side. */
export const queryKeys = {
  snapshot: (name: string) => ["snapshot", name] as const,
};
