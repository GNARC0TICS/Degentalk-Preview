import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format, formatDistanceToNow } from 'date-fns';
import { MessageSquare, Eye, ThumbsUp, TrendingUp, ArrowRight } from 'lucide-react';
import { getInitials } from '@/lib/utils';

export type HotThread = {
  thread_id: number;
  title: string;
  slug: string;
  post_count: number;
  view_count: number;
  like_count: number;
  hot_score: number;
  created_at: string;
  last_post_at: string;
  user_id: number;
  username: string;
  avatar_url?: string;
  category_name: string;
  category_slug: string;
};

interface HotThreadsListProps {
  limit?: number;
  showViewMore?: boolean;
  showHeader?: boolean;
  className?: string;
}

export function HotThreadsList({ 
  limit = 5, 
  showViewMore = true, 
  showHeader = true,
  className = ''
}: HotThreadsListProps) {
  const { data: hotThreads, isLoading, error } = useQuery<HotThread[]>({
    queryKey: ['/api/forum/hot-threads', limit],
    queryFn: async () => {
      const response = await fetch(`/api/forum/hot-threads?limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch hot threads');
      }
      return response.json();
    }
  });

  const getHotScoreColor = (score: number) => {
    if (score >= 100) return 'text-red-500';
    if (score >= 50) return 'text-orange-500';
    return 'text-yellow-500';
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        {showHeader && (
          <CardHeader>
            <CardTitle>Hot Threads</CardTitle>
            <CardDescription>Trending discussions with the most activity</CardDescription>
          </CardHeader>
        )}
        <CardContent>
          {Array.from({ length: limit }).map((_, index) => (
            <div key={index} className="p-3 border-b border-border last:border-0">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <div className="flex items-center gap-4 mt-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        {showHeader && (
          <CardHeader>
            <CardTitle>Hot Threads</CardTitle>
            <CardDescription>Trending discussions with the most activity</CardDescription>
          </CardHeader>
        )}
        <CardContent>
          <div className="p-4 text-center text-muted-foreground">
            Failed to load hot threads. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hotThreads || hotThreads.length === 0) {
    return (
      <Card className={className}>
        {showHeader && (
          <CardHeader>
            <CardTitle>Hot Threads</CardTitle>
            <CardDescription>Trending discussions with the most activity</CardDescription>
          </CardHeader>
        )}
        <CardContent>
          <div className="p-4 text-center text-muted-foreground">
            No hot threads found. Start a discussion to see it here!
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader>
          <CardTitle>Hot Threads</CardTitle>
          <CardDescription>Trending discussions with the most activity</CardDescription>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {hotThreads.map((thread) => (
            <Card key={thread.thread_id} className="bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-900/60 transition-all cursor-pointer h-full flex flex-col">
              <CardHeader className="p-4 pb-2 space-y-1">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="bg-zinc-800 text-emerald-400 border-emerald-800">Hot</Badge>
                  <TrendingUp className={`h-4 w-4 ${getHotScoreColor(thread.hot_score)}`} />
                </div>
                <CardTitle className="text-base line-clamp-2 text-zinc-100">{thread.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <div className="flex items-center gap-1">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={thread.avatar_url || ''} alt={thread.username} />
                      <AvatarFallback className="text-[10px]">
                        {getInitials(thread.username)}
                      </AvatarFallback>
                    </Avatar>
                    <Link 
                      href={`/user/${thread.user_id}`}
                      className="hover:underline text-zinc-100"
                    >
                      {thread.username}
                    </Link>
                  </div>
                  <span>•</span>
                  <Link href={`/forums/${thread.category_slug}`}>
                    <Badge variant="outline" className="px-2 py-0 h-5 bg-zinc-800 text-zinc-300 border-zinc-700">
                      {thread.category_name}
                    </Badge>
                  </Link>
                  <span>•</span>
                  <span>Last active {formatTimeAgo(thread.last_post_at)}</span>
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-zinc-400">
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />
                    <span>{thread.post_count} replies</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5 text-emerald-500" />
                    <span>{thread.view_count} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="h-3.5 w-3.5 text-emerald-500" />
                    <span>{thread.like_count} likes</span>
                  </div>
                  <div className="flex items-center gap-1 ml-auto">
                    <span className={`font-medium ${getHotScoreColor(thread.hot_score)}`}>
                      {thread.hot_score} 🔥
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
      {showViewMore && (
        <CardFooter className="border-t border-zinc-800 px-4 py-3">
          <Link href="/hot-threads">
            <Button variant="outline" className="w-full bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700 hover:text-zinc-100">
              View More Hot Threads
              <ArrowRight className="ml-2 h-4 w-4 text-zinc-300" />
            </Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}