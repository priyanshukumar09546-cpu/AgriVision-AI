import React from 'react';
import { ALL_CROPS } from '../data/cropsData';
import { ArrowRight } from 'lucide-react';

interface PopularCropsSectionProps {
  onCropClick?: (cropId: string) => void;
  onViewAllClick?: () => void;
}

export const PopularCropsSection: React.FC<PopularCropsSectionProps> = ({
  onCropClick,
  onViewAllClick,
}) => {
  // Top 5 popular crops matching Reference Image 1 (Rice, Wheat, Maize, Tomato, Potato)
  const popularCropIds = ['rice', 'wheat', 'maize', 'tomato', 'potato'];
  const popularCrops = popularCropIds
    .map((id) => ALL_CROPS.find((c) => c.id === id))
    .filter(Boolean);

  return (
    <section className="py-5 bg-white border-b border-slate-100">
      <div className="max-w-[1240px] mx-auto px-6">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-emerald-700 text-lg">🌱</span>
            <h3 className="text-base font-extrabold text-[#0F172A] tracking-tight">
              Popular Crops
            </h3>
          </div>
          <button
            type="button"
            onClick={onViewAllClick}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 5 Cards Row */}
        <div className="grid grid-cols-5 gap-3 sm:gap-4">
          {popularCrops.map((crop) => (
            <div
              key={crop!.id}
              onClick={() => onCropClick?.(crop!.id)}
              className="group cursor-pointer flex flex-col items-center select-none"
            >
              <div className="w-full aspect-square rounded-2xl overflow-hidden border border-slate-200/80 shadow-2xs group-hover:border-emerald-500 group-hover:shadow-md transition-all relative bg-slate-50">
                <img
                  src={crop!.cardImage || crop!.image}
                  alt={crop!.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    // Fallback to clean image if cardImage fails
                    (e.target as HTMLImageElement).src = crop!.image;
                  }}
                />
              </div>
              <span className="text-xs font-bold text-[#0F172A] mt-2 group-hover:text-emerald-700 transition-colors text-center">
                {crop!.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularCropsSection;
