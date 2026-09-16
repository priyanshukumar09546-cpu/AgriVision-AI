import React from 'react';
import { Zap, Target, ShieldCheck, Leaf } from 'lucide-react';

export const InfoStrip: React.FC = () => {
  const items = [
    {
      title: 'Fast Results',
      subtitle: 'Get predictions in seconds',
      icon: <Zap className="w-5 h-5 text-[#15803D] fill-[#15803D]" />,
    },
    {
      title: 'High Accuracy',
      subtitle: 'Trained on real-world data',
      icon: <Target className="w-5 h-5 text-[#15803D] stroke-[2.2]" />,
    },
    {
      title: 'Privacy Protected',
      subtitle: 'Your data stays secure',
      icon: <ShieldCheck className="w-5 h-5 text-[#15803D] stroke-[2.2]" />,
    },
    {
      title: 'Support Farmers',
      subtitle: 'Towards a sustainable future',
      icon: <Leaf className="w-5 h-5 text-[#15803D] fill-[#15803D]/20 stroke-[2.2]" />,
    },
  ];

  return (
    <section className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
        {items.map((item, idx) => (
          <div
            key={item.title}
            className={`flex items-center gap-3.5 ${
              idx > 0 ? 'pt-3 sm:pt-0 sm:pl-4 lg:pl-6' : ''
            }`}
          >
            {/* Circular light-green icon background matching reference */}
            <div className="w-12 h-12 rounded-full bg-[#EBF7EE] flex items-center justify-center shrink-0">
              {item.icon}
            </div>

            {/* Title and Subtitle */}
            <div className="min-w-0">
              <h3 className="text-[13px] font-bold text-[#0F172A] leading-snug">
                {item.title}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium leading-snug mt-0.5">
                {item.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
