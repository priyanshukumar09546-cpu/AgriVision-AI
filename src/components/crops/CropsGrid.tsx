import React from 'react';
import { ArrowRight, Leaf, ChevronDown } from 'lucide-react';
import type { CropInfo } from '../../data/cropsData';

interface CropsGridProps {
  crops: CropInfo[];
  sortBy: string;
  onSortChange: (sort: string) => void;
  onCropClick: (crop: CropInfo) => void;
}

export const CropsGrid: React.FC<CropsGridProps> = ({
  crops,
  sortBy,
  onSortChange,
  onCropClick,
}) => {
  return (
    <div className="flex-1 space-y-4">
      {/* Grid Header matching reference */}
      <div className="flex items-center justify-between">
        {/* Left: All Crops + Green Badge */}
        <div className="flex items-center gap-2.5">
          <h2 className="text-xl sm:text-[22px] font-extrabold text-[#0F172A] tracking-tight">
            All Crops
          </h2>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#15803D] text-white shadow-2xs">
            20+ Crops
          </span>
        </div>

        {/* Right: Sort by Dropdown matching reference */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Sort by:
          </span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="appearance-none bg-white hover:bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 pr-8 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 cursor-pointer shadow-2xs transition-all"
            >
              <option value="Popularity">Popularity</option>
              <option value="Name A–Z">Name A–Z</option>
              <option value="Name Z–A">Name Z–A</option>
              <option value="Most Diseases">Most Diseases</option>
              <option value="Least Diseases">Least Diseases</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 6-Column Desktop Grid matching reference */}
      {crops.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
          <Leaf className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No crops matched your filters</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search keywords or resetting the category and season checkboxes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-3.5">
          {crops.map((crop) => (
            <div
              key={crop.id}
              onClick={() => onCropClick(crop)}
              className="group bg-white hover:bg-slate-50/80 border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md hover:border-emerald-500/50 transition-all cursor-pointer flex flex-col justify-between select-none"
            >
              {/* Realistic Rectangular Crop Photograph with 2x/Retina asset */}
              <div className="w-full h-24 sm:h-28 overflow-hidden bg-slate-100 relative">
                <img
                  src={crop.cardImage || crop.image}
                  alt={crop.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (crop.image && !target.src.endsWith(crop.image)) {
                      target.src = crop.image;
                    } else {
                      target.src = '/crops_assets/crop_tomato_2x.jpg';
                    }
                  }}
                />
              </div>

              {/* Card Information Body */}
              <div className="p-3 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-[13px] font-bold text-[#0F172A] leading-tight group-hover:text-[#15803D] transition-colors">
                    {crop.name}
                  </h3>
                  <span className="text-[10.5px] text-slate-500 font-medium block mt-0.5">
                    {crop.categoryDisplay}
                  </span>
                </div>

                {/* Bottom Row: Disease Count + Right Arrow matching reference */}
                <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1 text-[10.5px] font-semibold text-emerald-800">
                    <Leaf className="w-3 h-3 text-[#15803D] fill-[#15803D]/20 shrink-0" />
                    <span>{crop.diseaseCount} diseases</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#15803D] group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
