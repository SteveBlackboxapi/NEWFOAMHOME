/** Keep the recap open until its sticky stage has travelled upward, then fold it away. */
export function storyBenefitsCollapseAt(stageTop: number, viewportHeight: number) {
  if (!Number.isFinite(stageTop) || !Number.isFinite(viewportHeight) || viewportHeight <= 0)
    return 0;
  const travel = -stageTop / viewportHeight;
  const progress = Math.max(0, Math.min(1, (travel - 0.02) / 0.23));
  return progress * progress * (3 - 2 * progress);
}
