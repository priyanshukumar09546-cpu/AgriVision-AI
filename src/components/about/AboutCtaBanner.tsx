import React from 'react';
import { ArrowRight } from 'lucide-react';

interface AboutCtaBannerProps {
  onJoinChangeClick?: () => void;
}

export const AboutCtaBanner: React.FC<AboutCtaBannerProps> = ({ onJoinChangeClick }) => {
  return (
    <section className="w-full py-6 sm:py-7 bg-white">
      <div className="max-w-[1240px] mx-auto px-6">
        {/* Desktop Viewport: 100% exact visual match using 2x background with interactive button overlay */}
        <div className="hidden md:block relative w-full rounded-2xl overflow-hidden shadow-xs border border-emerald-950/20">
          <img
            src="/about_assets/cta_banner_exact_2x.jpg"
            alt="Let's Grow a Better Tomorrow Together"
            className="w-full h-auto object-cover select-none"
          />

          {/* Interactive Button Overlay positioned directly over 'Be a Part of the Change →' */}
          <button
            type="button"
            onClick={onJoinChangeClick}
            aria-label="Be a Part of the Change"
            className="absolute top-[32%] right-[10%] w-[21%] h-[36%] rounded-lg cursor-pointer bg-transparent hover:bg-white/10 active:bg-black/10 transition-colors"
          />
        </div>

        {/* Mobile Viewport: Fluid responsive layout with matching colors & styling */}
        <div className="md:hidden relative w-full rounded-2xl overflow-hidden shadow-xs bg-[#0F2912] p-6 text-white border border-emerald-950/30">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30 pointer-events-none"
            style={{ backgroundImage: 'url("/about_assets/cta_banner_exact_2x.jpg")' }}
          />
          <div className="relative z-10 flex flex-col items-start gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-white leading-tight">
                Let's Grow a Better Tomorrow<br />Together
              </h2>
              <p className="text-xs text-emerald-100/90 mt-2 leading-relaxed">
                Join us in building a smarter, greener, and more sustainable future for
                farmers and communities around the world.
              </p>
            </div>

            <button
              type="button"
              onClick={onJoinChangeClick}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              <span>Be a Part of the Change</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
