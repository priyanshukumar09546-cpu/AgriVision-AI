/**
 * AgriVision AI Real Community Service
 * Persists discussions, likes, comments, and bookmarks to backend database.
 * No fake users or mock discussions.
 */

import { getStoredAuthUser } from './authService';
import { buildApiUrl, getAuthToken } from './apiClient';

export interface PostAuthor {
  id: string;
  name: string;
  role: string;
  avatar: string;
  location?: string;
  timeAgo: string;
}

export interface PostComment {
  id: string;
  authorName: string;
  authorRole: string;
  content: string;
  createdAt: string;
}

export interface RealPostItem {
  id: string;
  author: PostAuthor;
  title: string;
  content: string;
  images?: string[];
  cropTag?: string;
  categoryBadge: {
    text: string;
    variant: 'help' | 'discussion' | 'expert';
  };
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  createdAt?: string;
}

export interface CommunityFilterOptions {
  tab?: 'all' | 'my_posts' | 'bookmarked';
  crop?: string;
  category?: string;
  search?: string;
}

export async function fetchCommunityPosts(
  filters: CommunityFilterOptions = {}
): Promise<RealPostItem[]> {
  const currentUser = getStoredAuthUser();
  const params = new URLSearchParams();

  if (currentUser?.id) {
    params.append('currentUserId', currentUser.id);
  }
  if (filters.tab) {
    params.append('tab', filters.tab);
  }
  if (filters.crop && filters.crop !== 'all') {
    params.append('crop', filters.crop);
  }
  if (filters.category && filters.category !== 'all') {
    params.append('category', filters.category);
  }
  if (filters.search && filters.search.trim()) {
    params.append('search', filters.search.trim());
  }

  try {
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(buildApiUrl(`/api/community/posts?${params.toString()}`), { headers });
    if (!res.ok) return [];
    const data = await res.json();
    return data.posts || [];
  } catch (err) {
    console.error('Failed to fetch community posts:', err);
    return [];
  }
}

export async function createCommunityPost(formData: {
  title: string;
  content: string;
  cropTag?: string;
  category?: string;
  file?: File | null;
}): Promise<{ success: boolean; postId?: string; error?: string }> {
  const currentUser = getStoredAuthUser();
  if (!currentUser) {
    return {
      success: false,
      error: 'You must be signed in to publish a community discussion.',
    };
  }

  const fd = new FormData();
  fd.append('title', formData.title.trim());
  fd.append('content', formData.content.trim());
  fd.append('cropTag', formData.cropTag || '');
  fd.append('category', formData.category || 'discussion');
  fd.append('userId', currentUser.id);
  fd.append('authorName', currentUser.name);
  fd.append('authorRole', currentUser.role ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1) : 'Farmer');

  if (formData.file) {
    fd.append('file', formData.file);
  }

  try {
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(buildApiUrl('/api/community/posts'), {
      method: 'POST',
      headers,
      body: fd,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.error || 'Failed to publish discussion.' };
    }
    const data = await res.json();
    return { success: true, postId: data.postId };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to publish discussion.' };
  }
}

export async function toggleLikePost(
  postId: string
): Promise<{ success: boolean; isLiked: boolean; likesCount: number }> {
  const currentUser = getStoredAuthUser();
  if (!currentUser) {
    throw new Error('Please sign in to like discussions.');
  }

  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(
    buildApiUrl(`/api/community/posts/${encodeURIComponent(postId)}/like?userId=${encodeURIComponent(currentUser.id)}`),
    { method: 'POST', headers }
  );

  if (!res.ok) {
    throw new Error('Failed to update like status.');
  }

  const data = await res.json();
  return {
    success: true,
    isLiked: data.isLiked,
    likesCount: data.likesCount,
  };
}

export async function toggleBookmarkPost(
  postId: string
): Promise<{ success: boolean; isBookmarked: boolean }> {
  const currentUser = getStoredAuthUser();
  if (!currentUser) {
    throw new Error('Please sign in to save bookmarks.');
  }

  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(
    buildApiUrl(`/api/community/posts/${encodeURIComponent(postId)}/bookmark?userId=${encodeURIComponent(currentUser.id)}`),
    { method: 'POST', headers }
  );

  if (!res.ok) {
    throw new Error('Failed to update bookmark status.');
  }

  const data = await res.json();
  return {
    success: true,
    isBookmarked: data.isBookmarked,
  };
}

export async function addPostComment(
  postId: string,
  content: string
): Promise<{ success: boolean; comment?: PostComment; commentsCount?: number; error?: string }> {
  const currentUser = getStoredAuthUser();
  if (!currentUser) {
    return { success: false, error: 'Please sign in to post comments.' };
  }

  try {
    const token = getAuthToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(buildApiUrl(`/api/community/posts/${encodeURIComponent(postId)}/comment`), {
      method: 'POST',
      headers,
      body: JSON.stringify({
        content: content.trim(),
        user_id: currentUser.id,
        author_name: currentUser.name,
        author_role: currentUser.role ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1) : 'Farmer',
      }),
    });

    if (!res.ok) {
      return { success: false, error: 'Failed to submit comment.' };
    }

    const data = await res.json();
    return {
      success: true,
      comment: data.comment,
      commentsCount: data.commentsCount,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to submit comment.' };
  }
}

export async function fetchPostComments(postId: string): Promise<PostComment[]> {
  try {
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(buildApiUrl(`/api/community/posts/${encodeURIComponent(postId)}/comments`), { headers });
    if (!res.ok) return [];
    const data = await res.json();
    return data.comments || [];
  } catch (e) {
    console.error('Failed to fetch comments:', e);
    return [];
  }
}

export async function updateCommunityPost(
  postId: string,
  formData: { title: string; content: string; cropTag?: string; category?: string }
): Promise<{ success: boolean; error?: string }> {
  const currentUser = getStoredAuthUser();
  if (!currentUser) {
    return { success: false, error: 'You must be signed in to edit this post.' };
  }

  try {
    const token = getAuthToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(buildApiUrl(`/api/community/posts/${encodeURIComponent(postId)}`), {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        userId: currentUser.id,
        title: formData.title.trim(),
        content: formData.content.trim(),
        cropTag: formData.cropTag || '',
        category: formData.category || 'discussion',
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.error || 'Failed to update post.' };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update post.' };
  }
}

export async function deleteCommunityPost(
  postId: string
): Promise<{ success: boolean; error?: string }> {
  const currentUser = getStoredAuthUser();
  if (!currentUser) {
    return { success: false, error: 'You must be signed in to delete this post.' };
  }

  try {
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(
      buildApiUrl(`/api/community/posts/${encodeURIComponent(postId)}?userId=${encodeURIComponent(currentUser.id)}`),
      { method: 'DELETE', headers }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.error || 'Failed to delete post.' };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete post.' };
  }
}

export async function deleteCommunityComment(
  commentId: string
): Promise<{ success: boolean; commentsCount?: number; error?: string }> {
  const currentUser = getStoredAuthUser();
  if (!currentUser) {
    return { success: false, error: 'You must be signed in to delete this comment.' };
  }

  try {
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(
      buildApiUrl(`/api/community/comments/${encodeURIComponent(commentId)}?userId=${encodeURIComponent(currentUser.id)}`),
      { method: 'DELETE', headers }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.error || 'Failed to delete comment.' };
    }
    const data = await res.json();
    return { success: true, commentsCount: data.commentsCount };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete comment.' };
  }
}
