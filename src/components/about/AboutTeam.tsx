import React from 'react';
import { Brain, Sprout, Palette, Users } from 'lucide-react';
import { TEAM_PILLARS } from '../../data/aboutData';
import type { TeamPillarItem } from '../../data/aboutData';

export const AboutTeam: React.FC = () => {
  const getIcon = (iconName: TeamPillarItem['iconName']) => {
    switch (iconName) {
      case 'brain':
        return <Brain className="w-5 h-5 text-[#15803D]" />;
      case 'sprout':
        return <Sprout className="w-5 h-5 text-[#15803D]" />;
      case 'palette':
        return <Palette className="w-5 h-5 text-[#15803D]" />;
      case 'users':
        return <Users className="w-5 h-5 text-[#15803D]" />;
    }
  };

  return (
    <section className="w-full py-7 sm:py-8 bg-white">
      <div className="max-w-[1240px] mx-auto px-6">
        {/* Centered Heading and Subtitle */}
        <div className="text-center mb-6 sm:mb-7">
          <h2 className="text-[20px] sm:text-[23px] font-extrabold text-[#0F172A] tracking-tight">
            Our Team
          </h2>
          <p className="text-[11.5px] sm:text-[12px] text-slate-500 mt-1 max-w-[620px] mx-auto">
            A group of passionate innovators, engineers, and agriculture
            enthusiasts working towards a greener tomorrow.
          </p>
        </div>

        {/* 4 Equal Columns with subtle vertical dividers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {TEAM_PILLARS.map((pillar) => (
            <div
              key={pillar.id}
              className="flex flex-col items-center text-center px-4 py-4 sm:py-2"
            >
              {/* Circular mint icon badge */}
              <div className="w-11 h-11 rounded-full bg-[#E8F8EE] flex items-center justify-center mb-2.5 shrink-0">
                {getIcon(pillar.iconName)}
              </div>

              {/* Title */}
              <h3 className="text-[13.5px] font-bold text-[#0F172A] leading-snug">
                {pillar.title}
              </h3>

              {/* Subtitle */}
              <p className="text-[11px] sm:text-[11.5px] text-slate-500 leading-relaxed mt-0.5 max-w-[200px]">
                {pillar.subtitle}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
