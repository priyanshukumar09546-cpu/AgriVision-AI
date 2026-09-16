import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import {
  Camera,
  Eye,
  Trash2,
  CheckCircle2,
  User,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  Sparkles
} from 'lucide-react';
import {
  fetchAdminScans,
  deleteAdminScan
} from '../../services/adminService';
import type { RecentScanItem } from '../../services/adminService';

interface AdminScansPageProps {
  onRouteChange?: (route: string) => void;
}

export const AdminScansPage: React.FC<AdminScansPageProps> = ({ onRouteChange }) => {
  const [scans, setScans] = useState<RecentScanItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cropFilter, setCropFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals
  const [selectedScan, setSelectedScan] = useState<RecentScanItem | null>(null);
  const [deletingScan, setDeletingScan] = useState<RecentScanItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const loadScans = async () => {
    setIsLoading(true);
    const params: any = { page, limit: 12 };
    if (cropFilter !== 'All') params.crop = cropFilter;

    const res = await fetchAdminScans(params);
    setScans(res.scans || []);
    setTotalCount(res.total || 0);
    setTotalPages(res.totalPages || 1);
    setIsLoading(false);
  };

  useEffect(() => {
    loadScans();
  }, [cropFilter, page]);

  const handleDeleteScan = async () => {
    if (!deletingScan) return;
    setIsSubmitting(true);
    const res = await deleteAdminScan(deletingScan.id);
    setIsSubmitting(false);
    if (res.success) {
      showToast('Scan log entry deleted.');
      setDeletingScan(null);
      loadScans();
    } else {
      showToast(res.error || 'Failed to delete scan.');
    }
  };

  const getConfidenceBadge = (confStr: string) => {
    const num = parseFloat(confStr);
    if (isNaN(num)) return <span className="text-slate-600 font-bold">{confStr}</span>;
    if (num >= 90) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          {confStr}
        </span>
      );
    } else if (num >= 75) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
          {confStr}
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          {confStr}
        </span>
      );
    }
  };

  return (
    <AdminLayout activeItem="scans" onRouteChange={onRouteChange}>
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <p className="text-xs font-semibold">{toastMsg}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">AI Scan Records</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit real field diagnoses, AI model predictions, confidence levels, and user scan submissions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Filter Crop:</span>
          <select
            value={cropFilter}
            onChange={(e) => {
              setCropFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="All">All Crops</option>
            <option value="Tomato">Tomato</option>
            <option value="Potato">Potato</option>
            <option value="Corn">Corn</option>
            <option value="Wheat">Wheat</option>
            <option value="Rice">Rice</option>
            <option value="Apple">Apple</option>
            <option value="Grape">Grape</option>
            <option value="Pepper">Pepper</option>
          </select>
        </div>
      </div>

      {/* Scans Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
            <p className="text-xs font-semibold">Loading scan history...</p>
          </div>
        ) : scans.length === 0 ? (
          <div className="py-20 text-center px-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <Camera className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No scan records found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {cropFilter !== 'All'
                ? `No scans have been performed yet for ${cropFilter}. Try selecting All Crops.`
                : 'No leaf scans have been submitted yet. Scans performed in the mobile or web diagnosis engine will appear here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Sample Image</th>
                  <th className="py-3 px-4">Crop</th>
                  <th className="py-3 px-4">Diagnosis Result</th>
                  <th className="py-3 px-4">Confidence</th>
                  <th className="py-3 px-4">Submitted By</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {scans.map((scan) => {
                  const isHealthy = scan.result?.toLowerCase() === 'healthy';
                  return (
                    <tr key={scan.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <img
                          src={scan.image || 'https://images.unsplash.com/photo-1592417817098-8f3d69102353?w=100&auto=format&fit=crop&q=80'}
                          alt={scan.crop}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1592417817098-8f3d69102353?w=100&auto=format&fit=crop&q=80';
                          }}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {scan.crop}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              isHealthy ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          <div>
                            <p className="font-bold text-slate-800 leading-tight">{scan.result || scan.disease || 'Detected'}</p>
                            {scan.scientificName && (
                              <p className="text-[10.5px] text-slate-400 italic">{scan.scientificName}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {getConfidenceBadge(scan.confidence)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{scan.user || 'Guest Farmer'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-medium">
                        {scan.date}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedScan(scan)}
                            title="View Diagnosis"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingScan(scan)}
                            title="Delete Scan Log"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <p>
            Showing <span className="font-semibold text-slate-700">{scans.length}</span> of{' '}
            <span className="font-semibold text-slate-700">{totalCount}</span> scans logged
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-slate-700 px-1">
              Page {page} of {totalPages || 1}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Scan Detail Modal */}
      {selectedScan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">AI Diagnosis Record</h3>
              <button onClick={() => setSelectedScan(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-100 border border-slate-200">
                <img
                  src={selectedScan.image || 'https://images.unsplash.com/photo-1592417817098-8f3d69102353?w=600&auto=format&fit=crop&q=80'}
                  alt={selectedScan.crop}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-xs text-white px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{selectedScan.confidence} Confidence</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <p className="text-slate-400 font-medium">Crop</p>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedScan.crop}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Diagnosis</p>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedScan.result}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Submitted By</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedScan.user}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Scan Date</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedScan.date}</p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedScan(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
                >
                  Close Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Scan Confirmation */}
      {deletingScan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-100 p-6 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Delete Scan Entry?</h3>
            <p className="text-xs text-slate-500 mt-1.5">
              Are you sure you want to delete scan record <span className="font-bold text-slate-700">#{deletingScan.id}</span> ({deletingScan.crop} - {deletingScan.result})?
            </p>
            <div className="mt-6 flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setDeletingScan(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeleteScan}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Log</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
