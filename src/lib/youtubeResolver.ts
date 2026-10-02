/**
 * Helper to extract YouTube video ID from various YouTube & YouTube Music URLs
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=)|music\.youtube\.com\/watch\?v=)([\w-]{11})/
  );
  return match ? match[1] : null;
}

/**
 * Clean up common video title noise like [Official Video], (Audio), etc.
 */
export function cleanTrackTitle(rawTitle: string): { title: string; artistFromTitle?: string } {
  if (!rawTitle) return { title: 'Unknown Track' };

  let title = rawTitle
    .replace(/\[(Official Video|Official Audio|Official Music Video|Audio|MV|Lyrics|Visualizer)\]/gi, '')
    .replace(/\((Official Video|Official Audio|Official Music Video|Audio|MV|Lyrics|Visualizer)\)/gi, '')
    .replace(/【.+?】/g, '')
    .replace(/\|\s*Lofi.*$/gi, '')
    .trim();

  // If title has "Artist - Song Title" format
  if (title.includes(' - ')) {
    const parts = title.split(' - ');
    if (parts.length >= 2) {
      const artist = parts[0].trim();
      const songTitle = parts.slice(1).join(' - ').trim();
      return { title: songTitle, artistFromTitle: artist };
    }
  }

  return { title };
}

/**
 * Fetch YouTube metadata directly from client-side browser using CORS-enabled endpoints
 */
export async function fetchYouTubeMetadataFromBrowser(url: string): Promise<{
  title: string;
  artist: string;
  thumbnail_url: string;
  videoId: string | null;
}> {
  const videoId = extractYouTubeId(url);
  const cleanUrl = videoId
    ? `https://www.youtube.com/watch?v=${videoId}`
    : url.replace('music.youtube.com', 'www.youtube.com').split('&')[0];

  const fallbackThumbnail = videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : '';

  // 1. Try noembed.com (CORS friendly, works in all browsers)
  try {
    const noembedUrl = `https://noembed.com/embed?url=${encodeURIComponent(cleanUrl)}`;
    const res = await fetch(noembedUrl, { mode: 'cors' });
    if (res.ok) {
      const data = await res.json();
      if (data.title) {
        const { title: cleanT, artistFromTitle } = cleanTrackTitle(data.title);
        return {
          title: cleanT,
          artist: artistFromTitle || data.author_name || 'YouTube Music',
          thumbnail_url: data.thumbnail_url || fallbackThumbnail,
          videoId,
        };
      }
    }
  } catch (err) {
    // Continue to next method
  }

  // 2. Try YouTube oembed directly
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(cleanUrl)}&format=json`;
    const res = await fetch(oembedUrl);
    if (res.ok) {
      const data = await res.json();
      if (data.title) {
        const { title: cleanT, artistFromTitle } = cleanTrackTitle(data.title);
        return {
          title: cleanT,
          artist: artistFromTitle || data.author_name || 'YouTube Music',
          thumbnail_url: data.thumbnail_url || fallbackThumbnail,
          videoId,
        };
      }
    }
  } catch (err) {
    // Continue to fallback
  }

  // 3. Fallback: formatted video ID
  return {
    title: videoId ? `Track ${videoId}` : 'YouTube Music Track',
    artist: 'YouTube Music',
    thumbnail_url: fallbackThumbnail,
    videoId,
  };
}
