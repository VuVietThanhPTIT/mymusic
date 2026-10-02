import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { deleteTrack } from '@/lib/trackStorage';

export async function DELETE(
  _req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Yêu cầu quyền Quản trị viên để xoá bài hát' },
        { status: 401 }
      );
    }

    const { id } = await props.params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Thiếu ID bài hát' },
        { status: 400 }
      );
    }

    const deleted = await deleteTrack(id);

    return NextResponse.json({
      success: deleted,
      message: deleted ? 'Đã xoá bài hát thành công' : 'Không tìm thấy bài hát',
    });
  } catch (error) {
    console.error('Error deleting track:', error);
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi khi xoá bài hát' },
      { status: 500 }
    );
  }
}
