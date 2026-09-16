import React from 'react';
import { Camera, FileText } from 'lucide-react';

interface DashboardHeroProps {
  userName: string;
  onDetectClick: () => void;
  onScanHistoryClick: () => void;
}

export const DashboardHero: React.FC<DashboardHeroProps> = ({
  userName,
  onDetectClick,
  onScanHistoryClick,
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-2xs border border-slate-200/80 min-h-[190px] sm:min-h-[200px] flex items-center select-none">
      {/* Background Photograph */}
      <img
        src="/auth_assets/auth_hero_desktop.jpg"
        alt="AgriVision Agricultural Landscape"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      {/* Dark gradient overlay on the left for crisp typography contrast */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent" />

      {/* Content Container */}
      <div className="relative z-10 w-full p-5 sm:p-7 flex flex-col justify-between h-full">
        <div className="max-w-md space-y-1.5">
          <h1 className="text-xl sm:text-2xl lg:text-[26px] font-extrabold text-white tracking-tight leading-snug flex items-center gap-2">
            <span>{getGreeting()},</span>
            <span className="truncate">{userName || 'Farmer'}</span>
            <span className="inline-block animate-wave origin-bottom-right">👋</span>
          </h1>

          <p className="text-xs sm:text-[13px] text-slate-200 font-normal leading-relaxed max-w-sm">
            Monitor your crops, detect diseases and get AI-powered insights from one place.
          </p>
        </div>

        {/* Bottom Actions Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onDetectClick}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#15803D] hover:bg-[#166534] active:bg-[#14532D] rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Detect Disease</span>
            </button>

            <button
              type="button"
              onClick={onScanHistoryClick}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 rounded-xl shadow-2xs transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4 text-slate-600" />
              <span>View Scan History</span>
            </button>
          </div>

          {/* Right Quote matching reference */}
          <div className="hidden md:block text-right">
            <p className="text-[11px] font-semibold text-white/90 drop-shadow-xs italic">
              "Healthy Crops
            </p>
            <p className="text-[11px] font-semibold text-white/90 drop-shadow-xs italic">
              Stronger Communities"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
