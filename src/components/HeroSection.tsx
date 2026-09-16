import React from 'react';
import { ArrowRight, Sparkles, MessageSquare, BarChart3, Leaf } from 'lucide-react';

interface HeroSectionProps {
  onDetectClick?: () => void;
  onLearnMoreClick?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onDetectClick,
  onLearnMoreClick,
}) => {
  return (
    <section className="py-4 sm:py-6 bg-[#F8FAFC]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        {/* Rounded Hero Card matching Reference Image 1 */}
        <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-950/80 via-emerald-900/60 to-transparent shadow-lg border border-emerald-800/30 flex flex-col md:flex-row items-center justify-between min-h-[380px] sm:min-h-[420px] lg:min-h-[460px]">
          
          {/* Background Agricultural Photograph */}
          <div className="absolute inset-0 z-0">
            <img
              src="/assets/hero_bg_continuous_2x.jpg"
              alt="AgriVision AI Agricultural Hero Sprout"
              className="w-full h-full object-cover object-right"
            />
            {/* Smooth left gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 sm:via-white/90 to-transparent w-full md:w-[68%] lg:w-[60%]" />
          </div>

          {/* Left Content Area */}
          <div className="relative z-10 p-6 sm:p-8 lg:p-10 max-w-xl space-y-4 sm:space-y-5">
            {/* AI MEETS AGRICULTURE Pill Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100/90 text-emerald-800 rounded-full text-xs font-bold tracking-wide uppercase shadow-2xs">
              <Leaf className="w-3.5 h-3.5 text-emerald-700" />
              <span>AI Meets Agriculture</span>
            </div>

            {/* Main Heading matching reference Image 1 */}
            <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-extrabold tracking-tight leading-[1.12] text-[#0F172A]">
              <span>Healthy Crops</span> <br />
              <span>Brighter </span>
              <span className="text-emerald-700 underline decoration-emerald-500 decoration-wavy underline-offset-4">
                Tomorrows
              </span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-xs sm:text-sm text-slate-700 max-w-md leading-relaxed font-medium">
              Detect diseases, get expert advice, track your crops and build a smarter tomorrow with AI.
            </p>

            {/* Primary Get Started CTA Button */}
            <div className="pt-2">
              <a
                href="/detect"
                onClick={(e) => {
                  if (onDetectClick) {
                    e.preventDefault();
                    onDetectClick();
                  }
                }}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 rounded-full shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Right Visual Area: Cursive Tag + Powered by AI + Floating Badges */}
          <div className="relative z-10 w-full md:w-auto p-6 md:pr-10 lg:pr-12 flex flex-col items-end justify-between h-full min-h-[220px] md:min-h-[380px] pointer-events-none">
            {/* Top Right: Cursive Script & Powered by AI badge */}
            <div className="flex items-center gap-3 self-end">
              <span className="font-serif italic text-emerald-800 font-bold text-sm sm:text-base tracking-wide drop-shadow-xs hidden sm:inline-block">
                Grow Smart Live Better
              </span>
              <div className="px-3 py-1 bg-white/85 backdrop-blur-md border border-slate-200/80 rounded-full text-xs font-bold text-slate-800 shadow-xs flex items-center gap-1.5">
                <span>Powered by</span>
                <span className="font-extrabold text-emerald-800 flex items-center gap-0.5">
                  AI <Sparkles className="w-3 h-3 text-amber-500" />
                </span>
              </div>
            </div>

            {/* Bottom Right: 3 Floating Feature Pills Stacked */}
            <div className="mt-auto space-y-2 pointer-events-auto select-none pt-4 md:pt-0">
              <button
                type="button"
                onClick={onLearnMoreClick}
                className="flex items-center gap-2 px-3.5 py-1.5 bg-white/95 backdrop-blur-md text-emerald-900 border border-emerald-200/90 rounded-full text-xs font-bold shadow-sm hover:shadow-md hover:scale-105 transition-all cursor-pointer w-full justify-start"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Leaf className="w-3 h-3" />
                </div>
                <span>Detect Diseases</span>
              </button>

              <button
                type="button"
                onClick={onLearnMoreClick}
                className="flex items-center gap-2 px-3.5 py-1.5 bg-white/95 backdrop-blur-md text-emerald-900 border border-emerald-200/90 rounded-full text-xs font-bold shadow-sm hover:shadow-md hover:scale-105 transition-all cursor-pointer w-full justify-start"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <MessageSquare className="w-3 h-3" />
                </div>
                <span>Expert Guidance</span>
              </button>

              <button
                type="button"
                onClick={onLearnMoreClick}
                className="flex items-center gap-2 px-3.5 py-1.5 bg-white/95 backdrop-blur-md text-emerald-900 border border-emerald-200/90 rounded-full text-xs font-bold shadow-sm hover:shadow-md hover:scale-105 transition-all cursor-pointer w-full justify-start"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <BarChart3 className="w-3 h-3" />
                </div>
                <span>Better Yield</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
