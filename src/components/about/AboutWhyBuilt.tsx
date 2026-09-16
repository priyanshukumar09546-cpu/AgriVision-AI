import React from 'react';
import { Leaf, BarChart3, Users, Sprout } from 'lucide-react';
import { WHY_BUILT_ITEMS } from '../../data/aboutData';
import type { WhyBuiltItem } from '../../data/aboutData';

export const AboutWhyBuilt: React.FC = () => {
  const getIcon = (iconName: WhyBuiltItem['iconName']) => {
    switch (iconName) {
      case 'leaf':
        return <Leaf className="w-5 h-5 text-[#15803D] fill-[#15803D]" />;
      case 'chart':
        return <BarChart3 className="w-5 h-5 text-[#15803D]" />;
      case 'users':
        return <Users className="w-5 h-5 text-[#15803D]" />;
      case 'sprout':
        return <Sprout className="w-5 h-5 text-[#15803D]" />;
    }
  };

  return (
    <section className="w-full py-7 sm:py-8 bg-white">
      <div className="max-w-[1240px] mx-auto px-6">
        {/* Centered Heading */}
        <h2 className="text-[20px] sm:text-[23px] font-extrabold text-[#0F172A] tracking-tight text-center mb-6 sm:mb-7">
          Why We Built AgriVision AI
        </h2>

        {/* 4 Equal Columns with subtle vertical dividers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {WHY_BUILT_ITEMS.map((item) => (
            <div
              key={item.id}
              className="flex flex-col items-center text-center px-4 py-4 sm:py-2"
            >
              {/* Circular mint icon badge */}
              <div className="w-11 h-11 rounded-full bg-[#E8F8EE] flex items-center justify-center mb-2.5 shrink-0">
                {getIcon(item.iconName)}
              </div>

              {/* Title */}
              <h3 className="text-[13.5px] font-bold text-[#0F172A] leading-snug">
                {item.title}
              </h3>

              {/* Description */}
              <p className="text-[11px] sm:text-[11.5px] text-slate-500 leading-relaxed mt-1 max-w-[210px]">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
