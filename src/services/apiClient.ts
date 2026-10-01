/**
 * AgriVision AI API Client
 * Standardized HTTP client connecting frontend to backend services.
 */

export const PRODUCTION_BACKEND_URL = 'https://agrivision-ai-ucy3.onrender.com';

export function getApiBase(): string {
  try {
    const metaEnv = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {} as any;
    const envUrl = (metaEnv.VITE_API_URL || metaEnv.NEXT_PUBLIC_API_URL || '').trim();

    // 1. In browser runtime: check hostname
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

      // When running on Vercel or any public domain:
      if (!isLocalhost) {
        // If an explicit remote HTTPS URL is configured and not localhost, use it
        if ((envUrl.startsWith('http://') || envUrl.startsWith('https://')) &&
            !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
          const clean = envUrl.replace(/\/$/, '');
          return clean.endsWith('/api') ? clean : `${clean}/api`;
        }
        // Canonical production Render backend URL
        return `${PRODUCTION_BACKEND_URL}/api`;
      }

      // When running on localhost:
      if (envUrl) {
        const clean = envUrl.replace(/\/$/, '');
        return clean.endsWith('/api') ? clean : `${clean}/api`;
      }
      return '/api';
    }

    // 2. Build-time / SSR
    if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
      const clean = envUrl.replace(/\/$/, '');
      return clean.endsWith('/api') ? clean : `${clean}/api`;
    }
    if (metaEnv.PROD) {
      return `${PRODUCTION_BACKEND_URL}/api`;
    }
  } catch {
    // ignore
  }
  return `${PRODUCTION_BACKEND_URL}/api`;
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
    const baseOrigin = base.replace(/\/api$/, '');
    if (cleanEndpoint.startsWith('/api/')) {
      return `${baseOrigin}${cleanEndpoint}`;
    }
    return `${baseOrigin}/api${cleanEndpoint}`;
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
