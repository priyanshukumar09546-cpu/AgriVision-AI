/**
 * AgriVision AI API Client
 * Standardized HTTP client connecting frontend to backend services.
 */

export function getApiBase(): string {
  try {
    const metaEnv = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {} as any;
    const envUrl = metaEnv.VITE_API_URL || metaEnv.NEXT_PUBLIC_API_URL || '';
    if (envUrl) {
      const clean = envUrl.replace(/\/$/, '');
      return clean.endsWith('/api') ? clean : `${clean}/api`;
    }
  } catch {
    // ignore
  }
  return '/api';
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem('agrivision_auth_token') || localStorage.getItem('agrivision_admin_token') || localStorage.getItem('admin_token') || localStorage.getItem('token');
  } catch {
    return null;
  }
}

export function setAuthToken(token: string): void {
  try {
    localStorage.setItem('agrivision_auth_token', token);
  } catch {
    // ignore
  }
}

export function clearAuthToken(): void {
  try {
    localStorage.removeItem('agrivision_auth_token');
    localStorage.removeItem('agrivision_auth_user');
  } catch {
    // ignore
  }
}

export function buildApiUrl(endpoint: string): string {
  if (!endpoint) return getApiBase();
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  const base = getApiBase();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  if (base.startsWith('http://') || base.startsWith('https://')) {
    if (cleanEndpoint.startsWith('/api/')) {
      return `${base.replace(/\/api$/, '')}${cleanEndpoint}`;
    }
    return `${base}${cleanEndpoint}`;
  }

  if (cleanEndpoint.startsWith('/api/')) {
    return cleanEndpoint;
  }
  return `${base}${cleanEndpoint}`;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const url = buildApiUrl(endpoint);

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const contentType = res.headers.get('content-type') || '';
    let json: any = null;
    if (contentType.includes('application/json')) {
      json = await res.json();
    } else {
      const text = await res.text();
      try {
        json = JSON.parse(text);
      } catch {
        json = { detail: text };
      }
    }

    if (!res.ok) {
      const errMsg =
        json?.error ||
        json?.detail ||
        json?.message ||
        `Request failed with status ${res.status}`;
      return { success: false, error: errMsg };
    }

    return { success: true, data: json };
  } catch (err: any) {
    console.warn(`API request to ${endpoint} failed:`, err);
    return {
      success: false,
      error: err.message || 'Server not reachable. Please ensure the backend is running.',
    };
  }
}
