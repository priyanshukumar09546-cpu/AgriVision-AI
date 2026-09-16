import React from 'react';
import { SUPPORTED_CROPS } from '../data/cropsData';

interface CropSelectorProps {
  selectedCropId?: string | null;
  onCropSelect?: (cropId: string) => void;
  onViewAllClick?: () => void;
}

export const CropSelector: React.FC<CropSelectorProps> = ({
  selectedCropId = 'tomato',
  onCropSelect,
  onViewAllClick,
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[14px] font-bold text-[#0F172A]">
          Select a Crop to Get Started
        </h3>
        <a
          href="/crops"
          onClick={(e) => {
            if (onViewAllClick) {
              e.preventDefault();
              onViewAllClick();
            }
          }}
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline inline-flex items-center gap-1"
        >
          <span>View All Crops</span>
          <span>→</span>
        </a>
      </div>

      {/* 8 Crop Cards Grid matching reference */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
        {SUPPORTED_CROPS.map((crop) => {
          const isSelected =
            selectedCropId?.toLowerCase() === crop.id.toLowerCase() ||
            selectedCropId?.toLowerCase() === crop.name.toLowerCase();

          return (
            <button
              key={crop.id}
              type="button"
              onClick={() => {
                if (onCropSelect) {
                  onCropSelect(crop.id);
                }
              }}
              className={`group rounded-xl p-2.5 flex flex-col items-center justify-between text-center transition-all cursor-pointer select-none border ${
                isSelected
                  ? 'bg-[#F4FBF7] border-[#15803D] ring-2 ring-[#15803D]/25 shadow-xs'
                  : 'bg-white hover:bg-slate-50 border-slate-200/90 hover:border-emerald-500/60 hover:shadow-xs'
              }`}
              title={`Select ${crop.name}`}
            >
              {/* Clean Reference Crop Image - Crisp 256x256 rendered with object-contain */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center overflow-hidden mb-1.5 shrink-0">
                <img
                  src={crop.image}
                  alt={crop.name}
                  width="56"
                  height="56"
                  decoding="async"
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200 drop-shadow-2xs"
                  style={{ imageRendering: 'auto' }}
                />
              </div>

              {/* Crop Name */}
              <span
                className={`text-[11.5px] leading-tight transition-colors ${
                  isSelected
                    ? 'font-bold text-[#15803D]'
                    : 'font-semibold text-[#0F172A] group-hover:text-[#15803D]'
                }`}
              >
                {crop.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
