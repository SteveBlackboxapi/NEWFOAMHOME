export const FOUND_SEARCH_QUERY = "Everyday makeup and haircare";
const INITIAL_QUERY = "Morning runs outdoors";

const clamp = (value: number) =>
  Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
const between = (value: number, start: number, end: number) =>
  clamp((value - start) / (end - start));
const smooth = (value: number) => value * value * (3 - 2 * value);

/** Search, results and detail are derived only from the current scroll position. */
export function foundStoryTimeline(progress: number) {
  const p = clamp(progress);
  let query = INITIAL_QUERY.slice(
    0,
    Math.floor(INITIAL_QUERY.length * between(p, 0.025, 0.14)),
  );
  if (p >= 0.21) {
    query = INITIAL_QUERY.slice(
      0,
      Math.ceil(INITIAL_QUERY.length * (1 - between(p, 0.21, 0.27))),
    );
  }
  if (p >= 0.28) {
    query = FOUND_SEARCH_QUERY.slice(
      0,
      Math.floor(FOUND_SEARCH_QUERY.length * between(p, 0.28, 0.4)),
    );
  }
  return {
    query,
    zoom: smooth(between(p, 0.43, 0.62)),
    results: smooth(between(p, 0.53, 0.69)),
    highlight: smooth(between(p, 0.7, 0.76)),
    detail: smooth(between(p, 0.78, 0.89)),
    finish: smooth(between(p, 0.9, 0.97)),
  };
}
