import React from 'react';
import { Users, Sprout, MessageSquare, GraduationCap } from 'lucide-react';

interface CommunityHeroProps {
  onNewPostClick?: () => void;
}

export const CommunityHero: React.FC<CommunityHeroProps> = ({ onNewPostClick }) => {
  return (
    <section className="relative w-full overflow-hidden border-b border-slate-100 bg-white">
      {/* 2x Farmers in Field Landscape Background positioned on the right */}
      <div
        className="hidden lg:block absolute top-0 right-0 bottom-0 w-[58%] bg-no-repeat bg-cover pointer-events-none"
        style={{
          backgroundImage: 'url("/community_assets/hero_community_bg_2x.jpg")',
          backgroundPosition: 'right center',
        }}
        aria-hidden="true"
      />

      {/* Smooth soft white fade transition from the left side */}
      <div
        className="hidden lg:block absolute top-0 bottom-0 left-0 w-[48%] bg-white pointer-events-none z-0"
        aria-hidden="true"
      />
      <div
        className="hidden lg:block absolute top-0 bottom-0 left-[44%] w-[12%] bg-gradient-to-r from-white to-transparent pointer-events-none z-0"
        aria-hidden="true"
      />

      {/* Main Hero Container */}
      <div className="relative max-w-[1240px] mx-auto px-6 py-7 md:py-8 z-10">
        <div className="max-w-[530px] z-10 relative">
          <h1 className="text-3xl sm:text-4xl md:text-[36px] font-extrabold tracking-tight leading-[1.12]">
            <span className="text-[#0F172A] block">Grow Together</span>
            <span className="text-[#15803D] block">Stronger Communities</span>
          </h1>

          <p className="text-[12px] sm:text-[12.5px] text-slate-600 leading-relaxed mt-2.5 max-w-[460px]">
            Ask questions, share experiences, get expert advice, and learn from farmers
            across the world. Together for a healthier and more sustainable future.
          </p>

          {/* 4 Statistics in a row matching reference */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-1">
            {/* Stat 1 */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#E8F5E9] text-[#15803D] flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[13.5px] font-extrabold text-[#0F172A] leading-tight">10K+</div>
                <div className="text-[10px] text-slate-500 leading-tight">Active Members</div>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#E8F5E9] text-[#15803D] flex items-center justify-center shrink-0">
                <Sprout className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[13.5px] font-extrabold text-[#0F172A] leading-tight">20+</div>
                <div className="text-[10px] text-slate-500 leading-tight">Crop Communities</div>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#E8F5E9] text-[#15803D] flex items-center justify-center shrink-0">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[13.5px] font-extrabold text-[#0F172A] leading-tight">50K+</div>
                <div className="text-[10px] text-slate-500 leading-tight">Discussions</div>
              </div>
            </div>

            {/* Stat 4 */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#E8F5E9] text-[#15803D] flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[13.5px] font-extrabold text-[#0F172A] leading-tight">Experts</div>
                <div className="text-[9px] text-slate-500 leading-tight">
                  Farmers • Researchers • Agronomists
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Clickable Overlay for + New Post button */}
        <button
          type="button"
          onClick={onNewPostClick}
          aria-label="Create New Post"
          className="hidden lg:block absolute top-6 md:top-7 right-6 lg:right-9 w-[105px] h-[34px] rounded-lg cursor-pointer bg-transparent hover:bg-black/10 active:bg-black/20 transition-colors z-20"
        />
      </div>
    </section>
  );
};
