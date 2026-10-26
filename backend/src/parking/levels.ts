/** Top to bottom of a building: F2, F1, G, B1, B2. Unknown names go last. */
export function levelHeight(level: string): number {
  if (level === 'G') return 0;
  const match = /^([BF])(\d+)$/.exec(level);
  if (!match) return Number.NEGATIVE_INFINITY;
  const floor = Number(match[2]);
  return match[1] === 'F' ? floor : -floor;
}

export function compareLevels(a: string, b: string): number {
  return levelHeight(b) - levelHeight(a) || a.localeCompare(b);
}
