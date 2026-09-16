import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, ChevronDown, User, X, LogOut, Settings, Sprout, ShieldAlert, MessageSquare, LayoutDashboard, Bookmark, History, Sparkles } from 'lucide-react';
import { getStoredAuthUser, clearAuthUser, subscribeAuth } from '../services/authService';
import type { AuthUser } from '../services/authService';
import { ProfileModal } from './auth/ProfileModal';
import { GeminiAssistantModal } from './ai/GeminiAssistantModal';

interface NavbarProps {
  activeRoute?: string;
  onRouteChange?: (route: string) => void;
  user?: {
    name: string;
    avatar?: string;
    email?: string;
  } | null;
}

interface SearchResultItem {
  type: 'crop' | 'disease' | 'community';
  title: string;
  subtitle: string;
  route: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeRoute = '/',
  onRouteChange,
  user,
}) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | { name: string; avatar?: string; email?: string; role?: string } | null>(
    user !== undefined ? user : getStoredAuthUser()
  );
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [hasUnreadNotification, setHasUnreadNotification] = useState(true);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user !== undefined) {
      setCurrentUser(user);
      return;
    }
    setCurrentUser(getStoredAuthUser());
    const unsubscribe = subscribeAuth((updatedUser) => {
      setCurrentUser(updatedUser);
    });
    return unsubscribe;
  }, [user]);

  // Real backend live search with debounce
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results || []);
        } else {
          setSearchResults([]);
        }
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
        setHasSearched(true);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setHasSearched(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Detect Disease', href: '/detect' },
    { name: 'Crops', href: '/crops' },
    { name: 'Disease Library', href: '/library' },
    { name: 'AI Insights', href: '/insights' },
    { name: 'Community', href: '/community' },
    { name: 'About', href: '/about' },
  ];

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    if (onRouteChange) {
      onRouteChange(href);
    }
  };

  const handleSearchResultClick = (route: string) => {
    setSearchQuery('');
    setHasSearched(false);
    setIsSearchOpen(false);
    if (onRouteChange) {
      onRouteChange(route);
    }
  };

  const searchPlaceholder =
    activeRoute === '/about' || activeRoute.startsWith('/about')
      ? 'Search...'
      : activeRoute === '/community' || activeRoute.startsWith('/community')
      ? 'Search discussions, crops, topics...'
      : activeRoute === '/insights' || activeRoute.startsWith('/insights')
      ? 'Search crops, diseases, tips...'
      : activeRoute === '/library' ||
        activeRoute.startsWith('/library') ||
        activeRoute.startsWith('/diseases')
      ? 'Search diseases, crops, symptoms...'
      : 'Search crops, diseases, guides...';

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="max-w-[1240px] mx-auto px-6 h-[58px] flex items-center justify-between">
          {/* Left: Brand Logo & Tagline */}
          <a
            href="/"
            onClick={(e) => handleNavClick(e, '/')}
            className="flex items-center gap-2 select-none group shrink-0"
            aria-label="AgriVision AI - Healthy Crops. Brighter Tomorrow."
          >
            <img
              src="/assets/leaf_logo_vector.svg"
              alt="AgriVision AI Leaf Logo"
              className="w-[34px] h-[32px] object-contain shrink-0 drop-shadow-xs"
              width="34"
              height="32"
            />
            <div className="flex flex-col text-left leading-none">
              <div className="flex items-baseline tracking-tight">
                <span className="text-[17.5px] font-bold text-[#0F172A] tracking-[-0.02em]">
                  AgriVision
                </span>
                <span className="text-[17.5px] font-bold text-[#15803D] ml-1 tracking-[-0.02em]">
                  AI
                </span>
              </div>
              <span className="text-[10.5px] font-normal text-slate-500 tracking-tight mt-[3px]">
                Healthy Crops. Brighter Tomorrow.
              </span>
            </div>
          </a>

          {/* Navigation Links matching exact reference */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 h-full">
            {navLinks.map((link) => {
              const isActive =
                activeRoute === link.href ||
                (link.href !== '/' && activeRoute.startsWith(link.href));

              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`relative text-[13.5px] font-medium tracking-tight transition-colors py-4 flex items-center h-full ${
                    isActive
                      ? 'text-[#0F172A] font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#15803D] rounded-full" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Right Side: Search bar, and Login/SignUp or User Profile */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Search Pill Input with Live Results Dropdown */}
            <div ref={searchContainerRef} className="relative hidden sm:flex items-center">
              <div className="flex items-center gap-2 bg-slate-50/90 hover:bg-slate-100/80 border border-slate-200/90 rounded-full px-3 py-1.5 w-[160px] lg:w-[220px] transition-all focus-within:w-[240px] focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/20">
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (searchQuery.trim()) setHasSearched(true);
                  }}
                  className="w-full bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                      setHasSearched(false);
                    }}
                    className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Floating Live Search Results Dropdown */}
              {hasSearched && searchQuery.trim() && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in">
                  <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
                    <span>Search Results</span>
                    {isSearching && <span className="text-emerald-600 animate-pulse">Searching...</span>}
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                    {searchResults.length > 0 ? (
                      searchResults.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleSearchResultClick(item.route)}
                          className="p-3 hover:bg-emerald-50/60 cursor-pointer transition-colors flex items-start gap-2.5"
                        >
                          <div className="mt-0.5 shrink-0">
                            {item.type === 'crop' && <Sprout className="w-4 h-4 text-emerald-600" />}
                            {item.type === 'disease' && <ShieldAlert className="w-4 h-4 text-amber-600" />}
                            {item.type === 'community' && <MessageSquare className="w-4 h-4 text-blue-600" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-800 leading-tight truncate">
                              {item.title}
                            </p>
                            <p className="text-[10.5px] text-slate-500 truncate mt-0.5">
                              {item.subtitle}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs text-slate-500 font-medium">
                        No results found.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Search trigger on mobile */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="sm:hidden p-1.5 text-slate-600 hover:text-[#15803D] hover:bg-slate-50 rounded-full transition-colors focus:outline-none cursor-pointer"
              aria-label="Search AgriVision"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Ask Gemini AI Button */}
            <button
              onClick={() => setIsAiAssistantOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/90 rounded-full transition-all shadow-2xs hover:shadow-xs cursor-pointer"
              title="Ask Gemini AI Agronomist"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#15803D]" />
              <span className="hidden sm:inline">Ask Gemini AI</span>
            </button>

            {/* Notification Bell - ONLY IF AUTHENTICATED */}
            {currentUser && (
              <div className="relative">
                <button
                  onClick={() => {
                    setIsNotificationsOpen(!isNotificationsOpen);
                    setHasUnreadNotification(false);
                  }}
                  className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-colors focus:outline-none cursor-pointer"
                  aria-label="Notifications"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {hasUnreadNotification && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
                  )}
                </button>

                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 z-50 animate-in fade-in">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-800">Notifications</p>
                      <button
                        type="button"
                        onClick={() => setIsNotificationsOpen(false)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="py-2.5">
                      <p className="text-xs font-semibold text-slate-800">AgriVision AI Active</p>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        Real-time agricultural monitoring and pathology detection is active.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setIsNotificationsOpen(false);
                          if (onRouteChange) {
                            onRouteChange('/notifications');
                          } else {
                            window.location.href = '/notifications';
                          }
                        }}
                        className="text-xs font-bold text-[#15803D] hover:text-[#166534] transition-colors"
                      >
                        View All Notifications →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentUser && <div className="h-4 w-px bg-slate-200 hidden sm:block mx-0.5" />}

            {/* User Profile Section if authenticated, else Login + Sign Up */}
            {currentUser ? (
              <div className="relative">
                <div
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 pl-1 cursor-pointer select-none group"
                >
                  <div className="w-7 h-7 rounded-full bg-[#15803D] text-white flex items-center justify-center overflow-hidden shrink-0 border border-slate-200 text-xs font-bold">
                    {currentUser.avatar ? (
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      currentUser.name.charAt(0).toUpperCase() || <User className="w-4 h-4 text-slate-200" />
                    )}
                  </div>
                  <span className="hidden sm:inline-block text-[13px] font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors">
                    {currentUser.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-800 transition-colors" />
                </div>

                {/* Profile Menu Dropdown */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in">
                    <div className="px-3.5 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-800 leading-tight">
                        {currentUser.name}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {currentUser.email || 'Member'}
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 text-[#15803D] text-[10px] font-bold rounded-full capitalize">
                        {(currentUser as any).role || 'Farmer'}
                      </span>
                    </div>

                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          if (onRouteChange) {
                            onRouteChange('/dashboard');
                          } else {
                            window.location.href = '/dashboard';
                          }
                        }}
                        className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-emerald-600" />
                        <span>User Dashboard</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          if (onRouteChange) {
                            onRouteChange('/profile');
                          } else {
                            window.location.href = '/profile';
                          }
                        }}
                        className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>My Profile</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          if (onRouteChange) {
                            onRouteChange('/my-crops');
                          } else {
                            window.location.href = '/my-crops';
                          }
                        }}
                        className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Sprout className="w-3.5 h-3.5 text-slate-400" />
                        <span>My Crops</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          if (onRouteChange) {
                            onRouteChange('/history');
                          } else {
                            window.location.href = '/history';
                          }
                        }}
                        className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <History className="w-3.5 h-3.5 text-slate-400" />
                        <span>Scan History</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          if (onRouteChange) {
                            onRouteChange('/saved');
                          } else {
                            window.location.href = '/saved';
                          }
                        }}
                        className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                        <span>Saved Items</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          if (onRouteChange) {
                            onRouteChange('/settings');
                          } else {
                            window.location.href = '/settings';
                          }
                        }}
                        className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Settings className="w-3.5 h-3.5 text-slate-400" />
                        <span>Settings</span>
                      </button>
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          clearAuthUser();
                          setIsProfileMenuOpen(false);
                          if (onRouteChange) {
                            onRouteChange('/');
                          }
                        }}
                        className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* Login Button */}
                <button
                  type="button"
                  onClick={(e) => handleNavClick(e, '/login')}
                  className="px-3.5 py-1.5 h-[34px] flex items-center justify-center text-[13px] font-semibold text-slate-700 hover:text-[#15803D] hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                >
                  Login
                </button>

                {/* Sign Up Button */}
                <button
                  type="button"
                  onClick={(e) => handleNavClick(e, '/signup')}
                  className="px-3.5 py-1.5 h-[34px] flex items-center justify-center text-[13px] font-semibold text-white bg-[#15803D] hover:bg-[#166534] active:bg-[#14532D] rounded-lg transition-all shadow-xs hover:shadow-sm cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Bar Drawer */}
        {isSearchOpen && (
          <div className="sm:hidden px-4 py-2 border-t border-slate-100 bg-white">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-slate-400 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            {hasSearched && searchQuery.trim() && (
              <div className="mt-2 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden divide-y divide-slate-50 max-h-48 overflow-y-auto">
                {searchResults.length > 0 ? (
                  searchResults.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSearchResultClick(item.route)}
                      className="p-2.5 text-xs text-slate-800 hover:bg-emerald-50 cursor-pointer"
                    >
                      <p className="font-bold truncate">{item.title}</p>
                      <p className="text-[10px] text-slate-500 truncate">{item.subtitle}</p>
                    </div>
                  ))
                ) : (
                  <p className="p-3 text-xs text-slate-500 text-center">No results found.</p>
                )}
              </div>
            )}
          </div>
        )}
      </header>

      {/* Edit Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onProfileUpdated={(updated) => setCurrentUser(updated)}
      />

      {/* Gemini AI Assistant Chat Modal */}
      <GeminiAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
      />
    </>
  );
};
