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
import type { Thread } from '@shared/types/thread.types';
import type { PostId, ThreadId } from '@shared/types/ids';
import { toPostId } from '@shared/utils/id';

interface Post {
  id: PostId;
  content: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  user: {
    id: string;
    username: string;
    avatarUrl?: string;
    reputation?: number;
    forumStats?: {
      level: number;
      totalPosts: number;
    };
  };
  likes: number;
  hasLiked?: boolean;
  tips: number;
}

interface ThreadDetail extends Thread {
  posts: Post[];
  firstPost: Post;
}

export default function ThreadDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useCanonicalAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  // Fetch posts
  const { data: postsData } = useQuery({
    queryKey: ['posts', thread?.id],
    queryFn: async () => {
      if (!thread?.id) return null;
      const response = await apiRequest<{ posts: Post[]; total: number }>({
        url: `/api/forum/posts/${thread.firstPost.id}/replies`,
        method: 'GET'
      });
      return response;
    },
    enabled: !!thread?.id
  });

  // Like post mutation
  const likeMutation = useMutation({
    mutationFn: async (postId: PostId) => {
      return apiRequest({
        url: `/api/forum/posts/${postId}/react`,
        method: 'POST',
        data: { reaction: 'like' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['thread', slug] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    }
  });

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

  const allPosts = [thread.firstPost, ...(postsData?.posts || [])];

  return (
    <Container className="py-8">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-zinc-400 mb-6">
        <Link to="/forums" className="hover:text-white">Forums</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to={`/forums/${thread.forumSlug}`} className="hover:text-white">
          {thread.forumName}
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
        {allPosts.map((post, index) => (
          <Card key={post.id} className="bg-zinc-900/50 border-zinc-800">
            <div className="p-6">
              {/* Post Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarImage src={post.user.avatarUrl} />
                    <AvatarFallback className="bg-zinc-800">
                      {post.user.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-white">{post.user.username}</div>
                    <div className="text-sm text-zinc-400">
                      {post.user.forumStats && (
                        <span>Level {post.user.forumStats.level} • </span>
                      )}
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                </div>
                {index === 0 && (
                  <Badge variant="outline" className="text-zinc-400">
                    Original Post
                  </Badge>
                )}
              </div>

              {/* Post Content */}
              <div 
                className="prose prose-invert max-w-none mb-4"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Post Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-zinc-800">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => likeMutation.mutate(post.id)}
                  className={cn(
                    "text-zinc-400 hover:text-red-400",
                    post.hasLiked && "text-red-400"
                  )}
                >
                  <Heart className={cn("w-4 h-4 mr-1", post.hasLiked && "fill-current")} />
                  {post.likes || 0}
                </Button>
                
                {!thread.isLocked && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-zinc-400 hover:text-blue-400"
                  >
                    <Reply className="w-4 h-4 mr-1" />
                    Reply
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-zinc-400 hover:text-emerald-400"
                >
                  <Zap className="w-4 h-4 mr-1" />
                  Tip
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Reply Box */}
      {!thread.isLocked && user && (
        <Card className="bg-zinc-900/50 border-zinc-800 mt-6">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Reply to Thread</h3>
            <div className="text-center py-8 text-zinc-400">
              Reply functionality coming soon...
            </div>
          </div>
        </Card>
      )}
    </Container>
  );
}