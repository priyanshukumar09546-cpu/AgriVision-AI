/**
 * AgriVision AI — Google Gemini API Frontend Service
 * Connects securely to Flask backend endpoints (/api/ai/*).
 * API keys and secrets are never exposed on the frontend.
 */

import { apiRequest } from './apiClient';

export interface GeminiExplainResponse {
  success: boolean;
  explanation?: string;
  model?: string;
  error?: string;
  error_type?: string;
}

export interface GeminiChatResponse {
  success: boolean;
  answer?: string;
  model?: string;
  error?: string;
  error_type?: string;
}

export interface GeminiStatusResponse {
  success: boolean;
  configured: boolean;
  model: string;
  provider: string;
}

export const checkGeminiStatus = async (): Promise<GeminiStatusResponse> => {
  const res = await apiRequest<GeminiStatusResponse>('/ai/status', { method: 'GET' });
  if (res.success && res.data) {
    return res.data;
  }
  return { success: false, configured: false, model: 'gemini-3.6-flash', provider: 'Google Gemini' };
};

export const fetchGeminiDiseaseExplanation = async (params: {
  crop: string;
  disease: string;
  severity: string;
  symptoms?: string[];
  causes?: string[];
}): Promise<GeminiExplainResponse> => {
  const res = await apiRequest<GeminiExplainResponse>('/ai/explain-disease', {
    method: 'POST',
    body: JSON.stringify(params),
  });

  if (res.success && res.data) {
    return res.data;
  }
  return {
    success: false,
    error: res.error || 'Failed to connect to Gemini AI backend service.',
    error_type: res.error ? 'API_ERROR' : 'UNKNOWN',
  };
};

export const askGeminiAssistant = async (
  query: string,
  cropContext?: string
): Promise<GeminiChatResponse> => {
  const res = await apiRequest<GeminiChatResponse>('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ query: query.trim(), cropContext }),
  });

  if (res.success && res.data) {
    return res.data;
  }
  return {
    success: false,
    error: res.error || 'Failed to communicate with Gemini AI assistant.',
    error_type: res.error ? 'API_ERROR' : 'UNKNOWN',
  };
};
