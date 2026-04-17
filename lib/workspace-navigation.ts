const MIN_WEEK_OFFSET = -8;
const MAX_WEEK_OFFSET = 8;

export function parseWeekOffset(input: string | string[] | undefined) {
  const raw = Array.isArray(input) ? input[0] : input;
  const parsed = Number.parseInt(raw ?? "0", 10);

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.min(MAX_WEEK_OFFSET, Math.max(MIN_WEEK_OFFSET, parsed));
}

export function clampWeekOffset(value: number) {
  return Math.min(MAX_WEEK_OFFSET, Math.max(MIN_WEEK_OFFSET, value));
}
