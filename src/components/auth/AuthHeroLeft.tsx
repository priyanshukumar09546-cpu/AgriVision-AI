import React from 'react';
import { ShieldCheck, BarChart3, Users } from 'lucide-react';

export const AuthHeroLeft: React.FC = () => {
  return (
    <div className="w-full flex flex-col justify-between select-none py-2 lg:py-4">
      {/* Headline & Supporting Text */}
      <div>
        <h1 className="text-3xl sm:text-4xl lg:text-[44px] xl:text-[48px] font-extrabold text-[#0F172A] leading-[1.08] tracking-tight">
          Smarter
          <br />
          Farming
          <br />
          <span className="text-[#15803D]">Starts Here</span>
        </h1>

        <div className="mt-3.5 text-xs sm:text-sm text-slate-700 font-medium leading-relaxed max-w-sm drop-shadow-2xs">
          <p>Detect. Learn. Grow.</p>
          <p className="text-slate-600">Together for a healthier tomorrow.</p>
        </div>

        {/* Three Frosted Glass Feature Cards matching reference */}
        <div className="mt-7 sm:mt-8 space-y-3 max-w-[360px]">
          {/* Feature 1: Detect Crop Diseases */}
          <div className="bg-white/85 hover:bg-white/95 backdrop-blur-md border border-white/90 rounded-2xl p-3.5 flex items-center gap-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all group">
            <div className="w-10 h-10 rounded-xl bg-emerald-100/90 text-[#15803D] flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-200">
              <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="leading-tight">
              <h2 className="text-[13.5px] font-bold text-[#0F172A]">
                Detect Crop Diseases
              </h2>
              <p className="text-[11.5px] text-slate-600 font-medium mt-0.5">
                Get instant AI-powered results
              </p>
            </div>
          </div>

          {/* Feature 2: Learn & Grow */}
          <div className="bg-white/85 hover:bg-white/95 backdrop-blur-md border border-white/90 rounded-2xl p-3.5 flex items-center gap-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all group">
            <div className="w-10 h-10 rounded-xl bg-emerald-100/90 text-[#15803D] flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-200">
              <BarChart3 className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="leading-tight">
              <h2 className="text-[13.5px] font-bold text-[#0F172A]">
                Learn & Grow
              </h2>
              <p className="text-[11.5px] text-slate-600 font-medium mt-0.5">
                Access expert insights
              </p>
            </div>
          </div>

          {/* Feature 3: Join a Growing Community */}
          <div className="bg-white/85 hover:bg-white/95 backdrop-blur-md border border-white/90 rounded-2xl p-3.5 flex items-center gap-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all group">
            <div className="w-10 h-10 rounded-xl bg-emerald-100/90 text-[#15803D] flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-200">
              <Users className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="leading-tight">
              <h2 className="text-[13.5px] font-bold text-[#0F172A]">
                Join a Growing Community
              </h2>
              <p className="text-[11.5px] text-slate-600 font-medium mt-0.5">
                Connect with farmers and experts
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Translucent quote card */}
      <div className="pt-6 sm:pt-8">
        <div className="inline-block bg-white/80 backdrop-blur-md border border-white/85 rounded-2xl px-5 py-3 shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
          <p className="italic font-medium text-xs sm:text-[13px] text-slate-800 leading-snug">
            “Healthy Crops<br />
            Stronger Communities”
          </p>
        </div>
      </div>
    </div>
  );
};
