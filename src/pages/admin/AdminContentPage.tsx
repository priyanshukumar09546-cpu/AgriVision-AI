import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import {
  FileText,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  Loader2,
  X,
  Sprout,
  ShieldAlert
} from 'lucide-react';
import {
  fetchAdminArticles,
  saveAdminArticle,
  updateAdminArticle,
  deleteAdminArticle
} from '../../services/adminService';
import { AdminCropsPage } from './AdminCropsPage';
import { AdminDiseasesPage } from './AdminDiseasesPage';

interface AdminContentPageProps {
  onRouteChange?: (route: string) => void;
}

export const AdminContentPage: React.FC<AdminContentPageProps> = ({ onRouteChange }) => {
  const getTabFromUrl = () => {
    if (typeof window === 'undefined') return 'articles';
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'articles';
  };

  const [activeTab, setActiveTab] = useState<string>(getTabFromUrl());
  const [articles, setArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any | null>(null);
  const [deletingArticle, setDeletingArticle] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    category: 'Agronomy Guides',
    excerpt: '',
    content: '',
    author: 'AgriVision Editorial',
    image: '',
    read_time: '4 min'
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const loadArticles = async () => {
    setIsLoading(true);
    const data = await fetchAdminArticles();
    setArticles(data);
    setIsLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'articles') {
      loadArticles();
    }
  }, [activeTab]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.pushState({}, '', url.toString());
    }
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;
    setIsSubmitting(true);
    const res = await saveAdminArticle(formData);
    setIsSubmitting(false);
    if (res.success) {
      showToast('Article published to resources.');
      setIsAddModalOpen(false);
      setFormData({
        title: '',
        category: 'Agronomy Guides',
        excerpt: '',
        content: '',
        author: 'AgriVision Editorial',
        image: '',
        read_time: '4 min'
      });
      loadArticles();
    } else {
      showToast(res.error || 'Failed to publish article.');
    }
  };

  const handleUpdateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;
    setIsSubmitting(true);
    const res = await updateAdminArticle(editingArticle.id, formData);
    setIsSubmitting(false);
    if (res.success) {
      showToast('Article updated successfully.');
      setEditingArticle(null);
      loadArticles();
    } else {
      showToast(res.error || 'Failed to update article.');
    }
  };

  const handleDeleteArticle = async () => {
    if (!deletingArticle) return;
    setIsSubmitting(true);
    const res = await deleteAdminArticle(deletingArticle.id);
    setIsSubmitting(false);
    if (res.success) {
      showToast('Article deleted.');
      setDeletingArticle(null);
      loadArticles();
    } else {
      showToast(res.error || 'Failed to delete article.');
    }
  };

  const openEditModal = (art: any) => {
    setEditingArticle(art);
    setFormData({
      title: art.title || '',
      category: art.category || 'Agronomy Guides',
      excerpt: art.excerpt || '',
      content: art.content || '',
      author: art.author || 'AgriVision Editorial',
      image: art.image || '',
      read_time: art.read_time || '4 min'
    });
  };

  // If tab is crops or diseases, render their dedicated page content seamlessly
  if (activeTab === 'crops') {
    return <AdminCropsPage onRouteChange={onRouteChange} />;
  }

  if (activeTab === 'diseases') {
    return <AdminDiseasesPage onRouteChange={onRouteChange} />;
  }

  const filteredArticles = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.category && a.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <AdminLayout activeItem="content-articles" onRouteChange={onRouteChange}>
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
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Content Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Publish educational farmer articles, agronomy best practices, and knowledge library guides.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setFormData({
                title: '',
                category: 'Agronomy Guides',
                excerpt: '',
                content: '',
                author: 'AgriVision Editorial',
                image: '',
                read_time: '4 min'
              });
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Article</span>
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => handleTabChange('articles')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'articles'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Articles & Resources ({articles.length})</span>
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('crops')}
          className="px-4 py-2.5 text-xs font-semibold border-b-2 border-transparent text-slate-500 hover:text-slate-800 transition-colors cursor-pointer flex items-center gap-2"
        >
          <Sprout className="w-4 h-4" />
          <span>Crop Library</span>
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('diseases')}
          className="px-4 py-2.5 text-xs font-semibold border-b-2 border-transparent text-slate-500 hover:text-slate-800 transition-colors cursor-pointer flex items-center gap-2"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Disease Library</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search articles by title, topic, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
            <p className="text-xs font-semibold">Loading articles library...</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="py-20 text-center px-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No articles published yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Create your first educational guide or agronomy advisory using the button above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Article Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Author</th>
                  <th className="py-3 px-4">Read Time</th>
                  <th className="py-3 px-4">Published</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredArticles.map((art) => (
                  <tr key={art.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 max-w-md">
                      <p className="line-clamp-1">{art.title}</p>
                      {art.excerpt && <p className="text-[11px] font-normal text-slate-500 line-clamp-1 mt-0.5">{art.excerpt}</p>}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {art.category || 'General'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {art.author || 'Admin Editorial'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {art.read_time || '3 min'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {art.published_at ? new Date(art.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(art)}
                          title="Edit Article"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingArticle(art)}
                          title="Delete Article"
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

      {/* Add / Edit Article Modal */}
      {(isAddModalOpen || editingArticle) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                {editingArticle ? 'Edit Article' : 'Publish New Resource Article'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingArticle(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={editingArticle ? handleUpdateArticle : handleSaveArticle}
              className="p-6 space-y-4 overflow-y-auto flex-1"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Article Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Modern Integrated Pest Management for Tomato Crops"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                  >
                    <option value="Agronomy Guides">Agronomy Guides</option>
                    <option value="Disease Control">Disease Control</option>
                    <option value="Organic Farming">Organic Farming</option>
                    <option value="Smart Irrigation">Smart Irrigation</option>
                    <option value="Crop Health">Crop Health</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Read Time</label>
                  <input
                    type="text"
                    value={formData.read_time}
                    onChange={(e) => setFormData({ ...formData, read_time: e.target.value })}
                    placeholder="e.g. 5 min read"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Short Excerpt / Summary</label>
                <input
                  type="text"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="A concise 1-2 sentence overview shown in preview cards..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Article Body</label>
                <textarea
                  rows={8}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write the educational content or agronomic advice here..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl leading-relaxed"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingArticle(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingArticle ? 'Save Changes' : 'Publish Article'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Article Confirmation */}
      {deletingArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-100 p-6 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Delete Article?</h3>
            <p className="text-xs text-slate-500 mt-1.5">
              Are you sure you want to remove <span className="font-bold text-slate-700">{deletingArticle.title}</span>?
            </p>
            <div className="mt-6 flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setDeletingArticle(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeleteArticle}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
