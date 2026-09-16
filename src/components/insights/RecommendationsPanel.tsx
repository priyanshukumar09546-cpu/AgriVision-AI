import React from 'react';
import { Leaf, Droplets, Sprout, ShieldCheck, BarChart2 } from 'lucide-react';
import type { RecommendationItem } from '../../data/insightsData';

interface RecommendationsPanelProps {
  recommendations: RecommendationItem[];
  onActionClick: (rec: RecommendationItem) => void;
  onViewAllClick: () => void;
}

export const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({
  recommendations,
  onActionClick,
  onViewAllClick,
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'leaf':
        return (
          <div className="w-9 h-9 rounded-xl bg-[#DCFCE7] text-[#15803D] flex items-center justify-center shrink-0">
            <Leaf className="w-4 h-4" />
          </div>
        );
      case 'droplet':
        return (
          <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
            <Droplets className="w-4 h-4" />
          </div>
        );
      case 'sprout':
        return (
          <div className="w-9 h-9 rounded-xl bg-[#DCFCE7] text-[#15803D] flex items-center justify-center shrink-0">
            <Sprout className="w-4 h-4" />
          </div>
        );
      case 'shield':
      default:
        return (
          <div className="w-9 h-9 rounded-xl bg-[#DCFCE7] text-[#15803D] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-[#15803D] text-white flex items-center justify-center shrink-0">
            <BarChart2 className="w-3 h-3 text-white" />
          </div>
          <div>
            <h3 className="text-[12.5px] font-bold text-[#0F172A] leading-tight">
              AI Recommendations
            </h3>
            <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
              Based on recent scans and weather data
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onViewAllClick}
          className="text-[11px] font-semibold text-[#15803D] hover:text-[#166534] transition-colors"
        >
          View All →
        </button>
      </div>

      {/* 4 Recommendation Rows */}
      <div className="space-y-2.5 flex-1 flex flex-col justify-between">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="flex items-center justify-between gap-2.5 p-1 rounded-xl hover:bg-slate-50/80 transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {getIcon(rec.iconType)}
              <div className="min-w-0 text-left">
                <h4 className="text-[11px] font-bold text-[#0F172A] leading-tight">
                  {rec.title}
                </h4>
                <p className="text-[9.5px] text-slate-500 leading-snug mt-0.5 max-w-[210px]">
                  {rec.description}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onActionClick(rec)}
              className={`shrink-0 px-3.5 py-1.5 text-[10.5px] font-semibold rounded-full transition-all shadow-2xs ${
                rec.buttonVariant === 'primary'
                  ? 'bg-[#15803D] hover:bg-[#166534] text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-700'
              }`}
            >
              {rec.buttonText}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
