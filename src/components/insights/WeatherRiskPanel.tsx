import React, { useState } from 'react';
import { ShieldCheck, MapPin, ChevronDown, Sun, CloudSun, CloudRain, AlertTriangle } from 'lucide-react';
import type { WeatherDay } from '../../data/insightsData';

interface WeatherRiskPanelProps {
  location: string;
  forecastDays: WeatherDay[];
  alert: {
    title: string;
    description: string;
    buttonText: string;
  };
  onViewPrecautions: () => void;
}

export const WeatherRiskPanel: React.FC<WeatherRiskPanelProps> = ({
  location,
  forecastDays,
  alert,
  onViewPrecautions,
}) => {
  const [forecastRange, setForecastRange] = useState('7 Days Forecast');

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny':
        return <Sun className="w-5 h-5 text-amber-500" />;
      case 'partly-cloudy':
        return <CloudSun className="w-5 h-5 text-amber-500" />;
      case 'rainy':
      default:
        return <CloudRain className="w-5 h-5 text-sky-600" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High':
        return 'text-[#DC2626]';
      case 'Moderate':
        return 'text-[#F59E0B]';
      case 'Low':
      default:
        return 'text-[#15803D]';
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-[#15803D] text-white flex items-center justify-center shrink-0">
            <ShieldCheck className="w-3 h-3 text-white" />
          </div>
          <div>
            <h3 className="text-[12.5px] font-bold text-[#0F172A] leading-tight">
              Weather & Disease Risk
            </h3>
            <div className="flex items-center gap-1 text-[10px] text-slate-500 leading-tight mt-0.5">
              <MapPin className="w-2.5 h-2.5 text-sky-600" />
              <span>{location}</span>
            </div>
          </div>
        </div>

        {/* Dropdown */}
        <div className="relative">
          <select
            value={forecastRange}
            onChange={(e) => setForecastRange(e.target.value)}
            className="pl-2 pr-6 py-1 bg-white border border-slate-200 rounded-md text-[10px] font-semibold text-slate-700 focus:outline-none appearance-none cursor-pointer"
          >
            <option value="7 Days Forecast">7 Days Forecast</option>
            <option value="14 Days Forecast">14 Days Forecast</option>
          </select>
          <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* 7 Weather Columns matching reference */}
      <div className="grid grid-cols-7 gap-1 text-center py-2 select-none">
        {forecastDays.map((f, i) => (
          <div key={i} className="flex flex-col items-center justify-center p-1 rounded-lg hover:bg-slate-50 transition-colors">
            <span className="text-[10px] font-bold text-slate-700 leading-tight">{f.day}</span>
            <span className="text-[8.5px] text-slate-400 leading-tight mb-1">{f.date}</span>
            <div className="my-1">{getWeatherIcon(f.condition)}</div>
            <span className="text-[11px] font-extrabold text-slate-900 leading-tight mt-0.5">{f.temp}</span>
            <span className={`text-[9px] font-bold mt-0.5 ${getRiskColor(f.risk)}`}>{f.risk}</span>
          </div>
        ))}
      </div>

      {/* Red / Pink Alert Warning Box matching reference */}
      <div className="bg-[#FEF2F2] border border-[#FEE2E2] rounded-xl p-2.5 flex items-center justify-between gap-2.5 mt-2 text-left">
        <div className="flex items-start gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-rose-100 text-[#DC2626] flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-[11px] font-bold text-[#DC2626] leading-tight">
              {alert.title}
            </h4>
            <p className="text-[9px] text-slate-600 leading-snug mt-0.5 line-clamp-2">
              {alert.description}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onViewPrecautions}
          className="shrink-0 px-3.5 py-1.5 bg-[#EF4444] hover:bg-rose-700 text-white text-[10.5px] font-semibold rounded-full transition-colors shadow-2xs whitespace-nowrap"
        >
          {alert.buttonText}
        </button>
      </div>
    </div>
  );
};
