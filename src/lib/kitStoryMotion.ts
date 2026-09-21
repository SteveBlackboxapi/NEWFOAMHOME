export const clampProgress = (value: number) =>
  Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
export const progressBetween = (p: number, start: number, end: number) =>
  clampProgress((p - start) / (end - start));
export const smoothProgress = (p: number) => {
  const t = clampProgress(p);
  return t * t * (3 - 2 * t);
};

/** Every value is a pure function of scroll position: no playback clocks or one-shot flags. */
export function kitStoryTimeline(value: number) {
  const p = clampProgress(value);
  return {
    pack: smoothProgress(progressBetween(p, 0.015, 0.14)),
    platforms: progressBetween(p, 0.255, 0.31),
    metrics: progressBetween(p, 0.475, 0.535),
    growth: progressBetween(p, 0.585, 0.66),
    audience: progressBetween(p, 0.71, 0.78),
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

/** Settle each panel before drawing its data. Targets come from measured layout, not percentages. */
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

export const KIT_CHAPTERS = [
  { label: "Profile", progress: 0.16 },
  { label: "Platforms", progress: 0.31 },
  { label: "Content", progress: 0.4 },
  { label: "Performance", progress: 0.535 },
  { label: "Growth", progress: 0.66 },
  { label: "Audience", progress: 0.78 },
  { label: "Share", progress: 0.875 },
];
