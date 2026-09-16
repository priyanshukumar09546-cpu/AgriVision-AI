/**
 * AgriVision AI Real Insights Service
 * Computes analytics and disease epidemiology directly from real scan records.
 * Shows honest empty state if no scan records exist.
 */

import { buildApiUrl } from './apiClient';

export interface RealInsightsResult {
  hasData: boolean;
  totalScans: number;
  avgConfidence: number;
  cropBreakdown?: Array<{ crop: string; count: number; avg_conf: number }>;
  diseaseBreakdown?: Array<{ disease: string; count: number }>;
  primaryCrop?: string;
  message?: string;
}

export interface PlatformStats {
  farmersRegistered: number;
  cropsCovered: number;
  totalCropsCataloged: number;
  verifiedDiseases: number;
  scansCompleted: number;
  discussionsCount: number;
  usersCount?: number;
  postsCount?: number;
  cropsCount?: number;
}

export async function fetchRealInsights(cropFilter: string = 'all'): Promise<RealInsightsResult> {
  try {
    const res = await fetch(buildApiUrl(`/api/insights?crop=${encodeURIComponent(cropFilter)}`));
    if (!res.ok) {
      return {
        hasData: false,
        totalScans: 0,
        avgConfidence: 0,
        message: 'Unable to compile analytics at this moment.',
      };
    }
    return await res.json();
  } catch (err) {
    return {
      hasData: false,
      totalScans: 0,
      avgConfidence: 0,
      message: 'Not enough data available to generate insights yet.',
    };
  }
}

export async function fetchPlatformStats(): Promise<PlatformStats> {
  try {
    const res = await fetch(buildApiUrl('/api/stats'));
    if (!res.ok) {
      return {
        farmersRegistered: 0,
        cropsCovered: 8,
        totalCropsCataloged: 20,
        verifiedDiseases: 18,
        scansCompleted: 0,
        discussionsCount: 0,
        usersCount: 0,
        postsCount: 0,
        cropsCount: 8,
      };
    }
    const data = await res.json();
    return {
      ...data,
      usersCount: data.farmersRegistered ?? 0,
      postsCount: data.discussionsCount ?? 0,
      cropsCount: data.cropsCovered ?? 8,
    };
  } catch (e) {
    return {
      farmersRegistered: 0,
      cropsCovered: 8,
      totalCropsCataloged: 20,
      verifiedDiseases: 18,
      scansCompleted: 0,
      discussionsCount: 0,
      usersCount: 0,
      postsCount: 0,
      cropsCount: 8,
    };
  }
}
