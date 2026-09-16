import React from 'react';
import { Sprout, ShieldCheck, BarChart3, Globe } from 'lucide-react';

export const InsightsBottomBanner: React.FC = () => {
  return (
    <section className="relative w-full overflow-hidden border-t border-slate-200/80 bg-[#0F3925]">
      {/* 2x Photographic Farm Landscape Background */}
      <div
        className="absolute inset-0 bg-cover bg-left pointer-events-none"
        style={{
          backgroundImage: 'url("/insights_assets/bottom_insights_banner_2x.jpg")',
          backgroundPosition: 'left center',
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-[1240px] mx-auto px-6 py-6 md:py-7 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Text */}
        <div className="text-left text-white z-10">
          <h3 className="text-[17px] sm:text-[19px] font-extrabold tracking-tight leading-tight drop-shadow-sm">
            Empowering Farmers with AI
          </h3>
          <p className="text-xs sm:text-[13px] text-white/95 font-medium leading-tight mt-1 drop-shadow-xs">
            For Healthier Crops, Brighter Tomorrows.
          </p>
        </div>

        {/* Right 4 Feature Items matching reference */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-5 lg:gap-7 z-10">
          {/* Feature 1 */}
          <div className="flex items-center gap-2 text-slate-800">
            <Sprout className="w-4 h-4 text-[#064E3B] shrink-0" />
            <span className="text-xs font-bold text-[#0F172A] tracking-tight">
              Data-Driven Farming
            </span>
          </div>

          {/* Feature 2 */}
          <div className="flex items-center gap-2 text-slate-800">
            <ShieldCheck className="w-4 h-4 text-[#064E3B] shrink-0" />
            <span className="text-xs font-bold text-[#0F172A] tracking-tight">
              Prevent Crop Loss
            </span>
          </div>

          {/* Feature 3 */}
          <div className="flex items-center gap-2 text-slate-800">
            <BarChart3 className="w-4 h-4 text-[#064E3B] shrink-0" />
            <span className="text-xs font-bold text-[#0F172A] tracking-tight">
              Increase Productivity
            </span>
          </div>

          {/* Feature 4 */}
          <div className="flex items-center gap-2 text-slate-800">
            <Globe className="w-4 h-4 text-[#064E3B] shrink-0" />
            <span className="text-xs font-bold text-[#0F172A] tracking-tight">
              Sustainable Future
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
