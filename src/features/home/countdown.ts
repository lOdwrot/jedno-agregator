/** Polish plural for "dzień": 1 dzień, 2 dni, 5 dni. */
function dni(n: number): string {
  return n === 1 ? "dzień" : "dni";
}

/**
 * Human countdown to `targetMs` from `nowMs`, e.g. "Za 1 dzień 4 godz.", "Za 3 godz. 20 min",
 * "Za 12 min", "Trwa teraz" when already started.
 */
export function formatCountdown(targetMs: number, nowMs: number): string {
  const diff = targetMs - nowMs;
  if (diff <= 0) return "Trwa teraz";
  const totalMin = Math.floor(diff / 60_000);
  const days = Math.floor(totalMin / 1440);
  const hours = Math.floor((totalMin % 1440) / 60);
  const mins = totalMin % 60;
  if (days > 0)
    return hours > 0 ? `Za ${days} ${dni(days)} ${hours} godz.` : `Za ${days} ${dni(days)}`;
  if (hours > 0) return mins > 0 ? `Za ${hours} godz. ${mins} min` : `Za ${hours} godz.`;
  return `Za ${Math.max(1, mins)} min`;
}
