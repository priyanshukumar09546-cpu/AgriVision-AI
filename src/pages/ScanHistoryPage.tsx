import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { DashboardSidebar } from '../components/dashboard/DashboardSidebar';
import {
  Camera,
  Trash2,
  Search,
  Loader2,
  Check
} from 'lucide-react';
import { getStoredAuthUser } from '../services/authService';
import type { AuthUser } from '../services/authService';
import {
  fetchScanHistory,
  deleteScanRecord,
} from '../services/accountService';
import type { ScanHistoryItem } from '../services/accountService';
import { navigateTo } from '../utils/navigation';

interface ScanHistoryPageProps {
  onRouteChange?: (route: string) => void;
}

type TimeFilter = 'all' | '7days' | '30days' | 'year';

export const ScanHistoryPage: React.FC<ScanHistoryPageProps> = ({ onRouteChange }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getStoredAuthUser());
  const [scans, setScans] = useState<ScanHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScan, setSelectedScan] = useState<ScanHistoryItem | null>(null);

  const nav = (route: string) => navigateTo(route, onRouteChange);

  useEffect(() => {
    const user = getStoredAuthUser();
    if (!user) {
      nav('/login');
    } else {
      setCurrentUser(user);
    }
  }, []);

  const loadScans = async (filter: TimeFilter = timeFilter) => {
    if (!currentUser) return;
    setIsLoading(true);
    const data = await fetchScanHistory(currentUser.id, filter);
    setScans(data);
    setIsLoading(false);
  };

  useEffect(() => {
    if (currentUser) {
      loadScans(timeFilter);
    }
  }, [currentUser, timeFilter]);

  const handleDelete = async (scanId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;
    const ok = await deleteScanRecord(scanId, currentUser.id);
    if (ok) {
      setScans(prev => prev.filter(s => s.id !== scanId));
      if (selectedScan?.id === scanId) setSelectedScan(null);
    }
  };

  const filteredScans = scans.filter(s => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.crop?.toLowerCase().includes(q) ||
      s.disease?.toLowerCase().includes(q) ||
      s.scientificName?.toLowerCase().includes(q)
    );
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'high':
      case 'severe':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'medium':
      case 'moderate':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'low':
      case 'mild':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col antialiased text-slate-800">
      <Navbar activeRoute="/history" onRouteChange={onRouteChange} />

      <div className="flex flex-1 w-full max-w-[1500px] mx-auto pt-3 sm:pt-5 pb-12 px-3 sm:px-6 lg:px-8 gap-6">
        {/* Left Sidebar */}
        <div className="hidden lg:block w-56 xl:w-60 shrink-0">
          <div className="sticky top-20">
            <DashboardSidebar activeItem="history" onRouteChange={nav} />
          </div>
        </div>

        {/* Main Content Workspace */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Header Banner */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2.5">
                  <Camera className="w-6 h-6 text-[#15803D]" />
                  Scan History
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                  Review all past crop diagnoses, pathology reports, and treatments
                </p>
              </div>

              {/* Action and Time Filter */}
              <div className="flex items-center gap-2.5 self-start sm:self-auto">
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Time</option>
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="year">Past Year</option>
                </select>

                <button
                  type="button"
                  onClick={() => nav('/detect')}
                  className="px-3.5 py-1.5 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>New Scan</span>
                </button>
              </div>
            </div>

            {/* Search filter */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter by crop, disease, or symptom..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-[#15803D]"
                />
              </div>
              <span className="text-xs text-slate-400 font-medium">
                Showing {filteredScans.length} of {scans.length} scans
              </span>
            </div>
          </div>

          {/* Cards Grid or Empty State */}
          {isLoading ? (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-16 flex flex-col items-center justify-center text-center shadow-2xs">
              <Loader2 className="w-8 h-8 text-[#15803D] animate-spin mb-3" />
              <p className="text-sm font-semibold text-slate-600">Loading scan history...</p>
            </div>
          ) : filteredScans.length === 0 ? (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-12 sm:p-16 flex flex-col items-center justify-center text-center shadow-2xs">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
                <Camera className="w-8 h-8 text-[#15803D]" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1">
                No scans yet
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
                Take or upload a picture of an affected crop leaf to receive instant AI pathology diagnosis, confidence metrics, and treatment guidance.
              </p>
              <button
                type="button"
                onClick={() => nav('/detect')}
                className="px-4 py-2 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Detect Crop Disease</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredScans.map((scan) => (
                <div
                  key={scan.id}
                  onClick={() => setSelectedScan(scan)}
                  className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden hover:shadow-md transition-all cursor-pointer group flex flex-col"
                >
                  <div className="h-40 w-full overflow-hidden bg-slate-100 relative">
                    <img
                      src={scan.imageUrl || '/crops/tomato.jpg'}
                      alt={scan.crop}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/95 text-slate-800 border border-slate-200 shadow-2xs">
                        {scan.crop}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border shadow-2xs ${getSeverityBadge(scan.severity)}`}>
                        {scan.severity || 'Moderate'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(scan.id, e)}
                      title="Delete scan record"
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-400 hover:text-red-500 shadow-2xs transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#15803D] transition-colors mb-0.5">
                        {scan.disease || 'Healthy Plant'}
                      </h4>
                      {scan.scientificName && (
                        <p className="text-[11px] italic text-slate-400 mb-2">
                          {scan.scientificName}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-400 text-[11px]">
                        {scan.formattedDate || (scan.createdAt ? new Date(scan.createdAt).toLocaleDateString() : '')}
                      </span>
                      <span className="font-bold text-[#15803D] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[11px]">
                        {Math.round(scan.confidence || 95)}% match
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bottom Tips box matching reference */}
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 shadow-2xs">
            <h4 className="text-xs font-bold text-emerald-950 mb-2 flex items-center gap-1.5">
              <span>💡 Tips for better diagnosis results</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-emerald-800">
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-[#15803D] shrink-0 mt-0.5" />
                <span>Capture in clear natural daylight without hard shadows</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-[#15803D] shrink-0 mt-0.5" />
                <span>Keep camera focused directly on affected leaf spots</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-[#15803D] shrink-0 mt-0.5" />
                <span>Include both healthy and symptomatic leaf areas</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-[#15803D] shrink-0 mt-0.5" />
                <span>Avoid blurred, dark or heavily compressed photos</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scan Detail Modal */}
      {selectedScan && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md uppercase">
                  {selectedScan.crop} Diagnosis
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {selectedScan.disease}
                </h3>
                {selectedScan.scientificName && (
                  <p className="text-xs italic text-slate-400">{selectedScan.scientificName}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedScan(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            {selectedScan.imageUrl && (
              <div className="h-48 w-full rounded-xl overflow-hidden bg-slate-100">
                <img src={selectedScan.imageUrl} alt={selectedScan.disease} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              <span className="text-slate-500">Confidence Score:</span>
              <span className="font-bold text-[#15803D]">{Math.round(selectedScan.confidence || 95)}%</span>
            </div>

            {selectedScan.symptoms && selectedScan.symptoms.length > 0 && (
              <div>
                <h5 className="text-xs font-bold text-slate-700 mb-1.5">Symptoms Identified</h5>
                <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                  {selectedScan.symptoms.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedScan(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
