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

  const apiBase = getApiBase();
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${apiBase}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  try {
    let res: Response;
    try {
      res = await fetch(url, {
        ...options,
        headers,
      });
    } catch (primaryFetchErr) {
      // If fetching relative URL failed, retry directly against local backend daemon
      if (!endpoint.startsWith('http') && !url.startsWith('http')) {
        const fallbackUrl = `http://127.0.0.1:8000/api${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
        console.warn(`[apiClient] Relative fetch to ${url} failed. Retrying direct to backend ${fallbackUrl}`);
        res = await fetch(fallbackUrl, {
          ...options,
          headers,
        });
      } else {
        throw primaryFetchErr;
      }
    }

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
