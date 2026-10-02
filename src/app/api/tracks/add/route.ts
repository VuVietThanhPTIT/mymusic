import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { addTrack } from '@/lib/trackStorage';

function isYouTubeUrl(url: string): boolean {
  return (
    url.includes('youtube.com') ||
    url.includes('youtu.be') ||
    url.includes('music.youtube.com')
  );
}

function isSoundCloudUrl(url: string): boolean {
  return url.includes('soundcloud.com');
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}

export async function POST(req: Request) {
  try {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Yêu cầu quyền Quản trị viên (Admin) để thêm bài hát' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { url, genre = 'Lo-Fi', title: customTitle, artist: customArtist, thumbnail_url: customThumb } = body;

    if (!url || typeof url !== 'string' || !url.trim()) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng cung cấp đường link hợp lệ' },
        { status: 400 }
      );
    }

    const trimmedUrl = url.trim();
    let title = customTitle?.trim() || '';
    let artist = customArtist?.trim() || 'Unknown';
    let thumbnailUrl = customThumb?.trim() || '';

    // If YouTube URL, extract videoId for instant thumbnail
    const ytVideoId = extractYouTubeId(trimmedUrl);
    if (ytVideoId && !thumbnailUrl) {
      thumbnailUrl = `https://img.youtube.com/vi/${ytVideoId}/hqdefault.jpg`;
    }

    // Auto extract metadata from YouTube if needed
    if (isYouTubeUrl(trimmedUrl) && (!title || artist === 'Unknown')) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2500);

        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(trimmedUrl)}&format=json`;
        const oembedRes = await fetch(oembedUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (oembedRes.ok) {
          const oembedData = await oembedRes.json();
          if (!title) title = oembedData.title || '';
          if (artist === 'Unknown') artist = oembedData.author_name || 'YouTube Music';
          if (!thumbnailUrl) thumbnailUrl = oembedData.thumbnail_url || '';
        }
      } catch (err) {
        // Fallback gracefully if oEmbed network call times out
      }
    }

    // Try SoundCloud oEmbed if applicable
    if (isSoundCloudUrl(trimmedUrl) && (!title || !artist || !thumbnailUrl)) {
      try {
        const scOembedUrl = `https://soundcloud.com/oembed?url=${encodeURIComponent(trimmedUrl)}&format=json`;
        const scRes = await fetch(scOembedUrl);
        if (scRes.ok) {
          const scData = await scRes.json();
          if (!title) title = scData.title || '';
          if (artist === 'Unknown') artist = scData.author_name || 'SoundCloud Artist';
          if (!thumbnailUrl) thumbnailUrl = scData.thumbnail_url || '';
        }
      } catch (err) {
        console.warn('Failed to fetch SoundCloud oEmbed metadata:', err);
      }
    }

    // Fallback if still empty
    if (!title) {
      // Derive clean title from filename or URL
      try {
        const parsed = new URL(trimmedUrl);
        const pathname = parsed.pathname;
        const lastPart = pathname.substring(pathname.lastIndexOf('/') + 1);
        title = decodeURIComponent(lastPart).replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || 'New Audio Track';
      } catch {
        title = 'New Audio Track';
      }
    }

    if (!thumbnailUrl) {
      // Default stylish synth/lofi neon cover
      thumbnailUrl = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop';
    }

    const createdTrack = await addTrack({
      title,
      artist,
      source_url: trimmedUrl,
      thumbnail_url: thumbnailUrl,
      genre: genre || 'Lo-Fi',
    });

    return NextResponse.json({
      success: true,
      track: createdTrack,
      message: 'Thêm bài hát thành công!',
    });
  } catch (error) {
    console.error('Error adding track:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể thêm bài hát. Vui lòng thử lại.' },
      { status: 500 }
    );
  }
}
