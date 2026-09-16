import { apiRequest } from './apiClient';

export interface DashboardStats {
  totalScans: number;
  diseasesDetected: number;
  healthyScans: number;
  lastScanDate: string | null;
  lastScanTime: string | null;
  totalCrops: number;
}

export interface CropHealthOverview {
  totalScans: number;
  healthyPercent: number;
  diseasedPercent: number;
  needsAttentionPercent: number;
  cropsNeedingAttention: number;
}

export interface UserCropItem {
  id: string;
  name: string;
  image: string;
  plantedDate: string;
  scanCount: number;
  areaAcres: number;
}

export interface RecentScanItem {
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

export interface DashboardRecommendation {
  id: string;
  type: 'disease' | 'weather' | 'soil';
  icon: string;
  title: string;
  description: string;
  route: string;
}

export interface CommunitySnippet {
  id: string;
  authorName: string;
  authorRole: string;
  authorAvatar: string;
  title: string;
  content: string;
  imageUrl: string;
  likesCount: number;
  commentsCount: number;
  timeAgo: string;
  createdAt: string;
}

export interface DashboardData {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar_url?: string;
    location?: string;
    bio?: string;
    created_at?: string;
  };
  stats: DashboardStats;
  cropHealthOverview: CropHealthOverview;
  myCrops: UserCropItem[];
  recentScans: RecentScanItem[];
  unreadNotificationsCount: number;
  latestCommunityPost: CommunitySnippet | null;
  aiRecommendations: DashboardRecommendation[];
}

export async function fetchDashboardData(userId: string): Promise<DashboardData | null> {
  try {
    const res = await apiRequest<any>(`/dashboard?userId=${encodeURIComponent(userId)}`);
    if (res.success && res.data) {
      return res.data as DashboardData;
    }
    return null;
  } catch (err) {
    console.error('Failed to fetch dashboard data:', err);
    return null;
  }
}

export async function addUserCrop(payload: {
  userId: string;
  cropName: string;
  cropImage?: string;
  plantedDate?: string;
  areaAcres?: number;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await apiRequest<{ success: boolean; error?: string }>('/crops/my', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return { success: res.success, error: res.error };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to add crop.' };
  }
}

export async function deleteUserCrop(cropId: string, userId: string): Promise<boolean> {
  try {
    const res = await apiRequest<{ success: boolean }>(
      `/crops/my/${encodeURIComponent(cropId)}?userId=${encodeURIComponent(userId)}`,
      { method: 'DELETE' }
    );
    return res.success;
  } catch {
    return false;
  }
}

export async function fetchUserNotifications(userId: string): Promise<{ notifications: any[]; unreadCount: number }> {
  try {
    const res = await apiRequest<{ success: boolean; notifications: any[]; unreadCount: number }>(
      `/notifications?userId=${encodeURIComponent(userId)}`
    );
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

export async function markNotificationsRead(userId: string): Promise<boolean> {
  try {
    const res = await apiRequest<{ success: boolean }>('/notifications/read-all', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
    return res.success;
  } catch {
    return false;
  }
}
