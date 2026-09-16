import React, { useState } from 'react';
import { Users, ThumbsUp, MessageSquare, Share2, MoreVertical } from 'lucide-react';
import type { CommunitySnippet } from '../../services/dashboardService';
import { navigateTo } from '../../utils/navigation';

interface DashboardCommunitySnippetProps {
  snippet: CommunitySnippet | null;
  onRouteChange?: (route: string) => void;
  onToast: (msg: string) => void;
}

export const DashboardCommunitySnippet: React.FC<DashboardCommunitySnippetProps> = ({
  snippet,
  onRouteChange,
  onToast,
}) => {
  const [liked, setLiked] = useState(false);
  const [likesOffset, setLikesOffset] = useState(0);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (liked) {
      setLiked(false);
      setLikesOffset((prev) => prev - 1);
    } else {
      setLiked(true);
      setLikesOffset((prev) => prev + 1);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.origin + '/community');
    }
    onToast('Community link copied to clipboard!');
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs select-none text-left">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h2 className="text-sm font-bold text-[#0F172A]">From the Community</h2>
        <button
          type="button"
          onClick={() => navigateTo('/community', onRouteChange)}
          className="text-xs font-bold text-[#15803D] hover:text-[#166534] cursor-pointer"
        >
          View All
        </button>
      </div>

      {/* Snippet Content / Honest Empty State */}
      <div className="pt-3">
        {snippet ? (
          <div
            onClick={() => navigateTo('/community', onRouteChange)}
            className="cursor-pointer group hover:bg-slate-50/70 p-2 rounded-xl transition-colors -mx-2"
          >
            {/* Author Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 shrink-0 border border-slate-200/80 flex items-center justify-center">
                  {snippet.authorAvatar ? (
                    <img
                      src={snippet.authorAvatar}
                      alt={snippet.authorName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-bold text-[#15803D]">
                      {snippet.authorName ? snippet.authorName.charAt(0).toUpperCase() : 'F'}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-[#0F172A] leading-tight truncate">
                    {snippet.authorName}
                  </h4>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {snippet.timeAgo}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToast('Post options: Navigate to Community for full controls.');
                }}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Post Content */}
            <p className="text-xs text-slate-700 mt-2.5 mb-2.5 line-clamp-2 leading-relaxed">
              {snippet.content}
            </p>

            {/* Attached Image if present */}
            {snippet.imageUrl && (
              <div className="w-full h-32 rounded-xl overflow-hidden bg-slate-100 mb-3 border border-slate-200/70">
                <img
                  src={snippet.imageUrl}
                  alt="Community discussion"
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                />
              </div>
            )}

            {/* Footer Metrics */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleLike}
                  className={`flex items-center gap-1.5 transition-colors cursor-pointer text-[11px] font-semibold ${
                    liked ? 'text-[#15803D]' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${liked ? 'fill-[#15803D]' : ''}`} />
                  <span>{Math.max(0, snippet.likesCount + likesOffset)}</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('/community', onRouteChange)}
                  className="flex items-center gap-1.5 hover:text-slate-800 transition-colors cursor-pointer text-[11px] font-semibold text-slate-500"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{snippet.commentsCount}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleShare}
                className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-5 px-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Users className="w-7 h-7 text-slate-400 mx-auto mb-1.5 opacity-70" />
            <p className="text-xs font-bold text-slate-700">No community posts yet</p>
            <p className="text-[10.5px] text-slate-500 mt-1 max-w-xs mx-auto">
              Be the first to share farming updates, discuss crop diseases, or ask advice.
            </p>
            <button
              type="button"
              onClick={() => navigateTo('/community', onRouteChange)}
              className="mt-2.5 px-3 py-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200/80 rounded-lg transition cursor-pointer"
            >
              Open Community
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
