import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Sprout,
  ShieldAlert,
  Camera,
  MessageSquare,
  TrendingUp,
  FolderKanban,
  Bell,
  Globe,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Cpu,
  Key,
  Database,
  FileText,
  HelpCircle,
  Star,
  Image as ImageIcon
} from 'lucide-react';
import { clearAdminAuth } from '../../services/adminService';

interface AdminSidebarProps {
  activeItem?: string;
  onRouteChange?: (route: string) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeItem = 'dashboard',
  onRouteChange,
}) => {
  const [contentOpen, setContentOpen] = useState(
    activeItem.startsWith('content') || activeItem === 'crop-lib' || activeItem === 'disease-lib' || activeItem === 'articles'
  );
  const [websiteOpen, setWebsiteOpen] = useState(
    activeItem.startsWith('website') || activeItem === 'banners' || activeItem === 'testimonials' || activeItem === 'faq'
  );
  const [settingsOpen, setSettingsOpen] = useState(
    activeItem.startsWith('settings') || activeItem === 'settings-model' || activeItem === 'settings-api' || activeItem === 'settings-logs'
  );

  const handleNav = (route: string) => {
    if (onRouteChange) {
      onRouteChange(route);
    } else {
      window.location.href = route;
    }
  };

  const handleLogout = () => {
    clearAdminAuth();
    if (onRouteChange) {
      onRouteChange('/admin/login');
    } else {
      window.location.href = '/admin/login';
    }
  };

  const getItemClass = (id: string) => {
    const isActive = activeItem === id;
    return `w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none ${
      isActive
        ? 'bg-[#DCFCE7] text-[#15803D] font-bold shadow-2xs'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;
  };

  const getSubItemClass = (id: string) => {
    const isActive = activeItem === id;
    return `w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11.5px] font-medium transition-colors cursor-pointer select-none pl-8 ${
      isActive
        ? 'bg-emerald-50 text-[#15803D] font-bold'
        : 'text-slate-500 hover:bg-slate-100/80 hover:text-slate-800'
    }`;
  };

  return (
    <aside className="w-60 xl:w-64 bg-white border-r border-slate-200/90 flex flex-col h-full min-h-screen select-none shrink-0">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center gap-2.5 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
          <Sprout className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-extrabold text-slate-900 tracking-tight">AgriVision AI</span>
          </div>
          <p className="text-[10.5px] font-bold text-emerald-600 tracking-wide uppercase">Admin Panel</p>
        </div>
      </div>

      {/* Navigation Links Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1 no-scrollbar">
        {/* Dashboard */}
        <button
          type="button"
          onClick={() => handleNav('/admin')}
          className={getItemClass('dashboard')}
        >
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          <span>Dashboard</span>
        </button>

        {/* Users */}
        <button
          type="button"
          onClick={() => handleNav('/admin/users')}
          className={getItemClass('users')}
        >
          <Users className="w-4 h-4 shrink-0" />
          <span>Users</span>
        </button>

        {/* Crops */}
        <button
          type="button"
          onClick={() => handleNav('/admin/crops')}
          className={getItemClass('crops')}
        >
          <Sprout className="w-4 h-4 shrink-0" />
          <span>Crops</span>
        </button>

        {/* Diseases */}
        <button
          type="button"
          onClick={() => handleNav('/admin/diseases')}
          className={getItemClass('diseases')}
        >
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>Diseases</span>
        </button>

        {/* Scans */}
        <button
          type="button"
          onClick={() => handleNav('/admin/scans')}
          className={getItemClass('scans')}
        >
          <Camera className="w-4 h-4 shrink-0" />
          <span>Scans</span>
        </button>

        {/* Community Posts */}
        <button
          type="button"
          onClick={() => handleNav('/admin/community')}
          className={getItemClass('community')}
        >
          <MessageSquare className="w-4 h-4 shrink-0" />
          <span>Community Posts</span>
        </button>

        {/* Reports & Analytics */}
        <button
          type="button"
          onClick={() => handleNav('/admin/reports')}
          className={getItemClass('reports')}
        >
          <TrendingUp className="w-4 h-4 shrink-0" />
          <span>Reports & Analytics</span>
        </button>

        {/* Content Management (Accordion) */}
        <div>
          <button
            type="button"
            onClick={() => setContentOpen(!contentOpen)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <FolderKanban className="w-4 h-4 shrink-0" />
              <span>Content Management</span>
            </div>
            {contentOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
          {contentOpen && (
            <div className="mt-0.5 space-y-0.5">
              <button
                type="button"
                onClick={() => handleNav('/admin/content?tab=crops')}
                className={getSubItemClass('content-crops')}
              >
                <Sprout className="w-3 h-3 text-slate-400" />
                <span>Crop Library</span>
              </button>
              <button
                type="button"
                onClick={() => handleNav('/admin/content?tab=diseases')}
                className={getSubItemClass('content-diseases')}
              >
                <ShieldAlert className="w-3 h-3 text-slate-400" />
                <span>Disease Library</span>
              </button>
              <button
                type="button"
                onClick={() => handleNav('/admin/content?tab=articles')}
                className={getSubItemClass('content-articles')}
              >
                <FileText className="w-3 h-3 text-slate-400" />
                <span>Articles & Resources</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications */}
        <button
          type="button"
          onClick={() => handleNav('/admin/notifications')}
          className={getItemClass('notifications')}
        >
          <Bell className="w-4 h-4 shrink-0" />
          <span>Notifications</span>
        </button>

        {/* Website Management (Accordion) */}
        <div>
          <button
            type="button"
            onClick={() => setWebsiteOpen(!websiteOpen)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 shrink-0" />
              <span>Website Management</span>
            </div>
            {websiteOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
          {websiteOpen && (
            <div className="mt-0.5 space-y-0.5">
              <button
                type="button"
                onClick={() => handleNav('/admin/website?tab=banners')}
                className={getSubItemClass('website-banners')}
              >
                <ImageIcon className="w-3 h-3 text-slate-400" />
                <span>Banners</span>
              </button>
              <button
                type="button"
                onClick={() => handleNav('/admin/website?tab=testimonials')}
                className={getSubItemClass('website-testimonials')}
              >
                <Star className="w-3 h-3 text-slate-400" />
                <span>Testimonials</span>
              </button>
              <button
                type="button"
                onClick={() => handleNav('/admin/website?tab=faq')}
                className={getSubItemClass('website-faq')}
              >
                <HelpCircle className="w-3 h-3 text-slate-400" />
                <span>FAQ</span>
              </button>
            </div>
          )}
        </div>

        {/* Settings (Accordion) */}
        <div>
          <button
            type="button"
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Settings className="w-4 h-4 shrink-0" />
              <span>Settings</span>
            </div>
            {settingsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
          {settingsOpen && (
            <div className="mt-0.5 space-y-0.5">
              <button
                type="button"
                onClick={() => handleNav('/admin/settings?tab=general')}
                className={getSubItemClass('settings-general')}
              >
                <Settings className="w-3 h-3 text-slate-400" />
                <span>General Settings</span>
              </button>
              <button
                type="button"
                onClick={() => handleNav('/admin/settings?tab=model')}
                className={getSubItemClass('settings-model')}
              >
                <Cpu className="w-3 h-3 text-slate-400" />
                <span>AI & Model Settings</span>
              </button>
              <button
                type="button"
                onClick={() => handleNav('/admin/settings?tab=apikeys')}
                className={getSubItemClass('settings-apikeys')}
              >
                <Key className="w-3 h-3 text-slate-400" />
                <span>API Keys</span>
              </button>
              <button
                type="button"
                onClick={() => handleNav('/admin/settings?tab=logs')}
                className={getSubItemClass('settings-logs')}
              >
                <Database className="w-3 h-3 text-slate-400" />
                <span>Backup & Logs</span>
              </button>
            </div>
          )}
        </div>

        {/* Logout button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Bottom Promo Card matching reference */}
      <div className="p-3.5 pt-0">
        <div className="relative rounded-2xl overflow-hidden shadow-xs border border-slate-200">
          <img
            src="/auth_assets/auth_hero_desktop.jpg"
            alt="Farming"
            className="w-full h-24 object-cover brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 flex flex-col justify-end">
            <p className="text-[11px] font-bold text-white leading-tight">
              Healthy Farming<br />Brighter Tomorrow.
            </p>
            <button
              type="button"
              onClick={() => handleNav('/admin/reports')}
              className="mt-2 w-6 h-6 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center self-start transition-transform hover:scale-105"
            >
              <ArrowRight className="w-3 h-3 text-slate-800" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
