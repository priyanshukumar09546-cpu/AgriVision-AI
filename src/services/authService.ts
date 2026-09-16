/**
 * AgriVision AI Production Authentication Service
 * Communicates with real backend and SQLite database.
 * No hardcoded users or fake credentials.
 */

import { apiRequest, setAuthToken, clearAuthToken } from './apiClient';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'farmer' | 'student' | 'expert';
  avatar?: string;
  location?: string;
  bio?: string;
  joinedAt?: string;
  emailVerified?: boolean;
}

export type User = AuthUser;

const STORAGE_KEY = 'agrivision_auth_user';

type AuthListener = (user: AuthUser | null) => void;
const listeners = new Set<AuthListener>();

export const subscribeAuth = (listener: AuthListener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const notifyListeners = (user: AuthUser | null) => {
  listeners.forEach((fn) => {
    try {
      fn(user);
    } catch (err) {
      console.error(err);
    }
  });
};

export const getStoredAuthUser = (): AuthUser | null => {
  if (typeof window === 'undefined') return null;
  try {
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) return JSON.parse(local);
    const session = sessionStorage.getItem(STORAGE_KEY);
    if (session) return JSON.parse(session);
  } catch (e) {
    console.error('Failed to read auth state', e);
  }
  return null;
};

export const saveAuthUser = (user: AuthUser, rememberMe: boolean = true) => {
  if (typeof window === 'undefined') return;
  const serialized = JSON.stringify(user);
  if (rememberMe) {
    localStorage.setItem(STORAGE_KEY, serialized);
    sessionStorage.removeItem(STORAGE_KEY);
  } else {
    sessionStorage.setItem(STORAGE_KEY, serialized);
    localStorage.removeItem(STORAGE_KEY);
  }
  notifyListeners(user);
};

export const clearAuthUser = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
  clearAuthToken();
  notifyListeners(null);
};

export const loginUser = async (
  email: string,
  password: string,
  rememberMe: boolean = true
): Promise<{ success: boolean; user?: AuthUser; error?: string }> => {
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }
  if (!password) {
    return { success: false, error: 'Please enter your password.' };
  }

  const res = await apiRequest<{ success: boolean; token: string; user: any }>('/auth/signin', {
    method: 'POST',
    body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
  });

  if (res.success && res.data?.user) {
    const rawUser = res.data.user;
    const user: AuthUser = {
      id: rawUser.id,
      name: rawUser.name,
      email: rawUser.email,
      role: (rawUser.role || 'farmer').toLowerCase() as any,
      avatar: rawUser.avatar_url || undefined,
      location: rawUser.location || '',
      bio: rawUser.bio || '',
      joinedAt: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    };

    setAuthToken(res.data.token);
    saveAuthUser(user, rememberMe);
    return { success: true, user };
  }

  return { success: false, error: res.error || 'Invalid email or password.' };
};

export const registerUser = async (
  name: string,
  email: string,
  password: string,
  role: 'farmer' | 'student' | 'expert' = 'farmer',
  rememberMe: boolean = true
): Promise<{ success: boolean; user?: AuthUser; error?: string }> => {
  if (!name.trim()) {
    return { success: false, error: 'Please enter your full name.' };
  }
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }
  if (!password || password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }

  const res = await apiRequest<{ success: boolean; token: string; user: any }>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: role.charAt(0).toUpperCase() + role.slice(1),
    }),
  });

  if (res.success && res.data?.user) {
    const rawUser = res.data.user;
    const user: AuthUser = {
      id: rawUser.id,
      name: rawUser.name,
      email: rawUser.email,
      role,
      avatar: rawUser.avatar_url || undefined,
      location: rawUser.location || '',
      bio: rawUser.bio || '',
      joinedAt: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    };

    setAuthToken(res.data.token);
    saveAuthUser(user, rememberMe);
    return { success: true, user };
  }

  return { success: false, error: res.error || 'Failed to create account.' };
};

export const updateUserProfile = async (
  updates: Partial<AuthUser>
): Promise<{ success: boolean; user?: AuthUser; error?: string }> => {
  const current = getStoredAuthUser();
  if (!current) {
    return { success: false, error: 'No active authenticated session.' };
  }

  const res = await apiRequest<{ success: boolean; user: any }>('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(updates),
  });

  if (res.success && res.data?.user) {
    const raw = res.data.user;
    const updatedUser: AuthUser = {
      ...current,
      name: raw.name || current.name,
      role: (raw.role || current.role).toLowerCase() as any,
      location: raw.location ?? current.location,
      bio: raw.bio ?? current.bio,
    };
    saveAuthUser(updatedUser);
    return { success: true, user: updatedUser };
  }

  const localUpdated = { ...current, ...updates };
  saveAuthUser(localUpdated);
  return { success: true, user: localUpdated };
};

export const resetPassword = async (
  email: string
): Promise<{ success: boolean; message: string; error?: string }> => {
  const res = await apiRequest<{ success: boolean; message: string }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });

  if (res.success && res.data) {
    return { success: true, message: res.data.message };
  }

  return {
    success: false,
    message: '',
    error: res.error || 'Failed to send password reset request.',
  };
};

export const confirmPasswordReset = async (
  token: string,
  newPassword: string
): Promise<{ success: boolean; message: string; error?: string }> => {
  const res = await apiRequest<{ success: boolean; message: string }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token: token.trim(), new_password: newPassword }),
  });

  if (res.success && res.data) {
    return { success: true, message: res.data.message };
  }

  return {
    success: false,
    message: '',
    error: res.error || 'Failed to reset password.',
  };
};

export const verifyEmailToken = async (
  token: string
): Promise<{ success: boolean; message: string; error?: string }> => {
  const res = await apiRequest<{ success: boolean; message: string }>('/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ token: token.trim() }),
  });

  if (res.success && res.data) {
    return { success: true, message: res.data.message };
  }

  return {
    success: false,
    message: '',
    error: res.error || 'Failed to verify email address.',
  };
};

export const resendEmailVerification = async (
  email: string
): Promise<{ success: boolean; message: string; error?: string }> => {
  const res = await apiRequest<{ success: boolean; message: string }>('/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });

  if (res.success && res.data) {
    return { success: true, message: res.data.message };
  }

  return {
    success: false,
    message: '',
    error: res.error || 'Failed to resend verification email.',
  };
};

/**
 * Social Login Handler
 * Uses Google Identity Services to perform OAuth authentication,
 * then verifies access token on Flask backend, creating or logging in the user.
 */
export const socialLogin = async (
  provider: 'google' | 'microsoft' | 'apple'
): Promise<{ success: boolean; user?: AuthUser; error?: string }> => {
  if (provider !== 'google') {
    const clientId = (import.meta as any).env.VITE_MICROSOFT_CLIENT_ID;
    if (!clientId) {
      return {
        success: false,
        error: `${provider.toUpperCase()} OAuth requires configuring VITE_${provider.toUpperCase()}_CLIENT_ID. Please use email and password authentication.`,
      };
    }
    return {
      success: false,
      error: `${provider.toUpperCase()} OAuth provider is not configured yet.`,
    };
  }

  const clientId = (import.meta as any).env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId || clientId === 'PASTE_CLIENT_ID_HERE') {
    return {
      success: false,
      error: 'Google OAuth requires configuring VITE_GOOGLE_CLIENT_ID in .env file. Please use email and password authentication.',
    };
  }

  if (typeof window === 'undefined') {
    return { success: false, error: 'Window object unavailable.' };
  }

  // Wait for Google Identity Services script (window.google.accounts.oauth2)
  const getGoogleAuth = async (): Promise<any> => {
    if ((window as any).google?.accounts?.oauth2) {
      return (window as any).google.accounts.oauth2;
    }
    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 100));
      if ((window as any).google?.accounts?.oauth2) {
        return (window as any).google.accounts.oauth2;
      }
    }
    return null;
  };

  const oauth2 = await getGoogleAuth();
  if (!oauth2) {
    return {
      success: false,
      error: 'Google Identity Services library failed to load. Please check your internet connection.',
    };
  }

  return new Promise((resolve) => {
    try {
      const client = oauth2.initTokenClient({
        client_id: clientId,
        scope: 'email profile openid',
        callback: async (response: any) => {
          if (response.error) {
            resolve({
              success: false,
              error: response.error_description || response.error || 'Google Login was canceled or failed.',
            });
            return;
          }

          if (response.access_token) {
            try {
              const res = await apiRequest<{ success: boolean; token: string; user: any; error?: string }>('/auth/google', {
                method: 'POST',
                body: JSON.stringify({ access_token: response.access_token }),
              });

              if (res.success && res.data?.user && res.data?.token) {
                const rawUser = res.data.user;
                const user: AuthUser = {
                  id: rawUser.id,
                  name: rawUser.name,
                  email: rawUser.email,
                  role: (rawUser.role || 'farmer').toLowerCase() as any,
                  avatar: rawUser.avatar_url || undefined,
                  location: rawUser.location || '',
                  bio: rawUser.bio || '',
                  joinedAt: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                };
                setAuthToken(res.data.token);
                saveAuthUser(user, true);
                resolve({ success: true, user });
              } else {
                resolve({
                  success: false,
                  error: res.error || res.data?.error || 'Failed to authenticate Google user on backend.',
                });
              }
            } catch (apiErr: any) {
              resolve({
                success: false,
                error: apiErr?.message || 'Network error verifying Google authentication.',
              });
            }
          } else {
            resolve({
              success: false,
              error: 'No access token returned from Google.',
            });
          }
        },
        error_callback: (err: any) => {
          resolve({
            success: false,
            error: err?.message || 'Google Sign-In popup was closed or blocked.',
          });
        },
      });

      client.requestAccessToken();
    } catch (err: any) {
      resolve({
        success: false,
        error: err?.message || 'Failed to launch Google Sign-In popup.',
      });
    }
  });
};
