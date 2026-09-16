import React from 'react';
import { Sprout, ClipboardList, BarChart3, Globe } from 'lucide-react';

export const FeatureCards: React.FC = () => {
  const features = [
    {
      title: 'Detect Disease',
      description: 'Upload leaf image and get instant AI prediction.',
      icon: <Sprout className="w-5 h-5 text-[#15803D]" />,
    },
    {
      title: 'Get Insights',
      description: 'Learn about disease, symptoms and treatment.',
      icon: <ClipboardList className="w-5 h-5 text-[#15803D]" />,
    },
    {
      title: 'Increase Yield',
      description: 'Take timely action and protect your crops.',
      icon: <BarChart3 className="w-5 h-5 text-[#15803D]" />,
    },
    {
      title: 'Sustainable Future',
      description: 'Empowering farmers with AI for better agriculture.',
      icon: <Globe className="w-5 h-5 text-[#15803D]" />,
    },
  ];

  return (
    <section className="py-6 bg-white border-b border-slate-200/80">
      <div className="max-w-[1240px] mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((item) => (
            <div
              key={item.title}
              className="bg-white rounded-2xl p-4 border border-slate-200/85 shadow-2xs hover:shadow-xs transition-shadow flex items-center gap-3.5"
            >
              {/* Icon Circle with subtle soft mint green background */}
              <div className="w-12 h-12 rounded-full bg-[#EBF7EE] flex items-center justify-center shrink-0">
                {item.icon}
              </div>

              {/* Text Information */}
              <div className="min-w-0">
                <h4 className="text-[13px] font-bold text-[#0F172A] leading-snug">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
