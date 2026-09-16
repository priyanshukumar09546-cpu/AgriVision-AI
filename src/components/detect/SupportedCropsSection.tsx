import { SUPPORTED_CROPS } from '../../data/cropsData';
import type { CropInfo } from '../../data/cropsData';

interface SupportedCropsSectionProps {
  onCropClick?: (crop: CropInfo) => void;
  onViewAllClick?: () => void;
  selectedCropId?: string;
}

export const SupportedCropsSection: React.FC<SupportedCropsSectionProps> = ({
  onCropClick,
  onViewAllClick,
  selectedCropId,
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs h-full flex flex-col justify-between">
      {/* Header with Title, Subtitle, and View All link matching reference */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h2 className="text-[14.5px] font-bold text-[#0F172A] leading-tight">
            Supported Crops
          </h2>
          <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
            We currently support 20+ crops.
          </p>
        </div>

        <a
          href="/crops"
          onClick={(e) => {
            if (onViewAllClick) {
              e.preventDefault();
              onViewAllClick();
            }
          }}
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline inline-flex items-center gap-0.5 shrink-0"
        >
          <span>View All</span>
          <span>→</span>
        </a>
      </div>

      {/* 4x2 Grid of 8 Crops matching reference layout */}
      <div className="grid grid-cols-4 gap-2.5 flex-1 items-center">
        {SUPPORTED_CROPS.map((crop) => {
          const isSelected = selectedCropId === crop.id;
          return (
            <div
              key={crop.id}
              onClick={() => onCropClick && onCropClick(crop)}
              className={`group bg-white hover:bg-slate-50/90 border rounded-xl p-2 flex flex-col items-center justify-between text-center transition-all cursor-pointer select-none h-full ${
                isSelected
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20'
                  : 'border-slate-200/90 hover:border-emerald-400 hover:shadow-2xs'
              }`}
              title={`Select ${crop.name} (${crop.scientificName})`}
            >
              {/* Realistic Crop Photograph centered */}
              <div className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center overflow-hidden mb-1 shrink-0">
                <img
                  src={crop.image}
                  alt={crop.name}
                  width="48"
                  height="48"
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                />
              </div>

              {/* Crop Name */}
              <span
                className={`text-[11px] font-semibold leading-tight transition-colors ${
                  isSelected
                    ? 'text-[#15803D]'
                    : 'text-[#0F172A] group-hover:text-[#15803D]'
                }`}
              >
                {crop.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
