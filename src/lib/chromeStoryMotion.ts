import type { ChromeStage } from "./chromeDemo";

/** Every action finishes before its resulting UI state becomes visible. */
export const CHROME_STAGE_STOPS = [0, 0.14, 0.32, 0.49, 0.66, 0.88] as const;
// The complete demonstration takes 140vh of scrolling. The final 3.1vh releases
// the completed email into the natural-flow title immediately after paste.
export const CHROME_STORY_END = 0.9;
export const CHROME_STORY_HEIGHT_VH = 240;
export const SHOW_CHROME_STEP_NAV = false;

export type ChromeTarget = "reply" | "toolbar" | "talent" | "copy" | "caret";
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
  const p = Number.isFinite(progress) ? clamp(progress) : 0;
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
];

/** Pure scroll interpolation: no timers, accumulated state or CSS transitions. */
export function chromeCursorPose(progress: number, targets: ChromeTargets) {
  if (!Number.isFinite(progress)) return null;
  const p = clamp(progress);
  if (p <= 0 || p >= 0.88) return null;
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
    opacity: clamp(p / 0.012) * (1 - clamp((p - 0.87) / 0.01)),
    press,
  };
}
