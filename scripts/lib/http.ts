export interface HttpOptions {
  headers?: Record<string, string>;
  retries?: number;
  timeoutMs?: number;
  /** base backoff in ms (doubles each attempt) */
  backoffMs?: number;
}

export class HttpError extends Error {
  constructor(
    message: string,
    readonly status: number | null,
  ) {
    super(message);
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Strips the query string so logs never leak anything sensitive. */
const safeUrl = (url: string) => url.split("?")[0] ?? url;

/** fetch with timeout + retries (network errors, 408, 429, 5xx). 4xx otherwise fails immediately. */
export async function fetchWithRetry(url: string, opts: HttpOptions = {}): Promise<Response> {
  const { headers, retries = 3, timeoutMs = 20_000, backoffMs = 500 } = opts;
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) await sleep(backoffMs * 2 ** (attempt - 1));
    try {
      const res = await fetch(url, { headers, signal: AbortSignal.timeout(timeoutMs) });
      if (res.ok) return res;
      const err = new HttpError(`HTTP ${res.status} for ${safeUrl(url)}`, res.status);
      if (res.status === 408 || res.status === 429 || res.status >= 500) {
        lastError = err;
        continue;
      }
      throw err;
    } catch (e) {
      if (
        e instanceof HttpError &&
        e.status !== null &&
        e.status < 500 &&
        e.status !== 408 &&
        e.status !== 429
      ) {
        throw e;
      }
      lastError = e instanceof Error ? new Error(`${e.message} (${safeUrl(url)})`) : e;
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

export async function getJson<T = unknown>(url: string, opts?: HttpOptions): Promise<T> {
  const res = await fetchWithRetry(url, {
    ...opts,
    headers: { accept: "application/json", ...opts?.headers },
  });
  return (await res.json()) as T;
}

export async function getText(url: string, opts?: HttpOptions): Promise<string> {
  return (await fetchWithRetry(url, opts)).text();
}

/** Runs `fn` over items with at most `limit` in flight; preserves order; rejects on first error. */
export async function mapLimit<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  const worker = async () => {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      results[i] = await fn(items[i] as T, i);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}
