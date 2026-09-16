import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from '../components/Navbar';
import { DashboardSidebar } from '../components/dashboard/DashboardSidebar';
import { DashboardHero } from '../components/dashboard/DashboardHero';
import { DashboardWeatherCard } from '../components/dashboard/DashboardWeatherCard';
import { DashboardStatsRow } from '../components/dashboard/DashboardStatsRow';
import { DashboardQuickActions } from '../components/dashboard/DashboardQuickActions';
import { DashboardRecentScans } from '../components/dashboard/DashboardRecentScans';
import { DashboardCropHealthChart } from '../components/dashboard/DashboardCropHealthChart';
import { DashboardMyCrops } from '../components/dashboard/DashboardMyCrops';
import { DashboardProfileCard } from '../components/dashboard/DashboardProfileCard';
import { DashboardRecommendations } from '../components/dashboard/DashboardRecommendations';
import { DashboardCommunitySnippet } from '../components/dashboard/DashboardCommunitySnippet';
import { ProfileModal } from '../components/auth/ProfileModal';
import { DetectionResultModal } from '../components/detect/DetectionResultModal';
import { getStoredAuthUser } from '../services/authService';
import type { AuthUser } from '../services/authService';
import { fetchDashboardData, markNotificationsRead } from '../services/dashboardService';
import type { DashboardData, RecentScanItem } from '../services/dashboardService';
import { navigateTo } from '../utils/navigation';
import type { DiseaseDetectionResult } from '../services/diseaseDetectionService';

interface DashboardPageProps {
  onRouteChange?: (route: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onRouteChange }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getStoredAuthUser());
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Modals & UI state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedScanResult, setSelectedScanResult] = useState<DiseaseDetectionResult | null>(null);
  const [selectedScanImage, setSelectedScanImage] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeSidebarItem, setActiveSidebarItem] = useState('dashboard');

  const scansRef = useRef<HTMLDivElement>(null);

  const nav = (route: string) => {
    navigateTo(route, onRouteChange);
  };

  // Protect route: Redirect unauthenticated visitors to /login
  useEffect(() => {
    const user = getStoredAuthUser();
    if (!user) {
      nav('/login');
    } else {
      setCurrentUser(user);
    }
  }, []);

  // Fetch real aggregated dashboard data
  useEffect(() => {
    if (!currentUser) return;
    let isMounted = true;

    async function loadData() {
      setIsLoadingData(true);
      const data = await fetchDashboardData(currentUser!.id);
      if (isMounted) {
        if (data) {
          setDashboardData(data);
          // Sync current user state if updated in backend
          if (data.user) {
            setCurrentUser((prev) => {
              if (!prev) return null;
              return {
                ...prev,
                name: data.user.name,
                email: data.user.email,
                role: (data.user.role as 'farmer' | 'student' | 'expert') || 'farmer',
                location: data.user.location,
                bio: data.user.bio,
                avatar: data.user.avatar_url || prev.avatar,
              };
            });
          }
        }
        setIsLoadingData(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [currentUser?.id, refreshKey]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  const handleProfileUpdated = (updated: AuthUser) => {
    setCurrentUser(updated);
    showToast('Profile updated successfully!');
    handleRefresh();
  };

  const handleViewScan = (scan: RecentScanItem) => {
    // Adapt scan item to DiseaseDetectionResult modal format
    const modalResult: DiseaseDetectionResult = {
      scanId: scan.id,
      isMock: false,
      crop: scan.crop,
      disease: scan.disease,
      scientificName: scan.scientificName || 'Botanical Pathology',
      confidence: scan.confidence,
      severity: (scan.severity as any) || (scan.disease.toLowerCase().includes('healthy') ? 'Healthy' : 'Moderate'),
      symptoms: scan.symptoms && scan.symptoms.length > 0 ? scan.symptoms : [
        'Characteristic foliar discoloration and lesion formation on leaf tissue.',
        'Visible chlorosis around margin borders.',
        'Stunted photosynthetic area.'
      ],
      causes: [
        'High atmospheric humidity combined with surface moisture.',
        'Airborne fungal spores or seed-borne pathogen reservoir.',
        'Overcrowded canopy limiting cross-ventilation.'
      ],
      treatments: (scan.treatments && Array.isArray(scan.treatments.organic)) ? scan.treatments : {
        organic: [
          'Apply cold-pressed Neem oil spray (3-5ml per litre) in early morning.',
          'Dust biological Trichoderma harzianum or Bacillus subtilis bio-fungicide.'
        ],
        chemical: [
          'Spray protective copper oxychloride (2.5g/L) or Mancozeb 75% WP.',
          'Systemic intervention: Azoxystrobin + Difenoconazole if lesion area exceeds 15%.'
        ],
        preventive: [
          'Increase inter-plant spacing for enhanced aeration.',
          'Switch to drip irrigation to keep foliar canopy completely dry.',
          'Remove and burn severely infected leaves to halt secondary spread.'
        ]
      },
      analyzedAt: scan.formattedDate || new Date(scan.createdAt).toLocaleString(),
      imageUrl: scan.imageUrl || '/crops/tomato.png',
    };

    setSelectedScanResult(modalResult);
    setSelectedScanImage(scan.imageUrl || '/crops/tomato.png');
  };

  const handleSidebarSelect = async (item: string) => {
    setActiveSidebarItem(item);
    if (item === 'dashboard') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (item === 'profile') {
      setIsProfileModalOpen(true);
    } else if (item === 'crops') {
      const el = document.getElementById('dashboard-my-crops');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (item === 'scans') {
      if (scansRef.current) scansRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if (item === 'saved') {
      showToast('Saved items: Your bookmarks are synced with crop library.');
    } else if (item === 'community') {
      nav('/community');
    } else if (item === 'notifications') {
      if (currentUser) {
        await markNotificationsRead(currentUser.id);
        showToast('All notifications marked as read.');
        handleRefresh();
      }
    } else if (item === 'settings') {
      setIsProfileModalOpen(true);
    }
  };

  if (!currentUser) {
    return null; // Will redirect in useEffect
  }

  // Fallback / default data structure if loading or fresh database
  const stats = dashboardData?.stats || {
    totalScans: 0,
    diseasesDetected: 0,
    healthyScans: 0,
    lastScanDate: null,
    lastScanTime: null,
    totalCrops: 0,
  };

  const cropHealthOverview = dashboardData?.cropHealthOverview || {
    totalScans: 0,
    healthyPercent: 0,
    diseasedPercent: 0,
    needsAttentionPercent: 0,
    cropsNeedingAttention: 0,
  };

  const myCrops = dashboardData?.myCrops || [];
  const recentScans = dashboardData?.recentScans || [];
  const recommendations = dashboardData?.aiRecommendations || [];
  const communitySnippet = dashboardData?.latestCommunityPost || null;
  const unreadNotificationsCount = dashboardData?.unreadNotificationsCount || 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col antialiased text-slate-800">
      {/* Top Navbar */}
      <Navbar activeRoute="/dashboard" onRouteChange={onRouteChange} />

      {/* Loading Progress Bar */}
      {isLoadingData && (
        <div className="w-full h-0.5 bg-emerald-100 overflow-hidden">
          <div className="w-1/3 h-full bg-[#15803D] animate-pulse" />
        </div>
      )}

      {/* Main Content with Sidebar */}
      <div className="flex flex-1 w-full max-w-[1500px] mx-auto pt-3 sm:pt-5 pb-12 px-3 sm:px-6 lg:px-8 gap-6">
        {/* Left Sticky Sidebar (matching reference image) */}
        <div className="hidden lg:block w-56 xl:w-60 shrink-0">
          <div className="sticky top-20">
            <DashboardSidebar
              activeItem={activeSidebarItem}
              unreadCount={unreadNotificationsCount}
              onSelectItem={handleSidebarSelect}
              onRouteChange={nav}
              onOpenProfileModal={() => setIsProfileModalOpen(true)}
              onOpenNotifications={() => handleSidebarSelect('notifications')}
            />
          </div>
        </div>

        {/* Dashboard Main Workspace */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Top 2-Column Row: Left Hero Banner + Right Weather Card */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
            {/* Hero (70% width on xl) */}
            <div className="xl:col-span-8 flex">
              <DashboardHero
                userName={currentUser.name}
                onDetectClick={() => nav('/detect')}
                onScanHistoryClick={() => {
                  if (scansRef.current) scansRef.current.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            </div>

            {/* Weather Card (30% width on xl) */}
            <div className="xl:col-span-4 flex">
              <DashboardWeatherCard userLocation={currentUser.location} />
            </div>
          </div>

          {/* Middle 2-Column Row: Left Stats & Quick Actions + Right Profile Card */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
            {/* Left Area: Stats Row & Quick Actions */}
            <div className="xl:col-span-8 flex flex-col justify-between space-y-6">
              <DashboardStatsRow stats={stats} />
              <DashboardQuickActions
                onRouteChange={nav}
                onOpenScanHistory={() => {
                  if (scansRef.current) scansRef.current.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            </div>

            {/* Right Area: Profile Card (aligned under Weather) */}
            <div className="xl:col-span-4 flex">
              <DashboardProfileCard
                user={currentUser}
                totalScans={stats.totalScans}
                totalCrops={myCrops.length}
                onEditProfile={() => setIsProfileModalOpen(true)}
              />
            </div>
          </div>

          {/* Lower 3-Block Grid Area */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* Left Column: Recent Scans */}
            <div ref={scansRef} className="xl:col-span-5 flex flex-col h-full">
              <DashboardRecentScans
                scans={recentScans}
                onViewScan={handleViewScan}
                onViewAll={() => nav('/detect')}
                onNewScan={() => nav('/detect')}
              />
            </div>

            {/* Middle Column: Crop Health Overview Donut + My Crops */}
            <div className="xl:col-span-4 flex flex-col space-y-6">
              <DashboardCropHealthChart overview={cropHealthOverview} />
              <DashboardMyCrops
                crops={myCrops}
                userId={currentUser.id}
                onRefresh={handleRefresh}
                onViewAll={() => nav('/crops')}
                onToast={showToast}
              />
            </div>

            {/* Right Column: AI Recommendations + From the Community */}
            <div className="xl:col-span-3 flex flex-col space-y-6">
              <DashboardRecommendations
                recommendations={recommendations}
                onRouteChange={onRouteChange}
              />
              <DashboardCommunitySnippet
                snippet={communitySnippet}
                onRouteChange={onRouteChange}
                onToast={showToast}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onProfileUpdated={handleProfileUpdated}
      />

      {/* Detection Result Pathology Modal */}
      {selectedScanResult && (
        <DetectionResultModal
          result={selectedScanResult}
          imageUrl={selectedScanImage}
          onClose={() => setSelectedScanResult(null)}
          onReset={() => {
            setSelectedScanResult(null);
            nav('/detect');
          }}
        />
      )}

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-fade-in border border-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
