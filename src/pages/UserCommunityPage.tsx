import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { DashboardSidebar } from '../components/dashboard/DashboardSidebar';
import {
  Users,
  Plus,
  MessageSquare,
  Heart,
  Share2,
  Bookmark,
  Loader2,
  Send,
  X
} from 'lucide-react';
import { getStoredAuthUser } from '../services/authService';
import type { AuthUser } from '../services/authService';
import {
  fetchCommunityPosts,
  createCommunityPost,
  toggleLikePost,
  toggleBookmarkPost,
} from '../services/communityService';
import type { RealPostItem } from '../services/communityService';
import { navigateTo } from '../utils/navigation';

interface UserCommunityPageProps {
  onRouteChange?: (route: string) => void;
}

type TabType = 'all' | 'following' | 'my_posts';

export const UserCommunityPage: React.FC<UserCommunityPageProps> = ({ onRouteChange }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getStoredAuthUser());
  const [posts, setPosts] = useState<RealPostItem[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Create post modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCrop, setNewCrop] = useState('Tomato');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const nav = (route: string) => navigateTo(route, onRouteChange);

  useEffect(() => {
    const user = getStoredAuthUser();
    if (!user) {
      nav('/login');
    } else {
      setCurrentUser(user);
    }
  }, []);

  const loadPosts = async () => {
    setIsLoading(true);
    const data = await fetchCommunityPosts({
      tab: activeTab === 'my_posts' ? 'my_posts' : 'all',
    });
    setPosts(data);
    setIsLoading(false);
  };

  useEffect(() => {
    if (currentUser) {
      loadPosts();
    }
  }, [currentUser, activeTab]);

  const handleLike = async (postId: string) => {
    const res = await toggleLikePost(postId);
    if (res.success) {
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            isLiked: res.isLiked,
            likesCount: res.likesCount,
          };
        }
        return p;
      }));
    }
  };

  const handleBookmark = async (postId: string) => {
    const res = await toggleBookmarkPost(postId);
    if (res.success) {
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            isBookmarked: res.isBookmarked,
          };
        }
        return p;
      }));
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      setFormError('Please enter both a title and description.');
      return;
    }
    setIsSubmitting(true);
    setFormError(null);

    const res = await createCommunityPost({
      title: newTitle,
      content: newContent,
      cropTag: newCrop,
    });

    setIsSubmitting(false);
    if (res.success) {
      setShowCreateModal(false);
      setNewTitle('');
      setNewContent('');
      await loadPosts();
    } else {
      setFormError(res.error || 'Failed to publish post. Please try again.');
    }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col antialiased text-slate-800">
      <Navbar activeRoute="/community" onRouteChange={onRouteChange} />

      <div className="flex flex-1 w-full max-w-[1500px] mx-auto pt-3 sm:pt-5 pb-12 px-3 sm:px-6 lg:px-8 gap-6">
        {/* Left Sidebar */}
        <div className="hidden lg:block w-56 xl:w-60 shrink-0">
          <div className="sticky top-20">
            <DashboardSidebar activeItem="community" onRouteChange={nav} />
          </div>
        </div>

        {/* Main Content Workspace */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Header Banner */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2.5">
                  <Users className="w-6 h-6 text-[#15803D]" />
                  Community
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                  Connect with farmers and agricultural experts across the nation
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Create Post</span>
              </button>
            </div>

            {/* Sub Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto mt-6 border-b border-slate-100 pb-3 no-scrollbar">
              {[
                { key: 'all', label: 'All Posts' },
                { key: 'following', label: 'Following' },
                { key: 'my_posts', label: 'My Posts' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key as TabType)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                    activeTab === tab.key
                      ? 'bg-[#15803D] text-white shadow-xs'
                      : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Posts Feed or Empty State */}
          {isLoading ? (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-16 flex flex-col items-center justify-center text-center shadow-2xs">
              <Loader2 className="w-8 h-8 text-[#15803D] animate-spin mb-3" />
              <p className="text-sm font-semibold text-slate-600">Loading community discussions...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-12 sm:p-16 flex flex-col items-center justify-center text-center shadow-2xs">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-[#15803D]" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1">
                No community posts yet
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
                Join the discussion with fellow farmers and agronomists. Ask a question, share an update, or exchange disease management experiences.
              </p>
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Your First Post</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs hover:border-slate-300 transition-all space-y-3.5"
                >
                  {/* Author Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#15803D] text-white font-extrabold flex items-center justify-center overflow-hidden text-sm">
                        {post.author.avatar ? (
                          <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{post.author.name ? post.author.name.charAt(0).toUpperCase() : 'F'}</span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold text-slate-900">
                            {post.author.name}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#15803D] text-[10px] font-bold capitalize">
                            {post.author.role || 'Farmer'}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {post.author.timeAgo || 'Recently'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleBookmark(post.id)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        post.isBookmarked
                          ? 'text-[#15803D] bg-emerald-50'
                          : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                      }`}
                      title={post.isBookmarked ? 'Bookmarked' : 'Bookmark post'}
                    >
                      <Bookmark className={`w-4 h-4 ${post.isBookmarked ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Title & Body */}
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1">
                      {post.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                      {post.content}
                    </p>
                  </div>

                  {/* Crop Tag */}
                  {post.cropTag && (
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                        #{post.cropTag.replace(/^#/, '')}
                      </span>
                    </div>
                  )}

                  {/* Actions footer */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-1.5 font-bold transition-colors cursor-pointer ${
                          post.isLiked ? 'text-red-500' : 'text-slate-600 hover:text-red-500'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                        <span>{post.likesCount}</span>
                      </button>

                      <div className="flex items-center gap-1.5 font-bold text-slate-600">
                        <MessageSquare className="w-4 h-4 text-slate-400" />
                        <span>{post.commentsCount} comments</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({ title: post.title, text: post.content, url: window.location.href });
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                      title="Share discussion"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#15803D]" />
                Create Community Post
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Topic / Crop Category</label>
                <select
                  value={newCrop}
                  onChange={(e) => setNewCrop(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#15803D] font-medium"
                >
                  {['Tomato', 'Potato', 'Chili', 'Cotton', 'Wheat', 'Rice', 'Maize', 'Soybean', 'General Farming'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Discussion Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Best organic treatment for early blight in tomatoes?"
                  required
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#15803D] font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Content / Question Details</label>
                <textarea
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Share details about your crop symptoms, weather conditions, or questions for fellow farmers..."
                  required
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#15803D] font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#15803D] hover:bg-[#166534] disabled:bg-slate-300 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Publish Post</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
