import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const baseUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
    const backendRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    const data = await backendRes.json();
    
    if (!backendRes.ok || !data.success) {
      return NextResponse.json({ success: false, message: data.message || 'Registration failed' }, { status: 400 });
    }
    
    return NextResponse.json(data);
    
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
