import { NextResponse } from 'next/server';
import { getAllTracks } from '@/lib/trackStorage';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const genre = searchParams.get('genre') || '';
    const sort = searchParams.get('sort') || 'latest';

    const tracks = await getAllTracks({ search, genre, sort });

    return NextResponse.json({
      success: true,
      total: tracks.length,
      tracks,
    });
  } catch (error) {
    console.error('Error fetching tracks:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể tải danh sách bài hát' },
      { status: 500 }
    );
  }
}
