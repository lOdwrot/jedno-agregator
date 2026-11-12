/**
 * The single place the browser loads data from.
 * Features must not call fetch() themselves — use `loadSnapshot` inside their React Query hooks
 * (see `src/features/<feature>/api.ts`).
 */
import { SnapshotFiles, type SnapshotData, type SnapshotName } from "./schemas";

const DATA_BASE = `${import.meta.env.BASE_URL}data/`;

export class SnapshotError extends Error {}

export async function loadSnapshot<N extends SnapshotName>(
  name: N,
  signal?: AbortSignal,
): Promise<SnapshotData<N>> {
  const res = await fetch(`${DATA_BASE}${name}.json`, { signal, cache: "no-cache" });
  if (!res.ok) throw new SnapshotError(`Nie udało się pobrać danych (${name}): ${res.status}`);
  const json: unknown = await res.json();
  const parsed = SnapshotFiles[name].safeParse(json);
  if (!parsed.success) {
    if (import.meta.env.DEV) console.error(`Invalid snapshot ${name}`, parsed.error);
    throw new SnapshotError(`Niepoprawny format danych (${name})`);
  }
  return parsed.data as SnapshotData<N>;
}
