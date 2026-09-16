import React, { useState } from 'react';
import { Image as ImageIcon, BarChart2, Sprout, MapPin, User } from 'lucide-react';

interface CommunityCreatePostProps {
  currentUser?: { name: string; avatar?: string } | null;
  onPostSubmit?: (text: string) => void;
  onOpenPhotoModal?: () => void;
  onOpenPollModal?: () => void;
  onOpenCropTagModal?: () => void;
  onOpenLocationModal?: () => void;
  onRequireLogin?: () => void;
}

export const CommunityCreatePost: React.FC<CommunityCreatePostProps> = ({
  currentUser,
  onPostSubmit,
  onOpenPhotoModal,
  onOpenPollModal,
  onOpenCropTagModal,
  onOpenLocationModal,
  onRequireLogin,
}) => {
  const [postText, setPostText] = useState('');

  const handlePost = () => {
    if (!currentUser) {
      onRequireLogin?.();
      return;
    }
    if (postText.trim()) {
      onPostSubmit?.(postText);
      setPostText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handlePost();
    }
  };

  const handleActionClick = (callback?: () => void) => {
    if (!currentUser) {
      onRequireLogin?.();
      return;
    }
    callback?.();
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {/* Top Input Row */}
      <div className="flex items-center gap-3">
        {/* User Avatar */}
        {currentUser ? (
          currentUser.avatar ? (
            <div className="w-9 h-9 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-200">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
          )
        ) : (
          <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shrink-0 border border-slate-200">
            <User className="w-4 h-4" />
          </div>
        )}

        {/* Input Box */}
        <div className="flex-1">
          <input
            type="text"
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              currentUser
                ? `Share your question, experience, or tip, ${currentUser.name}...`
                : 'Sign in to share your question, experience, or tip...'
            }
            className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#15803D] focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Bottom Actions Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-100">
        {/* Action Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Photo */}
          <button
            type="button"
            onClick={() => handleActionClick(onOpenPhotoModal)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-medium text-slate-700 transition-colors shadow-2xs cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5 text-[#15803D]" />
            <span>Photo</span>
          </button>

          {/* Poll */}
          <button
            type="button"
            onClick={() => handleActionClick(onOpenPollModal)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-medium text-slate-700 transition-colors shadow-2xs cursor-pointer"
          >
            <BarChart2 className="w-3.5 h-3.5 text-[#15803D]" />
            <span>Poll</span>
          </button>

          {/* Crop Tag */}
          <button
            type="button"
            onClick={() => handleActionClick(onOpenCropTagModal)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-medium text-slate-700 transition-colors shadow-2xs cursor-pointer"
          >
            <Sprout className="w-3.5 h-3.5 text-[#15803D]" />
            <span>Crop Tag</span>
          </button>

          {/* Location */}
          <button
            type="button"
            onClick={() => handleActionClick(onOpenLocationModal)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-medium text-slate-700 transition-colors shadow-2xs cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <span>Location</span>
          </button>
        </div>

        {/* Post Button */}
        <button
          type="button"
          onClick={handlePost}
          className="px-5 py-1.5 bg-[#15803D] hover:bg-[#166534] text-white text-[11.5px] font-semibold rounded-lg transition-colors shadow-2xs cursor-pointer"
        >
          Post
        </button>
      </div>
    </div>
  );
};
