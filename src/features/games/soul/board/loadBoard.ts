/**
 * Lazy loader of the Pixi board. The chunk is fetched once and shared; a failed fetch (flaky network,
 * or a deploy that removed the old hashed file while the tab stayed open) is retried, and the next
 * call starts over instead of reusing the rejected promise.
 */
type BoardModule = typeof import("./BoardRenderer");

let pending: Promise<BoardModule> | null = null;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function loadBoard(
  load: () => Promise<BoardModule> = () => import("./BoardRenderer"),
  retries = 2,
): Promise<BoardModule> {
  pending ??= (async () => {
    for (let i = 0; ; i++) {
      try {
        return await load();
      } catch (e) {
        if (i >= retries) throw e;
        await wait(400 * (i + 1));
      }
    }
  })().catch((e: unknown) => {
    pending = null;
    throw e;
  });
  return pending;
}

/** Starts fetching the board in the background (e.g. while the player is still in the hub). */
export function preloadBoard() {
  loadBoard().catch(() => undefined);
}

/** Error thrown while fetching code (not by the renderer itself). */
export function isChunkError(e: unknown) {
  return (
    e instanceof Error &&
    /dynamically imported module|module script|Importing a module|Failed to fetch|error loading/i.test(
      e.message,
    )
  );
}

/** Test hook. */
export function resetBoardLoader() {
  pending = null;
}
