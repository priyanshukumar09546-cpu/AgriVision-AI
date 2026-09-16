import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import {
  PieChart,
  Download,
  CheckCircle2,
  Sprout,
  ShieldAlert,
  Users,
  Camera,
  Loader2
} from 'lucide-react';
import {
  fetchAdminDashboardStats
} from '../../services/adminService';
import type { AdminDashboardData } from '../../services/adminService';

interface AdminReportsPageProps {
  onRouteChange?: (route: string) => void;
}

export const AdminReportsPage: React.FC<AdminReportsPageProps> = ({ onRouteChange }) => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      setIsLoading(true);
      const res = await fetchAdminDashboardStats();
      setData(res);
      setIsLoading(false);
    }
    loadStats();
  }, []);

  const kpis = data?.kpis || {
    totalUsers: 0,
    usersThisMonth: 0,
    totalScans: 0,
    scansThisMonth: 0,
    cropsInLibrary: 0,
    diseasesInLibrary: 0,
    communityPosts: 0,
    postsThisMonth: 0,
    activeUsers: 0
  };

  const totalScans = data?.scanOverview.total || 0;
  const diseasedCount = data?.scanOverview.diseased || 0;
  const healthyCount = data?.scanOverview.healthy || 0;
  const needsAttnCount = data?.scanOverview.needsAttention || 0;

  const infectionRate = totalScans > 0 ? ((diseasedCount / totalScans) * 100).toFixed(1) : '0';
  const healthyRate = totalScans > 0 ? ((healthyCount / totalScans) * 100).toFixed(1) : '0';

  const topCrops = data?.topCrops || [];

  const handleExportCSV = () => {
    if (!data) return;
    const rows = [
      ['Metric', 'Value'],
      ['Total Users', kpis.totalUsers],
      ['Active Users', kpis.activeUsers],
      ['Total Scans Logged', kpis.totalScans],
      ['Healthy Crop Scans', healthyCount],
      ['Diseased Scans', diseasedCount],
      ['Needs Attention Scans', needsAttnCount],
      ['Infection Rate %', `${infectionRate}%`],
      ['Crops in Catalog', kpis.cropsInLibrary],
      ['Pathogens in Library', kpis.diseasesInLibrary],
      ['Community Posts', kpis.communityPosts]
    ];

    let csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AgriVision_Analytics_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout activeItem="reports" onRouteChange={onRouteChange}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Reports & Diagnostics Analytics</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Aggregated crop health metrics, disease outbreak telemetry, and platform adoption reports.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV Report</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
          <p className="text-xs font-semibold">Generating agricultural reports...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Scans</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">{kpis.totalScans.toLocaleString()}</p>
              <p className="text-[11px] text-slate-400 font-medium mt-1">
                {kpis.scansThisMonth > 0 ? `+${kpis.scansThisMonth} scanned this month` : 'Real field submissions'}
              </p>
            </div>

            <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Infection Rate</span>
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <ShieldAlert className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">{infectionRate}%</p>
              <p className="text-[11px] text-rose-600 font-medium mt-1">
                {diseasedCount} diseased of {totalScans} total scans
              </p>
            </div>

            <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Healthy Crop Rate</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">{healthyRate}%</p>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">
                {healthyCount} healthy foliage confirmed
              </p>
            </div>

            <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Farmer Community</span>
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">{kpis.totalUsers.toLocaleString()}</p>
              <p className="text-[11px] text-indigo-600 font-medium mt-1">
                {kpis.activeUsers} active accounts
              </p>
            </div>
          </div>

          {/* Detailed Analytical Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Crops Scanned */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Crop Health & Diagnostic Distribution</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Top scanned crops recorded in real field analyses</p>
                </div>
                <Sprout className="w-4 h-4 text-emerald-600" />
              </div>

              {topCrops.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <p className="text-xs">No crop scan data recorded yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topCrops.map((crop, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <img
                            src={crop.image}
                            alt={crop.name}
                            className="w-6 h-6 rounded-md object-cover border border-slate-100"
                          />
                          <span className="font-bold text-slate-800">{crop.name}</span>
                        </div>
                        <span className="font-semibold text-slate-600">
                          {crop.count} scans ({crop.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: crop.barWidth }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Diagnostic Outcome Ratio */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Scan Pathology Breakdown</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Categorization across all verified leaf scans</p>
                  </div>
                  <PieChart className="w-4 h-4 text-emerald-600" />
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="font-bold text-slate-800">Healthy Crops</span>
                    </div>
                    <span className="font-bold text-emerald-700">{healthyCount} ({healthyRate}%)</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50/60 border border-rose-100 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <span className="font-bold text-slate-800">Confirmed Disease</span>
                    </div>
                    <span className="font-bold text-rose-700">{diseasedCount} ({infectionRate}%)</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/60 border border-amber-100 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span className="font-bold text-slate-800">Needs Agronomist Attention</span>
                    </div>
                    <span className="font-bold text-amber-700">
                      {needsAttnCount} ({totalScans > 0 ? ((needsAttnCount / totalScans) * 100).toFixed(1) : 0}%)
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 text-[11px] text-slate-400">
                Data generated continuously from AI Vision inference logs and agronomist feedback.
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
