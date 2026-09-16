import { apiRequest } from './apiClient';

export interface UserProfileData {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  location?: string;
  bio?: string;
  phone?: string;
  farmSize?: number;
  primaryCrops?: string;
  farmingType?: string;
  soilType?: string;
  language?: string;
  measurementUnit?: string;
  newsletter?: boolean;
  createdAt?: string;
}

export interface UserStats {
  totalScans: number;
  myCrops: number;
  savedItems: number;
  communityPosts: number;
}

export interface UserCrop {
  id: string;
  name: string;
  image: string;
  plantedDate: string;
  scanCount: number;
  areaAcres: number;
  status: string;
  healthStatus?: string;
}

export interface ScanHistoryItem {
  id: string;
  crop: string;
  disease: string;
  scientificName: string;
  confidence: number;
  severity: string;
  imageUrl: string;
  createdAt: string;
  formattedDate: string;
  symptoms: string[];
  treatments: any;
}

export interface SavedItem {
  id: string;
  itemType: 'crop' | 'disease' | 'post' | 'article';
  itemId: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  route: string;
  createdAt: string;
}

export interface UserSettings {
  scanResults: boolean;
  diseaseAlerts: boolean;
  communityActivity: boolean;
  cropReminders: boolean;
  appearance: string;
  language: string;
}

export interface UserNotification {
  id: string;
  title: string;
  message: string;
  category?: string;
  isRead: boolean;
  createdAt: string;
}

// 1. Profile API
export async function fetchUserProfile(userId: string): Promise<{ user: UserProfileData; stats: UserStats } | null> {
  try {
    const res = await apiRequest<any>(`/user/profile?userId=${encodeURIComponent(userId)}`);
    if (res.success && res.data) {
      return {
        user: res.data.user,
        stats: res.data.stats,
      };
    }
    return null;
  } catch (err) {
    console.error('Failed to fetch user profile:', err);
    return null;
  }
}

export async function updateUserProfile(payload: Partial<UserProfileData> & { userId: string }): Promise<{ success: boolean; user?: UserProfileData; error?: string }> {
  try {
    const res = await apiRequest<any>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    if (res.success && res.data) {
      return { success: true, user: res.data.user };
    }
    return { success: false, error: res.error || 'Failed to update profile.' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error updating profile.' };
  }
}

// 2. My Crops API
export async function fetchUserCrops(userId: string, status?: string): Promise<UserCrop[]> {
  try {
    let url = `/crops/my?userId=${encodeURIComponent(userId)}`;
    if (status && status !== 'all') {
      url += `&status=${encodeURIComponent(status)}`;
    }
    const res = await apiRequest<any>(url);
    if (res.success && res.data) {
      return res.data.crops || [];
    }
    return [];
  } catch {
    return [];
  }
}

export async function addUserCrop(payload: {
  userId: string;
  cropName: string;
  cropImage?: string;
  plantedDate?: string;
  areaAcres?: number;
  status?: string;
}): Promise<{ success: boolean; cropId?: string; error?: string }> {
  try {
    const res = await apiRequest<any>('/crops/my', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return { success: res.success, cropId: res.data?.cropId, error: res.error };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateUserCrop(cropId: string, payload: Partial<UserCrop> & { userId: string }): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await apiRequest<any>(`/crops/my/${encodeURIComponent(cropId)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return { success: res.success, error: res.error };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteUserCrop(cropId: string, userId: string): Promise<boolean> {
  try {
    const res = await apiRequest<any>(`/crops/my/${encodeURIComponent(cropId)}?userId=${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    });
    return res.success;
  } catch {
    return false;
  }
}

// 3. Scan History API
export async function fetchScanHistory(userId: string, filter: string = 'all'): Promise<ScanHistoryItem[]> {
  try {
    const res = await apiRequest<any>(`/scans/history?userId=${encodeURIComponent(userId)}&filter=${encodeURIComponent(filter)}`);
    if (res.success && res.data) {
      return res.data.scans || [];
    }
    return [];
  } catch {
    return [];
  }
}

export async function deleteScanRecord(scanId: string, userId: string): Promise<boolean> {
  try {
    const res = await apiRequest<any>(`/scans/history?scanId=${encodeURIComponent(scanId)}&userId=${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    });
    return res.success;
  } catch {
    return false;
  }
}

// 4. Saved Items API
export async function fetchSavedItems(userId: string, type: string = 'all'): Promise<SavedItem[]> {
  try {
    const res = await apiRequest<any>(`/saved?userId=${encodeURIComponent(userId)}&type=${encodeURIComponent(type)}`);
    if (res.success && res.data) {
      return res.data.saved || [];
    }
    return [];
  } catch {
    return [];
  }
}

export async function toggleSavedItem(payload: {
  userId: string;
  itemType: 'crop' | 'disease' | 'post' | 'article';
  itemId: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  route?: string;
}): Promise<{ success: boolean; isSaved: boolean }> {
  try {
    const res = await apiRequest<any>('/saved', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return { success: res.success, isSaved: Boolean(res.data?.isSaved) };
  } catch {
    return { success: false, isSaved: false };
  }
}

export async function deleteSavedItem(savedId: string, userId: string): Promise<boolean> {
  try {
    const res = await apiRequest<any>(`/saved/${encodeURIComponent(savedId)}?userId=${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    });
    return res.success;
  } catch {
    return false;
  }
}

// 5. Notifications API
export async function fetchNotifications(userId: string, category: string = 'all'): Promise<{ notifications: UserNotification[]; unreadCount: number }> {
  try {
    const res = await apiRequest<any>(`/notifications?userId=${encodeURIComponent(userId)}&category=${encodeURIComponent(category)}`);
    if (res.success && res.data) {
      return {
        notifications: res.data.notifications || [],
        unreadCount: res.data.unreadCount || 0,
      };
    }
    return { notifications: [], unreadCount: 0 };
  } catch {
    return { notifications: [], unreadCount: 0 };
  }
}

export async function markAllNotificationsRead(userId: string): Promise<boolean> {
  try {
    const res = await apiRequest<any>('/notifications/read-all', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
    return res.success;
  } catch {
    return false;
  }
}

export async function markNotificationRead(notifId: string): Promise<boolean> {
  try {
    const res = await apiRequest<any>(`/notifications/${encodeURIComponent(notifId)}/read`, {
      method: 'PATCH',
    });
    return res.success;
  } catch {
    return false;
  }
}

export async function deleteNotification(notifId: string): Promise<boolean> {
  try {
    const res = await apiRequest<any>(`/notifications/${encodeURIComponent(notifId)}`, {
      method: 'DELETE',
    });
    return res.success;
  } catch {
    return false;
  }
}

// 6. Settings API
export async function fetchUserSettings(userId: string): Promise<UserSettings | null> {
  try {
    const res = await apiRequest<any>(`/user/settings?userId=${encodeURIComponent(userId)}`);
    if (res.success && res.data) {
      return res.data.settings;
    }
    return null;
  } catch {
    return null;
  }
}

export async function updateUserSettings(payload: Partial<UserSettings> & { userId: string }): Promise<boolean> {
  try {
    const res = await apiRequest<any>('/user/settings', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return res.success;
  } catch {
    return false;
  }
}

export async function changePassword(payload: {
  userId: string;
  currentPassword: string;
  newPassword: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await apiRequest<any>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return { success: res.success, error: res.error };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteUserAccount(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await apiRequest<any>('/auth/account', {
      method: 'DELETE',
      body: JSON.stringify({ userId }),
    });
    return { success: res.success, error: res.error };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
