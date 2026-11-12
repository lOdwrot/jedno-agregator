import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { loadSnapshot } from "./source";
import type { SnapshotData, SnapshotName } from "./schemas";
import { queryKeys } from "./queryClient";

/** Base hook for reading a snapshot file. Feature hooks wrap this with `select`. */
export function useSnapshot<N extends SnapshotName, T = SnapshotData<N>>(
  name: N,
  options?: Omit<UseQueryOptions<SnapshotData<N>, Error, T>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: queryKeys.snapshot(name),
    queryFn: ({ signal }) => loadSnapshot(name, signal),
    ...options,
  });
}
