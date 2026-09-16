import React from 'react';
import { Search, RotateCcw, Sprout, Leaf, ChevronDown } from 'lucide-react';
import type { DiseaseType, SeverityLevel } from '../../data/diseasesData';
import { CROP_OPTIONS } from '../../data/diseasesData';

interface LibrarySidebarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCrop: string;
  onSelectCrop: (crop: string) => void;
  selectedTypes: DiseaseType[];
  onToggleType: (type: DiseaseType) => void;
  selectedSeverity: SeverityLevel | 'All';
  onSelectSeverity: (severity: SeverityLevel | 'All') => void;
  sortBy: string;
  onSortByChange: (sort: string) => void;
  onResetFilters: () => void;
  onNavigateToDetect: () => void;
}

const ALL_TYPES: DiseaseType[] = [
  'Fungal',
  'Bacterial',
  'Viral',
  'Pest Infestation',
  'Nutrient Deficiency',
  'Physiological',
  'Other',
];

export const LibrarySidebar: React.FC<LibrarySidebarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCrop,
  onSelectCrop,
  selectedTypes,
  onToggleType,
  selectedSeverity,
  onSelectSeverity,
  sortBy,
  onSortByChange,
  onResetFilters,
  onNavigateToDetect,
}) => {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = React.useState(false);

  return (
    <aside className="w-full lg:w-[225px] shrink-0 space-y-4">
      {/* Mobile Toggle Button (Visible only on mobile/tablet <lg) */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
          className="w-full flex items-center justify-between px-4 py-2.5 bg-[#F2FBF5] border border-[#DCFCE7] rounded-xl text-xs font-bold text-[#0F172A] shadow-2xs"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[#15803D]" />
            <span>Filters & Search</span>
          </div>
          <span className="text-[11px] font-semibold text-[#15803D]">
            {isMobileFiltersOpen ? 'Hide Filters ▲' : 'Show Filters ▼'}
          </span>
        </button>
      </div>

      {/* Filters Panel - always visible on desktop, collapsible on mobile */}
      <div className={`${isMobileFiltersOpen ? 'block' : 'hidden lg:block'} space-y-4`}>
        <div className="bg-[#F2FBF5] border border-[#DCFCE7] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
        {/* Search Disease */}
        <div>
          <label className="block text-[12px] font-bold text-[#0F172A] mb-1.5">
            Search Disease
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search diseases..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#15803D] focus:ring-1 focus:ring-[#15803D] transition-all"
            />
          </div>
        </div>

        {/* Select Crop */}
        <div>
          <label className="block text-[12px] font-bold text-[#0F172A] mb-1.5">
            Select Crop
          </label>
          <div className="relative">
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#15803D]">
              <Leaf className="w-3.5 h-3.5" />
            </div>
            <select
              value={selectedCrop}
              onChange={(e) => onSelectCrop(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#15803D] focus:ring-1 focus:ring-[#15803D] appearance-none cursor-pointer"
            >
              {CROP_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Disease Type */}
        <div>
          <label className="block text-[12px] font-bold text-[#0F172A] mb-2">
            Disease Type
          </label>
          <div className="space-y-1.5">
            {ALL_TYPES.map((type) => {
              const isChecked = selectedTypes.includes(type);
              return (
                <label
                  key={type}
                  className="flex items-center gap-2 cursor-pointer group select-none text-[11.5px] text-slate-700 hover:text-slate-900"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleType(type)}
                    className="w-3.5 h-3.5 rounded text-[#15803D] border-slate-300 focus:ring-[#15803D] cursor-pointer"
                  />
                  <span className={isChecked ? 'font-medium text-[#0F172A]' : ''}>
                    {type}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Severity Level */}
        <div>
          <label className="block text-[12px] font-bold text-[#0F172A] mb-2">
            Severity Level
          </label>
          <div className="space-y-1.5">
            {[
              { level: 'Mild' as SeverityLevel, color: 'bg-[#22C55E]', text: 'Mild' },
              { level: 'Moderate' as SeverityLevel, color: 'bg-[#F59E0B]', text: 'Moderate' },
              { level: 'High' as SeverityLevel, color: 'bg-[#EF4444]', text: 'Severe' },
            ].map(({ level, color, text }) => {
              const isSelected = selectedSeverity === level;
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => onSelectSeverity(isSelected ? 'All' : level)}
                  className={`flex items-center gap-2.5 w-full text-left py-0.5 text-[11.5px] rounded transition-colors ${
                    isSelected
                      ? 'text-[#0F172A] font-semibold'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${color} shrink-0 ${isSelected ? 'ring-2 ring-slate-400' : ''}`} />
                  <span>{text}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-[12px] font-bold text-[#0F172A] mb-1.5">
            Sort By
          </label>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#15803D] focus:ring-1 focus:ring-[#15803D] appearance-none cursor-pointer"
            >
              <option value="most-common">Most Common</option>
              <option value="name-asc">Name (A - Z)</option>
              <option value="name-desc">Name (Z - A)</option>
              <option value="severity-desc">Severity (High to Low)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Reset Filters Button */}
        <button
          type="button"
          onClick={onResetFilters}
          className="w-full mt-2 py-2 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>
      </div>
      </div>

      {/* Bottom CTA Card matching reference */}
      <div className="bg-[#F2FBF5] border border-[#DCFCE7] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col items-start text-left">
        <div className="w-9 h-9 rounded-full bg-[#DCFCE7] text-[#15803D] flex items-center justify-center mb-2.5">
          <Sprout className="w-5 h-5 text-[#15803D]" />
        </div>
        <h4 className="text-[12.5px] font-bold text-[#0F172A] leading-snug">
          Not sure what's wrong with your plant?
        </h4>
        <p className="text-[11px] text-slate-600 leading-relaxed mt-1 mb-3.5">
          Upload a leaf image and let our AI detect the disease instantly.
        </p>
        <button
          type="button"
          onClick={onNavigateToDetect}
          className="w-full py-2 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs"
        >
          <span>Detect Disease</span>
          <span>→</span>
        </button>
      </div>
    </aside>
  );
};
