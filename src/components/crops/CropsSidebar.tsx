import React from 'react';
import { Search, RotateCcw, X } from 'lucide-react';

interface CropsSidebarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategories: string[];
  onCategoryToggle: (cat: string) => void;
  selectedSeasons: string[];
  onSeasonToggle: (season: string) => void;
  selectedPopularity: string[];
  onPopularityToggle: (pop: string) => void;
  onResetFilters: () => void;
}

export const CropsSidebar: React.FC<CropsSidebarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategories,
  onCategoryToggle,
  selectedSeasons,
  onSeasonToggle,
  selectedPopularity,
  onPopularityToggle,
  onResetFilters,
}) => {
  const categories = [
    'All',
    'Vegetables',
    'Fruits',
    'Cereals & Grains',
    'Pulses',
    'Oilseeds',
    'Commercial Crops',
    'Others',
  ];

  const seasons = ['Kharif', 'Rabi', 'Zaid', 'All Season'];

  const popularityOptions = ['Most Common', 'Recently Added'];

  return (
    <aside className="w-full bg-[#F0F7F2]/80 border border-emerald-100/90 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-5 select-none">
      {/* Heading */}
      <div className="flex items-center justify-between border-b border-emerald-200/50 pb-3">
        <h2 className="text-[15px] font-bold text-[#0F172A]">Filters</h2>
        {(selectedCategories.length > 0 && !selectedCategories.includes('All')) ||
        selectedSeasons.length > 0 ||
        selectedPopularity.length > 0 ||
        searchQuery ? (
          <button
            onClick={onResetFilters}
            className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 hover:underline"
          >
            Clear
          </button>
        ) : null}
      </div>

      {/* Search Field */}
      <div className="relative">
        <div className="flex items-center bg-white border border-slate-300/90 rounded-xl px-3 py-2 shadow-2xs focus-within:ring-2 focus-within:ring-emerald-500/30 focus-within:border-emerald-500 transition-all">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search crops..."
            className="w-full bg-transparent text-xs text-slate-800 placeholder:text-slate-400 pl-2 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Crop Category Checkboxes */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold text-[#0F172A]">Crop Category</h3>
        <div className="space-y-1.5">
          {categories.map((cat) => {
            const isChecked =
              cat === 'All'
                ? selectedCategories.includes('All') || selectedCategories.length === 0
                : selectedCategories.includes(cat);

            return (
              <label
                key={cat}
                className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer hover:text-slate-900 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onCategoryToggle(cat)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-[#15803D] focus:ring-emerald-500 focus:ring-offset-0 transition-colors"
                />
                <span className={isChecked ? 'font-semibold text-[#0F172A]' : 'font-normal'}>
                  {cat}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Growing Season Checkboxes */}
      <div className="space-y-2.5 pt-2 border-t border-emerald-200/50">
        <h3 className="text-xs font-bold text-[#0F172A]">Growing Season</h3>
        <div className="space-y-1.5">
          {seasons.map((season) => {
            const isChecked = selectedSeasons.includes(season);
            return (
              <label
                key={season}
                className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer hover:text-slate-900 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onSeasonToggle(season)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-[#15803D] focus:ring-emerald-500 focus:ring-offset-0 transition-colors"
                />
                <span className={isChecked ? 'font-semibold text-[#0F172A]' : 'font-normal'}>
                  {season}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Popularity Checkboxes */}
      <div className="space-y-2.5 pt-2 border-t border-emerald-200/50">
        <h3 className="text-xs font-bold text-[#0F172A]">Popularity</h3>
        <div className="space-y-1.5">
          {popularityOptions.map((pop) => {
            const isChecked = selectedPopularity.includes(pop);
            return (
              <label
                key={pop}
                className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer hover:text-slate-900 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onPopularityToggle(pop)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-[#15803D] focus:ring-emerald-500 focus:ring-offset-0 transition-colors"
                />
                <span className={isChecked ? 'font-semibold text-[#0F172A]' : 'font-normal'}>
                  {pop}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Reset Filters Button */}
      <div className="pt-3 border-t border-emerald-200/50">
        <button
          type="button"
          onClick={onResetFilters}
          className="w-full py-2 px-3 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-2 shadow-2xs hover:shadow-xs transition-all active:scale-[0.98]"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Reset Filters</span>
        </button>
      </div>
    </aside>
  );
};
