import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '../components/Navbar';
import { CommunityHero } from '../components/community/CommunityHero';
import { CommunityLeftSidebar } from '../components/community/CommunityLeftSidebar';
import { CommunityCreatePost } from '../components/community/CommunityCreatePost';
import { CommunityFilterTabs } from '../components/community/CommunityFilterTabs';
import type { CommunityTab } from '../components/community/CommunityFilterTabs';
import { CommunityPostCard } from '../components/community/CommunityPostCard';
import { CommunityRightSidebar } from '../components/community/CommunityRightSidebar';
import { CommunityModal } from '../components/community/CommunityModal';
import type { ModalData } from '../components/community/CommunityModal';
import { MessageSquare, Plus, Loader2 } from 'lucide-react';
import {
  fetchCommunityPosts,
  createCommunityPost,
  toggleLikePost,
  toggleBookmarkPost,
  updateCommunityPost,
  deleteCommunityPost,
} from '../services/communityService';
import type { RealPostItem } from '../services/communityService';
import { getStoredAuthUser } from '../services/authService';
import type { User } from '../services/authService';

interface CommunityPageProps {
  onRouteChange?: (route: string) => void;
}

export const CommunityPage: React.FC<CommunityPageProps> = ({ onRouteChange }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<RealPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<CommunityTab>('latest');
  const [activeMenu, setActiveMenu] = useState('home');
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [modalData, setModalData] = useState<ModalData | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const loadCurrentUser = () => {
    const user = getStoredAuthUser();
    setCurrentUser(user);
  };

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      let tabFilter: 'all' | 'my_posts' | 'bookmarked' = 'all';
      if (activeMenu === 'my-posts') tabFilter = 'my_posts';
      if (activeMenu === 'bookmarks') tabFilter = 'bookmarked';

      const data = await fetchCommunityPosts({
        tab: tabFilter,
        crop: activeTopic || undefined,
      });
      setPosts(data);
    } catch (err) {
      console.error('Failed to load community discussions:', err);
    } finally {
      setLoading(false);
    }
  }, [activeMenu, activeTopic]);

  useEffect(() => {
    loadCurrentUser();
    loadPosts();
  }, [loadPosts]);

  // Filter posts based on active tab
  const getFilteredPosts = () => {
    switch (activeTab) {
      case 'expert':
        return posts.filter((p) => p.categoryBadge.variant === 'expert');
      case 'unanswered':
        return posts.filter((p) => p.commentsCount === 0);
      case 'trending':
        return [...posts].sort((a, b) => b.likesCount - a.likesCount);
      case 'success':
        return posts.filter(
          (p) =>
            p.title.toLowerCase().includes('fertilizer') ||
            p.title.toLowerCase().includes('prevent') ||
            p.title.toLowerCase().includes('yield') ||
            p.title.toLowerCase().includes('success')
        );
      case 'latest':
      default:
        return posts;
    }
  };

  const handleRequireLogin = () => {
    if (onRouteChange) {
      onRouteChange('/login');
    } else {
      window.location.href = '/login';
    }
  };

  const handleCreatePost = async (text: string) => {
    if (!currentUser) {
      handleRequireLogin();
      return;
    }

    const title = text.length > 60 ? `${text.slice(0, 60)}...` : text;
    const res = await createCommunityPost({
      title,
      content: text,
      cropTag: activeTopic || 'General',
      category: 'discussion',
    });

    if (res.success) {
      showNotification('Discussion published to community!');
      await loadPosts();
    } else {
      showNotification(res.error || 'Failed to publish discussion.');
    }
  };

  const handleModalSubmitPost = async (title: string, content: string, cropTag?: string) => {
    if (!currentUser) {
      handleRequireLogin();
      return;
    }

    const res = await createCommunityPost({
      title,
      content,
      cropTag: cropTag || 'Tomato',
      category: 'help',
    });

    if (res.success) {
      showNotification('Discussion created successfully!');
      await loadPosts();
    } else {
      showNotification(res.error || 'Failed to create discussion.');
    }
  };

  const handleModalUpdatePost = async (postId: string, title: string, content: string, cropTag?: string) => {
    if (!currentUser) {
      handleRequireLogin();
      return;
    }

    const res = await updateCommunityPost(postId, {
      title,
      content,
      cropTag: cropTag || 'Tomato',
    });

    if (res.success) {
      showNotification('Discussion updated successfully!');
      await loadPosts();
    } else {
      showNotification(res.error || 'Failed to update discussion.');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!currentUser) {
      handleRequireLogin();
      return;
    }

    const res = await deleteCommunityPost(postId);
    if (res.success) {
      showNotification('Discussion deleted successfully.');
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } else {
      showNotification(res.error || 'Failed to delete discussion.');
    }
  };

  const handleEditPost = (post: any) => {
    setModalData({
      type: 'edit-post',
      postId: post.id,
      title: post.title,
      content: post.content,
      cropTag: post.cropTag,
    });
  };

  const handleLikeToggle = async (postId: string) => {
    if (!currentUser) {
      handleRequireLogin();
      return;
    }
    try {
      await toggleLikePost(postId);
    } catch (err: any) {
      showNotification(err.message || 'Unable to update like.');
    }
  };

  const handleBookmarkToggle = async (postId: string) => {
    if (!currentUser) {
      handleRequireLogin();
      return;
    }
    try {
      const res = await toggleBookmarkPost(postId);
      showNotification(res.isBookmarked ? 'Saved to bookmarks' : 'Removed from bookmarks');
    } catch (err: any) {
      showNotification(err.message || 'Unable to update bookmark.');
    }
  };

  const filteredPosts = getFilteredPosts();

  return (
    <div className="min-h-screen bg-[#FAFDFB] font-sans antialiased text-[#0F172A] selection:bg-[#DCFCE7] selection:text-[#15803D]">
      {/* 1. Global Navbar with Community active */}
      <Navbar activeRoute="/community" onRouteChange={onRouteChange} />

      {/* Floating Notification */}
      {notification && (
        <div className="fixed top-16 right-6 z-50 bg-[#0F172A] text-white text-xs px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 animate-in fade-in">
          {notification}
        </div>
      )}

      {/* 2. Panoramic Community Hero Section */}
      <CommunityHero
        onNewPostClick={() => {
          if (!currentUser) {
            handleRequireLogin();
          } else {
            setModalData({ type: 'new-post' });
          }
        }}
      />

      {/* 3. Main 3-Column Community Layout */}
      <main className="max-w-[1240px] mx-auto px-6 py-6 md:py-8">
        <div className="flex flex-col lg:flex-row items-start gap-5">
          {/* Left Column (19% width) */}
          <div className="w-full lg:w-[19%] shrink-0">
            <CommunityLeftSidebar
              activeMenu={activeMenu}
              onSelectMenu={(menu) => setActiveMenu(menu)}
              activeTopic={activeTopic}
              onSelectTopic={(topicId) => setActiveTopic(topicId === activeTopic ? null : topicId)}
              onIntroduceClick={() => setModalData({ type: 'introduce' })}
            />
          </div>

          {/* Center Column (53% width) */}
          <div className="w-full lg:w-[53%] flex-1 space-y-4">
            {/* Create Post Composer */}
            <CommunityCreatePost
              currentUser={currentUser}
              onPostSubmit={handleCreatePost}
              onRequireLogin={handleRequireLogin}
              onOpenPhotoModal={() => setModalData({ type: 'new-post' })}
              onOpenPollModal={() => setModalData({ type: 'new-post' })}
              onOpenCropTagModal={() => setModalData({ type: 'new-post' })}
              onOpenLocationModal={() => setModalData({ type: 'new-post' })}
            />

            {/* Horizontal Filter Tabs */}
            <CommunityFilterTabs
              activeTab={activeTab}
              onTabChange={(tab) => setActiveTab(tab)}
            />

            {/* Posts List / Loading / Honest Empty State */}
            {loading ? (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center shadow-xs">
                <Loader2 className="w-7 h-7 text-[#15803D] animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-500">Loading community discussions...</p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center shadow-xs">
                <div className="w-14 h-14 mx-auto mb-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#15803D]">
                  <MessageSquare className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">No discussions yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
                  Be the first to share something. Ask a question, share crop observations, or post farming advice!
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (!currentUser) {
                      handleRequireLogin();
                    } else {
                      setModalData({ type: 'new-post' });
                    }
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#15803D] hover:bg-[#166534] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Start Discussion</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredPosts.map((post) => (
                  <CommunityPostCard
                    key={post.id}
                    post={post as any}
                    currentUser={currentUser}
                    onLikeToggle={handleLikeToggle}
                    onBookmarkToggle={handleBookmarkToggle}
                    onEditPost={handleEditPost}
                    onDeletePost={handleDeletePost}
                    onRequireLogin={handleRequireLogin}
                    onImageClick={(imgUrl) =>
                      setModalData({
                        type: 'photo-preview',
                        imageSrc: imgUrl,
                      })
                    }
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Column (28% width) */}
          <div className="w-full lg:w-[28%] shrink-0">
            <CommunityRightSidebar
              onRegisterEvent={() => showNotification('Registered for webinar!')}
              onJoinMovementClick={() => setModalData({ type: 'join-movement' })}
              onSeeAllStats={() => {}}
              onViewAllEvents={() => {}}
            />
          </div>
        </div>
      </main>

      {/* Interactive Modal Dialog */}
      <CommunityModal
        modalData={modalData}
        currentUser={currentUser}
        onClose={() => setModalData(null)}
        onSubmitPost={handleModalSubmitPost}
        onUpdatePost={handleModalUpdatePost}
        onRequireLogin={handleRequireLogin}
      />
    </div>
  );
};
