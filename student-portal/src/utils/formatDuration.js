/**
 * Format duration in seconds to human readable string (e.g. "30 mins", "1h 20m")
 * @param {number} seconds
 * @returns {string}
 */
export const formatDuration = (seconds = 0) => {
  if (!seconds || seconds <= 0) return '0 mins';

  const mins = Math.floor(seconds / 60);
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;

  if (hours > 0) {
    return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
  }

  return `${mins} mins`;
};
