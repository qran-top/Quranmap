import { BoardShape, PixelPoint } from '../types/quran';
import { TOTAL_QURAN_WORDS } from '../data/surahs';

export interface LayoutResult {
  points: PixelPoint[];
  width: number;
  height: number;
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
}

/**
 * Generate (x, y) pixel coordinates for all ~77,825 Quran words based on chosen shape
 */
export function generatePixelLayout(
  shape: BoardShape,
  totalWords = TOTAL_QURAN_WORDS,
  customCols?: number
): LayoutResult {
  const points: PixelPoint[] = new Array(totalWords);
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  if (shape === 'square') {
    // 1:1 Square Grid (approx 279 x 279)
    const cols = customCols && customCols > 0 ? customCols : Math.ceil(Math.sqrt(totalWords));
    for (let i = 0; i < totalWords; i++) {
      const x = i % cols;
      const y = Math.floor(i / cols);
      points[i] = { x, y, wordIndex: i };
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  } else if (shape === 'rectangle') {
    // 16:9 or custom rectangular grid (e.g. 370 x 210)
    const cols = customCols && customCols > 0 ? customCols : Math.ceil(Math.sqrt(totalWords * (16 / 9)));
    for (let i = 0; i < totalWords; i++) {
      const x = i % cols;
      const y = Math.floor(i / cols);
      points[i] = { x, y, wordIndex: i };
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  } else if (shape === 'circle') {
    // Golden Ratio Radial Disk Packing (Vogel's spiral distribution)
    // Provides uniform pixel density inside a circle
    const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~137.5 degrees
    const scale = 1.0;
    const centerOffset = Math.ceil(Math.sqrt(totalWords)) * 0.55;

    for (let i = 0; i < totalWords; i++) {
      const r = Math.sqrt(i + 0.5) * scale;
      const theta = i * goldenAngle;
      const x = Math.round(centerOffset + r * Math.cos(theta));
      const y = Math.round(centerOffset + r * Math.sin(theta));

      points[i] = { x, y, wordIndex: i };
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  } else if (shape === 'spiral') {
    // Archimedean Spiral from center outwards (Al-Fatiha in the center, An-Nas at edge)
    const centerOffset = Math.ceil(Math.sqrt(totalWords)) * 0.7;
    const a = 0.5;
    const b = 0.6; // spiral expansion

    for (let i = 0; i < totalWords; i++) {
      const theta = Math.sqrt(i * 1.6);
      const r = a + b * theta * 5.5;
      const x = Math.round(centerOffset + r * Math.cos(theta * 2.5));
      const y = Math.round(centerOffset + r * Math.sin(theta * 2.5));

      points[i] = { x, y, wordIndex: i };
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  } else if (shape === 'mushaf') {
    // 604 Pages layout: arranged in a grid of 28 pages wide x 22 pages high
    // Each page is a miniature rectangle with words flowing top to bottom, right to left (Quran style)
    const pagesCount = 604;
    const wordsPerPage = Math.ceil(totalWords / pagesCount); // ~129 words
    const pagesPerRow = 26;
    const pageW = 11; // pixels wide
    const pageH = 15; // pixels tall
    const pageGap = 3; // gap between pages

    for (let i = 0; i < totalWords; i++) {
      const pageIndex = Math.floor(i / wordsPerPage);
      const wordInPage = i % wordsPerPage;

      const pageCol = pageIndex % pagesPerRow;
      const pageRow = Math.floor(pageIndex / pagesPerRow);

      // RTL page coordinate
      const pageStartX = (pagesPerRow - 1 - pageCol) * (pageW + pageGap);
      const pageStartY = pageRow * (pageH + pageGap);

      const wordCol = wordInPage % pageW;
      const wordRow = Math.floor(wordInPage / pageW);

      const x = pageStartX + (pageW - 1 - wordCol);
      const y = pageStartY + wordRow;

      points[i] = { x, y, wordIndex: i };
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  } else if (shape === 'crescent') {
    // Islamic Crescent shape packing
    const R_outer = Math.sqrt(totalWords) * 0.75;
    const R_inner = R_outer * 0.88;
    const offsetX = R_outer * 0.35;
    const offsetY = 0;
    const center = R_outer * 1.2;

    let placed = 0;
    let radiusStep = 0.5;
    let r = 2;
    let angle = 0;

    // Fill valid points inside crescent mask
    while (placed < totalWords && r < R_outer * 1.5) {
      const countAtRadius = Math.max(8, Math.floor(2 * Math.PI * r / 1.5));
      for (let k = 0; k < countAtRadius && placed < totalWords; k++) {
        const theta = (k / countAtRadius) * 2 * Math.PI;
        const px = r * Math.cos(theta);
        const py = r * Math.sin(theta);

        // Check if inside outer circle
        const distOuter = Math.sqrt(px * px + py * py);
        // Check if outside inner cutout circle
        const distInner = Math.sqrt((px - offsetX) * (px - offsetX) + (py - offsetY) * (py - offsetY));

        if (distOuter <= R_outer && distInner >= R_inner) {
          const x = Math.round(center + px);
          const y = Math.round(center + py);
          points[placed] = { x, y, wordIndex: placed };
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
          placed++;
        }
      }
      r += radiusStep;
    }

    // Fallback if needed to fill remaining words
    while (placed < totalWords) {
      const x = Math.round(center + (placed % 100));
      const y = Math.round(center + Math.floor(placed / 100));
      points[placed] = { x, y, wordIndex: placed };
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      placed++;
    }
  } else if (shape === 'mihrab') {
    // Islamic Arch / Mihrab
    const widthArch = Math.ceil(Math.sqrt(totalWords * 0.7));
    const heightArch = Math.ceil(totalWords / widthArch * 1.15);
    const radiusDome = widthArch / 2;
    let placed = 0;

    for (let y = 0; y < heightArch * 2 && placed < totalWords; y++) {
      for (let x = 0; x < widthArch && placed < totalWords; x++) {
        // Upper dome condition
        if (y < radiusDome) {
          const dx = x - radiusDome;
          const dy = radiusDome - y;
          if (dx * dx + dy * dy > radiusDome * radiusDome) {
            continue; // Outside arch dome
          }
        }
        points[placed] = { x, y, wordIndex: placed };
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        placed++;
      }
    }

    // Fill remaining if any
    while (placed < totalWords) {
      const x = placed % widthArch;
      const y = heightArch + Math.floor(placed / widthArch);
      points[placed] = { x, y, wordIndex: placed };
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      placed++;
    }
  }

  // Normalize points so minimum coordinate is 0,0
  const normMinX = minX;
  const normMinY = minY;
  const totalW = maxX - minX + 1;
  const totalH = maxY - minY + 1;

  for (let i = 0; i < totalWords; i++) {
    if (points[i]) {
      points[i].x -= normMinX;
      points[i].y -= normMinY;
    }
  }

  return {
    points,
    width: totalW,
    height: totalH,
    bounds: { minX: 0, maxX: totalW, minY: 0, maxY: totalH }
  };
}
