import React from 'react';
import { ArrowRight, Image as ImageIcon, Cpu, FileCheck } from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  return (
    <section className="bg-gradient-to-r from-[#EBF7EE] via-[#E5F5E9] to-[#DDF2E3] rounded-2xl border border-emerald-200/60 overflow-hidden shadow-2xs relative">
      <div className="flex flex-col lg:flex-row items-stretch justify-between">
        {/* Left: Heading & Steps */}
        <div className="p-6 lg:p-7 flex-1 flex flex-col justify-center space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight leading-tight">
              How It Works?
            </h2>
            <p className="text-xs sm:text-[13px] text-slate-600 font-medium leading-normal mt-0.5">
              Detect crop diseases in 3 simple steps.
            </p>
          </div>

          {/* Three Horizontal Steps with Arrows matching reference */}
          <div className="flex flex-col md:flex-row items-center gap-3 lg:gap-4">
            {/* Step 1: Upload */}
            <div className="flex-1 w-full flex items-center gap-3 bg-white/75 backdrop-blur-2xs p-3 rounded-xl border border-emerald-100 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#EBF7EE] text-[#15803D] flex items-center justify-center shrink-0">
                <ImageIcon className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-[#15803D] text-white text-[10px] font-bold flex items-center justify-center">
                    1
                  </span>
                  <h4 className="text-xs font-bold text-[#0F172A]">Upload</h4>
                </div>
                <p className="text-[10.5px] text-slate-500 font-medium leading-tight mt-0.5">
                  Upload a clear leaf image
                </p>
              </div>
            </div>

            {/* Directional Arrow between Step 1 & 2 */}
            <div className="text-emerald-500 shrink-0 hidden md:block">
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </div>

            {/* Step 2: Analyze */}
            <div className="flex-1 w-full flex items-center gap-3 bg-white/75 backdrop-blur-2xs p-3 rounded-xl border border-emerald-100 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#EBF7EE] text-[#15803D] flex items-center justify-center shrink-0">
                <Cpu className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-[#15803D] text-white text-[10px] font-bold flex items-center justify-center">
                    2
                  </span>
                  <h4 className="text-xs font-bold text-[#0F172A]">Analyze</h4>
                </div>
                <p className="text-[10.5px] text-slate-500 font-medium leading-tight mt-0.5">
                  Our AI model analyzes the image
                </p>
              </div>
            </div>

            {/* Directional Arrow between Step 2 & 3 */}
            <div className="text-emerald-500 shrink-0 hidden md:block">
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </div>

            {/* Step 3: Get Results */}
            <div className="flex-1 w-full flex items-center gap-3 bg-white/75 backdrop-blur-2xs p-3 rounded-xl border border-emerald-100 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#EBF7EE] text-[#15803D] flex items-center justify-center shrink-0">
                <FileCheck className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-[#15803D] text-white text-[10px] font-bold flex items-center justify-center">
                    3
                  </span>
                  <h4 className="text-xs font-bold text-[#0F172A]">Get Results</h4>
                </div>
                <p className="text-[10.5px] text-slate-500 font-medium leading-tight mt-0.5">
                  View disease, confidence and treatment suggestions
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Realistic Photograph of Hand Holding Plant with Soil */}
        <div className="lg:w-[320px] xl:w-[360px] shrink-0 flex items-center justify-end relative overflow-hidden bg-gradient-to-l from-transparent to-[#DDF2E3]/80">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-left pointer-events-none hidden sm:block">
            <span className="text-[13px] font-extrabold text-[#15803D] block leading-tight">
              Better Insights
            </span>
            <span className="text-[13px] font-extrabold text-[#15803D] block leading-tight">
              Healthier Crops
            </span>
            <span className="text-[13px] font-extrabold text-[#15803D] block leading-tight">
              Brighter Tomorrows
            </span>
          </div>

          <div className="w-full h-44 sm:h-48 lg:h-full min-h-[160px] relative">
            <img
              src="/detect_assets/hand_plant_2x.jpg"
              alt="Hand holding young seedling in soil"
              className="w-full h-full object-cover object-center"
            />
            {/* Soft left gradient fade into the card */}
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#DDF2E3] to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
};
