import React from 'react';
import { LayoutGrid, List } from 'lucide-react';
import type { Disease } from '../../data/diseasesData';

interface DiseaseGridProps {
  diseases: Disease[];
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onSelectDisease: (disease: Disease) => void;
}

export const DiseaseGrid: React.FC<DiseaseGridProps> = ({
  diseases,
  viewMode,
  onViewModeChange,
  onSelectDisease,
}) => {
  const getTypeBadgeStyle = (type: string) => {
    switch (type) {
      case 'Fungal':
        return 'bg-[#FCE7F3] text-[#9D174D] border border-pink-100';
      case 'Bacterial':
        return 'bg-[#CCFBF1] text-[#0F766E] border border-teal-100';
      case 'Viral':
        return 'bg-[#DCFCE7] text-[#166534] border border-emerald-100';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  const getSeverityBadgeStyle = (severity: string) => {
    switch (severity) {
      case 'High':
        return 'bg-[#DC2626] text-white';
      case 'Moderate':
        return 'bg-[#FEF3C7] text-[#92400E] border border-amber-200';
      case 'Mild':
        return 'bg-[#DCFCE7] text-[#166534] border border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="flex-1 min-w-0">
      {/* Top Header matching reference */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-1">
        <div>
          <h2 className="text-[19px] sm:text-[21px] font-extrabold text-[#0F172A] tracking-tight leading-tight">
            All Diseases
          </h2>
          <p className="text-[11.5px] sm:text-[12px] text-slate-500 mt-0.5">
            Browse diseases by crop and learn how to identify, treat, and prevent them.
          </p>
        </div>

        {/* View Toggle & Count Indicator */}
        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>View:</span>
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-white shadow-2xs">
              <button
                type="button"
                onClick={() => onViewModeChange('grid')}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-[#15803D] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid</span>
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('list')}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-[#15803D] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="List View"
              >
                <List className="w-3.5 h-3.5" />
                <span>List</span>
              </button>
            </div>
          </div>

          <span className="text-[11.5px] text-slate-500 hidden sm:inline-block">
            Showing {diseases.length} of 120+ diseases
          </span>
        </div>
      </div>

      {/* When no diseases match filters */}
      {diseases.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
          <p className="text-sm font-semibold text-slate-700">No diseases found matching your filters.</p>
          <p className="text-xs text-slate-500 mt-1">Try clearing some filter criteria or searching with a different term.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Exactly 6 columns on desktop (grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6) */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3">
          {diseases.map((disease) => (
            <div
              key={disease.id}
              onClick={() => onSelectDisease(disease)}
              className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-emerald-300 transition-all duration-200 flex flex-col justify-between group cursor-pointer"
            >
              {/* Card Photo */}
              <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-100 shrink-0">
                <img
                  src={disease.imageUrl}
                  alt={`${disease.name} on ${disease.crop}`}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Card Details */}
              <div className="p-2.5 flex-1 flex flex-col justify-between">
                <div>
                  {/* Badges Row */}
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span
                      className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${getTypeBadgeStyle(
                        disease.type
                      )}`}
                    >
                      {disease.type}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${getSeverityBadgeStyle(
                        disease.severity
                      )}`}
                    >
                      {disease.severity}
                    </span>
                  </div>

                  {/* Disease Name */}
                  <h3 className="text-[12px] font-bold text-[#0F172A] group-hover:text-[#15803D] transition-colors leading-tight line-clamp-1">
                    {disease.name}
                  </h3>

                  {/* Crop Name */}
                  <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                    {disease.crop}
                  </span>

                  {/* Short Description */}
                  <p className="text-[9.5px] text-slate-500 leading-[1.35] line-clamp-3 mt-1.5 min-h-[38px]">
                    {disease.shortDescription}
                  </p>
                </div>

                {/* Bottom View Details Link */}
                <button
                  type="button"
                  className="text-[10.5px] font-semibold text-[#15803D] hover:text-[#166534] flex items-center gap-1 mt-2 group-hover:gap-1.5 transition-all text-left"
                >
                  <span>View Details</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-2.5">
          {diseases.map((disease) => (
            <div
              key={disease.id}
              onClick={() => onSelectDisease(disease)}
              className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-emerald-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                  <img
                    src={disease.imageUrl}
                    alt={disease.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#0F172A] group-hover:text-[#15803D] transition-colors">
                      {disease.name}
                    </h3>
                    <span className="text-xs text-slate-500">({disease.crop})</span>
                    <span
                      className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${getTypeBadgeStyle(
                        disease.type
                      )}`}
                    >
                      {disease.type}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${getSeverityBadgeStyle(
                        disease.severity
                      )}`}
                    >
                      {disease.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 max-w-xl">
                    {disease.shortDescription}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="text-xs font-semibold text-[#15803D] hover:text-[#166534] flex items-center gap-1 shrink-0 group-hover:gap-1.5 transition-all"
              >
                <span>View Details</span>
                <span>→</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
