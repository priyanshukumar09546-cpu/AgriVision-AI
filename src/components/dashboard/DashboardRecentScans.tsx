import React from 'react';
import { Camera, ExternalLink, ArrowRight } from 'lucide-react';
import type { RecentScanItem } from '../../services/dashboardService';

interface DashboardRecentScansProps {
  scans: RecentScanItem[];
  onViewScan: (scan: RecentScanItem) => void;
  onViewAll: () => void;
  onNewScan: () => void;
}

export const DashboardRecentScans: React.FC<DashboardRecentScansProps> = ({
  scans,
  onViewScan,
  onViewAll,
  onNewScan,
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between text-left select-none h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h2 className="text-sm font-bold text-[#0F172A]">Recent Scans</h2>
        <button
          type="button"
          onClick={onViewAll}
          className="text-xs font-bold text-[#15803D] hover:text-[#166534] cursor-pointer"
        >
          View All
        </button>
      </div>

      {/* Scans List / Empty State */}
      <div className="py-2 flex-1 flex flex-col justify-center">
        {scans.length === 0 ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#15803D] flex items-center justify-center mx-auto border border-emerald-100">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800">
                Your recent scans will appear here after your first diagnosis.
              </h3>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
                Scan a crop leaf with our AI computer vision engine to detect diseases and view treatment protocols.
              </p>
            </div>
            <button
              type="button"
              onClick={onNewScan}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <span>Scan a Leaf Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {scans.map((scan) => {
              const isHealthy = scan.severity === 'Healthy';
              return (
                <div
                  key={scan.id}
                  className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200/80 transition-all"
                >
                  {/* Left: Thumbnail + Crop & Disease */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/80">
                      <img
                        src={scan.imageUrl || '/crops/tomato.png'}
                        alt={scan.crop}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-[#0F172A] leading-tight truncate">
                        {scan.crop}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold leading-none ${
                            isHealthy
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {scan.disease}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                        {scan.formattedDate}
                      </div>
                    </div>
                  </div>

                  {/* Right: Confidence + View Result Button */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-800 block">
                        {scan.confidence}%
                      </span>
                      <span className="text-[9.5px] text-slate-400 font-medium block leading-none">
                        Confidence
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onViewScan(scan)}
                      className="px-2.5 py-1.5 border border-emerald-300 hover:border-emerald-600 bg-white hover:bg-emerald-50 text-[#15803D] text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span>View Result</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
