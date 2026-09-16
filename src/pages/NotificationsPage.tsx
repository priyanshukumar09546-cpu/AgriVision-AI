import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { DashboardSidebar } from '../components/dashboard/DashboardSidebar';
import {
  Bell,
  CheckCheck,
  Trash2,
  Camera,
  Sprout,
  MessageSquare,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { getStoredAuthUser } from '../services/authService';
import type { AuthUser } from '../services/authService';
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  deleteNotification,
} from '../services/accountService';
import type { UserNotification } from '../services/accountService';
import { navigateTo } from '../utils/navigation';

interface NotificationsPageProps {
  onRouteChange?: (route: string) => void;
}

type NotificationCategory = 'all' | 'system' | 'scans' | 'crops' | 'community';

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onRouteChange }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getStoredAuthUser());
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<NotificationCategory>('all');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const nav = (route: string) => navigateTo(route, onRouteChange);

  useEffect(() => {
    const user = getStoredAuthUser();
    if (!user) {
      nav('/login');
    } else {
      setCurrentUser(user);
    }
  }, []);

  const loadNotifications = async (cat: NotificationCategory = activeCategory) => {
    if (!currentUser) return;
    setIsLoading(true);
    const res = await fetchNotifications(currentUser.id, cat === 'all' ? undefined : cat);
    setNotifications(res.notifications);
    setIsLoading(false);
  };

  useEffect(() => {
    if (currentUser) {
      loadNotifications(activeCategory);
    }
  }, [currentUser, activeCategory]);

  const handleMarkAllRead = async () => {
    if (!currentUser) return;
    const ok = await markAllNotificationsRead(currentUser.id);
    if (ok) {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setStatusMsg('All marked as read');
      setTimeout(() => setStatusMsg(null), 3000);
    }
  };

  const handleMarkRead = async (id: string) => {
    const ok = await markNotificationRead(id);
    if (ok) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await deleteNotification(id);
    if (ok) {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
  };

  const getIcon = (category?: string) => {
    if (category === 'scans') {
      return <Camera className="w-4 h-4 text-emerald-600" />;
    }
    if (category === 'crops') {
      return <Sprout className="w-4 h-4 text-emerald-600" />;
    }
    if (category === 'community') {
      return <MessageSquare className="w-4 h-4 text-blue-600" />;
    }
    return <Bell className="w-4 h-4 text-slate-600" />;
  };

  const getIconBg = (category?: string) => {
    if (category === 'scans') return 'bg-emerald-50 border-emerald-200';
    if (category === 'crops') return 'bg-green-50 border-green-200';
    if (category === 'community') return 'bg-blue-50 border-blue-200';
    return 'bg-slate-100 border-slate-200';
  };

  if (!currentUser) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col antialiased text-slate-800">
      <Navbar activeRoute="/notifications" onRouteChange={onRouteChange} />

      <div className="flex flex-1 w-full max-w-[1500px] mx-auto pt-3 sm:pt-5 pb-12 px-3 sm:px-6 lg:px-8 gap-6">
        {/* Left Sidebar */}
        <div className="hidden lg:block w-56 xl:w-60 shrink-0">
          <div className="sticky top-20">
            <DashboardSidebar activeItem="notifications" onRouteChange={nav} />
          </div>
        </div>

        {/* Main Content Workspace */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Header Banner */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2.5">
                  <Bell className="w-6 h-6 text-[#15803D]" />
                  Notifications
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[#15803D] text-xs font-bold">
                      {unreadCount} unread
                    </span>
                  )}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                  Stay updated on your crop health, scan results, and community activity
                </p>
              </div>

              <div className="flex items-center gap-3">
                {statusMsg && (
                  <span className="text-xs font-semibold text-emerald-600 animate-in fade-in">
                    {statusMsg}
                  </span>
                )}
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCheck className="w-3.5 h-3.5 text-[#15803D]" />
                    <span>Mark All as Read</span>
                  </button>
                )}
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto mt-6 border-b border-slate-100 pb-3 no-scrollbar">
              {[
                { key: 'all', label: 'All' },
                { key: 'system', label: 'System' },
                { key: 'scans', label: 'Scans' },
                { key: 'crops', label: 'Crops' },
                { key: 'community', label: 'Community' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveCategory(tab.key as NotificationCategory)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                    activeCategory === tab.key
                      ? 'bg-[#15803D] text-white shadow-xs'
                      : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* List or Empty State */}
          {isLoading ? (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-16 flex flex-col items-center justify-center text-center shadow-2xs">
              <Loader2 className="w-8 h-8 text-[#15803D] animate-spin mb-3" />
              <p className="text-sm font-semibold text-slate-600">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-12 sm:p-16 flex flex-col items-center justify-center text-center shadow-2xs">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-[#15803D]" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1">
                No notifications
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md leading-relaxed">
                You're all caught up! Important crop diagnosis results, community responses, and weather alerts will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    if (!n.isRead) handleMarkRead(n.id);
                  }}
                  className={`bg-white border rounded-2xl p-4 sm:p-4.5 transition-all cursor-pointer flex items-start justify-between gap-3.5 ${
                    n.isRead
                      ? 'border-slate-200/80 hover:border-slate-300'
                      : 'border-emerald-200/90 bg-emerald-50/20 shadow-2xs hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${getIconBg(n.category)}`}>
                      {getIcon(n.category)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className={`text-xs sm:text-sm font-bold ${n.isRead ? 'text-slate-800' : 'text-[#0F172A]'}`}>
                          {n.title}
                        </h4>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" title="Unread" />
                        )}
                        {n.category && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-bold capitalize">
                            {n.category}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
                        {n.message}
                      </p>
                      <span className="inline-block text-[11px] text-slate-400 mt-2 font-medium">
                        {n.createdAt ? new Date(n.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Recently'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-center">
                    {!n.isRead && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkRead(n.id);
                        }}
                        title="Mark as read"
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(n.id);
                      }}
                      title="Delete notification"
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
