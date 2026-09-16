import React, { useState, useEffect } from 'react';
import { History, Trash2, ExternalLink, Calendar, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import { fetchUserScans, deleteUserScan, type UserScanRecord } from '../../services/diseaseDetectionService';
import { getStoredAuthUser } from '../../services/authService';

interface ScanHistoryViewProps {
  onSelectScan: (scan: UserScanRecord) => void;
  onNewScan: () => void;
  onToast: (msg: string) => void;
}

export const ScanHistoryView: React.FC<ScanHistoryViewProps> = ({
  onSelectScan,
  onNewScan,
  onToast,
}) => {
  const [scans, setScans] = useState<UserScanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const currentUser = getStoredAuthUser();

  const loadScans = async () => {
    setLoading(true);
    try {
      const data = await fetchUserScans(currentUser?.id);
      setScans(data);
    } catch (e) {
      console.error(e);
      setScans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScans();
  }, []);

  const handleDelete = async (e: React.MouseEvent, scanId: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to remove this scan record?')) return;
    setDeletingId(scanId);
    const ok = await deleteUserScan(scanId);
    if (ok) {
      setScans((prev) => prev.filter((s) => s.id !== scanId));
      onToast('Scan record deleted.');
    } else {
      onToast('Failed to delete scan record.');
    }
    setDeletingId(null);
  };

  if (loading) {
    return (
      <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-12 text-center shadow-2xs">
        <div className="inline-block w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-slate-500 font-medium">Retrieving verified scan history from database...</p>
      </div>
    );
  }

  if (scans.length === 0) {
    return (
      <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-10 sm:p-14 text-center shadow-2xs">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#15803D] flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-2xs">
          <History className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-[#0F172A] tracking-tight">
          Your scan history will appear here after your first diagnosis.
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
          Every leaf diagnosed by our AI computer vision engine is securely recorded in the database with symptoms, treatment plans, and severity index.
        </p>
        <div className="mt-6">
          <button
            type="button"
            onClick={onNewScan}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <span>Run Your First Diagnosis</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-[#0F172A]">Verified Diagnosis History</h2>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
            {scans.length} {scans.length === 1 ? 'Scan' : 'Scans'}
          </span>
        </div>
        <button
          type="button"
          onClick={onNewScan}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#15803D] hover:text-[#166534] cursor-pointer"
        >
          <span>+ New Diagnostic Scan</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scans.map((scan) => {
          const isHealthy = scan.severity === 'Healthy';
          const formattedDate = new Date(scan.createdAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={scan.id}
              onClick={() => onSelectScan(scan)}
              className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/80">
                    <img
                      src={scan.imageUrl || '/crops/tomato.png'}
                      alt={scan.crop}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#0F172A] truncate">
                        {scan.crop}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[10.5px] text-slate-500 truncate">
                        {scan.scientificName}
                      </span>
                    </div>
                    <div className="text-sm font-extrabold text-[#0F172A] tracking-tight mt-0.5 truncate">
                      {scan.disease}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isHealthy
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : scan.severity === 'High' || scan.severity === 'Severe'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {isHealthy ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <ShieldAlert className="w-3 h-3" />
                        )}
                        <span>{scan.severity}</span>
                      </span>

                      <span className="text-[10.5px] font-semibold text-emerald-700">
                        {scan.confidence}% Conf.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>{formattedDate}</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    title="Delete Scan"
                    onClick={(e) => handleDelete(e, scan.id)}
                    disabled={deletingId === scan.id}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-bold text-[#15803D] group-hover:underline flex items-center gap-0.5">
                    View <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
