import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const rawBaseUrl =
      process.env.API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:8080';
    const normalizedBase = rawBaseUrl.replace(/\/+$/, '');
    const apiBaseUrl = normalizedBase.endsWith('/api')
      ? normalizedBase
      : `${normalizedBase}/api`;

    const backendRes = await fetch(`${apiBaseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const text = await backendRes.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      return NextResponse.json(
        { success: false, message: 'Backend returned a non-JSON auth response' },
        { status: 502 }
      );
    }

    if (!backendRes.ok || !data.success) {
      return NextResponse.json(
        { success: false, message: data?.message || 'Login failed' },
        { status: backendRes.status || 400 }
      );
    }

    const token = data?.data?.access_token;
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Login response missing access token' },
        { status: 502 }
      );
    }

    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    return NextResponse.json({ success: true, message: 'Logged in successfully', data: data.data });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to reach auth backend' },
      { status: 502 }
    );
  }
}
