import React, { useState } from 'react';
import { X, Sprout, CheckCircle2, User } from 'lucide-react';

export interface ModalData {
  type: 'new-post' | 'edit-post' | 'introduce' | 'join-movement' | 'photo-preview';
  postId?: string;
  content?: string;
  cropTag?: string;
  title?: string;
  imageSrc?: string;
}

interface CommunityModalProps {
  modalData: ModalData | null;
  currentUser?: { name: string; avatar?: string } | null;
  onClose: () => void;
  onSubmitPost?: (title: string, content: string, cropTag?: string) => void;
  onUpdatePost?: (postId: string, title: string, content: string, cropTag?: string) => void;
  onRequireLogin?: () => void;
}

export const CommunityModal: React.FC<CommunityModalProps> = ({
  modalData,
  currentUser,
  onClose,
  onSubmitPost,
  onUpdatePost,
  onRequireLogin,
}) => {
  const [postTitle, setPostTitle] = useState(modalData?.title || '');
  const [postBody, setPostBody] = useState(modalData?.content || '');
  const [selectedCrop, setSelectedCrop] = useState(modalData?.cropTag || 'Tomato');
  const [submitted, setSubmitted] = useState(false);

  React.useEffect(() => {
    if (modalData) {
      setPostTitle(modalData.title || '');
      setPostBody(modalData.content || '');
      setSelectedCrop(modalData.cropTag || 'Tomato');
    }
  }, [modalData]);

  if (!modalData) return null;

  const handleSubmitNewPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (postTitle.trim() && postBody.trim()) {
      if (modalData?.type === 'edit-post' && modalData.postId) {
        onUpdatePost?.(modalData.postId, postTitle, postBody, selectedCrop);
      } else {
        onSubmitPost?.(postTitle, postBody, selectedCrop);
      }
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setPostTitle('');
        setPostBody('');
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-[500px] w-full p-6 shadow-2xl relative text-left animate-in fade-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal: Photo Preview */}
        {modalData.type === 'photo-preview' && (
          <div>
            <h3 className="text-sm font-bold text-[#0F172A] mb-3">Diseased Leaf Attachment</h3>
            <div className="rounded-xl overflow-hidden border border-slate-200 aspect-[4/3] bg-slate-900 flex items-center justify-center">
              <img
                src={modalData.imageSrc}
                alt="Enlarged leaf"
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-xs text-slate-500 mt-2.5">
              High-resolution scan submitted by verified farmer for community disease identification.
            </p>
          </div>
        )}

        {/* Modal: New Post */}
        {(modalData.type === 'new-post' || modalData.type === 'edit-post') && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#E8F5E9] text-[#15803D] flex items-center justify-center">
                <Sprout className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A]">{modalData.type === 'edit-post' ? 'Edit Discussion' : 'Create New Discussion'}</h3>
            </div>

            {!currentUser ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#15803D] flex items-center justify-center mx-auto border border-emerald-200">
                  <User className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Sign In to Join the Discussion</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  You need to be signed in with your AgriVision AI account to publish questions and participate in community discussions.
                </p>
                <div className="pt-3 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onRequireLogin?.();
                    }}
                    className="px-5 py-2 text-xs font-semibold bg-[#15803D] hover:bg-[#166534] text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            ) : submitted ? (
              <div className="py-8 text-center">
                <CheckCircle2 className="w-10 h-10 text-[#15803D] mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-900">{modalData.type === 'edit-post' ? 'Post Updated!' : 'Post Published!'}</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Your question has been shared with the community network.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitNewPost} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Discussion Title
                  </label>
                  <input
                    type="text"
                    required
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder="e.g., Yellow curling on upper chili leaves"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#15803D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Crop Tag
                  </label>
                  <select
                    value={selectedCrop}
                    onChange={(e) => setSelectedCrop(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#15803D] bg-white"
                  >
                    <option value="Tomato">🍅 Tomato</option>
                    <option value="Maize">🌽 Maize</option>
                    <option value="Potato">🥔 Potato</option>
                    <option value="Chili">🌶️ Chili</option>
                    <option value="Wheat">🌾 Wheat</option>
                    <option value="Rice">🌾 Rice</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Description & Observations
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={postBody}
                    onChange={(e) => setPostBody(e.target.value)}
                    placeholder="Provide details about weather, age of crops, and symptoms..."
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#15803D]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-semibold bg-[#15803D] hover:bg-[#166534] text-white rounded-xl transition-colors shadow-xs"
                  >
                    {modalData.type === 'edit-post' ? 'Save Changes' : 'Publish Post'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Modal: Introduce Yourself */}
        {modalData.type === 'introduce' && (
          <div>
            <h3 className="text-base font-bold text-[#0F172A] mb-1">Welcome to AgriVision Community!</h3>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Introduce yourself to 10,000+ growers, students, and agronomists across India.
            </p>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Your State & District"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#15803D]"
              />
              <input
                type="text"
                placeholder="Primary crops you cultivate"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#15803D]"
              />
              <textarea
                rows={3}
                placeholder="What challenges or farming innovations are you working on?"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#15803D]"
              />
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
              >
                Submit Introduction
              </button>
            </div>
          </div>
        )}

        {/* Modal: Join Movement */}
        {modalData.type === 'join-movement' && (
          <div>
            <h3 className="text-base font-bold text-[#0F172A] mb-1">Join the AgriVision Movement</h3>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Become part of our mission to enable sustainable agriculture through AI-driven disease identification and peer-to-peer knowledge sharing.
            </p>

            <div className="p-3 bg-[#F0FDF4] border border-[#DCFCE7] rounded-xl text-xs text-slate-700 space-y-1.5 mb-4">
              <div className="flex items-center gap-2 font-bold text-[#15803D]">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified Farmer Network</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Receive free access to expert-led AMAs, regional outbreak alerts, and precision crop advisories.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
            >
              Get Free Farmer Membership
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
