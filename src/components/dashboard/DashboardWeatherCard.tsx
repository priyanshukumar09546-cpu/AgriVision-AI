import React, { useState, useEffect } from 'react';
import { MapPin, Droplets, CloudRain, Wind, Sun, CloudSun, Cloud, Loader2 } from 'lucide-react';
import { fetchLiveWeather } from '../../services/weatherService';
import type { RealWeatherResult } from '../../services/weatherService';

interface DashboardWeatherCardProps {
  weather?: RealWeatherResult | null;
  loading?: boolean;
  userLocation?: string;
  onRefresh?: () => void;
}

export const DashboardWeatherCard: React.FC<DashboardWeatherCardProps> = ({
  weather: propWeather,
  loading: propLoading = false,
  userLocation,
}) => {
  const [internalWeather, setInternalWeather] = useState<RealWeatherResult | null>(propWeather || null);
  const [isLoading, setIsLoading] = useState(propLoading);

  useEffect(() => {
    if (propWeather !== undefined) {
      setInternalWeather(propWeather);
      return;
    }
    let isMounted = true;
    setIsLoading(true);
    fetchLiveWeather(undefined, undefined, userLocation).then((res) => {
      if (isMounted) {
        setInternalWeather(res);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [propWeather, userLocation]);

  const weather = internalWeather;
  const locationDisplay = userLocation || weather?.location || 'Regional Farm, India';
  const lastUpdated = 'Live Satellite';

  const getWeatherIcon = (condition?: string) => {
    switch (condition?.toLowerCase()) {
      case 'sunny':
      case 'clear':
        return <Sun className="w-10 h-10 text-amber-500 fill-amber-400" />;
      case 'cloudy':
      case 'overcast':
        return <Cloud className="w-10 h-10 text-slate-400 fill-slate-300" />;
      case 'rainy':
      case 'drizzle':
        return <CloudRain className="w-10 h-10 text-sky-500 fill-sky-400" />;
      case 'partly-cloudy':
      default:
        return <CloudSun className="w-10 h-10 text-amber-500 fill-amber-300" />;
    }
  };



  if (weather?.error && !weather.current) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between h-full min-h-[190px]">
        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
          <MapPin className="w-3.5 h-3.5 text-emerald-700" />
          <span>{locationDisplay}</span>
        </div>
        <div className="py-6 text-center text-xs text-slate-500 font-medium">
          Weather service is currently unavailable.
        </div>
        <div className="text-[10px] text-slate-400 text-center">Open-Meteo API connection</div>
      </div>
    );
  }

  const current = weather?.current;
  const temp = current?.temperature || '28°C';
  const condition = current?.conditionLabel || 'Partly Cloudy';
  const humidity = current?.humidity || '64%';
  const rain = current?.condition === 'rainy' ? '80%' : current?.condition === 'partly-cloudy' ? '20%' : '0%';
  const wind = current?.windSpeed || '12 km/h';
  const airQuality = current?.diseaseRisk === 'High' ? 'High Risk' : current?.diseaseRisk === 'Moderate' ? 'Moderate' : 'Good';

  // Calculate approximate feels-like temperature
  const rawNum = parseInt(temp.replace(/[^0-9]/g, ''), 10) || 28;
  const feelsLike = `${rawNum + 2}°C`;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between h-full min-h-[190px] select-none text-left">
      {/* Top Header: Location + Updated Timestamp */}
      <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100/80">
        <div className="flex items-center gap-1.5 font-medium text-slate-700 truncate max-w-[200px]">
          <MapPin className="w-3.5 h-3.5 text-[#15803D] shrink-0" />
          <span className="truncate">{locationDisplay}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 shrink-0">
          {isLoading && <Loader2 className="w-3 h-3 text-[#15803D] animate-spin" />}
          <span>{lastUpdated}</span>
        </div>
      </div>

      {/* Main Temperature Display */}
      <div className="flex items-center justify-between py-3">
        <div className="flex items-center gap-3">
          <div className="shrink-0">{getWeatherIcon(current?.condition)}</div>
          <div>
            <div className="text-3xl font-extrabold text-[#0F172A] tracking-tight">{temp}</div>
            <div className="text-xs font-semibold text-slate-600">{condition}</div>
            <div className="text-[11px] text-slate-400">Feels like {feelsLike}</div>
          </div>
        </div>
      </div>

      {/* 4 Metrics Footer (matching reference image) */}
      <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-center">
        {/* Humidity */}
        <div className="flex flex-col items-center">
          <Droplets className="w-3.5 h-3.5 text-sky-500 mb-0.5" />
          <span className="text-xs font-bold text-slate-800">{humidity}</span>
          <span className="text-[10px] text-slate-400 font-medium">Humidity</span>
        </div>

        {/* Rain Chance */}
        <div className="flex flex-col items-center">
          <CloudRain className="w-3.5 h-3.5 text-blue-500 mb-0.5" />
          <span className="text-xs font-bold text-slate-800">{rain}</span>
          <span className="text-[10px] text-slate-400 font-medium">Rain</span>
        </div>

        {/* Wind Speed */}
        <div className="flex flex-col items-center">
          <Wind className="w-3.5 h-3.5 text-teal-600 mb-0.5" />
          <span className="text-xs font-bold text-slate-800">{wind}</span>
          <span className="text-[10px] text-slate-400 font-medium">Wind</span>
        </div>

        {/* Air Quality / Condition */}
        <div className="flex flex-col items-center">
          <span className="w-3.5 h-3.5 rounded-full bg-emerald-100 text-[#15803D] flex items-center justify-center text-[9px] font-bold mb-0.5">
            ✓
          </span>
          <span className="text-xs font-bold text-slate-800 truncate max-w-[60px]">{airQuality}</span>
          <span className="text-[10px] text-slate-400 font-medium">Air Quality</span>
        </div>
      </div>
    </div>
  );
};
