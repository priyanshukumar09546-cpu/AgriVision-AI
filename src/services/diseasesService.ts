import { apiRequest } from './apiClient';
import { DISEASES_DATA, type Disease } from '../data/diseasesData';

export interface DiseasesFilterParams {
  search?: string;
  crop?: string;
  type?: string;
  severity?: string;
  sort?: string;
}

export async function fetchDiseasesFromDB(params?: DiseasesFilterParams): Promise<Disease[]> {
  try {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.crop && params.crop !== 'All Crops') query.set('crop', params.crop);
    if (params?.type && params.type !== 'All') query.set('type', params.type);
    if (params?.severity && params.severity !== 'All') query.set('severity', params.severity);
    if (params?.sort) query.set('sort', params.sort);

    const queryString = query.toString();
    const endpoint = `/diseases${queryString ? `?${queryString}` : ''}`;
    const res = await apiRequest<{ success: boolean; diseases: Disease[] }>(endpoint);

    if (res.success && res.data && Array.isArray(res.data.diseases) && res.data.diseases.length > 0) {
      return res.data.diseases;
    }
    return DISEASES_DATA;
  } catch (err) {
    console.warn('Fallback to local disease catalog:', err);
    return DISEASES_DATA;
  }
}

export async function fetchDiseaseById(id: string): Promise<Disease | null> {
  try {
    const res = await apiRequest<{ success: boolean; disease: Disease }>(`/diseases/${encodeURIComponent(id)}`);
    if (res.success && res.data?.disease) {
      return res.data.disease;
    }
    const found = DISEASES_DATA.find((d) => d.id === id || d.name.toLowerCase() === id.toLowerCase());
    return found || null;
  } catch (err) {
    console.warn('Fallback to local disease search:', err);
    const found = DISEASES_DATA.find((d) => d.id === id || d.name.toLowerCase() === id.toLowerCase());
    return found || null;
  }
}
