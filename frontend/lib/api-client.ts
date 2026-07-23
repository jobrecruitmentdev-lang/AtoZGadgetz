export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bukcsheet.atozgadgetz.com/api';

export interface ApiResponse<T = unknown> {
  success?: boolean;
  status?: boolean;
  data?: T;
  message?: string;
}

export async function fetchApi<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // If running on the client, we always use the relative /api proxy
  const baseUrl = typeof window === 'undefined' 
    ? (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://bukcsheet.atozgadgetz.com/api') 
    : '';

  let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (cleanEndpoint.startsWith('/api/')) {
    cleanEndpoint = cleanEndpoint.substring(4);
  }
  // If it's relative client call, ensure it goes to /server-proxy/... proxy unless already starts with /server-proxy
  const url = typeof window === 'undefined'
    ? `${baseUrl}${cleanEndpoint}`
    : (cleanEndpoint.startsWith('/server-proxy') ? cleanEndpoint : `/server-proxy${cleanEndpoint}`);
  
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, { cache: 'no-store', ...options, headers });
  
  let data: ApiResponse<T> = {};
  try {
    const text = await res.text();
    try {
      data = JSON.parse(text);
    } catch {
      // If parsing fails (e.g., Nginx intercepts with HTML page), provide user-friendly fallbacks
      if (res.status === 401) throw new Error('Invalid email or password. Please try again.');
      if (res.status === 429) throw new Error('Too many attempts. Please try again later.');
      if (res.status >= 500) throw new Error('Server is currently unavailable. Please try again in a few minutes.');
      throw new Error(`Unexpected server response (${res.status})`);
    }
  } catch (err: any) {
    throw err;
  }

  if (!res.ok) {
    throw new Error(data?.message || `Error ${res.status}: Request failed`);
  }

  return data.data as T;
}
