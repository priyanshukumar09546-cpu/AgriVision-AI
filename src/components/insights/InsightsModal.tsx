import React from 'react';
import { X, ArrowRight } from 'lucide-react';

export interface ModalContent {
  type: 'precautions' | 'recommendation' | 'soil' | 'all-recommendations';
  title: string;
  subtitle?: string;
  body: React.ReactNode;
}

interface InsightsModalProps {
  content: ModalContent | null;
  onClose: () => void;
  onNavigateToDetect: () => void;
}

export const InsightsModal: React.FC<InsightsModalProps> = ({
  content,
  onClose,
  onNavigateToDetect,
}) => {
  if (!content) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col text-left"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-4 px-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-[#0F172A] leading-tight">
              {content.title}
            </h3>
            {content.subtitle && (
              <p className="text-xs text-slate-500 mt-0.5">{content.subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 max-h-[70vh] overflow-y-auto space-y-4 text-xs text-slate-700">
          {content.body}
        </div>

        {/* Footer */}
        <div className="p-3.5 px-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onNavigateToDetect();
            }}
            className="px-3.5 py-1.5 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <span>Scan Crop Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
