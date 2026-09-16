import React from 'react';
import { BarChart3 } from 'lucide-react';

export const InsightsHero: React.FC = () => {
  return (
    <section className="relative w-full overflow-hidden border-b border-slate-100 bg-[#FAFDFB]">
      {/* 2x Landscape Background */}
      <div 
        className="absolute inset-0 bg-no-repeat bg-right bg-cover pointer-events-none"
        style={{
          backgroundImage: 'url("/insights_assets/hero_insights_bg_2x.jpg")',
          backgroundPosition: 'right center'
        }}
        aria-hidden="true"
      />
      {/* Background overlay: solid white on left, smooth fade to landscape */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-white via-white via-42% to-transparent pointer-events-none" 
        aria-hidden="true"
      />

      <div className="relative max-w-[1240px] mx-auto px-6 py-7 md:py-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Text */}
          <div className="max-w-[560px] z-10">
            <h1 className="text-2xl sm:text-3xl md:text-[34px] font-extrabold tracking-tight leading-tight">
              <span className="text-[#0F172A]">AI-Powered </span>
              <span className="text-[#15803D]">Insights</span>
            </h1>
            <p className="text-[12.5px] sm:text-[13px] text-slate-600 leading-relaxed mt-2 max-w-[490px]">
              Turn data into better decisions. Get personalized recommendations, risk alerts, and smart insights to grow healthier and more productive crops.
            </p>
          </div>

          {/* Right Translucent Card matching reference screenshot */}
          <div className="z-10 lg:pr-12">
            <div className="bg-white/85 backdrop-blur-md border border-white/80 rounded-2xl px-5 py-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.05)] flex items-center gap-4 min-w-[210px]">
              <div className="w-10 h-10 rounded-2xl bg-[#E8F5E9] text-[#15803D] flex items-center justify-center shrink-0">
                <BarChart3 className="w-5 h-5 text-[#15803D]" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[13px] font-bold text-[#0F172A] leading-tight">
                  Smarter Insights
                </span>
                <span className="text-[13px] font-bold text-[#0F172A] leading-tight mt-0.5">
                  Healthier Farms
                </span>
                <span className="text-[10.5px] text-slate-500 leading-tight mt-1 font-medium">
                  A Greener Tomorrow
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
