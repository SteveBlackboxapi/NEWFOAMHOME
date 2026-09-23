/** Keep the Lab's established compact and mobile column counts. */
export function talentContentColumns(viewportWidth: number, compact: boolean): number {
  if (viewportWidth <= 560) return 2;
  const normal = viewportWidth <= 1100 ? 2 : viewportWidth >= 1900 ? 5 : viewportWidth >= 1500 ? 4 : 3;
  return normal + (compact ? 1 : 0);
}

/** Fill the visual first row before placing the next card underneath it. */
export function distributeTalentContent<T>(items: T[], count: number) {
  const columns: { item: T; position: number }[][] = Array.from({ length: count }, () => []);
  items.forEach((item, position) => columns[position % count].push({ item, position }));
  return columns;
}
