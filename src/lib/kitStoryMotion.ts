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

export type KitRevealLayout = KitRevealStarts & { viewportHeight: number };

// Start early until the real section positions have been measured.
const DEFAULT_REVEAL_STARTS: KitRevealStarts = {
  platforms: 0.08,
  metrics: 0.34,
  growth: 0.45,
  audience: 0.56,
};
const REVEAL_ENDS: KitRevealStarts = {
  platforms: 0.31,
  metrics: 0.535,
  growth: 0.66,
  audience: 0.78,
};

/** Every value is a pure function of scroll position: no playback clocks or one-shot flags. */
export function kitStoryTimeline(
  value: number,
  revealStarts?: Partial<KitRevealStarts>,
) {
  const p = clampProgress(value);
  const reveal = (section: keyof KitRevealStarts) => {
    const end = REVEAL_ENDS[section];
    const supplied = revealStarts?.[section];
    const start =
      supplied !== undefined && Number.isFinite(supplied)
        ? Math.max(0, Math.min(end - 0.001, supplied))
        : DEFAULT_REVEAL_STARTS[section];
    return progressBetween(p, start, end);
  };
  return {
    pack: smoothProgress(progressBetween(p, 0.015, 0.14)),
    platforms: reveal("platforms"),
    metrics: reveal("metrics"),
    growth: reveal("growth"),
    audience: reveal("audience"),
    aimShare: progressBetween(p, 0.795, 0.825),
    shareOpen: progressBetween(p, 0.825, 0.85),
    generated: progressBetween(p, 0.85, 0.87),
    aimCopy: progressBetween(p, 0.87, 0.895),
    copied: progressBetween(p, 0.895, 0.915),
    shareFade: progressBetween(p, 0.925, 0.94),
    publicize: progressBetween(p, 0.925, 0.94),
    kitOut: progressBetween(p, 0.93, 0.96),
    fold: progressBetween(p, 0.95, 0.98),
    fly: progressBetween(p, 0.97, 1),
    sharedIn: smoothProgress(progressBetween(p, 0.94, 0.96)),
    sharedOut: progressBetween(p, 0.98, 1),
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
    [0.54, 0.585, targets.metrics, targets.growth],
    [0.665, 0.71, targets.growth, targets.audience],
  ];
  let position = 0;
  for (const [start, end, from, to] of segments) {
    if (p < start) break;
    position =
      from + (to - from) * smoothProgress(progressBetween(p, start, end));
  }
  return position;
}

/** Find when each section approaches the viewport, in the same scroll space as the pan. */
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
    const entryPan = Math.max(0, top - layout.viewportHeight - 70);
    if (entryPan === 0) {
      starts[section] = 0.08;
      continue;
    }
    const end = REVEAL_ENDS[section];
    if (!Number.isFinite(kitPan(end, targets)) || kitPan(end, targets) < entryPan)
      continue;
    let low = 0.08;
    let high = end;
    // kitPan is monotonic for measured document sections. Inverting it avoids
    // restarting or flattening a count when the panel settles into a reading hold.
    for (let step = 0; step < 48; step++) {
      const middle = (low + high) / 2;
      if (kitPan(middle, targets) >= entryPan) high = middle;
      else low = middle;
    }
    starts[section] = Math.min(high, end - 0.001);
  }
  return starts;
}

export const KIT_CHAPTERS = [
  { label: "Profile", progress: 0.16 },
  { label: "Platforms", progress: 0.31 },
  { label: "Content", progress: 0.4 },
  { label: "Performance", progress: 0.535 },
  { label: "Growth", progress: 0.66 },
  { label: "Audience", progress: 0.78 },
  { label: "Share", progress: 0.875 },
];
