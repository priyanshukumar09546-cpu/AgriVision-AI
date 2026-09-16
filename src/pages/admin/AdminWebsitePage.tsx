import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import {
  Image as ImageIcon,
  Star,
  HelpCircle,
  Plus,
  Trash2,
  CheckCircle2,
  Loader2,
  X
} from 'lucide-react';
import {
  fetchAdminWebsiteContent,
  createAdminWebsiteItem,
  deleteAdminWebsiteItem
} from '../../services/adminService';

interface AdminWebsitePageProps {
  onRouteChange?: (route: string) => void;
}

export const AdminWebsitePage: React.FC<AdminWebsitePageProps> = ({ onRouteChange }) => {
  const getTabFromUrl = () => {
    if (typeof window === 'undefined') return 'banners';
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'banners';
  };

  const [activeTab, setActiveTab] = useState<string>(getTabFromUrl());
  const [data, setData] = useState<{ banners: any[]; testimonials: any[]; faqs: any[] }>({
    banners: [],
    testimonials: [],
    faqs: []
  });
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [modalType, setModalType] = useState<'banner' | 'testimonial' | 'faq' | null>(null);
  const [deletingItem, setDeletingItem] = useState<{ type: 'banner' | 'testimonial' | 'faq'; id: string; name: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Forms
  const [bannerForm, setBannerForm] = useState({
    title: '',
    subtitle: '',
    cta_text: 'Get Started',
    cta_url: '/detect',
    image_url: '',
    is_active: 1
  });

  const [testimForm, setTestimForm] = useState({
    farmer_name: '',
    role_location: 'Organic Farmer, Maharashtra',
    quote: '',
    rating: 5,
    avatar: ''
  });

  const [faqForm, setFaqForm] = useState({
    question: '',
    answer: '',
    category: 'General',
    display_order: 1
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const loadContent = async () => {
    setIsLoading(true);
    const res = await fetchAdminWebsiteContent();
    setData(res);
    setIsLoading(false);
  };

  useEffect(() => {
    loadContent();
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.pushState({}, '', url.toString());
    }
  };

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerForm.title) return;
    setIsSubmitting(true);
    const res = await createAdminWebsiteItem('banner', bannerForm);
    setIsSubmitting(false);
    if (res.success) {
      showToast('Promotional banner added.');
      setModalType(null);
      setBannerForm({ title: '', subtitle: '', cta_text: 'Get Started', cta_url: '/detect', image_url: '', is_active: 1 });
      loadContent();
    } else {
      showToast(res.error || 'Failed to save banner.');
    }
  };

  const handleCreateTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testimForm.farmer_name || !testimForm.quote) return;
    setIsSubmitting(true);
    const res = await createAdminWebsiteItem('testimonial', testimForm);
    setIsSubmitting(false);
    if (res.success) {
      showToast('Farmer testimonial published.');
      setModalType(null);
      setTestimForm({ farmer_name: '', role_location: 'Organic Farmer, Maharashtra', quote: '', rating: 5, avatar: '' });
      loadContent();
    } else {
      showToast(res.error || 'Failed to save testimonial.');
    }
  };

  const handleCreateFAQ = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqForm.question || !faqForm.answer) return;
    setIsSubmitting(true);
    const res = await createAdminWebsiteItem('faq', faqForm);
    setIsSubmitting(false);
    if (res.success) {
      showToast('FAQ question and answer published.');
      setModalType(null);
      setFaqForm({ question: '', answer: '', category: 'General', display_order: 1 });
      loadContent();
    } else {
      showToast(res.error || 'Failed to save FAQ.');
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    setIsSubmitting(true);
    const res = await deleteAdminWebsiteItem(deletingItem.type, deletingItem.id);
    setIsSubmitting(false);
    if (res.success) {
      showToast('Item deleted successfully.');
      setDeletingItem(null);
      loadContent();
    } else {
      showToast(res.error || 'Failed to delete item.');
    }
  };

  return (
    <AdminLayout activeItem={`website-${activeTab}`} onRouteChange={onRouteChange}>
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
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Website Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure homepage banners, verified farmer testimonials, and public agricultural FAQs.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (activeTab === 'banners') setModalType('banner');
            else if (activeTab === 'testimonials') setModalType('testimonial');
            else setModalType('faq');
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>
            {activeTab === 'banners' ? 'Add Hero Banner' : activeTab === 'testimonials' ? 'Add Testimonial' : 'Add FAQ'}
          </span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => handleTabChange('banners')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'banners'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Banners ({data.banners.length})</span>
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('testimonials')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'testimonials'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Star className="w-4 h-4" />
          <span>Testimonials ({data.testimonials.length})</span>
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('faq')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'faq'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>FAQs ({data.faqs.length})</span>
        </button>
      </div>

      {/* Content Body */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
          <p className="text-xs font-semibold">Loading website content...</p>
        </div>
      ) : activeTab === 'banners' ? (
        /* Banners Table / Cards */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          {data.banners.length === 0 ? (
            <div className="py-20 text-center px-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <ImageIcon className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No promotional banners yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Add marketing or educational banners displayed on the portal landing pages.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.banners.map((b) => (
                <div key={b.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {b.image_url ? (
                      <img src={b.image_url} alt={b.title} className="w-20 h-14 rounded-xl object-cover border border-slate-200" />
                    ) : (
                      <div className="w-20 h-14 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center text-xs font-semibold">
                        No Image
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{b.title}</h4>
                      {b.subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{b.subtitle}</p>}
                      <div className="flex items-center gap-2 mt-1.5 text-[11px]">
                        <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          CTA: {b.cta_text || 'Get Started'}
                        </span>
                        <span className="text-slate-400">Target: {b.cta_url || '/'}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDeletingItem({ type: 'banner', id: b.id, name: b.title })}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'testimonials' ? (
        /* Testimonials List */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          {data.testimonials.length === 0 ? (
            <div className="py-20 text-center px-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <Star className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No testimonials published yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Add verified farmer endorsements and feedback to show on the public platform.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
              {data.testimonials.map((t) => (
                <div key={t.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
                          {t.farmer_name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-xs text-slate-900 leading-tight">{t.farmer_name}</p>
                          <p className="text-[11px] text-slate-500">{t.role_location}</p>
                        </div>
                      </div>
                      <div className="flex text-amber-400">
                        {Array.from({ length: t.rating || 5 }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 italic leading-relaxed">
                      "{t.quote}"
                    </p>
                  </div>
                  <div className="pt-3 mt-3 border-t border-slate-200/80 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setDeletingItem({ type: 'testimonial', id: t.id, name: t.farmer_name })}
                      className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* FAQs List */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          {data.faqs.length === 0 ? (
            <div className="py-20 text-center px-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <HelpCircle className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No FAQs published yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Add frequently asked questions to assist visiting farmers and agronomists.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.faqs.map((faq) => (
                <div key={faq.id} className="p-4 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10.5px] font-bold">
                        {faq.category || 'General'}
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs">{faq.question}</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pl-1 pt-0.5">{faq.answer}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDeletingItem({ type: 'faq', id: faq.id, name: faq.question })}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Banner Modal */}
      {modalType === 'banner' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Add Hero Banner</h3>
              <button onClick={() => setModalType(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateBanner} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Banner Title</label>
                <input
                  type="text"
                  required
                  value={bannerForm.title}
                  onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                  placeholder="e.g. Empowering Farmers with Instant AI Disease Detection"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={bannerForm.subtitle}
                  onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                  placeholder="98.4% diagnostic accuracy across 14 major crops"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Button Text</label>
                  <input
                    type="text"
                    value={bannerForm.cta_text}
                    onChange={(e) => setBannerForm({ ...bannerForm, cta_text: e.target.value })}
                    placeholder="Scan Now"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Button Link</label>
                  <input
                    type="text"
                    value={bannerForm.cta_url}
                    onChange={(e) => setBannerForm({ ...bannerForm, cta_url: e.target.value })}
                    placeholder="/detect"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Background Image URL</label>
                <input
                  type="url"
                  value={bannerForm.image_url}
                  onChange={(e) => setBannerForm({ ...bannerForm, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Add Banner</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Testimonial Modal */}
      {modalType === 'testimonial' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Add Testimonial</h3>
              <button onClick={() => setModalType(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateTestimonial} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Farmer Name</label>
                <input
                  type="text"
                  required
                  value={testimForm.farmer_name}
                  onChange={(e) => setTestimForm({ ...testimForm, farmer_name: e.target.value })}
                  placeholder="e.g. Ramesh K."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Role & Region</label>
                <input
                  type="text"
                  value={testimForm.role_location}
                  onChange={(e) => setTestimForm({ ...testimForm, role_location: e.target.value })}
                  placeholder="e.g. Cotton & Wheat Cultivator, Punjab"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Quote / Review</label>
                <textarea
                  rows={3}
                  required
                  value={testimForm.quote}
                  onChange={(e) => setTestimForm({ ...testimForm, quote: e.target.value })}
                  placeholder="How did AgriVision AI assist in diagnosis or crop management?"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Publish Testimonial</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add FAQ Modal */}
      {modalType === 'faq' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Add FAQ Question</h3>
              <button onClick={() => setModalType(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateFAQ} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Question</label>
                <input
                  type="text"
                  required
                  value={faqForm.question}
                  onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                  placeholder="e.g. How does the AI detect leaf diseases without internet?"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Answer</label>
                <textarea
                  rows={4}
                  required
                  value={faqForm.answer}
                  onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                  placeholder="Detailed answer explaining the technology or process..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Publish FAQ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Item Confirmation */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-100 p-6 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Delete Website Item?</h3>
            <p className="text-xs text-slate-500 mt-1.5">
              Are you sure you want to delete <span className="font-bold text-slate-700">{deletingItem.name}</span>?
            </p>
            <div className="mt-6 flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDelete}
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
