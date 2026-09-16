import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { DashboardSidebar } from '../components/dashboard/DashboardSidebar';
import {
  Bookmark,
  Trash2,
  Sprout,
  ShieldAlert,
  MessageSquare,
  FileText,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { getStoredAuthUser } from '../services/authService';
import type { AuthUser } from '../services/authService';
import {
  fetchSavedItems,
  deleteSavedItem
} from '../services/accountService';
import type { SavedItem } from '../services/accountService';
import { navigateTo } from '../utils/navigation';

interface SavedItemsPageProps {
  onRouteChange?: (route: string) => void;
}

type FilterType = 'all' | 'crop' | 'disease' | 'post' | 'article';

export const SavedItemsPage: React.FC<SavedItemsPageProps> = ({ onRouteChange }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getStoredAuthUser());
  const [items, setItems] = useState<SavedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [notification, setNotification] = useState<string | null>(null);

  const nav = (route: string) => navigateTo(route, onRouteChange);

  useEffect(() => {
    const user = getStoredAuthUser();
    if (!user) {
      nav('/login');
    } else {
      setCurrentUser(user);
    }
  }, []);

  const loadItems = async (typeFilter: FilterType = activeFilter) => {
    if (!currentUser) return;
    setIsLoading(true);
    const data = await fetchSavedItems(currentUser.id, typeFilter === 'all' ? undefined : typeFilter);
    setItems(data);
    setIsLoading(false);
  };

  useEffect(() => {
    if (currentUser) {
      loadItems(activeFilter);
    }
  }, [currentUser, activeFilter]);

  const handleRemove = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;
    const ok = await deleteSavedItem(id, currentUser.id);
    if (ok) {
      setItems(prev => prev.filter(item => item.id !== id));
      setNotification('Item removed from saved list');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const getItemIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'crop':
        return <Sprout className="w-3.5 h-3.5 text-emerald-600" />;
      case 'disease':
        return <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />;
      case 'post':
        return <MessageSquare className="w-3.5 h-3.5 text-blue-600" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-indigo-600" />;
    }
  };

  const getItemBadgeClass = (type: string) => {
    switch (type.toLowerCase()) {
      case 'crop':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'disease':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'post':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-purple-50 text-purple-700 border-purple-200';
    }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col antialiased text-slate-800">
      <Navbar activeRoute="/saved" onRouteChange={onRouteChange} />

      <div className="flex flex-1 w-full max-w-[1500px] mx-auto pt-3 sm:pt-5 pb-12 px-3 sm:px-6 lg:px-8 gap-6">
        {/* Left Sidebar */}
        <div className="hidden lg:block w-56 xl:w-60 shrink-0">
          <div className="sticky top-20">
            <DashboardSidebar activeItem="saved" onRouteChange={nav} />
          </div>
        </div>

        {/* Main Content Workspace */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Header Banner */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2.5">
                  <Bookmark className="w-6 h-6 text-[#15803D]" />
                  Saved Items
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                  Articles, disease guides, and community posts you've bookmarked
                </p>
              </div>

              {/* Notification badge */}
              {notification && (
                <div className="px-3 py-1.5 bg-emerald-50 text-[#15803D] border border-emerald-200 rounded-xl text-xs font-semibold animate-in fade-in">
                  {notification}
                </div>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto mt-6 border-b border-slate-100 pb-3 no-scrollbar">
              {[
                { key: 'all', label: 'All Items' },
                { key: 'crop', label: 'Crops' },
                { key: 'disease', label: 'Diseases' },
                { key: 'post', label: 'Community Posts' },
                { key: 'article', label: 'Articles' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveFilter(tab.key as FilterType)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                    activeFilter === tab.key
                      ? 'bg-[#15803D] text-white shadow-xs'
                      : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid or Empty State */}
          {isLoading ? (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-16 flex flex-col items-center justify-center text-center shadow-2xs">
              <Loader2 className="w-8 h-8 text-[#15803D] animate-spin mb-3" />
              <p className="text-sm font-semibold text-slate-600">Loading your saved items...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-12 sm:p-16 flex flex-col items-center justify-center text-center shadow-2xs">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
                <Bookmark className="w-8 h-8 text-[#15803D]" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1">
                No saved items yet
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
                Bookmark diseases, crop guides, and community discussions while exploring to access them quickly here.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => nav('/library')}
                  className="px-4 py-2 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2"
                >
                  <ShieldAlert className="w-4 h-4" />
                  Explore Disease Library
                </button>
                <button
                  type="button"
                  onClick={() => nav('/crops')}
                  className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Sprout className="w-4 h-4 text-emerald-600" />
                  Browse Crops
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => item.route && nav(item.route)}
                  className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden hover:shadow-md transition-all cursor-pointer group flex flex-col"
                >
                  {item.imageUrl ? (
                    <div className="h-36 w-full overflow-hidden bg-slate-100 relative">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className={`absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase flex items-center gap-1 bg-white/90 backdrop-blur-xs ${getItemBadgeClass(item.itemType)}`}>
                        {getItemIcon(item.itemType)}
                        {item.itemType}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleRemove(item.id, e)}
                        title="Remove from saved"
                        className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-400 hover:text-red-500 shadow-2xs transition-colors"
                      >
                        <Bookmark className="w-4 h-4 fill-emerald-600 text-emerald-600" />
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase flex items-center gap-1 ${getItemBadgeClass(item.itemType)}`}>
                        {getItemIcon(item.itemType)}
                        {item.itemType}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleRemove(item.id, e)}
                        title="Remove from saved"
                        className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#15803D] transition-colors line-clamp-1 mb-1">
                        {item.title}
                      </h4>
                      {item.subtitle && (
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                          {item.subtitle}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Saved {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'recently'}</span>
                      <span className="text-[#15803D] font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        View <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
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
