import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import {
  Users,
  Camera,
  Sprout,
  ShieldAlert,
  MessageSquare,
  TrendingUp,
  ArrowUpRight,
  Calendar,
  MoreVertical,
  Plus,
  Bell,
  FileText,
  BarChart2,
  Check,
  X,
  Loader2,
  ChevronRight
} from 'lucide-react';
import {
  fetchAdminDashboardStats,
  saveAdminCrop,
  saveAdminDisease,
  saveAdminArticle,
  sendAdminNotification
} from '../../services/adminService';
import type { AdminDashboardData } from '../../services/adminService';

interface AdminDashboardPageProps {
  onRouteChange?: (route: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onRouteChange }) => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [, setIsLoading] = useState(true);
  const [growthPeriod, setGrowthPeriod] = useState('Last 9 Months');

  // Quick Action Modals
  const [modalType, setModalType] = useState<'addCrop' | 'addDisease' | 'sendNotif' | 'createArticle' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form states
  const [cropName, setCropName] = useState('');
  const [cropSciName, setCropSciName] = useState('');
  const [cropCategory, setCropCategory] = useState('Vegetables');
  const [cropSeason, setCropSeason] = useState('Year-round');
  const [cropDesc, setCropDesc] = useState('');

  const [diseaseName, setDiseaseName] = useState('');
  const [diseaseCrop, setDiseaseCrop] = useState('Tomato');
  const [diseaseSciName, setDiseaseSciName] = useState('');
  const [diseaseType, setDiseaseType] = useState('Fungal');
  const [diseaseSeverity, setDiseaseSeverity] = useState('Moderate');
  const [diseaseDesc, setDiseaseDesc] = useState('');

  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifRole, setNotifRole] = useState('all');

  const [artTitle, setArtTitle] = useState('');
  const [artCategory, setArtCategory] = useState('Crop Protection');
  const [artContent, setArtContent] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const loadStats = async () => {
    setIsLoading(true);
    const stats = await fetchAdminDashboardStats();
    if (stats) {
      setData(stats);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleCreateCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropName.trim()) return;
    setIsSubmitting(true);
    const res = await saveAdminCrop({
      name: cropName,
      scientific_name: cropSciName,
      category: cropCategory,
      growing_season: cropSeason,
      description: cropDesc,
    });
    setIsSubmitting(false);
    if (res.success) {
      showToast('Crop successfully registered in agricultural catalog.');
      setModalType(null);
      setCropName('');
      setCropSciName('');
      setCropDesc('');
      loadStats();
    }
  };

  const handleCreateDisease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diseaseName.trim()) return;
    setIsSubmitting(true);
    const res = await saveAdminDisease({
      name: diseaseName,
      crop_name: diseaseCrop,
      scientific_name: diseaseSciName,
      disease_type: diseaseType,
      severity: diseaseSeverity,
      description: diseaseDesc,
    });
    setIsSubmitting(false);
    if (res.success) {
      showToast(`Disease "${diseaseName}" recorded successfully.`);
      setModalType(null);
      setDiseaseName('');
      setDiseaseSciName('');
      setDiseaseDesc('');
      loadStats();
    }
  };

  const handleSendNotif = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await sendAdminNotification({
      title: notifTitle,
      message: notifMessage,
      target_role: notifRole,
    });
    setIsSubmitting(false);
    if (res.success) {
      showToast((res as any).message || 'Notification broadcast successfully delivered.');
      setModalType(null);
      setNotifTitle('');
      setNotifMessage('');
    }
  };

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await saveAdminArticle({
      title: artTitle,
      category: artCategory,
      excerpt: artContent.slice(0, 120),
      content: artContent,
      author: 'Admin Editorial',
      published: true,
    });
    setIsSubmitting(false);
    if (res.success) {
      showToast('Article published to Resources library.');
      setModalType(null);
      setArtTitle('');
      setArtContent('');
    }
  };

  const kpis = data?.kpis || {
    totalUsers: 0,
    usersThisMonth: 0,
    totalScans: 0,
    scansThisMonth: 0,
    cropsInLibrary: 0,
    diseasesInLibrary: 0,
    communityPosts: 0,
    postsThisMonth: 0,
    activeUsers: 0,
  };

  // User growth calculations for SVG spline
  const growthPoints = data?.userGrowth || [];
  const maxGrowthUsers = Math.max(...growthPoints.map(p => p.users), 10);
  const chartHeight = 140;
  const chartWidth = 420;

  const getSvgCoordinates = () => {
    if (growthPoints.length < 2) return '';
    return growthPoints
      .map((p, idx) => {
        const x = (idx / (growthPoints.length - 1)) * chartWidth;
        const y = chartHeight - (p.users / maxGrowthUsers) * (chartHeight - 20) - 10;
        return `${x},${y}`;
      })
      .join(' ');
  };

  // Donut chart calculations
  const totalScans = data?.scanOverview.total || 0;
  const healthyCount = data?.scanOverview.healthy || 0;
  const diseasedCount = data?.scanOverview.diseased || 0;
  const needsAttnCount = data?.scanOverview.needsAttention || 0;

  const healthyPct = totalScans > 0 ? (healthyCount / totalScans) * 100 : 0;
  const diseasedPct = totalScans > 0 ? (diseasedCount / totalScans) * 100 : 0;
  const needsAttnPct = totalScans > 0 ? (needsAttnCount / totalScans) * 100 : 0;

  // SVG Donut circumference: 2 * Math.PI * 48 ≈ 301.6
  const circleCircumference = 301.6;
  const healthyStroke = (healthyPct / 100) * circleCircumference;
  const diseasedStroke = (diseasedPct / 100) * circleCircumference;
  const needsAttnStroke = (needsAttnPct / 100) * circleCircumference;

  const todayFormatted = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <AdminLayout activeItem="dashboard" onRouteChange={onRouteChange}>
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-800 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4 text-emerald-300" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. HERO BANNER matching reference */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs border border-slate-200">
        {/* Agricultural Panorama Background */}
        <div className="relative h-44 sm:h-52 w-full overflow-hidden">
          <img
            src="/auth_assets/auth_hero_desktop.jpg"
            alt="Agricultural Panorama Banner"
            className="w-full h-full object-cover brightness-90 saturate-110"
          />
          {/* Subtle gradient overlay to match reference */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-black/10" />
        </div>

        {/* Banner Content Layout */}
        <div className="absolute inset-0 p-5 sm:p-7 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Left Welcome Copy */}
            <div>
              <p className="text-white/80 text-xs sm:text-sm font-semibold mb-0.5">
                Welcome back,
              </p>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                Admin <span className="inline-block animate-bounce">👋</span>
              </h1>
              <p className="text-white/90 text-xs sm:text-sm max-w-lg mt-1 font-medium leading-relaxed">
                Manage users, monitor activity, and keep AgriVision AI healthy and growing.
              </p>
            </div>

            {/* Right Quote & Date Widget */}
            <div className="hidden md:flex flex-col items-end gap-2 text-right">
              <p className="text-white/80 text-xs italic max-w-xs font-medium">
                "Empowering farmers towards a healthier tomorrow."
              </p>
              <div className="bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl shadow-sm border border-white/40 flex items-center gap-2 text-slate-800">
                <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                <div className="text-left">
                  <p className="text-[9.5px] font-bold uppercase text-slate-400 leading-tight">Today</p>
                  <p className="text-xs font-bold text-slate-900 leading-tight">{todayFormatted}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 6 KPI CARDS ROW matching reference */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Users */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Total Users</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#15803D] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {kpis.totalUsers}
            </h3>
            <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5 mt-1">
              <ArrowUpRight className="w-3 h-3" />
              <span>+{kpis.usersThisMonth} this month</span>
            </p>
          </div>
        </div>

        {/* Total Scans */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Total Scans</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#15803D] flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {kpis.totalScans}
            </h3>
            <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5 mt-1">
              <ArrowUpRight className="w-3 h-3" />
              <span>+{kpis.scansThisMonth} this month</span>
            </p>
          </div>
        </div>

        {/* Crops in Library */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Crops in Library</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#15803D] flex items-center justify-center">
              <Sprout className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {kpis.cropsInLibrary}
            </h3>
            <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5 mt-1">
              <ArrowUpRight className="w-3 h-3" />
              <span>Active catalog</span>
            </p>
          </div>
        </div>

        {/* Diseases in Library */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Diseases in Library</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {kpis.diseasesInLibrary}
            </h3>
            <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5 mt-1">
              <ArrowUpRight className="w-3 h-3" />
              <span>Documented</span>
            </p>
          </div>
        </div>

        {/* Community Posts */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Community Posts</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {kpis.communityPosts}
            </h3>
            <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5 mt-1">
              <ArrowUpRight className="w-3 h-3" />
              <span>+{kpis.postsThisMonth} this month</span>
            </p>
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Active Users</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#15803D] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {kpis.activeUsers}
            </h3>
            <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block mr-1" />
              <span>Live activity</span>
            </p>
          </div>
        </div>
      </div>

      {/* 3. CHARTS ROW: User Growth, Scan Overview, Top Crops Scanned */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* User Growth Chart (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">User Growth</h3>
            <select
              value={growthPeriod}
              onChange={(e) => setGrowthPeriod(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 font-semibold text-slate-600 focus:outline-none cursor-pointer"
            >
              <option value="Last 9 Months">Last 9 Months</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Last 6 Months">Last 6 Months</option>
              <option value="Last 12 Months">Last 12 Months</option>
            </select>
          </div>

          {/* SVG Line Chart */}
          <div className="relative pt-2">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-36 overflow-visible">
              <defs>
                <linearGradient id="userGrowthGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="20" x2={chartWidth} y2="20" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="0" y1="60" x2={chartWidth} y2="60" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="0" y1="100" x2={chartWidth} y2="100" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />

              {/* Area fill */}
              {growthPoints.length > 1 && (
                <polygon
                  points={`0,${chartHeight} ${getSvgCoordinates()} ${chartWidth},${chartHeight}`}
                  fill="url(#userGrowthGrad)"
                />
              )}

              {/* Spline Path */}
              {growthPoints.length > 1 && (
                <polyline
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={getSvgCoordinates()}
                />
              )}

              {/* Data points */}
              {growthPoints.map((p, idx) => {
                const x = (idx / (growthPoints.length - 1)) * chartWidth;
                const y = chartHeight - (p.users / maxGrowthUsers) * (chartHeight - 20) - 10;
                return (
                  <circle
                    key={idx}
                    cx={x}
                    cy={y}
                    r="3.5"
                    fill="#10B981"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    className="hover:r-5 transition-all cursor-pointer"
                  >
                    <title>{`${p.month}: ${p.users} users`}</title>
                  </circle>
                );
              })}
            </svg>

            {/* X-Axis Month Labels */}
            <div className="flex justify-between text-[10.5px] font-bold text-slate-400 mt-2 px-1">
              {growthPoints.map((p, idx) => (
                <span key={idx}>{p.month}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Scan Overview Donut Chart (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-900 mb-2">Scan Overview</h3>

          <div className="flex items-center justify-between gap-4 py-2">
            {/* Circular Donut */}
            <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                {/* Background Ring */}
                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  stroke="#F1F5F9"
                  strokeWidth="14"
                  fill="transparent"
                />
                {/* Healthy Slice */}
                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  stroke="#10B981"
                  strokeWidth="14"
                  fill="transparent"
                  strokeDasharray={`${healthyStroke} ${circleCircumference - healthyStroke}`}
                  strokeDashoffset="0"
                />
                {/* Diseased Slice */}
                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  stroke="#F43F5E"
                  strokeWidth="14"
                  fill="transparent"
                  strokeDasharray={`${diseasedStroke} ${circleCircumference - diseasedStroke}`}
                  strokeDashoffset={`-${healthyStroke}`}
                />
                {/* Needs Attention Slice */}
                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  stroke="#F59E0B"
                  strokeWidth="14"
                  fill="transparent"
                  strokeDasharray={`${needsAttnStroke} ${circleCircumference - needsAttnStroke}`}
                  strokeDashoffset={`-${healthyStroke + diseasedStroke}`}
                />
              </svg>
              {/* Centered Total */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black text-slate-900 leading-none">
                  {totalScans}
                </span>
                <span className="text-[10px] font-bold text-slate-400 mt-0.5">Total Scans</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-2.5 text-xs flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-600 font-medium">Healthy</span>
                </div>
                <span className="font-bold text-slate-900">{healthyCount}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-slate-600 font-medium">Diseased</span>
                </div>
                <span className="font-bold text-slate-900">{diseasedCount}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-slate-600 font-medium">Needs Attention</span>
                </div>
                <span className="font-bold text-slate-900">{needsAttnCount}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Accuracy rating</span>
            <span className="text-emerald-700 font-bold">95.4% botanical confidence</span>
          </div>
        </div>

        {/* Top Crops Scanned (3 Cols) */}
        <div className="lg:col-span-3 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-900">Top Crops Scanned</h3>
            <button
              type="button"
              onClick={() => onRouteChange?.('/admin/crops')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
            >
              View All
            </button>
          </div>

          <div className="space-y-3 my-auto py-1">
            {data?.topCrops && data.topCrops.length > 0 ? (
              data.topCrops.map((crop, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                    <img src={crop.image} alt={crop.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-800 truncate">{crop.name}</span>
                      <span className="text-slate-400 font-bold text-[11px]">{crop.count}</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full"
                        style={{ width: crop.barWidth }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">No scan records available yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* 4. TABLES ROW: Recent Users & Recent Scans */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Users Table */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">Recent Users</h3>
            <button
              type="button"
              onClick={() => onRouteChange?.('/admin/users')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
            >
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold text-[11px] pb-2">
                  <th className="pb-2.5 font-bold">Name</th>
                  <th className="pb-2.5 font-bold">Email</th>
                  <th className="pb-2.5 font-bold">Role</th>
                  <th className="pb-2.5 font-bold">Joined On</th>
                  <th className="pb-2.5 font-bold">Status</th>
                  <th className="pb-2.5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.recentUsers && data.recentUsers.length > 0 ? (
                  data.recentUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 pr-2 flex items-center gap-2 font-bold text-slate-900">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px] shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate max-w-[110px]">{u.name}</span>
                      </td>
                      <td className="py-2.5 pr-2 text-slate-500 font-medium truncate max-w-[130px]">
                        {u.email}
                      </td>
                      <td className="py-2.5 pr-2 text-slate-600 font-medium">
                        {u.role}
                      </td>
                      <td className="py-2.5 pr-2 text-slate-400 font-medium whitespace-nowrap">
                        {u.joinedOn}
                      </td>
                      <td className="py-2.5 pr-2">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          {u.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => onRouteChange?.('/admin/users')}
                          className="p-1 text-slate-400 hover:text-slate-600"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No users registered yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Scans Table */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">Recent Scans</h3>
            <button
              type="button"
              onClick={() => onRouteChange?.('/admin/scans')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
            >
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold text-[11px] pb-2">
                  <th className="pb-2.5 font-bold">Image</th>
                  <th className="pb-2.5 font-bold">Crop</th>
                  <th className="pb-2.5 font-bold">Result</th>
                  <th className="pb-2.5 font-bold">Confidence</th>
                  <th className="pb-2.5 font-bold">User</th>
                  <th className="pb-2.5 font-bold">Date</th>
                  <th className="pb-2.5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.recentScans && data.recentScans.length > 0 ? (
                  data.recentScans.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 pr-2">
                        <div className="w-7 h-7 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                          <img src={s.image} alt={s.crop} className="w-full h-full object-cover" />
                        </div>
                      </td>
                      <td className="py-2.5 pr-2 font-bold text-slate-900">
                        {s.crop}
                      </td>
                      <td className="py-2.5 pr-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                          s.result === 'Healthy'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {s.result}
                        </span>
                      </td>
                      <td className="py-2.5 pr-2 text-slate-600 font-medium">
                        {s.confidence}
                      </td>
                      <td className="py-2.5 pr-2 text-slate-500 font-medium truncate max-w-[100px]">
                        {s.user}
                      </td>
                      <td className="py-2.5 pr-2 text-slate-400 font-medium whitespace-nowrap">
                        {s.date}
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => onRouteChange?.('/admin/scans')}
                          className="p-1 text-slate-400 hover:text-slate-600"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No scan records available yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 5. BOTTOM ROW: Pending Actions, System Status, Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Pending Actions (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900">Pending Actions</h3>
            <button
              type="button"
              onClick={() => onRouteChange?.('/admin/community')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
            >
              View All
            </button>
          </div>

          <div className="space-y-2.5 my-auto">
            {data?.pendingActions && data.pendingActions.length > 0 ? (
              data.pendingActions.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onRouteChange?.(item.route)}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-emerald-50/40 hover:border-emerald-200 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                      {item.icon === 'user-check' && <Users className="w-4 h-4 text-purple-600" />}
                      {item.icon === 'flag' && <ShieldAlert className="w-4 h-4 text-rose-600" />}
                      {item.icon === 'file-text' && <FileText className="w-4 h-4 text-blue-600" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-500">{item.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">No pending actions.</p>
            )}
          </div>
        </div>

        {/* System Status (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900">System Status</h3>
            <button
              type="button"
              onClick={() => onRouteChange?.('/admin/settings?tab=model')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
            >
              View Details
            </button>
          </div>

          <div className="space-y-3 my-auto">
            {data?.systemStatus && data.systemStatus.length > 0 ? (
              data.systemStatus.map((s, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-bold text-slate-800">{s.name}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10.5px] border border-emerald-200">
                    {s.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">System check in progress...</p>
            )}
          </div>
        </div>

        {/* Quick Actions (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Quick Actions</h3>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Add Crop */}
            <button
              type="button"
              onClick={() => setModalType('addCrop')}
              className="p-3 rounded-xl bg-emerald-50/90 hover:bg-emerald-100 text-emerald-800 transition-all text-center flex flex-col items-center justify-center gap-1.5 border border-emerald-200/80 cursor-pointer shadow-2xs"
            >
              <Sprout className="w-5 h-5 text-emerald-600" />
              <span className="text-xs font-bold">Add Crop</span>
            </button>

            {/* Add Disease */}
            <button
              type="button"
              onClick={() => setModalType('addDisease')}
              className="p-3 rounded-xl bg-rose-50/90 hover:bg-rose-100 text-rose-800 transition-all text-center flex flex-col items-center justify-center gap-1.5 border border-rose-200/80 cursor-pointer shadow-2xs"
            >
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <span className="text-xs font-bold">Add Disease</span>
            </button>

            {/* Send Notification */}
            <button
              type="button"
              onClick={() => setModalType('sendNotif')}
              className="p-3 rounded-xl bg-sky-50/90 hover:bg-sky-100 text-sky-800 transition-all text-center flex flex-col items-center justify-center gap-1.5 border border-sky-200/80 cursor-pointer shadow-2xs"
            >
              <Bell className="w-5 h-5 text-sky-600" />
              <span className="text-xs font-bold">Send Notification</span>
            </button>

            {/* Manage Users */}
            <button
              type="button"
              onClick={() => onRouteChange?.('/admin/users')}
              className="p-3 rounded-xl bg-indigo-50/90 hover:bg-indigo-100 text-indigo-800 transition-all text-center flex flex-col items-center justify-center gap-1.5 border border-indigo-200/80 cursor-pointer shadow-2xs"
            >
              <Users className="w-5 h-5 text-indigo-600" />
              <span className="text-xs font-bold">Manage Users</span>
            </button>

            {/* Create Article */}
            <button
              type="button"
              onClick={() => setModalType('createArticle')}
              className="p-3 rounded-xl bg-amber-50/90 hover:bg-amber-100 text-amber-800 transition-all text-center flex flex-col items-center justify-center gap-1.5 border border-amber-200/80 cursor-pointer shadow-2xs"
            >
              <FileText className="w-5 h-5 text-amber-600" />
              <span className="text-xs font-bold">Create Article</span>
            </button>

            {/* View Reports */}
            <button
              type="button"
              onClick={() => onRouteChange?.('/admin/reports')}
              className="p-3 rounded-xl bg-emerald-50/90 hover:bg-emerald-100 text-emerald-800 transition-all text-center flex flex-col items-center justify-center gap-1.5 border border-emerald-200/80 cursor-pointer shadow-2xs"
            >
              <BarChart2 className="w-5 h-5 text-emerald-700" />
              <span className="text-xs font-bold">View Reports</span>
            </button>
          </div>
        </div>
      </div>

      {/* QUICK ACTION MODALS */}
      {/* 1. Add Crop Modal */}
      {modalType === 'addCrop' && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Sprout className="w-5 h-5 text-emerald-600" />
                Add New Agricultural Crop
              </h3>
              <button type="button" onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateCrop} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Crop Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tomato, Wheat, Maize"
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Scientific Botanical Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solanum lycopersicum"
                  value={cropSciName}
                  onChange={(e) => setCropSciName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600 italic"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={cropCategory}
                    onChange={(e) => setCropCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  >
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Cereals & Grains">Cereals & Grains</option>
                    <option value="Commercial Crops">Commercial Crops</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Season</label>
                  <input
                    type="text"
                    value={cropSeason}
                    onChange={(e) => setCropSeason(e.target.value)}
                    placeholder="e.g. Rabi, Kharif, Year-round"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={cropDesc}
                  onChange={(e) => setCropDesc(e.target.value)}
                  placeholder="Overview of cultivation characteristics and pathology profile..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5">
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Save Crop</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Add Disease Modal */}
      {modalType === 'addDisease' && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                Add Pathology Disease Record
              </h3>
              <button type="button" onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateDisease} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Disease Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Early Blight, Yellow Leaf Curl Virus"
                  value={diseaseName}
                  onChange={(e) => setDiseaseName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Affected Crop</label>
                  <input
                    type="text"
                    required
                    value={diseaseCrop}
                    onChange={(e) => setDiseaseCrop(e.target.value)}
                    placeholder="e.g. Tomato, Potato"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pathogen Type</label>
                  <select
                    value={diseaseType}
                    onChange={(e) => setDiseaseType(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Fungal">Fungal</option>
                    <option value="Bacterial">Bacterial</option>
                    <option value="Viral">Viral</option>
                    <option value="Pest Infestation">Pest Infestation</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pathogen Scientific Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Alternaria solani"
                    value={diseaseSciName}
                    onChange={(e) => setDiseaseSciName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl italic"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Severity</label>
                  <select
                    value={diseaseSeverity}
                    onChange={(e) => setDiseaseSeverity(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Mild">Mild</option>
                    <option value="Moderate">Moderate</option>
                    <option value="High">High</option>
                    <option value="Severe">Severe</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Symptoms Overview</label>
                <textarea
                  rows={2}
                  value={diseaseDesc}
                  onChange={(e) => setDiseaseDesc(e.target.value)}
                  placeholder="Visible symptoms on leaves or stems..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5">
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Save Disease</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Send Notification Modal */}
      {modalType === 'sendNotif' && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-sky-600" />
                Broadcast System Notification
              </h3>
              <button type="button" onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSendNotif} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Audience</label>
                <select
                  value={notifRole}
                  onChange={(e) => setNotifRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  <option value="all">All Registered Users</option>
                  <option value="farmer">Farmers Only</option>
                  <option value="student">Students & Researchers</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Alert Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Seasonal Crop Disease Advisory"
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notification Message</label>
                <textarea
                  rows={3}
                  required
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  placeholder="Provide urgent advisories, weather warnings or feature announcements..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5">
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bell className="w-3.5 h-3.5" />}
                  <span>Broadcast</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Create Article Modal */}
      {modalType === 'createArticle' && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" />
                Publish Agronomy Article
              </h3>
              <button type="button" onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateArticle} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Article Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Biological Control of Tomato Blight in High Rainfall"
                  value={artTitle}
                  onChange={(e) => setArtTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={artCategory}
                  onChange={(e) => setArtCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="Crop Protection">Crop Protection</option>
                  <option value="Disease Management">Disease Management</option>
                  <option value="Organic Farming">Organic Farming</option>
                  <option value="Yield Optimization">Yield Optimization</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Content Body</label>
                <textarea
                  rows={4}
                  required
                  value={artContent}
                  onChange={(e) => setArtContent(e.target.value)}
                  placeholder="Enter publication text, research guidance, and verified farming recommendations..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5">
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Publish</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
