import { afterEach, describe, expect, it, vi } from "vitest";
import { isChunkError, loadBoard, resetBoardLoader } from "./loadBoard";

type Mod = Awaited<ReturnType<typeof loadBoard>>;
const mod = {} as Mod;

afterEach(() => {
  resetBoardLoader();
  vi.useRealTimers();
});

describe("loadBoard", () => {
  it("retries a failed chunk fetch", async () => {
    vi.useFakeTimers();
    const load = vi
      .fn<() => Promise<Mod>>()
      .mockRejectedValueOnce(new TypeError("Failed to fetch dynamically imported module"))
      .mockResolvedValue(mod);
    const p = loadBoard(load);
    await vi.runAllTimersAsync();
    await expect(p).resolves.toBe(mod);
    expect(load).toHaveBeenCalledTimes(2);
  });

  it("shares one fetch between callers", async () => {
    const load = vi.fn(() => Promise.resolve(mod));
    await Promise.all([loadBoard(load), loadBoard(load)]);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it("starts over after giving up", async () => {
    const err = new TypeError("Failed to fetch dynamically imported module");
    const bad = vi.fn(() => Promise.reject(err));
    await expect(loadBoard(bad, 0)).rejects.toBe(err);
    const good = vi.fn(() => Promise.resolve(mod));
    await expect(loadBoard(good)).resolves.toBe(mod);
  });
});

describe("isChunkError", () => {
  it("tells code-loading errors from renderer errors", () => {
    expect(isChunkError(new TypeError("Failed to fetch dynamically imported module: x.js"))).toBe(true);
    expect(isChunkError(new TypeError("Importing a module script failed."))).toBe(true);
    expect(isChunkError(new Error("No available renderer for the current environment"))).toBe(false);
  });
});
