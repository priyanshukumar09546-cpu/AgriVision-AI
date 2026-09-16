import React from 'react';
import { Leaf } from 'lucide-react';

export const CropsHero: React.FC = () => {
  return (
    <section className="relative w-full overflow-hidden select-none border-b border-slate-200/80 bg-white">
      {/* 
        Full-width Continuous Photographic Composition:
        Spans 100% width with the sun-drenched agricultural field and mountains on the right,
        and soft white/mist gradient on the left.
      */}
      <div className="relative w-full min-h-[140px] sm:min-h-[155px] lg:min-h-[165px] flex items-center">
        {/* Full-width background image container */}
        <div className="absolute inset-0 z-0">
          <img
            src="/crops_assets/hero_crops_bg_2x.jpg"
            alt="Agricultural Field with Mountain Landscape"
            className="w-full h-full object-cover object-right"
          />

          {/* Soft white/green gradient fade on the left */}
          <div className="absolute inset-y-0 left-0 w-full md:w-[60%] lg:w-[50%] bg-gradient-to-r from-white via-white/95 to-transparent pointer-events-none" />
        </div>

        {/* Content Container aligned with site grid */}
        <div className="relative z-10 max-w-[1240px] w-full mx-auto px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Left Content */}
          <div className="max-w-xl space-y-1">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#15803D] block">
              EXPLORE
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold tracking-tight leading-tight">
              <span className="text-[#15803D]">Crops </span>
              <span className="text-[#0F172A]">We Support</span>
            </h1>
            <p className="text-xs sm:text-[13px] text-slate-600 font-normal leading-relaxed max-w-lg">
              Select a crop to learn about common diseases, view symptoms, and get AI-powered
              detection and treatment recommendations.
            </p>
          </div>

          {/* Right Floating Card matching reference */}
          <div className="self-start md:self-center bg-white/92 backdrop-blur-md border border-emerald-200/80 rounded-2xl px-4 py-3 shadow-[0_4px_16px_rgba(0,0,0,0.06)] flex items-center gap-3.5 shrink-0 select-none">
            <div className="w-10 h-10 rounded-xl bg-[#15803D] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Leaf className="w-5 h-5 fill-white/20 stroke-[2.2]" />
            </div>
            <div className="leading-tight">
              <span className="text-[12.5px] font-bold text-[#0F172A] block">
                Healthy Crops
              </span>
              <span className="text-[12.5px] font-extrabold text-[#15803D] block tracking-tight">
                Stronger Farmers
              </span>
              <span className="text-[10px] text-slate-500 font-medium italic block mt-0.5">
                Learn. Detect. Prevent. Grow.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
