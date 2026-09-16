import React from 'react';
import { Camera, FileText, Leaf, BookOpen } from 'lucide-react';

interface DashboardQuickActionsProps {
  onRouteChange: (route: string) => void;
  onOpenScanHistory: () => void;
}

export const DashboardQuickActions: React.FC<DashboardQuickActionsProps> = ({
  onRouteChange,
  onOpenScanHistory,
}) => {
  const actions = [
    {
      id: 'detect',
      title: 'Detect Disease',
      subtitle: 'Upload a leaf image',
      icon: Camera,
      iconBg: 'bg-[#DCFCE7]',
      iconColor: 'text-[#15803D]',
      onClick: () => onRouteChange('/detect'),
    },
    {
      id: 'scans',
      title: 'My Scans',
      subtitle: 'View previous results',
      icon: FileText,
      iconBg: 'bg-[#E0F2FE]',
      iconColor: 'text-sky-600',
      onClick: onOpenScanHistory,
    },
    {
      id: 'crops',
      title: 'Crop Library',
      subtitle: 'Explore all crops',
      icon: Leaf,
      iconBg: 'bg-[#FEF3C7]',
      iconColor: 'text-amber-600',
      onClick: () => onRouteChange('/crops'),
    },
    {
      id: 'diseases',
      title: 'Disease Library',
      subtitle: 'Learn and manage',
      icon: BookOpen,
      iconBg: 'bg-[#F3E8FF]',
      iconColor: 'text-purple-600',
      onClick: () => onRouteChange('/library'),
    },
  ];

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs select-none text-left">
      <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 px-1">
        Quick Actions
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              type="button"
              onClick={act.onClick}
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/70 hover:bg-emerald-50/60 border border-slate-100 hover:border-emerald-200/80 transition-all cursor-pointer text-left group active:scale-[0.98]"
            >
              <div className={`w-10 h-10 rounded-xl ${act.iconBg} ${act.iconColor} flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xs font-bold text-[#0F172A] group-hover:text-[#15803D] transition-colors leading-tight">
                  {act.title}
                </h3>
                <p className="text-[10.5px] text-slate-500 truncate mt-0.5 leading-tight">
                  {act.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
