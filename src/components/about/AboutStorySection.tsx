import React from 'react';
import { Target, Eye } from 'lucide-react';

export const AboutStorySection: React.FC = () => {
  return (
    <section id="our-mission-section" className="w-full py-6 sm:py-7 bg-white">
      <div className="max-w-[1240px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
          {/* Left Column: Young Plant in Soil Photography (4 cols) */}
          <div className="md:col-span-4 flex items-center">
            <div className="relative w-full rounded-2xl overflow-hidden border border-slate-100 shadow-xs bg-slate-900">
              <img
                src="/about_assets/story_plant_2x.jpg"
                alt="Healthy Soil. Healthy Crops. Brighter Lives."
                className="w-full h-auto object-cover select-none block"
              />
            </div>
          </div>

          {/* Center Column: Narrative Story & Quote Box (5 cols) */}
          <div className="md:col-span-5 flex flex-col justify-between py-0.5">
            <div>
              <h2 className="text-[22px] sm:text-[24px] font-extrabold text-[#0F172A] tracking-tight leading-tight">
                Our Story
              </h2>

              <p className="text-[12px] sm:text-[12.5px] text-slate-600 leading-relaxed mt-2.5">
                AgriVision AI started with a simple idea — to use the power of
                Artificial Intelligence to solve real problems faced by farmers.
                We saw how crop diseases, lack of expert guidance, and limited
                resources affected farmers’ productivity and income. So, we built
                a platform that combines AI, data, and community knowledge to
                make farming smarter, easier, and more sustainable for everyone.
              </p>
            </div>

            {/* Quote Box with Green Left Border */}
            <div className="mt-3.5 p-3 rounded-r-xl bg-[#F4FBF7] border-l-[3.5px] border-[#15803D]">
              <p className="italic text-[12.5px] sm:text-[13px] font-medium text-[#15803D] leading-snug">
                “A world where every farmer grows with confidence.”
              </p>
            </div>
          </div>

          {/* Right Column: Mission & Vision Card (3 cols) */}
          <div className="md:col-span-3 flex">
            <div className="w-full p-4 sm:p-4.5 rounded-2xl bg-[#F4FBF7] border border-[#E5F5EC] flex flex-col justify-between">
              {/* Mission Subsection */}
              <div>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="w-8 h-8 rounded-full bg-[#DCFCE7] flex items-center justify-center shrink-0">
                    <Target className="w-4 h-4 text-[#15803D]" />
                  </div>
                  <h3 className="text-[14.5px] font-extrabold text-[#0F172A]">
                    Our Mission
                  </h3>
                </div>
                <p className="text-[11px] sm:text-[11.5px] text-slate-600 leading-relaxed pl-0.5">
                  To make AI-driven agricultural solutions accessible to every
                  farmer, helping them grow healthier crops and achieve better
                  yields.
                </p>
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-[#D6EFE0] my-3" />

              {/* Vision Subsection */}
              <div>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="w-8 h-8 rounded-full bg-[#DCFCE7] flex items-center justify-center shrink-0">
                    <Eye className="w-4 h-4 text-[#15803D]" />
                  </div>
                  <h3 className="text-[14.5px] font-extrabold text-[#0F172A]">
                    Our Vision
                  </h3>
                </div>
                <p className="text-[11px] sm:text-[11.5px] text-slate-600 leading-relaxed pl-0.5">
                  A sustainable and food-secure world where technology empowers
                  farmers and strengthens communities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
