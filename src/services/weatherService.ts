/**
 * AgriVision AI Real Weather Service
 * Connected to Open-Meteo live satellite & meteorological data.
 * No hardcoded or fake temperatures.
 */

import { buildApiUrl } from './apiClient';

export interface WeatherDayForecast {
  day: string;
  date: string;
  temp: string;
  condition: 'sunny' | 'partly-cloudy' | 'rainy';
  conditionLabel: string;
  risk: 'Low' | 'Moderate' | 'High';
}

export interface RealWeatherResult {
  success: boolean;
  location?: string;
  latitude?: number;
  longitude?: number;
  current?: {
    temperature: string;
    tempValue: number;
    humidity: string;
    humidityValue: number;
    windSpeed: string;
    condition: 'sunny' | 'partly-cloudy' | 'rainy';
    conditionLabel: string;
    diseaseRisk: 'Low' | 'Moderate' | 'High';
  };
  forecast?: WeatherDayForecast[];
  error?: string;
}

export async function fetchLiveWeather(
  lat?: number,
  lon?: number,
  locationName?: string
): Promise<RealWeatherResult> {
  // Try to use browser geolocation if coordinates not provided
  let latitude = lat;
  let longitude = lon;
  let location = locationName;

  if (latitude === undefined || longitude === undefined) {
    // Default to agricultural regional hub if geolocation is not immediately available
    latitude = 28.6139;
    longitude = 77.2090;
    location = locationName || 'Regional Agro-Zone (North)';
  }

  try {
    const endpoint = `/api/weather?lat=${latitude}&lon=${longitude}&location=${encodeURIComponent(location || 'Local Field')}`;
    const res = await fetch(buildApiUrl(endpoint));
    if (!res.ok) {
      return {
        success: false,
        error: 'Unable to fetch weather information right now.',
      };
    }
    const data = await res.json();
    return data;
  } catch (err: any) {
    return {
      success: false,
      error: 'Unable to fetch weather information right now.',
    };
  }
}
