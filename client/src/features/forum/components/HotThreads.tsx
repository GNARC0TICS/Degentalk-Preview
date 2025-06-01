import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { ThreadCard } from '@/components/forum/thread-card';
import { ThreadTag } from '@shared/types';
import { Link } from 'wouter';
import { MessageSquare, Eye, ThumbsUp, ArrowRight, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ThreadResponse {
  thread_id: number;
  title: string;
  slug: string;
  post_count: number;
  view_count: number;
  hot_score: number;
  created_at: string;
  last_post_at: string;
  user_id: number;
  username: string;
  avatar_url: string;
  category_name: string;
  category_slug: string;
  like_count: number;
  // Add fields that are part of ThreadWithUserAndCategory but might be missing from this specific API response
  // We'll provide default/placeholder values in the mapping
  uuid?: string;
  isSticky?: boolean;
  isLocked?: boolean;
  isHidden?: boolean;
  isFeatured?: boolean;
  updated_at?: string; // Assuming API might return this as string
  isSolved?: boolean;
  solving_post_id?: number | null;
  tags?: ThreadTag[];
  prefix_id?: number | null; // Assuming prefix_id from API
}

interface HotThreadsProps {
  className?: string;
  limit?: number;
}

export function HotThreads({ className = '', limit = 5 }: HotThreadsProps) {
  const { data: threads, isLoading, error } = useQuery<ThreadResponse[]>({
    queryKey: ['/api/forum/hot-threads', { limit }],
    queryFn: async () => {
      const res = await fetch(`/api/forum/hot-threads?limit=${limit}`);
      if (!res.ok) throw new Error('Failed to fetch hot threads');
      return res.json();
    },
  });

  // Track which thread is being hovered for dynamic animations
  const [hoveredThreadId, setHoveredThreadId] = useState<number | null>(null);

  // Get the color based on hot score
  const getHotScoreColor = (score: number) => {
    if (score >= 100) return 'text-red-500';
    if (score >= 50) return 'text-orange-500';
    return 'text-yellow-500';
  };

  // Format relative time
  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return dateString;
    }
  };

  // Transform the API response to match what ThreadCard expects (ThreadWithUserAndCategory)
  const formattedThreads = threads?.map(thread => ({
    id: thread.thread_id,
    uuid: thread.uuid || `hot-thread-${thread.thread_id}`,
    title: thread.title,
    slug: thread.slug,
    categoryId: 0,
    userId: thread.user_id,
    prefixId: thread.prefix_id || null,
    isSticky: thread.isSticky || false,
    isLocked: thread.isLocked || false,
    isHidden: thread.isHidden || false,
    isFeatured: thread.isFeatured || false,
    viewCount: thread.view_count,
    postCount: thread.post_count,
    firstPostLikeCount: thread.like_count,
    lastPostAt: new Date(thread.last_post_at),
    createdAt: new Date(thread.created_at),
    updatedAt: new Date(thread.updated_at || thread.created_at),
    isSolved: thread.isSolved || false,
    solvingPostId: thread.solving_post_id || null,
    user: {
      id: thread.user_id,
      username: thread.username,
      avatarUrl: thread.avatar_url,
    },
    hotScore: thread.hot_score,
    category: {
      id: 0,
      name: thread.category_name,
      slug: thread.category_slug,
      description: null,
    },
    tags: thread.tags || [],
    prefix: undefined,
  })) || [];

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name?.substring(0, 2).toUpperCase() || 'UN';
  };

  return (
    <Card className={`bg-zinc-900/60 border border-zinc-800 shadow-md ${className}`}>
      <CardHeader className="pb-2 flex items-center gap-2">
        <div className="h-6 w-6 flex items-center justify-center">
          <DotLottieReact
            src="https://lottie.host/abeba818-d877-4e4d-8d8a-7f7f9099411c/6Pqbh2E87a.lottie"
            loop
            autoplay
            style={{ height: '32px', width: '32px' }}
          />
        </div>
        <CardTitle className="text-lg font-bold text-orange-300">Hot Threads</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-zinc-400">Loading...</div>
        ) : error ? (
          <div className="text-red-400">Failed to load hot threads.</div>
        ) : threads && threads.length > 0 ? (
          <div className="space-y-3">
            {threads.map(thread => (
              <Card 
                key={thread.thread_id} 
                className="bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-900/80 transition-all cursor-pointer relative overflow-hidden"
                onMouseEnter={() => setHoveredThreadId(thread.thread_id)}
                onMouseLeave={() => setHoveredThreadId(null)}
              >
                {/* Animated flame icon for hovered thread with high score */}
                {hoveredThreadId === thread.thread_id && thread.hot_score > 50 && (
                  <div className="absolute -right-2 -top-2 opacity-30 pointer-events-none">
                    <DotLottieReact
                      src="https://lottie.host/abeba818-d877-4e4d-8d8a-7f7f9099411c/6Pqbh2E87a.lottie"
                      loop
                      autoplay
                      style={{ height: '64px', width: '64px' }}
                    />
                  </div>
                )}
                
                <Link href={`/threads/${thread.thread_id}`}>
                  <div className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="bg-zinc-800 text-orange-400 border-orange-800/30">
                        Hot 🔥
                      </Badge>
                      <span className={`font-medium ${getHotScoreColor(thread.hot_score)}`}>
                        {thread.hot_score} points
                      </span>
                    </div>
                    
                    <h3 className="font-medium text-zinc-100 line-clamp-2 mb-2 hover:text-orange-300 transition-colors">
                      {thread.title}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-xs text-zinc-400 mb-3">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={thread.avatar_url} alt={thread.username} />
                        <AvatarFallback className="text-[10px] bg-zinc-800">
                          {getInitials(thread.username)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-zinc-300">{thread.username}</span>
                      <span>•</span>
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTimeAgo(thread.last_post_at)}
                      </span>
                      <span>•</span>
                      <Link href={`/forums/${thread.category_slug}`}>
                        <span className="text-zinc-300 hover:text-orange-300 transition-colors">
                          {thread.category_name}
                        </span>
                      </Link>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-zinc-400">
                          <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />
                          <span>{thread.post_count} replies</span>
                        </div>
                        <div className="flex items-center gap-1 text-zinc-400">
                          <Eye className="h-3.5 w-3.5 text-emerald-500" />
                          <span>{thread.view_count} views</span>
                        </div>
                        <div className="flex items-center gap-1 text-zinc-400">
                          <ThumbsUp className="h-3.5 w-3.5 text-emerald-500" />
                          <span>{thread.like_count} likes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-zinc-400">No hot threads right now.</div>
        )}
        
        <div className="mt-4 text-center">
          <Link href="/hot-threads">
            <Badge className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-100 border-zinc-700 px-3 py-1.5 cursor-pointer transition-colors">
              View More Hot Threads
              <ArrowRight className="ml-2 h-4 w-4" />
            </Badge>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default HotThreads;
