import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { SnapshotFiles, type SnapshotData, type SnapshotName } from "../../src/data/schemas.ts";
import { fetchWithRetry } from "./http.ts";

export const DATA_DIR = join(process.cwd(), "public", "data");
export const REMOTE_BASE = process.env.SNAPSHOT_REMOTE_BASE ?? "https://lodwrot.github.io/jedno-agregator/data";

function validate<N extends SnapshotName>(name: N, json: unknown): SnapshotData<N> | null {
  const parsed = SnapshotFiles[name].safeParse(json);
  return parsed.success ? (parsed.data as SnapshotData<N>) : null;
}

/** Previous snapshot: local file first, then the published site (unless offline). null when unavailable/invalid. */
export async function readPrevious<N extends SnapshotName>(
  name: N,
  opts: { offline?: boolean; dir?: string } = {},
): Promise<{ data: SnapshotData<N>; origin: "local" | "remote" } | null> {
  const file = join(opts.dir ?? DATA_DIR, `${name}.json`);
  if (existsSync(file)) {
    try {
      const data = validate(name, JSON.parse(await readFile(file, "utf8")));
      if (data !== null) return { data, origin: "local" };
    } catch {
      /* fall through to remote */
    }
  }
  if (opts.offline) return null;
  try {
    const res = await fetchWithRetry(`${REMOTE_BASE}/${name}.json`, { retries: 1, timeoutMs: 15_000 });
    const data = validate(name, await res.json());
    return data !== null ? { data, origin: "remote" } : null;
  } catch {
    return null; // 404 on first deploy, offline, etc.
  }
}

export async function writeSnapshot<N extends SnapshotName>(name: N, data: SnapshotData<N>, dir = DATA_DIR): Promise<void> {
  const checked = SnapshotFiles[name].parse(data);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, `${name}.json`), JSON.stringify(checked, null, 2) + "\n", "utf8");
}
