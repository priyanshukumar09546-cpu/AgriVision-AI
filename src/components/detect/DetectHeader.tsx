import React from 'react';
import { Sprout, Leaf } from 'lucide-react';

export const DetectHeader: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-6 border-b border-slate-200/80">
      {/* Left: Heading & Subtitle */}
      <div className="space-y-1">
        <h1 className="text-3xl sm:text-[34px] lg:text-[38px] font-extrabold text-[#0F172A] tracking-tight leading-tight">
          Detect Crop Disease
        </h1>
        <p className="text-[13.5px] sm:text-[14.5px] text-slate-600 font-normal leading-relaxed">
          Upload a leaf image and get instant AI-powered disease detection results.
        </p>
      </div>

      {/* Right: Agricultural Promotional Visual matching reference */}
      <div className="self-start md:self-auto bg-gradient-to-r from-[#F0FDF4] via-[#F3FAF5] to-[#ECFDF5] border border-emerald-100/90 rounded-2xl p-2.5 sm:px-3.5 sm:py-2.5 shadow-2xs flex items-center gap-3 sm:gap-4 shrink-0 overflow-hidden relative">
        {/* Left Badge: Healthy Plants / Stronger Future */}
        <div className="flex items-center gap-2.5 z-10 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-[#15803D] text-white flex items-center justify-center shadow-xs">
            <Sprout className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="leading-tight">
            <span className="text-[11.5px] font-bold text-[#0F172A] block">
              Healthy Plants
            </span>
            <span className="text-[12.5px] font-extrabold text-[#15803D] block tracking-tight">
              Stronger Future
            </span>
          </div>
        </div>

        {/* Center: Realistic Agricultural Landscape Photograph */}
        <div className="w-24 sm:w-28 h-10 rounded-lg overflow-hidden shrink-0 border border-emerald-200/60 shadow-2xs relative">
          <img
            src="/detect_assets/promo_landscape_2x.jpg"
            alt="Sustainable Farmland Hills"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-emerald-900/10 pointer-events-none" />
        </div>

        {/* Right Badge: Support Sustainable Farming */}
        <div className="flex items-center gap-2 text-right z-10 shrink-0 border-l border-emerald-200/60 pl-3">
          <div className="leading-tight">
            <span className="text-[10px] text-slate-500 font-medium block">
              Support
            </span>
            <span className="text-[11px] font-bold text-[#0F172A] block leading-tight">
              Sustainable
            </span>
            <span className="text-[11px] font-bold text-[#15803D] block leading-tight">
              Farming
            </span>
          </div>
          <div className="text-[#15803D] shrink-0">
            <Leaf className="w-4 h-4 fill-[#22C55E]/30 stroke-[2.2]" />
          </div>
        </div>
      </div>
    </div>
  );
};
