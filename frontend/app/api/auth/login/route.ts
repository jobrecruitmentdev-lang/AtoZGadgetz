import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const baseUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://bukcsheet.atozgadgetz.com/api';
    const backendRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    const data = await backendRes.json();
    
    if (!backendRes.ok || !data.success) {
      return NextResponse.json({ success: false, message: data.message || 'Login failed' }, { status: 400 });
    }
    
    const token = data.data.access_token;
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });
    
    return NextResponse.json({ success: true, message: 'Logged in successfully', data: data.data });
    
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
