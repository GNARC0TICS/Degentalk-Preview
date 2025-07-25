import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { 
  MessageSquare, 
  Eye, 
  Clock, 
  ChevronRight,
  Reply,
  Heart,
  Zap,
  Share2,
  Flag,
  Edit,
  Trash,
  Lock,
  CheckCircle
} from 'lucide-react';

import { apiRequest } from '@app/utils/queryClient';
import { Container } from '@app/layout/primitives';
import { Button } from '@app/components/ui/button';
import { Card } from '@app/components/ui/card';
import { Badge } from '@app/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@app/components/ui/avatar';
import { Separator } from '@app/components/ui/separator';
import { useToast } from '@app/hooks/use-toast';
import { useCanonicalAuth } from '@app/features/auth/useCanonicalAuth';
import { cn } from '@app/utils/utils';
import type { PostId, ThreadId } from '@shared/types/ids';
import { toPostId } from '@shared/utils/id';
import PostCard from '@app/features/forum/components/PostCard';
import { forumApi } from '@app/features/forum/services/forumApi';
import ReplyForm from '@app/features/forum/components/ReplyForm';
import { EditPostDialog } from '@app/features/forum/components/EditPostDialog';
import { useDeletePost } from '@app/features/forum/hooks/useForumQueries';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@app/components/ui/alert-dialog';
import type { PostWithUser } from '@app/types/compat/forum';


interface ThreadDetail {
  id: ThreadId;
  title: string;
  slug: string;
  content?: string;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  postCount: number;
  isSticky: boolean;
  isLocked: boolean;
  isSolved: boolean;
  user: {
    id: string;
    username: string;
    avatarUrl?: string;
    role: string;
  };
  forum?: {
    name: string;
    slug: string;
  };
  category?: {
    name: string;
    slug: string;
  };
  tags?: Array<{ id: string; name: string }>;
  permissions?: {
    canEdit: boolean;
    canDelete: boolean;
    canReply: boolean;
  };
}

export default function ThreadDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useCanonicalAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Edit/Delete state
  const [editingPost, setEditingPost] = useState<PostWithUser | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<PostId | null>(null);
  const deletePost = useDeletePost();

  // Fetch thread data
  const { data: thread, isLoading, error } = useQuery<ThreadDetail>({
    queryKey: ['thread', slug],
    queryFn: async () => {
      const response = await apiRequest<ThreadDetail>({
        url: `/api/forum/threads/slug/${slug}`,
        method: 'GET'
      });
      return response;
    }
  });

  // Fetch posts for this thread
  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['posts', thread?.id],
    queryFn: async () => {
      if (!thread?.id) return null;
      return forumApi.getPosts(thread.id);
    },
    enabled: !!thread?.id
  });

  // Handle post creation
  const handleReplySubmit = async (content: string) => {
    if (!thread?.id) return;
    await forumApi.createPost({
      threadId: thread.id,
      content
    });
    queryClient.invalidateQueries({ queryKey: ['posts', thread.id] });
  };

  // Handle post edit
  const handleEditPost = (postId: PostId) => {
    const post = postsData?.posts?.find(p => p.id === postId);
    if (post) {
      setEditingPost(post);
    }
  };

  // Handle post delete
  const handleDeletePost = (postId: PostId) => {
    setDeletingPostId(postId);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!deletingPostId) return;
    
    try {
      await deletePost.mutateAsync(deletingPostId);
      queryClient.invalidateQueries({ queryKey: ['posts', thread?.id] });
      setDeletingPostId(null);
    } catch (error) {
      // Error is already handled by the mutation
    }
  };

  // Check if user can edit/delete post
  const canEditPost = (post: PostWithUser): boolean => {
    if (!user) return false;
    // User can edit their own posts
    if (post.user.id === user.id) return true;
    // Moderators/admins can edit any post
    if (user.role === 'admin' || user.role === 'moderator') return true;
    return false;
  };

  if (isLoading) {
    return (
      <Container className="py-8">
        <Card className="bg-zinc-900/50 animate-pulse">
          <div className="p-6 space-y-4">
            <div className="h-8 bg-zinc-800 rounded w-3/4" />
            <div className="h-4 bg-zinc-800 rounded w-1/2" />
            <div className="h-32 bg-zinc-800 rounded" />
          </div>
        </Card>
      </Container>
    );
  }

  if (error || !thread) {
    return (
      <Container className="py-8">
        <Card className="bg-zinc-900/50 border-red-900/50">
          <div className="p-6 text-center">
            <h2 className="text-xl font-bold text-red-400 mb-2">Thread Not Found</h2>
            <p className="text-zinc-400 mb-4">This thread doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/forums')}>Back to Forums</Button>
          </div>
        </Card>
      </Container>
    );
  }

  // Get forum info
  const forumSlug = thread?.forum?.slug || thread?.category?.slug || 'forums';
  const forumName = thread?.forum?.name || thread?.category?.name || 'Forums';

  return (
    <Container className="py-8">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-zinc-400 mb-6">
        <Link to="/forums" className="hover:text-white">Forums</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to={`/forums/${forumSlug}`} className="hover:text-white">
          {forumName}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-zinc-200">{thread.title}</span>
      </div>

      {/* Thread Header */}
      <Card className="bg-zinc-900/50 border-zinc-800 mb-6">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {thread.isSticky && (
                  <Badge className="bg-cyan-900/60 text-cyan-300">Pinned</Badge>
                )}
                {thread.isLocked && (
                  <Badge className="bg-red-900/60 text-red-300">
                    <Lock className="w-3 h-3 mr-1" />
                    Locked
                  </Badge>
                )}
                {thread.isSolved && (
                  <Badge className="bg-emerald-900/60 text-emerald-300">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Solved
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">{thread.title}</h1>
              <div className="flex items-center gap-4 text-sm text-zinc-400">
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>{thread.postCount} replies</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{thread.viewCount} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>Created {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}</span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast({
                  title: 'Link copied!',
                  description: 'Thread link copied to clipboard'
                });
              }}
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Tags */}
          {thread.tags && thread.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {thread.tags.map(tag => (
                <Badge key={tag.id} variant="secondary" className="bg-zinc-800/50">
                  #{tag.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Posts */}
      <div className="space-y-4">
        {postsLoading ? (
          <Card className="bg-zinc-900/50 border-zinc-800">
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-zinc-800 rounded w-3/4" />
                <div className="h-4 bg-zinc-800 rounded w-1/2" />
                <div className="h-20 bg-zinc-800 rounded" />
              </div>
            </div>
          </Card>
        ) : postsData?.posts && postsData.posts.length > 0 ? (
          postsData.posts.map((post, index) => (
            <PostCard
              key={post.id}
              post={post}
              isEditable={canEditPost(post)}
              isFirst={index === 0}
              onEdit={handleEditPost}
              onDelete={handleDeletePost}
              onLike={(postId, hasLiked) => {
                // TODO: Implement like functionality
                toast({
                  title: 'Coming soon',
                  description: 'Like functionality will be implemented soon'
                });
              }}
              onReply={(postId) => {
                // TODO: Implement reply quote functionality
                toast({
                  title: 'Coming soon',
                  description: 'Reply quote functionality will be implemented soon'
                });
              }}
              onReport={(postId) => {
                // TODO: Implement report functionality
                toast({
                  title: 'Coming soon', 
                  description: 'Report functionality will be implemented soon'
                });
              }}
            />
          ))
        ) : (
          <Card className="bg-zinc-900/50 border-zinc-800">
            <div className="p-6 text-center text-zinc-400">
              No posts yet. Be the first to contribute!
            </div>
          </Card>
        )}
      </div>

      {/* Reply Box */}
      {!thread.isLocked && user && (
        <div className="mt-6">
          <ReplyForm
            threadId={thread.id}
            onSubmit={handleReplySubmit}
          />
        </div>
      )}

      {/* Edit Post Dialog */}
      <EditPostDialog
        post={editingPost}
        isOpen={!!editingPost}
        onClose={() => {
          setEditingPost(null);
          queryClient.invalidateQueries({ queryKey: ['posts', thread.id] });
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingPostId} onOpenChange={(open) => !open && setDeletingPostId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the post.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Container>
  );
}