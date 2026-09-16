import React from 'react';
import { Leaf, BookOpen, ShieldCheck } from 'lucide-react';

export const LibraryHero: React.FC = () => {
  return (
    <section className="relative w-full overflow-hidden border-b border-slate-100/80 bg-[#F4FAF6]">
      {/* Background with 2x continuous agricultural leaf & glistening water droplets */}
      <div 
        className="absolute inset-0 bg-no-repeat bg-right bg-cover pointer-events-none"
        style={{
          backgroundImage: 'url("/diseases_assets/hero_disease_leaf_2x.jpg")',
          backgroundPosition: 'right center'
        }}
        aria-hidden="true"
      />
      {/* Mobile contrast scrim so text is sharp and readable on narrow viewports */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-[#F4FAF6] via-[#F4FAF6]/90 to-transparent lg:hidden pointer-events-none" 
        aria-hidden="true"
      />

      <div className="relative max-w-[1240px] mx-auto px-6 py-7 md:py-9">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Text Content */}
          <div className="max-w-[560px] z-10">
            <span className="inline-block text-[11px] font-bold tracking-[0.14em] uppercase text-[#15803D] mb-1.5">
              DISEASE LIBRARY
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-[34px] font-extrabold tracking-tight leading-tight">
              <span className="text-[#0F172A]">Know More. </span>
              <span className="text-[#15803D]">Grow Better.</span>
            </h1>
            <p className="text-[12.5px] sm:text-[13px] text-slate-600 leading-relaxed mt-2 max-w-[490px]">
              Explore detailed information about crop diseases, their symptoms, causes, and AI-recommended treatments. Knowledge today, healthier crops tomorrow.
            </p>
          </div>

          {/* Right 3 Info Cards matching reference screenshot */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 z-10 lg:pr-10">
            {/* Card 1: 100+ Crop Diseases */}
            <div className="bg-white/95 backdrop-blur-sm border border-slate-100 rounded-xl px-3.5 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center gap-3 min-w-[155px]">
              <div className="w-9 h-9 rounded-full bg-[#E8F5E9] text-[#15803D] flex items-center justify-center shrink-0">
                <Leaf className="w-4 h-4 text-[#15803D]" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[14px] font-bold text-[#0F172A] leading-tight">100+</span>
                <span className="text-[11.5px] font-semibold text-[#0F172A] leading-tight">Crop Diseases</span>
                <span className="text-[10px] text-slate-500 leading-tight mt-0.5">Across 20+ crops</span>
              </div>
            </div>

            {/* Card 2: Detailed Guides */}
            <div className="bg-white/95 backdrop-blur-sm border border-slate-100 rounded-xl px-3.5 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center gap-3 min-w-[165px]">
              <div className="w-9 h-9 rounded-full bg-[#E8F5E9] text-[#15803D] flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4 text-[#15803D]" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[12.5px] font-bold text-[#0F172A] leading-tight">Detailed Guides</span>
                <span className="text-[10px] text-slate-500 leading-tight mt-0.5">Symptoms, Causes</span>
                <span className="text-[10px] text-slate-500 leading-tight">& Treatments</span>
              </div>
            </div>

            {/* Card 3: Expert Verified */}
            <div className="bg-white/95 backdrop-blur-sm border border-slate-100 rounded-xl px-3.5 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center gap-3 min-w-[165px]">
              <div className="w-9 h-9 rounded-full bg-[#E8F5E9] text-[#15803D] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-[#15803D]" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[12.5px] font-bold text-[#0F172A] leading-tight">Expert Verified</span>
                <span className="text-[10px] text-slate-500 leading-tight mt-0.5">Backed by agricultural</span>
                <span className="text-[10px] text-slate-500 leading-tight">research</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
