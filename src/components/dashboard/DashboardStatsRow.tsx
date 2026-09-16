import React from 'react';
import { Camera, Sprout, Leaf, Calendar } from 'lucide-react';
import type { DashboardStats } from '../../services/dashboardService';

interface DashboardStatsRowProps {
  stats: DashboardStats;
}

export const DashboardStatsRow: React.FC<DashboardStatsRowProps> = ({ stats }) => {
  const cards = [
    {
      id: 'total-scans',
      title: 'Total Scans',
      value: stats.totalScans,
      trendText: stats.totalScans > 0 ? '↑ Database Scans' : 'No scans logged',
      trendColor: 'text-[#15803D]',
      icon: Camera,
    },
    {
      id: 'diseases-detected',
      title: 'Diseases Detected',
      value: stats.diseasesDetected,
      trendText: stats.diseasesDetected > 0 ? `${stats.diseasesDetected} with symptoms` : 'Zero disease found',
      trendColor: stats.diseasesDetected > 0 ? 'text-amber-700' : 'text-slate-400',
      icon: Sprout,
    },
    {
      id: 'healthy-scans',
      title: 'Healthy Scans',
      value: stats.healthyScans,
      trendText: stats.healthyScans > 0 ? `${stats.healthyScans} verified healthy` : 'No healthy scans',
      trendColor: 'text-[#15803D]',
      icon: Leaf,
    },
    {
      id: 'last-scan',
      title: 'Last Scan',
      value: stats.lastScanDate || 'No scans yet',
      subValue: stats.lastScanTime || '',
      isDate: true,
      icon: Calendar,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 select-none">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-col justify-between text-left transition-all hover:border-slate-300"
          >
            {/* Top row: Icon container + Title */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#DCFCE7] text-[#15803D] flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[11.5px] font-bold text-slate-700 leading-tight">
                {card.title}
              </span>
            </div>

            {/* Main Stat Value */}
            <div className="mt-3">
              {card.isDate ? (
                <div>
                  <div className="text-base sm:text-lg font-extrabold text-[#0F172A] tracking-tight truncate leading-tight">
                    {card.value}
                  </div>
                  {card.subValue && (
                    <div className="text-[10.5px] text-slate-400 font-medium mt-0.5">
                      {card.subValue}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight leading-none">
                    {card.value}
                  </div>
                  <div className={`text-[10.5px] font-semibold mt-1 ${card.trendColor}`}>
                    {card.trendText}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
