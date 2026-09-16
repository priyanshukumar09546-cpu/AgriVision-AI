import { apiRequest } from './apiClient';
import { ALL_CROPS, type CropInfo } from '../data/cropsData';

export interface CropsFilterParams {
  search?: string;
  category?: string;
  season?: string;
  sort?: string;
}

export async function fetchCropsFromDB(params?: CropsFilterParams): Promise<CropInfo[]> {
  try {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.category && params.category !== 'All') query.set('category', params.category);
    if (params?.season && params.season !== 'All') query.set('season', params.season);
    if (params?.sort) query.set('sort', params.sort);

    const queryString = query.toString();
    const endpoint = `/crops${queryString ? `?${queryString}` : ''}`;
    const res = await apiRequest<{ success: boolean; crops: CropInfo[] }>(endpoint);

    if (res.success && res.data && Array.isArray(res.data.crops) && res.data.crops.length > 0) {
      return res.data.crops;
    }
    return ALL_CROPS;
  } catch (err) {
    console.warn('Fallback to local crop catalog:', err);
    return ALL_CROPS;
  }
}

export async function fetchCropById(id: string): Promise<CropInfo | null> {
  try {
    const res = await apiRequest<{ success: boolean; crop: CropInfo }>(`/crops/${encodeURIComponent(id)}`);
    if (res.success && res.data?.crop) {
      return res.data.crop;
    }
    const found = ALL_CROPS.find((c) => c.id === id || c.name.toLowerCase() === id.toLowerCase());
    return found || null;
  } catch (err) {
    console.warn('Fallback to local crop search:', err);
    const found = ALL_CROPS.find((c) => c.id === id || c.name.toLowerCase() === id.toLowerCase());
    return found || null;
  }
}
