import React, { useState } from 'react';
import { Leaf, ChevronDown, Search, Lock, Loader2, Sparkles } from 'lucide-react';
import { SUPPORTED_CROPS } from '../../data/cropsData';
import type { CropInfo } from '../../data/cropsData';

interface CropSelectSectionProps {
  selectedCrop: CropInfo;
  onCropChange: (crop: CropInfo) => void;
  onDetectClick: () => void;
  isAnalyzing: boolean;
  hasImage: boolean;
  analysisStage?: string;
  analysisProgress?: number;
}

export const CropSelectSection: React.FC<CropSelectSectionProps> = ({
  selectedCrop,
  onCropChange,
  onDetectClick,
  isAnalyzing,
  hasImage,
  analysisStage,
  analysisProgress,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSelect = (crop: CropInfo) => {
    onCropChange(crop);
    setIsDropdownOpen(false);
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs h-full flex flex-col justify-between relative">
      <div>
        {/* Header with Circular Green Leaf Icon matching reference */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-[#EBF7EE] text-[#15803D] flex items-center justify-center shrink-0 shadow-2xs">
            <Leaf className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-[14.5px] font-bold text-[#0F172A] leading-tight">
              Select Crop (Optional)
            </h2>
            <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
              Choose the crop for more accurate results.
            </p>
          </div>
        </div>

        {/* Custom Dropdown Selector matching reference */}
        <div className="relative mb-6">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            disabled={isAnalyzing}
            className="w-full bg-white hover:bg-slate-50/80 border border-slate-300 rounded-xl px-3.5 py-2.5 flex items-center justify-between text-left transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                <img
                  src={selectedCrop.image}
                  alt={selectedCrop.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-[13.5px] font-semibold text-[#0F172A]">
                {selectedCrop.name}
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Dropdown Options matching reference crops */}
          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg z-30 max-h-60 overflow-y-auto py-1 animate-in fade-in zoom-in-95">
                {SUPPORTED_CROPS.map((crop) => (
                  <button
                    key={crop.id}
                    type="button"
                    onClick={() => handleSelect(crop)}
                    className={`w-full px-3.5 py-2 flex items-center justify-between hover:bg-emerald-50/60 transition-colors text-left ${
                      selectedCrop.id === crop.id
                        ? 'bg-emerald-50 text-emerald-900 font-semibold'
                        : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-md overflow-hidden flex items-center justify-center shrink-0">
                        <img
                          src={crop.image}
                          alt={crop.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <span className="text-xs font-medium">{crop.name}</span>
                    </div>
                    {selectedCrop.id === crop.id && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Action Zone: Large Green Detect Disease Button & Security Notice */}
      <div className="space-y-3 pt-4">
        {/* Analysis Progress Bar if scanning */}
        {isAnalyzing && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                <span>AI Diagnostics in Progress</span>
              </span>
              <span className="font-bold text-emerald-700">
                {analysisProgress || 45}%
              </span>
            </div>
            <div className="w-full bg-emerald-200/60 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#15803D] h-full rounded-full transition-all duration-300 shadow-[0_0_8px_#22C55E]"
                style={{ width: `${analysisProgress || 45}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-600 italic">
              {analysisStage || 'Analyzing leaf lesions and biomarkers...'}
            </p>
          </div>
        )}

        {/* Large Green Detect Disease Button */}
        <button
          type="button"
          onClick={onDetectClick}
          disabled={isAnalyzing}
          className={`w-full py-3.5 px-5 rounded-xl font-bold text-[14px] text-white flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-[0.99] ${
            isAnalyzing
              ? 'bg-emerald-800 cursor-wait opacity-90'
              : hasImage
              ? 'bg-[#15803D] hover:bg-[#166534] hover:shadow-lg hover:shadow-emerald-900/10'
              : 'bg-[#15803D] hover:bg-[#166534]'
          }`}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing Leaf...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4 stroke-[2.4]" />
              <span>Detect Disease</span>
            </>
          )}
        </button>

        {/* Security / Privacy notice with lock icon matching reference */}
        <div className="flex items-center justify-center gap-1.5 text-slate-500 pt-1">
          <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-[11px] font-normal leading-tight">
            Your images are secure and will not be shared.
          </span>
        </div>
      </div>
    </div>
  );
};
