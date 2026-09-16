import React from 'react';
import { Camera, Sprout, Sun, Users, ArrowRight, Bot, Sparkles } from 'lucide-react';

interface FeatureCardsProps {
  onRouteChange?: (route: string) => void;
  onOpenAiAssistant?: () => void;
}

export const FeatureCards: React.FC<FeatureCardsProps> = ({
  onRouteChange,
  onOpenAiAssistant,
}) => {
  const quickActions = [
    {
      title: 'Scan Plant',
      description: 'Detect diseases instantly',
      icon: Camera,
      bgColor: 'bg-emerald-50',
      iconColor: 'bg-emerald-100 text-emerald-700',
      btnColor: 'bg-emerald-600 text-white hover:bg-emerald-700',
      route: '/detect',
    },
    {
      title: 'My Crops',
      description: 'Manage & track your fields',
      icon: Sprout,
      bgColor: 'bg-blue-50/80',
      iconColor: 'bg-blue-100 text-blue-700',
      btnColor: 'bg-blue-600 text-white hover:bg-blue-700',
      route: '/my-crops',
    },
    {
      title: 'Weather',
      description: 'Get real-time updates',
      icon: Sun,
      bgColor: 'bg-amber-50/80',
      iconColor: 'bg-amber-100 text-amber-700',
      btnColor: 'bg-amber-600 text-white hover:bg-amber-700',
      route: '/dashboard',
    },
    {
      title: 'Community',
      description: 'Learn, share & grow together',
      icon: Users,
      bgColor: 'bg-pink-50/80',
      iconColor: 'bg-pink-100 text-pink-700',
      btnColor: 'bg-pink-600 text-white hover:bg-pink-700',
      route: '/community',
    },
  ];

  const handleNavigate = (route: string) => {
    if (onRouteChange) {
      onRouteChange(route);
    }
  };

  return (
    <section className="py-6 bg-[#F8FAFC]">
      <div className="max-w-[1240px] mx-auto px-6 space-y-6">
        {/* 1. Quick Action Cards (4 Grid Cards matching Image 1) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <div
                key={action.title}
                onClick={() => handleNavigate(action.route)}
                className={`${action.bgColor} rounded-2xl p-4 border border-slate-200/60 shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between h-[130px]`}
              >
                <div className="flex items-start justify-between">
                  <div className={`w-10 h-10 rounded-2xl ${action.iconColor} flex items-center justify-center shrink-0 shadow-xs`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight group-hover:text-emerald-800 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5 font-medium">
                    {action.description}
                  </p>
                </div>

                <div className="flex justify-end pt-1">
                  <div className={`w-6 h-6 rounded-full ${action.btnColor} flex items-center justify-center shadow-xs transition-transform group-hover:scale-110`}>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 2. Your AI Farming Assistant Banner Card (matching Image 1) */}
        <div
          onClick={onOpenAiAssistant}
          className="bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 border border-emerald-200/80 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4 z-10">
            {/* Friendly Robot Mascot Icon Container */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
              <Bot className="w-8 h-8 sm:w-9 sm:h-9" />
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Your AI Farming Assistant</span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Ask AgriVision AI
              </h3>
              <p className="text-xs text-slate-600 font-medium max-w-md">
                Get instant answers to your farming questions with{' '}
                <span className="font-bold text-emerald-700">gemini-3.6-flash</span>
              </p>
            </div>
          </div>

          <div className="z-10 shrink-0">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md group-hover:bg-emerald-700 transition-all group-hover:scale-110">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
