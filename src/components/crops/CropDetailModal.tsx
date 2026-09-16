import React from 'react';
import { X, Leaf, ShieldAlert, Sparkles, ArrowRight } from 'lucide-react';
import type { CropInfo } from '../../data/cropsData';

interface CropDetailModalProps {
  crop: CropInfo;
  onClose: () => void;
  onScanClick: (crop: CropInfo) => void;
}

export const CropDetailModal: React.FC<CropDetailModalProps> = ({
  crop,
  onClose,
  onScanClick,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
        {/* Modal Header with Crop Photo */}
        <div className="relative h-44 sm:h-48 w-full bg-slate-100 overflow-hidden">
          <img
            src={crop.image}
            alt={crop.name}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 bg-black/40 hover:bg-black/70 text-white rounded-full transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Title Overlay */}
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#15803D] uppercase tracking-wider">
                {crop.categoryDisplay}
              </span>
              <span className="text-[11px] text-slate-300">
                Season: {crop.season}
              </span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight leading-tight">
              {crop.name}
            </h2>
            <p className="text-xs text-slate-300 italic">
              {crop.scientificName}
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#EBF7EE] text-[#15803D] flex items-center justify-center shrink-0">
                <Leaf className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-medium block">Tracked Diseases</span>
                <span className="text-xs font-bold text-[#0F172A]">{crop.diseaseCount} Common Diseases</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#EBF7EE] text-[#15803D] flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-medium block">AI Accuracy</span>
                <span className="text-xs font-bold text-[#0F172A]">95%+ Precision</span>
              </div>
            </div>
          </div>

          {/* Common Diseases List */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              <span>Common Tracked Diseases</span>
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {crop.commonDiseases.map((d) => (
                <span
                  key={d}
                  className="text-xs font-medium px-2.5 py-1 bg-emerald-50 text-emerald-900 rounded-lg border border-emerald-100"
                >
                  {d}
                </span>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
            Upload an image of your {crop.name} leaf to get instant AI-powered detection,
            symptom analysis, and tailored treatment suggestions.
          </p>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => onScanClick(crop)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#15803D] hover:bg-[#166534] rounded-lg shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
          >
            <span>Scan Leaf for {crop.name}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
