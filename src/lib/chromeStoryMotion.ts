import type { ChromeStage } from "./chromeDemo";

/** Every action finishes before its resulting UI state becomes visible. */
export const CHROME_STAGE_STOPS = [
  0, 0.14, 0.32, 0.49, 0.66, 0.88, 1.02,
] as const;
// Preserve the inbox workflow’s pace, then give Send and the flight one compact
// beat. The Chrome lockup finishes inside the pin, so there is no second finale.
export const CHROME_STORY_END = 1.38;
export const CHROME_STORY_HEIGHT_VH = 315;
export const SHOW_CHROME_STEP_NAV = false;

export type ChromeTarget =
  "reply" | "toolbar" | "talent" | "copy" | "caret" | "send";
export type ChromePoint = { x: number; y: number };
export type ChromeTargets = Partial<Record<ChromeTarget, ChromePoint>>;

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const smooth = (value: number) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

/** Grow during the section's natural entrance, before the pinned demo begins. */
export function chromeEntryScale(top: number, viewportHeight: number) {
  if (
    !Number.isFinite(top) ||
    !Number.isFinite(viewportHeight) ||
    viewportHeight <= 0
  )
    return 1;
  return 0.7 + 0.3 * smooth(1 - top / (viewportHeight * 0.65));
}

export function chromeStageAt(progress: number): ChromeStage {
  const p = Number.isFinite(progress)
    ? Math.max(0, Math.min(CHROME_STORY_END, progress))
    : 0;
  return CHROME_STAGE_STOPS.reduce<ChromeStage>(
    (stage, stop, index) => (p >= stop ? (index as ChromeStage) : stage),
    0,
  );
}

const MOVES: {
  start: number;
  end: number;
  from: ChromeTarget;
  to: ChromeTarget;
}[] = [
  { start: 0, end: 0.12, from: "reply", to: "reply" },
  { start: 0.14, end: 0.3, from: "reply", to: "toolbar" },
  { start: 0.32, end: 0.47, from: "toolbar", to: "talent" },
  { start: 0.49, end: 0.64, from: "talent", to: "copy" },
  { start: 0.66, end: 0.86, from: "copy", to: "caret" },
  { start: 0.88, end: 1, from: "caret", to: "send" },
];

/** Pure scroll interpolation: no timers, accumulated state or CSS transitions. */
export function chromeCursorPose(progress: number, targets: ChromeTargets) {
  if (!Number.isFinite(progress)) return null;
  const p = progress;
  if (p <= 0 || p >= 1.02) return null;
  const move = MOVES.reduce(
    (current, next) => (p >= next.start ? next : current),
    MOVES[0],
  );
  const from = targets[move.from];
  const to = targets[move.to];
  // Until the real DOM targets have been measured, don't guess a cursor position.
  if (!from || !to) return null;
  const t = smooth((p - move.start) / (move.end - move.start));
  const initialOffset = move === MOVES[0] ? 1 - t : 0;
  const press = CHROME_STAGE_STOPS.slice(1).reduce<number>(
    (strongest, stop) => {
      const click = clamp(1 - Math.abs(p - (stop - 0.01)) / 0.01);
      return Math.max(strongest, click);
    },
    0,
  );
  return {
    x: from.x + (to.x - from.x) * t + initialOffset * 75,
    y: from.y + (to.y - from.y) * t + initialOffset * 24,
    opacity: clamp(p / 0.012) * (1 - clamp((p - 1.01) / 0.01)),
    press,
  };
}

/** The whole desktop departs together while the plane and store stay above it. */
export function chromeSendoffAt(progress: number) {
  const p = Number.isFinite(progress) ? progress : 0;
  const depart = smooth((p - 1.045) / 0.135);
  const reveal = smooth((p - 1.12) / 0.16);
  return {
    desktopOpacity: 1 - depart,
    finaleOpacity: reveal,
    finaleOffset: (1 - reveal) * 18,
    finaleInteractive: reveal === 1,
  };
}

export type ChromeFlightGeometry = {
  start: ChromePoint;
  width: number;
  height: number;
};

/** A measured launch from Send, a rising arc, then departure beyond the viewport. */
export function chromePlanePose(
  progress: number,
  geometry: ChromeFlightGeometry | null,
) {
  if (
    !Number.isFinite(progress) ||
    !geometry ||
    progress <= 1.02 ||
    progress >= 1.36
  )
    return null;
  const { start, width, height } = geometry;
  if (
    ![start.x, start.y, width, height].every(Number.isFinite) ||
    width <= 0 ||
    height <= 0
  )
    return null;
  const t = clamp((progress - 1.02) / 0.32);
  const u = 1 - t;
  const size = Math.max(128, Math.min(240, width * 0.13));
  const control1 = { x: start.x + width * 0.24, y: start.y - height * 0.08 };
  const control2 = { x: width * 0.7, y: height * 0.08 };
  const end = { x: width + size, y: -size };
  const axis = (key: "x" | "y") =>
    u ** 3 * start[key] +
    3 * u ** 2 * t * control1[key] +
    3 * u * t ** 2 * control2[key] +
    t ** 3 * end[key];
  const tangent = (key: "x" | "y") =>
    3 * u ** 2 * (control1[key] - start[key]) +
    6 * u * t * (control2[key] - control1[key]) +
    3 * t ** 2 * (end[key] - control2[key]);
  return {
    x: axis("x"),
    y: axis("y"),
    width: size,
    rotation: (Math.atan2(tangent("y"), tangent("x")) * 180) / Math.PI + 16,
    scale: 0.22 + 0.78 * smooth(t / 0.35),
    opacity:
      smooth((progress - 1.02) / 0.035) *
      (1 - smooth((progress - 1.32) / 0.04)),
  };
}
