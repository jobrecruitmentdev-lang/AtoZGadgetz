import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

async function handleProxy(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const p = await params;
    const path = p.path.join('/');
    const url = new URL(request.url);
    
    const backendUrl = `${process.env.API_URL || 'http://localhost:8080/api'}/${path}${url.search}`;
    
    const headers = new Headers(request.headers);
    headers.delete('host');
    headers.delete('connection');
    
    // Add token from cookie to Authorization header
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const options: RequestInit = {
      method: request.method,
      headers,
      redirect: 'manual',
    };

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      options.body = await request.arrayBuffer();
    }

    const response = await fetch(backendUrl, options);
    
    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete('content-encoding'); // fetch unzips it

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error('Proxy error:', error);
    return NextResponse.json({ success: false, message: 'Proxy Error' }, { status: 500 });
  }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const PATCH = handleProxy;
export const DELETE = handleProxy;
