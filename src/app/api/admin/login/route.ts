import { NextResponse } from 'next/server';
import { getAdminPassword, createSessionToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { password } = body;

    const correctPassword = getAdminPassword();

    if (!password || password !== correctPassword) {
      return NextResponse.json(
        { success: false, error: 'Mật khẩu quản trị không chính xác' },
        { status: 401 }
      );
    }

    const token = createSessionToken();
    const response = NextResponse.json({ success: true, message: 'Đăng nhập thành công' });

    // Set HTTP-Only Secure Cookie
    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi máy chủ' },
      { status: 500 }
    );
  }
}
