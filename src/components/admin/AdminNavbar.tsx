import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  X,
  Sprout,
  ShieldAlert,
  Camera,
  MessageSquare,
  FileText,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  getStoredAdminUser,
  clearAdminAuth,
  adminGlobalSearch
} from '../../services/adminService';
import type {
  AdminSearchResult,
  AdminUser
} from '../../services/adminService';

interface AdminNavbarProps {
  onToggleSidebar?: () => void;
  onRouteChange?: (route: string) => void;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({
  onToggleSidebar,
  onRouteChange,
}) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => getStoredAdminUser());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AdminSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAdminUser(getStoredAdminUser());
  }, []);

  // Global search debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      const results = await adminGlobalSearch(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
      setIsSearchOpen(true);
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside search
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNav = (route: string) => {
    setIsSearchOpen(false);
    setIsProfileOpen(false);
    setIsNotifOpen(false);
    if (onRouteChange) {
      onRouteChange(route);
    } else {
      window.location.href = route;
    }
  };

  const handleLogout = () => {
    clearAdminAuth();
    handleNav('/admin/login');
  };

  const getResultIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'user':
        return <User className="w-3.5 h-3.5 text-blue-600" />;
      case 'crop':
        return <Sprout className="w-3.5 h-3.5 text-emerald-600" />;
      case 'disease':
        return <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />;
      case 'scan':
        return <Camera className="w-3.5 h-3.5 text-emerald-700" />;
      case 'community post':
        return <MessageSquare className="w-3.5 h-3.5 text-purple-600" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Left: Mobile Toggle & Global Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Admin Search Bar */}
        <div ref={searchContainerRef} className="relative flex-1">
          <div className="flex items-center gap-2 bg-slate-100/90 hover:bg-slate-100 border border-slate-200/80 rounded-xl px-3.5 py-2 w-full transition-all focus-within:bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search users, crops, diseases, posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchQuery.trim()) setIsSearchOpen(true);
              }}
              className="w-full bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setIsSearchOpen(false);
                }}
                className="text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {isSearchOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in">
              <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
                <span>Search Results</span>
                {isSearching && <span className="text-emerald-600 animate-pulse">Searching...</span>}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {searchResults.length > 0 ? (
                  searchResults.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleNav(item.route)}
                      className="p-3 hover:bg-emerald-50/50 cursor-pointer transition-colors flex items-start gap-2.5"
                    >
                      <div className="mt-0.5 p-1 rounded-md bg-slate-100 shrink-0">
                        {getResultIcon(item.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {item.title}
                          </p>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            {item.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-slate-500 font-medium">
                    {searchQuery.trim() ? 'No matching records found in database.' : 'Type to search...'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Notifications & Admin Profile Section */}
      <div className="flex items-center gap-3.5">
        {/* Notification Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            title="System Alerts & Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
          </button>

          {/* Notifications Popover */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-3.5 z-50 animate-in fade-in">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">Admin Alerts</p>
                <button
                  type="button"
                  onClick={() => setIsNotifOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="py-2.5 space-y-2">
                <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">AI Pathology Engine Online</p>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-tight">
                      Computer vision inference service connected with zero errors.
                    </p>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Database Synced</p>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-tight">
                      SQLite persistence initialized with real user scan records.
                    </p>
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleNav('/admin/notifications')}
                  className="text-xs font-bold text-[#15803D] hover:text-[#166534] transition-colors"
                >
                  View All Notifications →
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        {/* Authenticated Admin Profile Dropdown */}
        <div className="relative">
          <div
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 pl-1 cursor-pointer select-none group"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center overflow-hidden shrink-0 border border-slate-200 text-xs font-bold shadow-2xs">
              {adminUser?.avatar ? (
                <img
                  src={adminUser.avatar}
                  alt={adminUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>A</span>
              )}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-tight">
                {adminUser?.name || 'Admin'}
              </p>
              <p className="text-[10px] font-semibold text-slate-400 leading-tight">
                System Administrator
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-colors" />
          </div>

          {/* Profile Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in">
              <div className="px-3.5 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  {adminUser?.name || 'Administrator'}
                </p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {adminUser?.email || 'admin@agrivision.ai'}
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 text-[#15803D] text-[10px] font-bold rounded-full">
                  Super Admin
                </span>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => handleNav('/admin/settings?tab=general')}
                  className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>System Settings</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNav('/admin/reports')}
                  className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Audit Logs</span>
                </button>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
