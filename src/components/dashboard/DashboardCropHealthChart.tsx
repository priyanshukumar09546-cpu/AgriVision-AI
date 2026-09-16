import React from 'react';
import { Sprout } from 'lucide-react';
import type { CropHealthOverview } from '../../services/dashboardService';

interface DashboardCropHealthChartProps {
  overview: CropHealthOverview;
}

export const DashboardCropHealthChart: React.FC<DashboardCropHealthChartProps> = ({ overview }) => {
  const { totalScans, healthyPercent, diseasedPercent, needsAttentionPercent, cropsNeedingAttention } = overview;

  // SVG Donut calculation
  const radius = 38;
  const circumference = 2 * Math.PI * radius; // ~238.76

  const healthyStroke = (healthyPercent / 100) * circumference;
  const diseasedStroke = (diseasedPercent / 100) * circumference;
  const needsStroke = (needsAttentionPercent / 100) * circumference;

  const diseasedOffset = -healthyStroke;
  const needsOffset = -(healthyStroke + diseasedStroke);

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between text-left select-none">
      {/* Title */}
      <h2 className="text-sm font-bold text-[#0F172A] mb-3">Crop Health Overview</h2>

      {totalScans === 0 ? (
        <div className="py-6 text-center text-xs text-slate-400">
          <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-dashed mx-auto mb-2 flex items-center justify-center font-bold text-slate-300">
            0
          </div>
          <p className="font-semibold text-slate-600">No scan data available yet.</p>
          <p className="text-[10.5px] text-slate-400 mt-0.5">Diagnose crops to track health distribution.</p>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4 py-2">
          {/* SVG Donut Chart */}
          <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background Track */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="text-slate-100 stroke-current"
                strokeWidth="11"
                fill="transparent"
              />

              {/* Healthy Segment (Green) */}
              {healthyPercent > 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="text-[#22C55E] stroke-current transition-all duration-700"
                  strokeWidth="11"
                  strokeDasharray={`${healthyStroke} ${circumference}`}
                  strokeDashoffset={0}
                  strokeLinecap="round"
                  fill="transparent"
                />
              )}

              {/* Diseased Segment (Red/Rose) */}
              {diseasedPercent > 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="text-[#EF4444] stroke-current transition-all duration-700"
                  strokeWidth="11"
                  strokeDasharray={`${diseasedStroke} ${circumference}`}
                  strokeDashoffset={diseasedOffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              )}

              {/* Needs Attention Segment (Amber) */}
              {needsAttentionPercent > 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="text-[#F59E0B] stroke-current transition-all duration-700"
                  strokeWidth="11"
                  strokeDasharray={`${needsStroke} ${circumference}`}
                  strokeDashoffset={needsOffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              )}
            </svg>

            {/* Inner Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xl font-black text-[#0F172A] leading-none">
                {totalScans}
              </span>
              <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                Total Scans
              </span>
            </div>
          </div>

          {/* Right Legend matching reference */}
          <div className="space-y-2 flex-1 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
                <span className="font-semibold text-slate-700">Healthy</span>
              </div>
              <span className="font-bold text-slate-900">{healthyPercent}%</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                <span className="font-semibold text-slate-700">Diseased</span>
              </div>
              <span className="font-bold text-slate-900">{diseasedPercent}%</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                <span className="font-semibold text-slate-700">Needs Attention</span>
              </div>
              <span className="font-bold text-slate-900">{needsAttentionPercent}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Alert Banner matching reference */}
      <div className="mt-3 p-2.5 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-[#DCFCE7] text-[#15803D] flex items-center justify-center shrink-0">
          <Sprout className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-bold text-[#0F172A] leading-tight">
            {cropsNeedingAttention > 0
              ? `${cropsNeedingAttention} ${cropsNeedingAttention === 1 ? 'crop needs' : 'crops need'} attention`
              : 'All monitored crops are healthy'}
          </div>
          <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
            Based on your recent scan results.
          </div>
        </div>
      </div>
    </div>
  );
};
