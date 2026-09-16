import React from 'react';
import { Sprout, AlertTriangle, BarChart3, Leaf } from 'lucide-react';
import type { KpiMetric } from '../../data/insightsData';

interface InsightsKpiRowProps {
  kpis: KpiMetric[];
}

export const InsightsKpiRow: React.FC<InsightsKpiRowProps> = ({ kpis }) => {
  const renderIcon = (name: string) => {
    switch (name) {
      case 'sprout':
        return <Sprout className="w-5 h-5 text-[#15803D]" />;
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-[#15803D]" />;
      case 'barChart':
        return <BarChart3 className="w-5 h-5 text-[#15803D]" />;
      case 'leaf':
      default:
        return <Leaf className="w-5 h-5 text-[#15803D]" />;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {kpis.map((kpi) => (
        <div
          key={kpi.id}
          className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow flex items-center gap-3.5"
        >
          {/* Green Soft Rounded Square with Icon */}
          <div className="w-11 h-11 rounded-xl bg-[#DCFCE7]/70 text-[#15803D] flex items-center justify-center shrink-0">
            {renderIcon(kpi.iconName)}
          </div>

          <div className="flex flex-col text-left">
            <span className="text-[11px] font-semibold text-slate-500 tracking-tight">
              {kpi.title}
            </span>
            <span className="text-[20px] font-extrabold text-[#0F172A] tracking-tight leading-tight mt-0.5">
              {kpi.value}
            </span>
            <div className="flex items-center gap-1 mt-1 text-[10.5px]">
              <span className="font-bold text-[#15803D] flex items-center">
                {kpi.trend}
              </span>
              <span className="text-slate-400 font-medium">
                {kpi.trendContext}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
