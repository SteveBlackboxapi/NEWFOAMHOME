// Six viewport heights of travel, plus the final sticky viewport.
export const KIT_STORY_HEIGHT_VH = 700;
export const KIT_COUNT_SCROLL_VH = 24;
const COUNT_SPAN = KIT_COUNT_SCROLL_VH / (KIT_STORY_HEIGHT_VH - 100);

export const clampProgress = (value: number) =>
  Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
export const progressBetween = (p: number, start: number, end: number) =>
  clampProgress((p - start) / (end - start));
export const smoothProgress = (p: number) => {
  const t = clampProgress(p);
  return t * t * (3 - 2 * t);
};

export type KitRevealStarts = {
  platforms: number;
  metrics: number;
  growth: number;
  audience: number;
};

/** First visible number offsets within the scrolling body, not section/header offsets. */
export type KitRevealLayout = KitRevealStarts & { viewportHeight: number };

// Start early until the real section positions have been measured.
const DEFAULT_REVEAL_STARTS: KitRevealStarts = {
  platforms: 0.08,
  metrics: 0.34,
  growth: 0.43,
  audience: 0.5,
};
const REVEAL_ENDS: KitRevealStarts = {
  platforms: 0.31,
  metrics: 0.49,
  growth: 0.56,
  audience: 0.65,
};

/** Every value is a pure function of scroll position: no playback clocks or one-shot flags. */
export function kitStoryTimeline(
  value: number,
  revealStarts?: Partial<KitRevealStarts>,
) {
  const p = clampProgress(value);
  const reveal = (section: keyof KitRevealStarts) => {
    const latestEnd = REVEAL_ENDS[section];
    const supplied = revealStarts?.[section];
    const start =
      supplied !== undefined && Number.isFinite(supplied)
        ? Math.max(0, Math.min(latestEnd - 0.001, supplied))
        : DEFAULT_REVEAL_STARTS[section];
    const end = Math.min(latestEnd, start + COUNT_SPAN);
    return progressBetween(p, start, end);
  };
  return {
    pack: smoothProgress(progressBetween(p, 0.015, 0.14)),
    platforms: reveal("platforms"),
    metrics: reveal("metrics"),
    growth: reveal("growth"),
    audience: reveal("audience"),
    aimShare: progressBetween(p, 0.655, 0.69),
    shareOpen: progressBetween(p, 0.69, 0.72),
    generated: progressBetween(p, 0.72, 0.755),
    aimCopy: progressBetween(p, 0.755, 0.795),
    copied: progressBetween(p, 0.795, 0.82),
    shareFade: progressBetween(p, 0.84, 0.86),
    publicize: progressBetween(p, 0.84, 0.86),
    kitOut: progressBetween(p, 0.85, 0.89),
    fold: progressBetween(p, 0.88, 0.91),
    planeIn: smoothProgress(progressBetween(p, 0.902, 0.914)),
    planeEmerge: smoothProgress(progressBetween(p, 0.915, 0.95)),
    fly: smoothProgress(progressBetween(p, 0.95, 1)),
    sharedIn: smoothProgress(progressBetween(p, 0.865, 0.895)),
    sharedOut: progressBetween(p, 0.95, 0.985),
    headlineOpacity: 1 - progressBetween(p, 0.015, 0.105),
  };
}

export type KitPanTargets = {
  platforms: number;
  content: number;
  metrics: number;
  growth: number;
  audience: number;
};

/** Measured pan stages include reading holds; counters span both movement and holds. */
export function kitPan(value: number, targets: KitPanTargets) {
  const p = clampProgress(value);
  const segments = [
    [0.19, 0.255, 0, targets.platforms],
    [0.315, 0.39, targets.platforms, targets.content],
    [0.415, 0.475, targets.content, targets.metrics],
    [0.495, 0.54, targets.metrics, targets.growth],
    [0.565, 0.61, targets.growth, targets.audience],
  ];
  let position = 0;
  for (const [start, end, from, to] of segments) {
    if (p < start) break;
    position =
      from + (to - from) * smoothProgress(progressBetween(p, start, end));
  }
  return position;
}

/** Find when each first number approaches the viewport, in the same scroll space as the pan. */
export function kitRevealStarts(
  targets: KitPanTargets,
  layout: KitRevealLayout,
): KitRevealStarts {
  const starts = { ...DEFAULT_REVEAL_STARTS };
  if (!Number.isFinite(layout.viewportHeight) || layout.viewportHeight <= 0)
    return starts;
  for (const section of Object.keys(starts) as (keyof KitRevealStarts)[]) {
    const top = layout[section];
    if (!Number.isFinite(top) || top < 0) continue;
    const visiblePan = Math.max(0, top - layout.viewportHeight);
    if (visiblePan === 0) {
      // The canvas first shows through while the portrait is still shrinking.
      starts[section] = 0.08;
      continue;
    }
    const leadPan = Math.max(0, visiblePan - 70);
    const end = REVEAL_ENDS[section];
    if (
      !Number.isFinite(kitPan(end, targets)) ||
      kitPan(end, targets) < visiblePan
    )
      continue;
    const atPan = (distance: number) => {
      let low = 0.08;
      let high = end;
      for (let step = 0; step < 48; step++) {
        const middle = (low + high) / 2;
        if (kitPan(middle, targets) >= distance) high = middle;
        else low = middle;
      }
      return high;
    };
    // A geometric lead can span a stationary hold. Limit that lead in scroll
    // space too, so these shorter counts are still moving at visible entry.
    starts[section] = Math.min(
      Math.max(atPan(leadPan), atPan(visiblePan) - COUNT_SPAN * 0.35),
      end - 0.001,
    );
  }
  return starts;
}

export const KIT_CHAPTERS = [
  { label: "Profile", progress: 0.16 },
  { label: "Platforms", progress: 0.31 },
  { label: "Content", progress: 0.4 },
  { label: "Performance", progress: 0.49 },
  { label: "Growth", progress: 0.56 },
  { label: "Audience", progress: 0.65 },
  { label: "Share", progress: 0.77 },
];

type KitRect = { left: number; top: number; width: number; height: number };
type KitPoint = { x: number; y: number };

/** The cursor lands on the rendered control, even after a resize or label change. */
export function kitShareCursor(
  stage: KitRect,
  share: KitRect,
  copy: KitRect | null,
  aimShare: number,
  aimCopy: number,
): KitPoint {
  const centre = (rect: KitRect): KitPoint => ({
    x: rect.left - stage.left + rect.width / 2,
    y: rect.top - stage.top + rect.height / 2,
  });
  const sharePoint = centre(share);
  const from =
    aimCopy > 0 ? sharePoint : { x: stage.width * 0.7, y: stage.height * 0.28 };
  const to = aimCopy > 0 && copy ? centre(copy) : sharePoint;
  const progress = clampProgress(aimCopy > 0 ? aimCopy : aimShare);
  return {
    x: from.x + (to.x - from.x) * progress,
    y: from.y + (to.y - from.y) * progress,
  };
}

/** Complete natural-scroll counts in roughly a quarter of a viewport. */
export const kitMobileCountProgress = (progress: number) =>
  clampProgress(clampProgress(progress) * 2.6);

/** Start inside the rendered logo, emerge behind its silhouette, then fly away. */
export function kitPlanePose(
  stage: KitRect,
  logo: KitRect,
  emerge: number,
  flight: number,
) {
  const e = clampProgress(emerge);
  const f = clampProgress(flight);
  const logoX = logo.left - stage.left + logo.width / 2;
  const logoY = logo.top - stage.top + logo.height / 2;
  const launchX = logoX + logo.width * 0.76 * e;
  const launchY = logoY - logo.height * 0.52 * e;
  const launchWidth = logo.width * (0.58 + 0.22 * e);
  const width = launchWidth + (logo.width * 1.1 - launchWidth) * f;
  return {
    x: launchX + (stage.width + width - launchX) * f,
    y:
      launchY +
      (-width - launchY) * f -
      Math.sin(f * Math.PI) * stage.height * 0.08,
    width,
    rotation: -16 + 10 * e + 16 * f,
  };
}
