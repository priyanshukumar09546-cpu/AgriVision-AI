import React from 'react';
import { X, ShieldCheck, FileText } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tab?: 'terms' | 'privacy';
}

export const TermsModal: React.FC<TermsModalProps> = ({
  isOpen,
  onClose,
  tab = 'terms',
}) => {
  const [activeTab, setActiveTab] = React.useState<'terms' | 'privacy'>(tab);

  React.useEffect(() => {
    setActiveTab(tab);
  }, [tab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#15803D] flex items-center justify-center">
              {activeTab === 'terms' ? <FileText className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            </div>
            <h3 className="text-base font-bold text-[#0F172A]">
              {activeTab === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-100 px-6 pt-2 bg-slate-50/30">
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'terms'
                ? 'border-[#15803D] text-[#15803D]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Terms of Service
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'privacy'
                ? 'border-[#15803D] text-[#15803D]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Privacy Policy
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-600 leading-relaxed">
          {activeTab === 'terms' ? (
            <>
              <div>
                <h4 className="font-bold text-[#0F172A] mb-1">1. Welcome to AgriVision AI</h4>
                <p>
                  By creating an account or accessing our agricultural diagnostics platform, you agree to comply with and be bound by these Terms of Service. AgriVision AI is dedicated to empowering farmers and agricultural researchers with AI-driven plant disease diagnostics.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-[#0F172A] mb-1">2. Permitted Diagnostic Use</h4>
                <p>
                  Our AI vision models provide diagnostic assistance based on crop leaf photographs. Diagnostic outputs should be validated against local agronomic conditions and best management practices.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-[#0F172A] mb-1">3. User Conduct & Content</h4>
                <p>
                  Users agree to upload legitimate agricultural images and engage respectfully in community discussions and knowledge sharing.
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <h4 className="font-bold text-[#0F172A] mb-1">1. Privacy Principles</h4>
                <p>
                  AgriVision AI respects your personal privacy. We collect minimal account data (such as name, email, and user role) strictly to personalize diagnostic reports and support community discussions.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-[#0F172A] mb-1">2. Crop Image Data</h4>
                <p>
                  Uploaded leaf photos may be processed by our diagnostic neural networks to identify plant pathologies and improve model accuracy for all farmers.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-[#0F172A] mb-1">3. Data Security</h4>
                <p>
                  All account credentials and communications are encrypted in transit and securely stored using modern industry standards.
                </p>
              </div>
            </>
          )}
        </div>

        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-[#15803D] hover:bg-[#166534] rounded-xl transition-all shadow-2xs"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
