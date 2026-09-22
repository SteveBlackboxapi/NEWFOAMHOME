export const FOUND_SEARCH_QUERY = "Skincare product reviews";
export const FOUND_SEARCH_LOCK_PROGRESS = 0.025;
export const FOUND_STORY_HEIGHT_VH = 210;
export const FOUND_CAMPAIGN_SCROLL_VH = 38;
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
    zoom: smooth(between(p, FOUND_SEARCH_LOCK_PROGRESS, 0.38)),
    results: smooth(between(p, 0.2, 0.52)),
    highlight: smooth(between(p, 0.52, 0.62)),
    detail: smooth(between(p, 0.62, 0.94)),
  };
}

/** Natural page travel enlarges the complete artwork; its layout box never changes. */
export function foundCampaignScale(
  top: number,
  viewportHeight: number,
  width: number,
  reducedMotion = false,
) {
  if (
    reducedMotion ||
    !Number.isFinite(top) ||
    !Number.isFinite(viewportHeight) ||
    viewportHeight <= 0 ||
    !Number.isFinite(width) ||
    width <= 0
  )
    return 1;
  // Begin at 70% of the earlier, padded/max-width presentation.
  const priorPadding = Math.max(16, Math.min(48, width * 0.03));
  const priorWidth = Math.min(1500, Math.max(1, width - priorPadding * 2));
  const from = (0.7 * priorWidth) / width;
  const reveal = between(
    viewportHeight * 0.85 - top,
    0,
    (viewportHeight * FOUND_CAMPAIGN_SCROLL_VH) / 100,
  );
  return from + (1 - from) * smooth(reveal);
}
