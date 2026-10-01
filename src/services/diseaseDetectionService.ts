/**
 * AgriVision AI Real Disease Detection Service
 * Connects to Python AI Computer Vision and Pathology Engine.
 * No fake predictions, no random selection, no hardcoded results.
 */

import { getStoredAuthUser } from './authService';
import { buildApiUrl, getAuthToken, PRODUCTION_BACKEND_URL, PRODUCTION_DETECT_ENDPOINT } from './apiClient';

export interface DiseaseDetectionResult {
  scanId?: string;
  isMock: boolean;
  crop: string;
  disease: string;
  scientificName: string;
  confidence: number;
  severity: 'Healthy' | 'Low' | 'Moderate' | 'High' | 'Severe';
  summary?: string;
  symptoms: string[];
  causes: string[];
  treatments: {
    organic: string[];
    chemical: string[];
    preventive: string[];
  };
  metrics?: {
    plantCoveragePercent: number;
    lesionAreaPercent: number;
    detectedLesionSpots: number;
  };
  imageUrl?: string;
  analyzedAt: string;
}

export interface UserScanRecord {
  id: string;
  crop: string;
  disease: string;
  scientificName: string;
  confidence: number;
  severity: string;
  imageUrl?: string;
  symptoms: string[];
  treatments: any;
  createdAt: string;
}

async function urlToFile(url: string, filename: string = 'leaf_sample.jpg'): Promise<File> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type || 'image/jpeg' });
}

export async function detectCropDisease(
  imageFileOrUrl: File | string,
  selectedCropId?: string,
  onProgress?: (stage: string, percent: number) => void
): Promise<DiseaseDetectionResult> {
  if (onProgress) {
    onProgress('Sending image to AI Pathology Engine...', 30);
  }

  let file: File;
  if (typeof imageFileOrUrl === 'string') {
    file = await urlToFile(imageFileOrUrl);
  } else {
    file = imageFileOrUrl;
  }

  if (onProgress) {
    onProgress('Analyzing botanical morphology & lesion patterns...', 65);
  }

  const formData = new FormData();
  formData.append('file', file);
  if (selectedCropId) {
    formData.append('cropId', selectedCropId.toLowerCase());
  }

  const currentUser = getStoredAuthUser();
  if (currentUser) {
    formData.append('userId', currentUser.id);
  }

  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const resolvedUrl = buildApiUrl('/api/detect');
  const targetUrl = (typeof window !== 'undefined' && 
                     (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') && 
                     !resolvedUrl.startsWith('http')) 
    ? PRODUCTION_DETECT_ENDPOINT 
    : resolvedUrl;

  console.info('[AgriVision AI] Executing disease detection POST request to:', targetUrl);

  const response = await fetch(targetUrl, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (onProgress) {
    onProgress('Compiling diagnostic pathology report...', 90);
  }

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    const message =
      errorJson.error ||
      errorJson.detail ||
      `AI detection service unavailable (${response.status}: ${response.statusText}). Please check that the AgriVision backend is running.`;
    throw new Error(message);
  }

  let data: any;
  try {
    data = await response.json();
  } catch (parseErr) {
    console.error('Failed to parse detection response:', parseErr);
    throw new Error('Unexpected non-JSON response from AgriVision AI backend server.');
  }

  if (!data.success) {
    throw new Error(
      data.error ||
        'Unable to confidently identify this image. Please upload a clearer crop/leaf image.'
    );
  }

  return {
    scanId: data.scanId,
    isMock: false,
    crop: data.crop,
    disease: data.disease,
    scientificName: data.scientificName || 'Botanical Pathogen Complex',
    confidence: data.confidence,
    severity: data.severity || 'Moderate',
    symptoms: Array.isArray(data.symptoms) ? data.symptoms : [],
    causes: Array.isArray(data.causes) ? data.causes : [],
    treatments: {
      organic: Array.isArray(data.treatments?.organic) ? data.treatments.organic : [],
      chemical: Array.isArray(data.treatments?.chemical) ? data.treatments.chemical : [],
      preventive: Array.isArray(data.treatments?.preventive) ? data.treatments.preventive : [],
    },
    metrics: data.metrics,
    imageUrl: data.imageUrl
      ? (data.imageUrl.startsWith('http') ? data.imageUrl : `${PRODUCTION_BACKEND_URL}${data.imageUrl}`)
      : undefined,
    analyzedAt: data.analyzedAt || new Date().toLocaleTimeString(),
  };
}

export async function fetchUserScans(userId?: string): Promise<UserScanRecord[]> {
  try {
    const endpoint = userId ? `/api/scans?userId=${encodeURIComponent(userId)}` : '/api/scans';
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(buildApiUrl(endpoint), { headers });
    if (!res.ok) return [];
    const data = await res.json();
    return data.scans || [];
  } catch (e) {
    console.error('Failed to fetch scans:', e);
    return [];
  }
}

export async function deleteUserScan(scanId: string): Promise<boolean> {
  try {
    const currentUser = getStoredAuthUser();
    const endpoint = currentUser ? `/api/scans/${encodeURIComponent(scanId)}?userId=${encodeURIComponent(currentUser.id)}` : `/api/scans/${encodeURIComponent(scanId)}`;
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(buildApiUrl(endpoint), { method: 'DELETE', headers });
    return res.ok;
  } catch (e) {
    console.error('Failed to delete scan:', e);
    return false;
  }
}
