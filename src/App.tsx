import { useState, useEffect } from 'react';
import { HomePage } from './pages/HomePage';
import { DetectDiseasePage } from './pages/DetectDiseasePage';
import { CropsPage } from './pages/CropsPage';
import { DiseaseLibraryPage } from './pages/DiseaseLibraryPage';
import { AIInsightsPage } from './pages/AIInsightsPage';
import { CommunityPage } from './pages/CommunityPage';
import { UserCommunityPage } from './pages/UserCommunityPage';
import { AboutPage } from './pages/AboutPage';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { DashboardPage } from './pages/DashboardPage';
import { MyProfilePage } from './pages/MyProfilePage';
import { MyCropsPage } from './pages/MyCropsPage';
import { ScanHistoryPage } from './pages/ScanHistoryPage';
import { SavedItemsPage } from './pages/SavedItemsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { getStoredAuthUser } from './services/authService';

// Admin Panel Pages & Service
import { isAdminAuthenticated } from './services/adminService';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminCropsPage } from './pages/admin/AdminCropsPage';
import { AdminDiseasesPage } from './pages/admin/AdminDiseasesPage';
import { AdminScansPage } from './pages/admin/AdminScansPage';
import { AdminCommunityPage } from './pages/admin/AdminCommunityPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminContentPage } from './pages/admin/AdminContentPage';
import { AdminWebsitePage } from './pages/admin/AdminWebsitePage';
import { AdminNotificationsPage } from './pages/admin/AdminNotificationsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

export function App() {
  const [currentRoute, setCurrentRoute] = useState<string>(
    typeof window !== 'undefined' ? window.location.pathname || '/' : '/'
  );

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname || '/');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (route: string) => {
    if (typeof window !== 'undefined' && route !== currentRoute) {
      window.history.pushState({}, '', route);
      setCurrentRoute(route);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isAuth = !!getStoredAuthUser();

  // -------------------------------------------------------------
  // Admin Route Handling & Strict Role Guard
  // -------------------------------------------------------------
  if (currentRoute === '/admin/login') {
    if (isAdminAuthenticated()) {
      return <AdminDashboardPage onRouteChange={handleNavigate} />;
    }
    return <AdminLoginPage onRouteChange={handleNavigate} />;
  }

  if (currentRoute.startsWith('/admin')) {
    if (!isAdminAuthenticated()) {
      return <AdminLoginPage onRouteChange={handleNavigate} />;
    }

    if (
      currentRoute === '/admin' ||
      currentRoute === '/admin/' ||
      currentRoute === '/admin/dashboard' ||
      currentRoute === '/admin/control-center'
    ) {
      return <AdminDashboardPage onRouteChange={handleNavigate} />;
    }

    if (currentRoute === '/admin/users') {
      return <AdminUsersPage onRouteChange={handleNavigate} />;
    }

    if (currentRoute === '/admin/crops') {
      return <AdminCropsPage onRouteChange={handleNavigate} />;
    }

    if (currentRoute === '/admin/diseases') {
      return <AdminDiseasesPage onRouteChange={handleNavigate} />;
    }

    if (currentRoute === '/admin/scans') {
      return <AdminScansPage onRouteChange={handleNavigate} />;
    }

    if (currentRoute === '/admin/community') {
      return <AdminCommunityPage onRouteChange={handleNavigate} />;
    }

    if (currentRoute === '/admin/reports') {
      return <AdminReportsPage onRouteChange={handleNavigate} />;
    }

    if (currentRoute === '/admin/content' || currentRoute.startsWith('/admin/content')) {
      return <AdminContentPage onRouteChange={handleNavigate} />;
    }

    if (currentRoute === '/admin/website' || currentRoute.startsWith('/admin/website')) {
      return <AdminWebsitePage onRouteChange={handleNavigate} />;
    }

    if (currentRoute === '/admin/notifications') {
      return <AdminNotificationsPage onRouteChange={handleNavigate} />;
    }

    if (currentRoute === '/admin/settings' || currentRoute.startsWith('/admin/settings')) {
      return <AdminSettingsPage onRouteChange={handleNavigate} />;
    }

    // Default admin fallback
    return <AdminDashboardPage onRouteChange={handleNavigate} />;
  }

  // -------------------------------------------------------------
  // Authentication protection for private account routes
  // -------------------------------------------------------------
  const protectedRoutes = ['/dashboard', '/profile', '/my-crops', '/history', '/scans', '/saved', '/notifications', '/settings'];
  if (!isAuth && protectedRoutes.some(p => currentRoute === p || currentRoute.startsWith(p + '/'))) {
    return <SignInPage onRouteChange={handleNavigate} />;
  }

  // Route switcher
  if (currentRoute === '/dashboard') {
    return <DashboardPage onRouteChange={handleNavigate} />;
  }

  if (currentRoute === '/profile') {
    return <MyProfilePage onRouteChange={handleNavigate} />;
  }

  if (currentRoute === '/my-crops') {
    return <MyCropsPage onRouteChange={handleNavigate} />;
  }

  if (currentRoute === '/history' || currentRoute === '/scans') {
    return <ScanHistoryPage onRouteChange={handleNavigate} />;
  }

  if (currentRoute === '/saved') {
    return <SavedItemsPage onRouteChange={handleNavigate} />;
  }

  if (currentRoute === '/notifications') {
    return <NotificationsPage onRouteChange={handleNavigate} />;
  }

  if (currentRoute === '/settings') {
    return <SettingsPage onRouteChange={handleNavigate} />;
  }

  if (currentRoute === '/login' || currentRoute === '/signin') {
    return <SignInPage onRouteChange={handleNavigate} />;
  }

  if (currentRoute === '/signup' || currentRoute === '/register') {
    return <SignUpPage onRouteChange={handleNavigate} />;
  }

  if (currentRoute === '/reset-password' || currentRoute.startsWith('/reset-password')) {
    return <ResetPasswordPage onRouteChange={handleNavigate} />;
  }

  if (currentRoute === '/verify-email' || currentRoute.startsWith('/verify-email')) {
    return <VerifyEmailPage onRouteChange={handleNavigate} />;
  }

  if (currentRoute === '/detect') {
    return <DetectDiseasePage onRouteChange={handleNavigate} />;
  }

  if (currentRoute === '/crops' || currentRoute.startsWith('/crops/')) {
    return <CropsPage onRouteChange={handleNavigate} />;
  }

  if (
    currentRoute === '/library' ||
    currentRoute.startsWith('/library/') ||
    currentRoute === '/diseases' ||
    currentRoute.startsWith('/diseases/')
  ) {
    return <DiseaseLibraryPage onRouteChange={handleNavigate} />;
  }

  if (currentRoute === '/insights' || currentRoute.startsWith('/insights/')) {
    return <AIInsightsPage onRouteChange={handleNavigate} />;
  }

  if (currentRoute === '/community' || currentRoute.startsWith('/community/')) {
    if (isAuth) {
      return <UserCommunityPage onRouteChange={handleNavigate} />;
    }
    return <CommunityPage onRouteChange={handleNavigate} />;
  }

  if (currentRoute === '/about' || currentRoute.startsWith('/about/')) {
    return <AboutPage onRouteChange={handleNavigate} />;
  }

  return <HomePage onRouteChange={handleNavigate} />;
}

export default App;
