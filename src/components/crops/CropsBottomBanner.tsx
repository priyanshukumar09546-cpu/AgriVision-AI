import React from 'react';
import { Sprout, BookOpen, ShieldCheck, Users } from 'lucide-react';

export const CropsBottomBanner: React.FC = () => {
  const blocks = [
    {
      icon: <Sprout className="w-5 h-5 text-[#15803D] stroke-[2.2]" />,
      title: 'Wide Crop Coverage',
      desc: 'Support for 20+ major crops',
    },
    {
      icon: <BookOpen className="w-5 h-5 text-[#15803D] stroke-[2.2]" />,
      title: 'Detailed Information',
      desc: 'Disease symptoms, causes and treatment',
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-[#15803D] stroke-[2.2]" />,
      title: 'AI-Powered Insights',
      desc: 'Get instant and reliable results',
    },
    {
      icon: <Users className="w-5 h-5 text-[#15803D] stroke-[2.2]" />,
      title: 'Help Farmers Grow',
      desc: 'Towards a healthier and more sustainable future',
    },
  ];

  return (
    <section className="bg-gradient-to-r from-[#EBF7EE] via-[#E2F4E6] to-[#DCF0E2] rounded-2xl border border-emerald-200/70 overflow-hidden shadow-2xs relative select-none">
      <div className="flex flex-col lg:flex-row items-stretch justify-between">
        {/* Four Feature Blocks matching reference */}
        <div className="p-5 lg:p-6 flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 items-center">
          {blocks.map((b) => (
            <div key={b.title} className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shrink-0 shadow-2xs">
                {b.icon}
              </div>
              <div className="min-w-0">
                <h4 className="text-[13px] font-bold text-[#0F172A] leading-tight">
                  {b.title}
                </h4>
                <p className="text-[11px] text-slate-600 font-medium leading-tight mt-0.5">
                  {b.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Right Side: Better Crops / Brighter Tomorrows + Young Sprout Photograph matching reference */}
        <div className="lg:w-[260px] xl:w-[290px] shrink-0 flex items-center justify-end relative overflow-hidden bg-gradient-to-l from-transparent to-[#DCF0E2]/80 border-t lg:border-t-0 lg:border-l border-emerald-200/50">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-left pointer-events-none hidden sm:block">
            <span className="text-[13px] font-extrabold text-[#15803D] block leading-tight">
              Better Crops
            </span>
            <span className="text-[13px] font-extrabold text-[#15803D] block leading-tight">
              Brighter Tomorrows
            </span>
          </div>

          <div className="w-full h-24 sm:h-28 lg:h-full min-h-[90px] relative">
            <img
              src="/crops_assets/bottom_plant_sprout_2x.jpg"
              alt="Young plant sprout in soil"
              className="w-full h-full object-cover object-right"
            />
            {/* Soft fade into the left section */}
            <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#DCF0E2] to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
};
