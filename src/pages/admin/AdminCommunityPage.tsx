import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import {
  MessageSquare,
  Search,
  Trash2,
  CheckCircle2,
  Heart,
  MessageCircle,
  Eye,
  Loader2,
  X,
  Flag
} from 'lucide-react';
import {
  fetchAdminCommunityPosts,
  deleteAdminPost
} from '../../services/adminService';

interface AdminCommunityPageProps {
  onRouteChange?: (route: string) => void;
}

export const AdminCommunityPage: React.FC<AdminCommunityPageProps> = ({ onRouteChange }) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [moderationFilter, setModerationFilter] = useState<'all' | 'reported'>('all');

  // Modals
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [deletingPost, setDeletingPost] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const loadPosts = async () => {
    setIsLoading(true);
    const data = await fetchAdminCommunityPosts();
    setPosts(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleDeletePost = async () => {
    if (!deletingPost) return;
    setIsSubmitting(true);
    const res = await deleteAdminPost(deletingPost.id);
    setIsSubmitting(false);
    if (res.success) {
      showToast('Community post removed by moderator.');
      setDeletingPost(null);
      loadPosts();
    } else {
      showToast(res.error || 'Failed to remove post.');
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      (post.author_name && post.author_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (post.content && post.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (post.crop_tag && post.crop_tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesReported = moderationFilter === 'reported' ? Boolean(post.is_reported || post.report_count > 0) : true;
    return matchesSearch && matchesReported;
  });

  return (
    <AdminLayout activeItem="community" onRouteChange={onRouteChange}>
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <p className="text-xs font-semibold">{toastMsg}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Community Moderation</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Oversee farmer discussions, moderate reported content, and uphold agricultural community guidelines.
          </p>
        </div>
        <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <button
            type="button"
            onClick={() => setModerationFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              moderationFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Posts ({posts.length})
          </button>
          <button
            type="button"
            onClick={() => setModerationFilter('reported')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              moderationFilter === 'reported'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-600 hover:bg-rose-50'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Reported</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search discussions by author, keywords, or crop tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
            <p className="text-xs font-semibold">Loading community discussions...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-20 text-center px-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <MessageSquare className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              {moderationFilter === 'reported' ? 'No reported posts' : 'No community posts found'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {moderationFilter === 'reported'
                ? 'All farmer discussions meet community safety and accuracy standards.'
                : 'No community discussions have been created yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Author</th>
                  <th className="py-3 px-4">Crop Tag</th>
                  <th className="py-3 px-4">Content Excerpt</th>
                  <th className="py-3 px-4">Engagement</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Flag Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs shrink-0">
                          {(post.author_name || 'U').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">{post.author_name || 'Anonymous Farmer'}</p>
                          <p className="text-[10.5px] text-slate-500 mt-0.5">{post.author_email || 'Verified user'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {post.crop_tag ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {post.crop_tag}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">General</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 max-w-sm">
                      <p className="line-clamp-2 leading-relaxed text-[11.5px] font-normal">
                        {post.content}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3 text-slate-500 font-medium">
                        <span className="flex items-center gap-1 text-[11.5px]">
                          <Heart className="w-3.5 h-3.5 text-rose-500" />
                          {post.likes_count || 0}
                        </span>
                        <span className="flex items-center gap-1 text-[11.5px]">
                          <MessageCircle className="w-3.5 h-3.5 text-indigo-500" />
                          {post.comments_count || 0}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium whitespace-nowrap">
                      {post.created_at ? new Date(post.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Recently'}
                    </td>
                    <td className="py-3.5 px-4">
                      {post.is_reported ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <Flag className="w-3 h-3 text-rose-500" />
                          Reported ({post.report_count || 1})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700">
                          Clear
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedPost(post)}
                          title="View Full Post"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingPost(post)}
                          title="Delete Post"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Post Details Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Community Discussion</h3>
              <button onClick={() => setSelectedPost(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm">
                  {(selectedPost.author_name || 'U').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{selectedPost.author_name || 'Anonymous Farmer'}</p>
                  <p className="text-xs text-slate-500">{selectedPost.author_email || 'Verified user'}</p>
                </div>
              </div>

              {selectedPost.image && (
                <div className="rounded-xl overflow-hidden aspect-video border border-slate-200">
                  <img src={selectedPost.image} alt="Post attachment" className="w-full h-full object-cover" />
                </div>
              )}

              <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-100">
                {selectedPost.content}
              </p>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500 font-medium">
                  Crop: <span className="font-bold text-slate-800">{selectedPost.crop_tag || 'None'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedPost(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-100 p-6 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Remove Post from Community?</h3>
            <p className="text-xs text-slate-500 mt-1.5">
              This post will be permanently deleted from the community feed.
            </p>
            <div className="mt-6 flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setDeletingPost(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeletePost}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Post</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
