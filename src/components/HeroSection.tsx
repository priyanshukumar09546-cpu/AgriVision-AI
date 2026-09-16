import React from 'react';
import { ArrowRight, AlertTriangle, Sparkles, ShieldCheck } from 'lucide-react';

interface HeroSectionProps {
  onDetectClick?: () => void;
  onLearnMoreClick?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onDetectClick,
  onLearnMoreClick,
}) => {
  return (
    <section className="relative w-full overflow-hidden select-none border-b border-slate-200/80 bg-white">
      {/* 
        Full-width Continuous Photographic Composition:
        Spans 100% width with the complete un-cropped leaf on the right
        and the soft white/agricultural blur gradient on the left.
        At 1440px+ screens, the height scales proportionally with 31.25vw (3.2:1 ratio),
        ensuring 100% of the leaf is visible without vertical or horizontal cropping.
      */}
      <div className="relative w-full min-h-[440px] sm:min-h-[460px] lg:h-[clamp(440px,31.25vw,600px)] flex items-center">
        {/* Full-width background image container */}
        <div className="absolute inset-0 z-0">
          <img
            src="/assets/hero_bg_continuous_2x.jpg"
            alt="AgriVision AI Full-Width Agricultural Hero with Diseased Leaf"
            className="w-full h-full object-cover object-right"
            style={{
              imageRendering: 'auto',
            }}
          />

          {/* 
            Soft white agricultural blur + gradient fade overlay on the left:
            Transitions smoothly: LEFT (white/light blur) -> CENTER (soft blend) -> RIGHT (full-color photograph)
          */}
          <div className="absolute inset-y-0 left-0 w-full md:w-[60%] lg:w-[53%] xl:w-[48%] bg-gradient-to-r from-white via-white/95 to-transparent pointer-events-none" />

          {/* AI Scanning Overlay Container over the right-side leaf */}
          <div className="absolute right-[4%] sm:right-[7%] lg:right-[9%] xl:right-[11%] top-1/2 -translate-y-1/2 w-[280px] sm:w-[320px] lg:w-[360px] xl:w-[400px] h-[280px] sm:h-[300px] lg:h-[340px] xl:h-[370px] pointer-events-none hidden md:block">
            {/* AI Scanning Frame with 4 Crisp Neon Green Corner Brackets */}
            <div className="relative w-full h-full border border-emerald-500/25 rounded-2xl">
              {/* Corner Bracket: Top-Left */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-[2.5px] border-l-[2.5px] border-[#22C55E] rounded-tl-sm shadow-[0_0_8px_#22C55E]" />
              
              {/* Corner Bracket: Top-Right */}
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-[2.5px] border-r-[2.5px] border-[#22C55E] rounded-tr-sm shadow-[0_0_8px_#22C55E]" />
              
              {/* Corner Bracket: Bottom-Left */}
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-[2.5px] border-l-[2.5px] border-[#22C55E] rounded-bl-sm shadow-[0_0_8px_#22C55E]" />
              
              {/* Corner Bracket: Bottom-Right */}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-[2.5px] border-r-[2.5px] border-[#22C55E] rounded-br-sm shadow-[0_0_8px_#22C55E]" />

              {/* Top Accent Tag: Healthy Crop / Stronger Future */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0F172A]/85 backdrop-blur-sm border border-emerald-500/40 px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-emerald-300 flex items-center gap-1 shadow-xs">
                <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                <span>Healthy Crop • Stronger Future</span>
              </div>

              {/* Dynamic Animated Vertical Scan Laser Line */}
              <div
                className="absolute inset-y-0 w-0.5 bg-gradient-to-b from-transparent via-[#4ADE80] to-transparent shadow-[0_0_12px_#22C55E]"
                style={{
                  animation: 'heroScanBox 3.6s ease-in-out infinite alternate',
                }}
              />

              {/* Detection Card: Disease Detected / Early Blight / Confidence: 94.2% */}
              <div className="absolute top-[32%] left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0F172A]/90 backdrop-blur-md border border-emerald-500/50 rounded-xl p-3.5 shadow-[0_12px_32px_rgba(0,0,0,0.45)] min-w-[200px] pointer-events-auto select-none transition-transform hover:scale-[1.02]">
                <div className="flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-[10px] font-bold tracking-wider text-slate-200 uppercase">
                    Disease Detected
                  </span>
                </div>
                <div className="text-[15px] font-extrabold text-white tracking-tight leading-snug">
                  Early Blight
                </div>
                <div className="text-[11.5px] font-semibold text-[#4ADE80] mt-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] shadow-[0_0_6px_#22C55E] animate-pulse" />
                  <span>Confidence: High</span>
                </div>
              </div>

              {/* Bottom Accent Tag: Technology for a Greener Tomorrow */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#0F172A]/85 backdrop-blur-sm border border-emerald-500/40 px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-slate-300 flex items-center gap-1 shadow-xs">
                <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                <span>Technology for a Greener Tomorrow</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Container aligned with site grid */}
        <div className="relative z-10 w-full max-w-[1240px] mx-auto px-6 py-8 sm:py-10 lg:py-12">
          <div className="max-w-xl xl:max-w-2xl space-y-4 sm:space-y-5">
            {/* AI MEETS AGRICULTURE Pill Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100/90 text-emerald-800 rounded-full text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>AI Meets Agriculture</span>
            </div>

            {/* Main Heading matching reference Image 1 */}
            <h1 className="text-3xl sm:text-4xl lg:text-[45px] xl:text-[48px] font-extrabold tracking-tight leading-[1.12] text-[#0F172A]">
              <span>Healthy Crops</span> <br />
              <span>Brighter </span>
              <span className="text-emerald-700 underline decoration-emerald-500 decoration-wavy underline-offset-4">
                Tomorrows
              </span>
            </h1>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-700 max-w-md leading-relaxed font-medium">
              Detect diseases, get expert advice, track your crops and build a smarter tomorrow with AI.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={onLearnMoreClick}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-full text-xs font-semibold transition-colors cursor-pointer"
              >
                <span>🌱 Detect Diseases</span>
              </button>
              <button
                type="button"
                onClick={onLearnMoreClick}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-full text-xs font-semibold transition-colors cursor-pointer"
              >
                <span>💬 Expert Guidance</span>
              </button>
              <button
                type="button"
                onClick={onLearnMoreClick}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-full text-xs font-semibold transition-colors cursor-pointer"
              >
                <span>📊 Better Yield</span>
              </button>
            </div>

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
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 rounded-full shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes heroScanBox {
          0% {
            left: 10%;
            opacity: 0.4;
          }
          50% {
            opacity: 1;
          }
          100% {
            left: 90%;
            opacity: 0.4;
          }
        }
      `}</style>
    </section>
  );
};
