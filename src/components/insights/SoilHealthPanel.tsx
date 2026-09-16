import React from 'react';
import { Database, Lightbulb, Activity, Leaf, Atom } from 'lucide-react';
import type { SoilParameter } from '../../data/insightsData';

interface SoilHealthPanelProps {
  parameters: SoilParameter[];
  insightText: string;
  onViewDetails: () => void;
}

export const SoilHealthPanel: React.FC<SoilHealthPanelProps> = ({
  parameters,
  insightText,
  onViewDetails,
}) => {
  const getParamIcon = (type: string) => {
    switch (type) {
      case 'ph':
        return (
          <div className="w-8 h-8 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Activity className="w-4 h-4" />
          </div>
        );
      case 'nitrogen':
        return (
          <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#15803D] flex items-center justify-center shrink-0">
            <Leaf className="w-4 h-4" />
          </div>
        );
      case 'phosphorus':
        return (
          <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Atom className="w-4 h-4" />
          </div>
        );
      case 'potassium':
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#15803D] flex items-center justify-center shrink-0">
            <Leaf className="w-4 h-4" />
          </div>
        );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Optimal':
      case 'Good':
        return 'text-[#15803D]';
      case 'Moderate':
        return 'text-[#F59E0B]';
      default:
        return 'text-[#DC2626]';
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-[#15803D] text-white flex items-center justify-center shrink-0">
            <Database className="w-3 h-3 text-white" />
          </div>
          <div>
            <h3 className="text-[12.5px] font-bold text-[#0F172A] leading-tight">
              Soil Health Insights
            </h3>
            <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
              Key soil parameters from AI analysis
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onViewDetails}
          className="text-[11px] font-semibold text-[#15803D] hover:text-[#166534] transition-colors"
        >
          View Details →
        </button>
      </div>

      {/* Body: 2x2 Grid on Left, Insight Box on Right */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 my-auto">
        {/* 2x2 Parameter Grid (3 cols) */}
        <div className="sm:col-span-3 grid grid-cols-2 gap-2">
          {parameters.map((param) => (
            <div
              key={param.name}
              className="bg-slate-50/70 border border-slate-100 rounded-xl p-2.5 flex items-center gap-2.5"
            >
              {getParamIcon(param.iconType)}
              <div className="flex flex-col text-left">
                <span className="text-[9.5px] text-slate-500 font-medium leading-tight">
                  {param.name}
                </span>
                <span className="text-[14px] font-extrabold text-[#0F172A] leading-tight mt-0.5">
                  {param.value}
                </span>
                <span className={`text-[9.5px] font-semibold mt-0.5 leading-tight ${getStatusColor(param.status)}`}>
                  {param.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Insight Box (2 cols) */}
        <div className="sm:col-span-2 bg-[#F2FBF5] border border-[#DCFCE7] rounded-xl p-3 flex flex-col justify-center text-left">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded-lg bg-[#DCFCE7] text-[#15803D] flex items-center justify-center shrink-0">
              <Lightbulb className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11.5px] font-bold text-[#15803D]">
              Insight
            </span>
          </div>
          <p className="text-[10px] text-slate-700 leading-relaxed font-normal">
            {insightText}
          </p>
        </div>
      </div>
    </div>
  );
};
