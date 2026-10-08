/** Multiply by the full recap height plus its gap to keep the first rows below a stationary title. */
export function storyBenefitsEntryShift(reveal: number) {
  const opening = Number.isFinite(reveal) ? Math.max(0, Math.min(1, reveal)) : 0;
  const progress = Math.max(0, Math.min(1, (opening - 0.2) / 0.8));
  const centred = progress * progress * (3 - 2 * progress);
  return opening * (1 - centred) / 2;
}
