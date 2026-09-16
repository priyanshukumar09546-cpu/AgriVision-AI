import React, { useState } from 'react';
import {
  ThumbsUp,
  MessageSquare,
  Share2,
  Bookmark,
  AlertCircle,
  Award,
  Sparkles,
  Check,
  Send,
} from 'lucide-react';
import type { PostItem } from '../../data/communityData';
import { fetchPostComments, addPostComment, deleteCommunityComment } from '../../services/communityService';
import { Edit3, Trash2 } from 'lucide-react';
import type { PostComment } from '../../services/communityService';

interface CommunityPostCardProps {
  post: PostItem;
  currentUser?: { id: string; name: string; avatar?: string } | null;
  onLikeToggle?: (postId: string) => void;
  onBookmarkToggle?: (postId: string) => void;
  onShareClick?: (postId: string) => void;
  onImageClick?: (imgUrl: string) => void;
  onRequireLogin?: () => void;
  onEditPost?: (post: PostItem) => void;
  onDeletePost?: (postId: string) => void;
}

export const CommunityPostCard: React.FC<CommunityPostCardProps> = ({
  post,
  currentUser,
  onLikeToggle,
  onBookmarkToggle,
  onShareClick,
  onImageClick,
  onRequireLogin,
  onEditPost,
  onDeletePost,
}) => {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  // Inline comments state
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const isAuthor = Boolean(
    currentUser && ((post.author as any).id === currentUser.id || currentUser.name === post.author.name)
  );

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Delete this reply?')) return;
    const res = await deleteCommunityComment(commentId);
    if (res.success) {
      setComments((prev) => prev.filter((item) => item.id !== commentId));
      setCommentsCount((prev) => Math.max(0, prev - 1));
    }
  };


  const handleLike = () => {
    if (!currentUser) {
      onRequireLogin?.();
      return;
    }
    const next = !isLiked;
    setIsLiked(next);
    setLikesCount(next ? likesCount + 1 : Math.max(0, likesCount - 1));
    onLikeToggle?.(post.id);
  };

  const handleBookmark = () => {
    if (!currentUser) {
      onRequireLogin?.();
      return;
    }
    setIsBookmarked(!isBookmarked);
    onBookmarkToggle?.(post.id);
  };

  const handleToggleComments = async () => {
    const next = !showComments;
    setShowComments(next);
    if (next && comments.length === 0) {
      setLoadingComments(true);
      try {
        const loaded = await fetchPostComments(post.id);
        setComments(loaded);
      } catch {
        // ignore
      } finally {
        setLoadingComments(false);
      }
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onRequireLogin?.();
      return;
    }
    if (!newCommentText.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await addPostComment(post.id, newCommentText.trim());
      if (res.success && res.comment) {
        setComments((prev) => [...prev, res.comment!]);
        setCommentsCount((prev) => prev + 1);
        setNewCommentText('');
      }
    } catch {
      // ignore
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = () => {
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 2000);
    onShareClick?.(post.id);
  };

  const getBadgeIcon = (variant: string) => {
    switch (variant) {
      case 'help':
        return <AlertCircle className="w-3 h-3 text-[#15803D]" />;
      case 'expert':
        return <Award className="w-3 h-3 text-amber-700" />;
      case 'discussion':
      default:
        return <Sparkles className="w-3 h-3 text-sky-600" />;
    }
  };

  const getBadgeStyles = (variant: string) => {
    switch (variant) {
      case 'help':
        return 'bg-[#E8F5E9] text-[#15803D]';
      case 'expert':
        return 'bg-[#FEF3C7] text-amber-800';
      case 'discussion':
      default:
        return 'bg-[#E0F2FE] text-sky-700';
    }
  };

  const getRoleBadgeStyles = (role: string) => {
    if (role.includes('Verified')) {
      return 'bg-[#E8F5E9] text-[#15803D] font-bold';
    }
    if (role.includes('Student')) {
      return 'bg-[#E0F2FE] text-sky-700 font-semibold';
    }
    return 'bg-[#DCFCE7] text-[#15803D] font-bold';
  };

  return (
    <article className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] text-left relative transition-all hover:border-slate-300/80">
      {/* Author Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-slate-100 overflow-hidden border border-slate-200 shrink-0 flex items-center justify-center">
            {post.author.avatar ? (
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                {post.author.name ? post.author.name.charAt(0).toUpperCase() : 'F'}
              </div>
            )}
          </div>

          {/* Name, Role Badge, Location */}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs font-bold text-[#0F172A] leading-tight">
                {post.author.name}
              </h3>
              <span
                className={`text-[9.5px] px-2 py-0.5 rounded-full leading-none flex items-center gap-1 ${getRoleBadgeStyles(
                  post.author.role
                )}`}
              >
                {post.author.role.includes('Verified') && (
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                )}
                {post.author.role}
              </span>
            </div>

            <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
              {post.author.location && <span>{post.author.location} • </span>}
              <span>{post.author.timeAgo}</span>
            </div>
          </div>
        </div>

        {/* Top-Right Category Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 leading-none ${getBadgeStyles(
              post.categoryBadge.variant
            )}`}
          >
            {getBadgeIcon(post.categoryBadge.variant)}
            <span>{post.categoryBadge.text}</span>
          </span>

          {isAuthor && (
            <div className="flex items-center gap-1 border-r border-slate-200 pr-1.5 mr-0.5">
              <button
                type="button"
                onClick={() => onEditPost?.(post)}
                title="Edit your post"
                className="p-1 rounded-md text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this discussion?')) {
                    onDeletePost?.(post.id);
                  }
                }}
                title="Delete your post"
                className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleBookmark}
            title={isBookmarked ? 'Saved to bookmarks' : 'Save bookmark'}
            className={`p-1 rounded-md transition-colors cursor-pointer ${
              isBookmarked
                ? 'text-[#15803D] bg-emerald-50'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-[#15803D]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Post Title */}
      <h4 className="text-[13px] font-bold text-[#0F172A] leading-snug mt-3">
        {post.title}
      </h4>

      {/* Post Text */}
      <p className="text-[11.5px] text-slate-600 leading-relaxed mt-1">
        {post.content}
        {post.categoryBadge.variant === 'expert' && !isExpanded && (
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="text-[#15803D] hover:text-[#166534] font-semibold ml-1.5 inline cursor-pointer"
          >
            Read more
          </button>
        )}
      </p>

      {/* Expanded expert advice content */}
      {isExpanded && (
        <div className="mt-2 text-[11px] text-slate-600 bg-slate-50 rounded-xl p-3 border border-slate-100 leading-relaxed">
          <p className="font-semibold text-slate-800 mb-1">Key Preventive Steps:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Implement certified disease-free seed tubers with balanced potash.</li>
            <li>Maintain wide row spacing for optimal air circulation under canopies.</li>
            <li>Apply preventive bio-formulations prior to heavy rainfall events.</li>
          </ul>
        </div>
      )}

      {/* Images Gallery */}
      {post.images && post.images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mt-3 max-w-[420px]">
          {post.images.map((imgUrl, idx) => (
            <div
              key={idx}
              onClick={() => onImageClick?.(imgUrl)}
              className="aspect-[4/3] rounded-xl overflow-hidden border border-slate-100 bg-slate-50 cursor-pointer group shadow-2xs"
            >
              <img
                src={imgUrl}
                alt={`Post leaf attachment ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            </div>
          ))}
        </div>
      )}

      {/* Bottom Row: Crop Tag & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-2.5 border-t border-slate-100">
        {/* Crop Tag */}
        {post.cropTag ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-full text-[10.5px] font-semibold text-slate-700 transition-colors cursor-pointer select-none">
            <span>{post.cropTag.toLowerCase() === 'tomato' ? '🍅' : post.cropTag.toLowerCase() === 'maize' ? '🌽' : '🌱'}</span>
            <span>{post.cropTag}</span>
          </div>
        ) : (
          <div />
        )}

        {/* Action Buttons: Like, Comment, Share */}
        <div className="flex items-center gap-4 text-slate-500 text-xs">
          {/* Like */}
          <button
            type="button"
            onClick={handleLike}
            className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
              isLiked ? 'text-[#15803D] font-bold' : 'hover:text-[#15803D]'
            }`}
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-[#15803D]' : ''}`} />
            <span>{likesCount}</span>
          </button>

          {/* Comment Toggle */}
          <button
            type="button"
            onClick={handleToggleComments}
            className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
              showComments ? 'text-[#15803D] font-bold' : 'hover:text-[#15803D]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{commentsCount}</span>
          </button>

          {/* Share */}
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 hover:text-[#15803D] transition-colors cursor-pointer relative"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
            {showShareToast && (
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] px-2 py-0.5 rounded shadow-sm whitespace-nowrap">
                Link copied!
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Expandable Inline Comments Section */}
      {showComments && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5 animate-in fade-in duration-150">
          {/* Existing Comments List */}
          {loadingComments ? (
            <div className="text-center py-2 text-xs text-slate-400">Loading discussions...</div>
          ) : comments.length === 0 ? (
            <div className="text-center py-2 text-[11px] text-slate-400">
              No comments yet. Be the first to reply!
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {comments.map((c) => (
                <div key={c.id} className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100 text-left">
                  <div className="flex items-center justify-between text-[10.5px] mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{c.authorName}</span>
                      <span className="text-slate-400 text-[9.5px]">{c.authorRole}</span>
                    </div>
                    {currentUser && currentUser.name === c.authorName && (
                      <button
                        type="button"
                        onClick={() => handleDeleteComment(c.id)}
                        className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition-colors"
                        title="Delete your comment"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{c.content}</p>
                </div>
              ))}
            </div>
          )}

          {/* Comment Composer */}
          {currentUser ? (
            <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Write a reply or answer..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#15803D] focus:bg-white"
              />
              <button
                type="submit"
                disabled={submittingComment || !newCommentText.trim()}
                className="px-3 py-1.5 bg-[#15803D] hover:bg-[#166534] disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Send className="w-3 h-3" />
              </button>
            </form>
          ) : (
            <div className="text-center py-2 bg-emerald-50/50 rounded-xl border border-emerald-100">
              <p className="text-xs text-slate-600 mb-1.5">Sign in to join this discussion</p>
              <button
                type="button"
                onClick={onRequireLogin}
                className="px-3 py-1 bg-[#15803D] hover:bg-[#166534] text-white text-[11px] font-semibold rounded-lg cursor-pointer transition-colors shadow-2xs"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  );
};
