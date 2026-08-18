/**
 * Formats duration in seconds to a human-readable string.
 * Example: 240 -> "4 mins"
 * Example: 4100 -> "1 hr 8 mins"
 */
export const formatDuration = (totalSeconds) => {
  if (!totalSeconds || totalSeconds <= 0) return "0 mins";

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    if (minutes > 0) {
      return `${hours} hr${hours > 1 ? 's' : ''} ${minutes} min${minutes > 1 ? 's' : ''}`;
    }
    return `${hours} hr${hours > 1 ? 's' : ''}`;
  }
  
  return `${minutes} min${minutes !== 1 ? 's' : ''}`;
};
