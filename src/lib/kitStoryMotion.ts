// Three and a half viewport heights of travel, plus the final sticky viewport.
export const KIT_STORY_HEIGHT_VH = 450;
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
  metrics: 0.27,
  growth: 0.335,
  audience: 0.4,
};
const REVEAL_ENDS: KitRevealStarts = {
  platforms: 0.22,
  metrics: 0.385,
  growth: 0.455,
  audience: 0.535,
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
    aimShare: progressBetween(p, 0.535, 0.58),
    shareOpen: progressBetween(p, 0.58, 0.62),
    generated: progressBetween(p, 0.62, 0.66),
    aimCopy: progressBetween(p, 0.66, 0.71),
    copied: progressBetween(p, 0.71, 0.75),
    shareFade: progressBetween(p, 0.765, 0.8),
    publicize: progressBetween(p, 0.765, 0.8),
    kitOut: progressBetween(p, 0.78, 0.83),
    fold: progressBetween(p, 0.815, 0.85),
    planeIn: smoothProgress(progressBetween(p, 0.858, 0.87)),
    planeEmerge: smoothProgress(progressBetween(p, 0.872, 0.94)),
    fly: smoothProgress(progressBetween(p, 0.94, 1)),
    sharedIn: smoothProgress(progressBetween(p, 0.815, 0.85)),
    sharedOut: progressBetween(p, 0.94, 0.985),
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

/** Pan stages meet with only a short settling beat; numbers animate during entry. */
export function kitPan(value: number, targets: KitPanTargets) {
  const p = clampProgress(value);
  const segments = [
    [0.15, 0.205, 0, targets.platforms],
    [0.22, 0.3, targets.platforms, targets.content],
    [0.31, 0.375, targets.content, targets.metrics],
    [0.385, 0.445, targets.metrics, targets.growth],
    [0.455, 0.515, targets.growth, targets.audience],
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

export const KIT_JUMP_POINTS = { profile: 0.145, audience: 0.535, share: 0.64 };

export const KIT_CHAPTERS = [
  { label: "Profile", progress: KIT_JUMP_POINTS.profile },
  { label: "Platforms", progress: 0.22 },
  { label: "Content", progress: 0.305 },
  { label: "Performance", progress: 0.385 },
  { label: "Growth", progress: 0.455 },
  { label: "Audience", progress: KIT_JUMP_POINTS.audience },
  { label: "Share", progress: 0.68 },
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

/** Reveal only the part of a featured card inside the clipped kit viewport. */
export function kitFeaturedOpacity(
  pan: number,
  layout: { top: number; height: number; viewportHeight: number } | null,
) {
  if (
    !layout ||
    ![pan, layout.top, layout.height, layout.viewportHeight].every(
      Number.isFinite,
    ) ||
    layout.height <= 0 ||
    layout.viewportHeight <= 0
  )
    return 1;
  const top = layout.top - pan;
  const visible =
    Math.min(layout.viewportHeight, top + layout.height) - Math.max(0, top);
  // A short reveal within the existing movement, complete once the upper part is visible.
  const revealDistance = Math.min(
    96,
    layout.viewportHeight * 0.18,
    layout.height * 0.3,
  );
  return smoothProgress(visible / revealDistance);
}
