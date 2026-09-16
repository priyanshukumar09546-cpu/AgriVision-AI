import React, { useState, useEffect } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminNavbar } from './AdminNavbar';
import { isAdminAuthenticated } from '../../services/adminService';

interface AdminLayoutProps {
  activeItem?: string;
  onRouteChange?: (route: string) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  activeItem = 'dashboard',
  onRouteChange,
  children,
}) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const ok = isAdminAuthenticated();
    if (!ok) {
      if (onRouteChange) {
        onRouteChange('/admin/login');
      } else {
        window.location.href = '/admin/login';
      }
    } else {
      setIsAuthorized(true);
    }
  }, [onRouteChange]);

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-800 antialiased">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0">
        <div className="sticky top-0 h-screen">
          <AdminSidebar activeItem={activeItem} onRouteChange={onRouteChange} />
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-50 w-64 bg-white h-full shadow-2xl animate-in slide-in-from-left">
            <AdminSidebar
              activeItem={activeItem}
              onRouteChange={(route) => {
                setMobileSidebarOpen(false);
                onRouteChange?.(route);
              }}
            />
          </div>
        </div>
      )}

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminNavbar
          onToggleSidebar={() => setMobileSidebarOpen(true)}
          onRouteChange={onRouteChange}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-7 max-w-[1700px] w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};
