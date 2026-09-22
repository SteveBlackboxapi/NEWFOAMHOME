export const FOUND_SEARCH_QUERY = "Everyday makeup and haircare";
export const FOUND_SEARCH_LOCK_PROGRESS = 0.025;
export const FOUND_SEARCH_EXAMPLES = [
  "Morning runs outdoors",
  FOUND_SEARCH_QUERY,
];
const TYPE_MS = 65;
const HOLD_MS = 1500;
const ERASE_MS = 30;
const GAP_MS = 400;
export const FOUND_SEARCH_CYCLE_MS = FOUND_SEARCH_EXAMPLES.reduce(
  (total, text) =>
    total + text.length * (TYPE_MS + ERASE_MS) + HOLD_MS + GAP_MS,
  0,
);

/** Elapsed visible time drives only the opening examples, never the camera. */
export function foundSearchExample(elapsedMs: number) {
  let time =
    (Number.isFinite(elapsedMs) ? Math.max(0, elapsedMs) : 0) %
    FOUND_SEARCH_CYCLE_MS;
  for (const text of FOUND_SEARCH_EXAMPLES) {
    const typing = text.length * TYPE_MS;
    const erasing = text.length * ERASE_MS;
    if (time < typing) return text.slice(0, Math.floor(time / TYPE_MS));
    time -= typing;
    if (time < HOLD_MS) return text;
    time -= HOLD_MS;
    if (time < erasing)
      return text.slice(0, Math.ceil(text.length - time / ERASE_MS));
    time -= erasing;
    if (time < GAP_MS) return "";
    time -= GAP_MS;
  }
  return "";
}

const clamp = (value: number) =>
  Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
const between = (value: number, start: number, end: number) =>
  clamp((value - start) / (end - start));
const smooth = (value: number) => value * value * (3 - 2 * value);

/** Scrolling selects the final query; all visual beats remain reversible. */
export function foundStoryTimeline(progress: number) {
  const p = clamp(progress);
  return {
    query: p >= FOUND_SEARCH_LOCK_PROGRESS ? FOUND_SEARCH_QUERY : "",
    zoom: smooth(between(p, 0.05, 0.38)),
    results: smooth(between(p, 0.22, 0.5)),
    highlight: smooth(between(p, 0.52, 0.62)),
    detail: smooth(between(p, 0.66, 0.85)),
    finish: smooth(between(p, 0.88, 0.98)),
  };
}
