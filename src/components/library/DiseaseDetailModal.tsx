import React from 'react';
import { X, ShieldAlert, Sparkles, CheckCircle2, FlaskConical, AlertTriangle, ArrowRight } from 'lucide-react';
import type { Disease } from '../../data/diseasesData';

interface DiseaseDetailModalProps {
  disease: Disease | null;
  onClose: () => void;
  onNavigateToDetect: (cropName: string) => void;
}

export const DiseaseDetailModal: React.FC<DiseaseDetailModalProps> = ({
  disease,
  onClose,
  onNavigateToDetect,
}) => {
  if (!disease) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header Photo & Close Button */}
        <div className="relative h-48 sm:h-56 w-full bg-slate-900 shrink-0 overflow-hidden">
          <img
            src={disease.imageUrl}
            alt={`${disease.name} on ${disease.crop}`}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors focus:outline-none"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Badges and Title on Image */}
          <div className="absolute bottom-4 left-5 right-5 text-white">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="bg-[#15803D] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {disease.crop}
              </span>
              <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                {disease.type}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                disease.severity === 'High' 
                  ? 'bg-rose-600 text-white' 
                  : disease.severity === 'Moderate'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-emerald-500 text-white'
              }`}>
                {disease.severity} Severity
              </span>
            </div>
            <h2 id="modal-title" className="text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-tight">
              {disease.name}
            </h2>
            <p className="text-xs text-emerald-200 italic mt-0.5">
              Pathogen: {disease.scientificName}
            </p>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-slate-800 text-left">
          {/* Overview */}
          <div className="bg-[#F2FBF5] border border-[#DCFCE7] rounded-xl p-3.5">
            <h3 className="text-xs font-bold text-[#15803D] uppercase tracking-wider mb-1">
              Overview
            </h3>
            <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed">
              {disease.shortDescription}
            </p>
          </div>

          {/* Symptoms */}
          <div>
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Identification Symptoms
            </h3>
            <ul className="space-y-1.5 pl-1">
              {disease.symptoms.map((symptom, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span>{symptom}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Favorable Environmental Conditions & Causes */}
          <div>
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 mb-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              Causes & Environmental Triggers
            </h3>
            <ul className="space-y-1.5 pl-1">
              {disease.causes.map((cause, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                  <span>{cause}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Treatments Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Organic Controls */}
            <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3.5">
              <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#15803D]" />
                Organic / Biological Controls
              </h4>
              <ul className="space-y-1.5">
                {disease.treatments.organic.map((item, idx) => (
                  <li key={idx} className="text-[11.5px] text-slate-700 flex items-start gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-[#15803D] mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Chemical Treatments */}
            <div className="bg-sky-50/70 border border-sky-100 rounded-xl p-3.5">
              <h4 className="text-xs font-bold text-sky-900 flex items-center gap-1.5 mb-2">
                <FlaskConical className="w-3.5 h-3.5 text-sky-700" />
                Chemical Fungicides / Treatments
              </h4>
              <ul className="space-y-1.5">
                {disease.treatments.chemical.map((item, idx) => (
                  <li key={idx} className="text-[11.5px] text-slate-700 flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Prevention Practices */}
          <div>
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
              Preventive Agronomic Practices
            </h3>
            <ul className="space-y-1.5 pl-1">
              {disease.prevention.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#15803D] mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div className="bg-slate-50 border-t border-slate-100 p-4 px-6 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            Close Guide
          </button>
          <button
            type="button"
            onClick={() => onNavigateToDetect(disease.crop)}
            className="px-4 py-2 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-semibold rounded-lg flex items-center gap-2 shadow-xs transition-colors"
          >
            <span>Scan Leaf for {disease.crop}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
