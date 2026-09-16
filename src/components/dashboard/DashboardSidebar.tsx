import React from 'react';
import {
  LayoutDashboard,
  User,
  Sprout,
  Clock,
  Bookmark,
  Users,
  Bell,
  Settings,
  ArrowRight,
  Leaf
} from 'lucide-react';

interface DashboardSidebarProps {
  activeItem?: string;
  unreadCount?: number;
  onSelectItem?: (item: string) => void;
  onRouteChange?: (route: string) => void;
  onOpenProfileModal?: () => void;
  onOpenNotifications?: () => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeItem = 'dashboard',
  unreadCount = 0,
  onSelectItem,
  onRouteChange,
  onOpenProfileModal: _onOpenProfileModal,
  onOpenNotifications: _onOpenNotifications,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, route: '/dashboard' },
    { id: 'profile', label: 'My Profile', icon: User, route: '/profile' },
    { id: 'crops', label: 'My Crops', icon: Sprout, route: '/my-crops' },
    { id: 'scans', label: 'Scan History', icon: Clock, route: '/history' },
    { id: 'saved', label: 'Saved', icon: Bookmark, route: '/saved' },
    { id: 'community', label: 'Community', icon: Users, route: '/community' },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount, route: '/notifications' },
    { id: 'settings', label: 'Settings', icon: Settings, route: '/settings' },
  ];

  const handleItemClick = (item: typeof navItems[0]) => {
    onSelectItem?.(item.id);
    if (onRouteChange) {
      onRouteChange(item.route);
    } else if (typeof window !== 'undefined') {
      window.history.pushState({}, '', item.route);
      window.dispatchEvent(new PopStateEvent('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <aside className="w-full lg:w-[210px] shrink-0 flex flex-col justify-between py-1 select-none">
      <div className="space-y-6">
        {/* Navigation Items */}
        <nav className="space-y-1" aria-label="Dashboard Sidebar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            const hasBadge = Boolean(item.badge && item.badge > 0);

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(item)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#DCFCE7] text-[#15803D] shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-[#15803D] stroke-[2.2]' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {hasBadge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white min-w-4 text-center leading-none">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Promo Seedling Card matching reference exactly */}
        <div className="relative rounded-2xl overflow-hidden shadow-2xs border border-slate-200/80 bg-slate-900 text-white p-4 h-36 flex flex-col justify-between group">
          <img
            src="/about_assets/story_plant_2x.jpg"
            alt="Farming Future"
            className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

          <div className="relative z-10">
            <p className="text-xs font-bold leading-snug">
              Better Farming
              <br />
              Brighter Tomorrow.
            </p>
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <span className="text-[10px] text-slate-300">Soil. Crops. Life.</span>
            <button
              type="button"
              onClick={() => {
                if (onRouteChange) onRouteChange('/about');
              }}
              className="w-6 h-6 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-sm hover:bg-emerald-50 hover:text-[#15803D] transition-colors cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Brand & Version Footer */}
      <div className="pt-4 pb-2 border-t border-slate-200/70 flex items-center justify-between text-slate-400">
        <div className="flex items-center gap-1.5">
          <Leaf className="w-4 h-4 text-[#15803D]" />
          <span className="text-xs font-bold text-slate-700">AgriVision AI</span>
        </div>
        <span className="text-[10px] font-medium text-slate-400">v1.0.0</span>
      </div>
    </aside>
  );
};
