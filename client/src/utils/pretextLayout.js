'use client';

/**
 * Pretext Layout Utility (@chenglou/pretext)
 * Provides high-performance text measurement and tight bubble wrap calculation
 * without triggering DOM layout thrashing or forced reflows.
 */

import { prepare, measureLineStats } from '@chenglou/pretext';

const preparedCache = new Map();
const MAX_CACHE_SIZE = 200;

export const isPretextAvailable = () => {
  if (typeof window === 'undefined') return false;
  return typeof OffscreenCanvas !== 'undefined' || typeof document !== 'undefined';
};

/**
 * Calculates tight message bubble geometry using pure arithmetic
 * @param {string} text - The message text
 * @param {Object} options - Configuration options
 * @returns {Object} Bubble geometry { bubbleWidth, textWidth, height, lineCount, isSingleLine }
 */
export const computeTightBubbleLayout = (text, options = {}) => {
  if (!text || typeof text !== 'string' || !isPretextAvailable()) {
    return null;
  }

  const {
    font = '13px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    maxWidth = 280,
    lineHeight = 21,
    paddingX = 24, // p-3 (12px * 2)
    paddingY = 24, // p-3 (12px * 2)
  } = options;

  try {
    const cacheKey = `${font}:::${text}`;
    let prepared = preparedCache.get(cacheKey);

    if (!prepared) {
      if (preparedCache.size >= MAX_CACHE_SIZE) {
        // Evict oldest 50 items
        const keys = Array.from(preparedCache.keys()).slice(0, 50);
        keys.forEach((k) => preparedCache.delete(k));
      }
      prepared = prepare(text, font);
      preparedCache.set(cacheKey, prepared);
    }

    const availableContentWidth = Math.max(40, maxWidth - paddingX);
    const stats = measureLineStats(prepared, availableContentWidth);
    const lineCount = stats?.lineCount || 1;
    const maxLineWidth = Math.ceil(stats?.maxLineWidth || 0);

    const tightTextWidth = Math.min(availableContentWidth, Math.max(20, maxLineWidth));
    const bubbleWidth = tightTextWidth + paddingX;
    const estimatedHeight = lineCount * lineHeight + paddingY;

    return {
      textWidth: tightTextWidth,
      bubbleWidth,
      height: estimatedHeight,
      lineCount,
      isSingleLine: lineCount <= 1,
    };
  } catch (err) {
    console.debug('[Pretext compute error]:', err);
    return null;
  }
};
