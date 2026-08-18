/**
 * Format progress value to clean integer percentage
 * @param {number} val
 * @returns {number}
 */
export const formatProgress = (val = 0) => {
  if (typeof val !== 'number' || isNaN(val)) return 0;
  return Math.min(100, Math.max(0, Math.round(val)));
};
