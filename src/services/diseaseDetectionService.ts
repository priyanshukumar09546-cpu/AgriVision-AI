/**
 * AgriVision AI Real Disease Detection Service
 * Connects to Python AI Computer Vision and Pathology Engine.
 * No fake predictions, no random selection, no hardcoded results.
 */

import { getStoredAuthUser } from './authService';

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

  const response = await fetch('/api/detect', {
    method: 'POST',
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
      'AI detection service is currently unavailable. Please check that the AgriVision backend is running.';
    throw new Error(message);
  }

  const data = await response.json();

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
    scientificName: data.scientificName,
    confidence: data.confidence,
    severity: data.severity,
    symptoms: data.symptoms || [],
    causes: data.causes || [],
    treatments: data.treatments || { organic: [], chemical: [], preventive: [] },
    metrics: data.metrics,
    imageUrl: data.imageUrl,
    analyzedAt: data.analyzedAt || new Date().toLocaleTimeString(),
  };
}

export async function fetchUserScans(userId?: string): Promise<UserScanRecord[]> {
  try {
    const url = userId ? `/api/scans?userId=${encodeURIComponent(userId)}` : '/api/scans';
    const res = await fetch(url);
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
    const url = currentUser ? `/api/scans/${encodeURIComponent(scanId)}?userId=${encodeURIComponent(currentUser.id)}` : `/api/scans/${encodeURIComponent(scanId)}`;
    const res = await fetch(url, { method: 'DELETE' });
    return res.ok;
  } catch (e) {
    console.error('Failed to delete scan:', e);
    return false;
  }
}
