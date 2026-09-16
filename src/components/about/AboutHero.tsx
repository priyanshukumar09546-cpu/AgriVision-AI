import React from 'react';
import { ArrowRight } from 'lucide-react';

interface AboutHeroProps {
  onMissionClick?: () => void;
}

export const AboutHero: React.FC<AboutHeroProps> = ({ onMissionClick }) => {
  const handleMissionClick = () => {
    if (onMissionClick) {
      onMissionClick();
    } else {
      const el = document.getElementById('our-mission-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="relative w-full overflow-hidden bg-white border-b border-slate-100">
      {/* High-resolution 2x Farmer Sunset Background Image positioned on the right */}
      <div
        className="hidden lg:block absolute top-0 right-0 bottom-0 w-full bg-no-repeat bg-cover pointer-events-none"
        style={{
          backgroundImage: 'url("/about_assets/hero_clean_full_2x.jpg")',
          backgroundPosition: 'right center',
        }}
        aria-hidden="true"
      />

      {/* Main Hero Container with Content on Left */}
      <div className="relative max-w-[1240px] mx-auto px-6 py-7 md:py-8 z-10">
        <div className="max-w-[580px] z-10 relative">
          {/* Small uppercase label */}
          <div className="text-[11px] sm:text-[11.5px] font-extrabold tracking-wider text-[#15803D] uppercase mb-1">
            ABOUT US
          </div>

          {/* Main heading matching reference line breaks and colors */}
          <h1 className="text-3xl sm:text-4xl md:text-[35px] font-extrabold tracking-tight leading-[1.14] text-[#0F172A]">
            <span>Empowering Farmers</span>
            <span className="block mt-0.5">
              with AI for a <span className="text-[#15803D] whitespace-nowrap">Healthier Tomorrow</span>
            </span>
          </h1>

          {/* Paragraph copy */}
          <p className="text-[12px] sm:text-[12.5px] text-slate-600 leading-relaxed mt-3 max-w-[475px]">
            At AgriVision AI, we believe that technology and agriculture together can
            create a more sustainable, food-secure, and prosperous world. Our mission
            is to make advanced AI tools accessible to every farmer, helping them
            detect crop diseases early, get expert insights, and grow healthier crops.
          </p>

          {/* Our Mission button */}
          <div className="mt-4 pt-0.5">
            <button
              type="button"
              onClick={handleMissionClick}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#15803D] hover:bg-[#166534] active:bg-[#14532D] text-white text-[12.5px] font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <span>Our Mission</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
