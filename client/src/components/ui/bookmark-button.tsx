// Inspired by Voicu Apostol, https://x.com/cerpow/status/1902002944435683613
// Pen by Konstantin Denerz: https://codepen.io/konstantindenerz/pen/GgRxXdg
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface BookmarkButtonProps {
  threadId: number;
  hasBookmarked: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function BookmarkButton({ 
  threadId, 
  hasBookmarked,
  size = 'md'
}: BookmarkButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [active, setActive] = useState(hasBookmarked);
  const [animating, setAnimating] = useState(false);

  const mutation = useMutation({
    mutationFn: async (next: boolean) => {
      if (next) {
        return await apiRequest({
          url: `/api/bookmarks`,
          method: 'POST',
          data: { threadId }
        });
      } else {
        return await apiRequest({
          url: `/api/bookmarks/${threadId}`,
          method: 'DELETE'
        });
      }
    },
    onMutate: async (next) => {
      setActive(next);
      setAnimating(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threads'] });
      setTimeout(() => setAnimating(false), 400);
    },
    onError: (error) => {
      setActive((prev) => !prev);
      setAnimating(false);
      const errorMessage = error instanceof Error 
        ? error.message
        : 'Failed to update bookmark';
      
      toast({ 
        title: 'Action Failed', 
        description: errorMessage, 
        variant: 'destructive' 
      });
    },
  });

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ 
        title: 'Login Required', 
        description: 'Please sign in to bookmark threads', 
        variant: 'default',
        action: <a href="/login" className="px-2 py-1 bg-zinc-800 rounded text-sm">Sign In</a>
      });
      return;
    }
    mutation.mutate(!active);
  };

  // Size classes for better touch targets on mobile
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-9 h-9',
    lg: 'w-10 h-10'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <button
      aria-label={active ? 'Remove bookmark' : 'Add bookmark'}
      onClick={handleClick}
      disabled={mutation.isLoading}
      className={cn(
        'relative flex items-center justify-center rounded-full transition-all outline-none',
        'focus:ring-2 focus:ring-cyan-500',
        active
          ? 'bg-gradient-to-br from-cyan-700/60 to-emerald-700/60 shadow-[0_0_8px_2px_rgba(34,211,238,0.4)]'
          : 'bg-zinc-900/60 hover:bg-zinc-800',
        animating && 'animate-pulse',
        sizeClasses[size]
      )}
      tabIndex={0}
    >
      <Bookmark
        className={cn(
          'transition-all',
          active
            ? 'fill-cyan-400 text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.7)]'
            : 'text-zinc-400 group-hover:text-cyan-400',
          iconSizes[size]
        )}
        strokeWidth={active ? 1.5 : 2}
      />
      <span className="sr-only">{active ? 'Bookmarked' : 'Bookmark'}</span>
    </button>
  );
}