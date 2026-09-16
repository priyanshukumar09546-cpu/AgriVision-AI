import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Lightbulb, 
  Cloud, 
  Leaf, 
  Database, 
  ChevronDown 
} from 'lucide-react';
import { AVAILABLE_INSIGHT_CROPS } from '../../data/insightsData';

export type InsightsTab = 
  | 'overview' 
  | 'disease-trends' 
  | 'recommendations' 
  | 'weather' 
  | 'yield' 
  | 'soil';

interface InsightsTabsProps {
  activeTab: InsightsTab;
  onTabChange: (tab: InsightsTab) => void;
  selectedCrop: string;
  onSelectCrop: (crop: string) => void;
}

export const InsightsTabs: React.FC<InsightsTabsProps> = ({
  activeTab,
  onTabChange,
  selectedCrop,
  onSelectCrop,
}) => {
  const tabs = [
    { id: 'overview' as InsightsTab, name: 'Overview', icon: BarChart3 },
    { id: 'disease-trends' as InsightsTab, name: 'Disease Trends', icon: TrendingUp },
    { id: 'recommendations' as InsightsTab, name: 'Recommendations', icon: Lightbulb },
    { id: 'weather' as InsightsTab, name: 'Weather Insights', icon: Cloud },
    { id: 'yield' as InsightsTab, name: 'Yield Prediction', icon: Leaf },
    { id: 'soil' as InsightsTab, name: 'Soil Insights', icon: Database },
  ];

  return (
    <div className="w-full bg-white border-b border-slate-200/80 py-2.5">
      <div className="max-w-[1240px] mx-auto px-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Horizontal Navigation Tabs with horizontal scroll on mobile */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-lg shrink-0 transition-all ${
                  isActive
                    ? 'bg-[#15803D] text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Select Crop Dropdown matching reference */}
        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          <span className="text-[11.5px] font-semibold text-slate-600">Select Crop</span>
          <div className="relative">
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#15803D]">
              <Leaf className="w-3.5 h-3.5" />
            </div>
            <select
              value={selectedCrop}
              onChange={(e) => onSelectCrop(e.target.value)}
              className="pl-8 pr-7 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#15803D] focus:ring-1 focus:ring-[#15803D] appearance-none cursor-pointer shadow-2xs"
            >
              {AVAILABLE_INSIGHT_CROPS.map((crop) => (
                <option key={crop} value={crop}>
                  {crop}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};
