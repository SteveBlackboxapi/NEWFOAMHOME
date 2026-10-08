const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => {
  const progress = clamp(value);
  return progress * progress * (3 - 2 * progress);
};

/** Each row opens its full height, writes its label, then draws its tick before the next row starts. */
export function storyBenefitsSequenceAt(reveal: number, count: number) {
  if (!Number.isSafeInteger(count) || count <= 0) return { space: 0, rows: [] };
  const opening = Number.isFinite(reveal) ? clamp(reveal) : 0;
  const rows = Array.from({ length: count }, (_, index) => {
    const phase = opening * count - index;
    return {
      space: smooth(phase / 0.2),
      text: smooth((phase - 0.2) / (0.72 - 0.2)),
      tick: smooth((phase - 0.72) / (1 - 0.72)),
    };
  });
  return { space: rows.reduce((sum, row) => sum + row.space, 0) / count, rows };
}

/** Offset flex centring so the core holds initially, then reaches the centred expanded composition. */
export function storyBenefitsEntryShift(reveal: number) {
  const opening = Number.isFinite(reveal) ? clamp(reveal) : 0;
  const centred = smooth((opening - 0.2) / 0.8);
  return opening * (1 - centred) / 2;
}
