

/**
 * Priority 1: If lesson.duration already exists, use it.
 * Priority 2: If API Key exists, fetch duration, title, thumbnail automatically.
 * Priority 3: If no API Key, auto-fill thumbnail using img.youtube.com and let admin manually enter duration.
 */

export const processYouTubeMetadata = async (videoUrl, manualDuration = 0, apiKey = process.env.YOUTUBE_API_KEY) => {
  if (!videoUrl || (!videoUrl.includes('youtube.com') && !videoUrl.includes('youtu.be'))) {
    return { url: videoUrl, provider: 'youtube', duration: manualDuration, thumbnail: '' };
  }

  // Extract Video ID
  let videoId = '';
  try {
    if (videoUrl.includes('youtube.com/watch')) {
      videoId = new URL(videoUrl).searchParams.get('v');
    } else if (videoUrl.includes('youtu.be/')) {
      videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
    }
  } catch (err) {
    console.error("Error parsing YouTube URL:", err);
  }

  if (!videoId) {
    return { url: videoUrl, provider: 'youtube', duration: manualDuration, thumbnail: '' };
  }

  // Base fallback thumbnail
  const fallbackThumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  // Priority 1: Manual duration already provided (and not 0)
  // We'll still try to fetch thumbnail if possible, but we don't overwrite duration
  // Actually, we should fetch metadata if API key exists.

  if (apiKey) {
    // Priority 2: Fetch from YouTube API
    try {
      const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=contentDetails,snippet&key=${apiKey}`);
      const data = await response.json();

      if (data.items && data.items.length > 0) {
        const item = data.items[0];
        
        // Parse ISO 8601 duration (e.g., PT1H2M10S) to seconds
        const isoDuration = item.contentDetails.duration;
        let finalDuration = manualDuration;
        if (isoDuration) {
          const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
          const hours = (parseInt(match[1]) || 0);
          const minutes = (parseInt(match[2]) || 0);
          const seconds = (parseInt(match[3]) || 0);
          finalDuration = hours * 3600 + minutes * 60 + seconds;
        }

        const thumbnail = item.snippet.thumbnails?.maxres?.url || item.snippet.thumbnails?.high?.url || fallbackThumbnail;
        const title = item.snippet.title;

        return {
          url: videoUrl,
          provider: 'youtube',
          duration: finalDuration > 0 ? finalDuration : manualDuration,
          thumbnail,
          title,
        };
      }
    } catch (error) {
      console.error("❌ Error fetching YouTube metadata:", error);
    }
  }

  // Priority 3: Fallback
  return {
    url: videoUrl,
    provider: 'youtube',
    duration: manualDuration, // Whatever the admin manually entered
    thumbnail: fallbackThumbnail,
  };
};

/**
 * Safely extracts and validates a YouTube video ID from a URL.
 * Rejects non-YouTube hosts, javascript protocols, data URLs, etc.
 * @param {string} url 
 * @returns {string|null}
 */
export function extractYouTubeVideoId(url) {
  if (!url || typeof url !== 'string') return null;
  
  let parsedUrl;
  try {
    parsedUrl = new URL(url.trim());
  } catch (e) {
    return null;
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  
  const allowedHosts = [
    'youtube.com', 'www.youtube.com', 'm.youtube.com', 
    'youtu.be', 'www.youtube-nocookie.com', 'youtube-nocookie.com'
  ];
  
  if (!allowedHosts.includes(hostname)) {
    return null;
  }

  let videoId = null;
  if (hostname === 'youtu.be') {
    const path = parsedUrl.pathname.substring(1);
    videoId = path.split('/')[0].split('?')[0];
  } else {
    if (parsedUrl.pathname === '/watch') {
      videoId = parsedUrl.searchParams.get('v');
    } else if (parsedUrl.pathname.startsWith('/embed/')) {
      videoId = parsedUrl.pathname.split('/embed/')[1].split('?')[0];
    } else if (parsedUrl.pathname.startsWith('/v/')) {
      videoId = parsedUrl.pathname.split('/v/')[1].split('?')[0];
    }
  }

  const ytIdRegex = /^[a-zA-Z0-9_-]{11}$/;
  if (videoId && ytIdRegex.test(videoId)) {
    return videoId;
  }
  
  return null;
}
