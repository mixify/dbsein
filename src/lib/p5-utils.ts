/**
 * Calculate appropriate object count based on container area and object size.
 * Ensures consistent density across different screen sizes.
 *
 * @param containerW - container width
 * @param containerH - container height
 * @param objSize - approximate size of each object (diameter or side length)
 * @param density - how much of the area to fill (0.0 ~ 1.0, default 0.05 = 5%)
 * @param min - minimum count
 * @param max - maximum count
 */
export function spawnCount(
  containerW: number,
  containerH: number,
  objSize: number,
  density = 0.05,
  min = 1,
  max = 200
): number {
  const area = containerW * containerH;
  const objArea = objSize * objSize;
  const count = Math.round((area * density) / objArea);
  return Math.max(min, Math.min(max, count));
}

/**
 * Scale a value relative to a reference container width.
 * Objects stay proportionally sized across screen sizes.
 *
 * @param value - size at reference width
 * @param containerW - current container width
 * @param refWidth - reference width (default 1440 = desktop)
 * @param minScale - minimum scale factor (prevent too tiny on mobile)
 */
export function scaleSize(
  value: number,
  containerW: number,
  refWidth = 1440,
  minScale = 0.5
): number {
  const scale = Math.max(minScale, containerW / refWidth);
  return value * scale;
}
