import React from 'react';
import { CloudRain, Sprout, ChevronRight, Lightbulb } from 'lucide-react';
import type { DashboardRecommendation } from '../../services/dashboardService';
import { navigateTo } from '../../utils/navigation';

interface DashboardRecommendationsProps {
  recommendations: DashboardRecommendation[];
  onRouteChange?: (route: string) => void;
}

export const DashboardRecommendations: React.FC<DashboardRecommendationsProps> = ({
  recommendations,
  onRouteChange,
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'weather':
        return <CloudRain className="w-4 h-4 text-blue-600" />;
      case 'soil':
        return <Sprout className="w-4 h-4 text-amber-600" />;
      case 'disease':
      default:
        return <Sprout className="w-4 h-4 text-emerald-600" />;
    }
  };

  const getBgClass = (type: string) => {
    switch (type) {
      case 'weather':
        return 'bg-blue-50 text-blue-600 border border-blue-100';
      case 'soil':
        return 'bg-amber-50 text-amber-600 border border-amber-100';
      case 'disease':
      default:
        return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs select-none text-left">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h2 className="text-sm font-bold text-[#0F172A]">AI Recommendations</h2>
        <button
          type="button"
          onClick={() => navigateTo('/detect', onRouteChange)}
          className="text-xs font-bold text-[#15803D] hover:text-[#166534] cursor-pointer"
        >
          View All
        </button>
      </div>

      {/* Recommendations List */}
      <div className="pt-3">
        {recommendations && recommendations.length > 0 ? (
          <div className="space-y-2.5">
            {recommendations.slice(0, 3).map((rec) => (
              <div
                key={rec.id}
                onClick={() => navigateTo(rec.route || '/detect', onRouteChange)}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group border border-transparent hover:border-slate-100"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${getBgClass(
                      rec.type
                    )}`}
                  >
                    {getIcon(rec.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-bold text-[#0F172A] group-hover:text-[#15803D] transition truncate">
                      {rec.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 leading-snug">
                      {rec.description}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#15803D] group-hover:translate-x-0.5 transition shrink-0" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-5 px-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Lightbulb className="w-7 h-7 text-slate-400 mx-auto mb-1.5 opacity-70" />
            <p className="text-xs font-bold text-slate-700">No AI recommendations yet</p>
            <p className="text-[10.5px] text-slate-500 mt-1 max-w-xs mx-auto">
              Run a crop scan to receive tailored prevention tips and field insights.
            </p>
            <button
              type="button"
              onClick={() => navigateTo('/detect', onRouteChange)}
              className="mt-2.5 px-3 py-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200/80 rounded-lg transition cursor-pointer"
            >
              Scan a Crop
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
