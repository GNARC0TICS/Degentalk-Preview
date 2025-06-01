import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface LikeButtonProps {
  postId: number;
  hasLiked: boolean;
  likeCount?: number;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function LikeButton({ 
  postId, 
  hasLiked, 
  likeCount = 0, 
  showCount = true,
  size = 'md'
}: LikeButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [active, setActive] = useState(hasLiked);
  const [count, setCount] = useState(likeCount);
  const [animating, setAnimating] = useState(false);

  const mutation = useMutation({
    mutationFn: async (next: boolean) => {
      return await apiRequest({
        url: `/api/posts/${postId}/react`,
        method: 'POST',
        data: { type: 'like', active: next }
      });
    },
    onMutate: async (next) => {
      setActive(next);
      setCount(prev => next ? prev + 1 : Math.max(0, prev - 1));
      setAnimating(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/threads`] });
      queryClient.invalidateQueries({ queryKey: [`/api/posts`] });
      setTimeout(() => setAnimating(false), 400);
    },
    onError: (error) => {
      setActive((prev) => !prev);
      setCount(prev => active ? prev - 1 : prev + 1);
      setAnimating(false);
      
      const errorMessage = error instanceof Error 
        ? error.message
        : 'Failed to update reaction';
      
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
        description: 'Please sign in to like posts', 
        variant: 'default',
        action: <a href="/login" className="px-2 py-1 bg-zinc-800 rounded text-sm">Sign In</a>
      });
      return;
    }
    mutation.mutate(!active);
  };

  // Adjusted sizes for better touch targets on mobile
  const sizeClasses = {
    sm: 'w-8 h-8',  // Increased from w-7 h-7
    md: 'w-9 h-9',  // Increased from w-8 h-8
    lg: 'w-10 h-10' // Increased from w-9 h-9
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <div className="flex items-center gap-1.5">
      <button
        aria-label={active ? 'Unlike' : 'Like'}
        onClick={handleClick}
        disabled={mutation.isLoading}
        className={cn(
          'relative flex items-center justify-center rounded-full transition-all outline-none',
          'focus:ring-2 focus:ring-rose-500',
          active
            ? 'bg-gradient-to-br from-rose-700/60 to-pink-700/60 shadow-[0_0_8px_2px_rgba(244,114,182,0.4)]'
            : 'bg-zinc-900/60 hover:bg-zinc-800',
          animating && 'animate-pulse',
          sizeClasses[size]
        )}
        tabIndex={0}
      >
        <Heart
          className={cn(
            'transition-all',
            active
              ? 'fill-rose-400 text-rose-400 drop-shadow-[0_0_6px_rgba(244,114,182,0.7)]'
              : 'text-zinc-400 group-hover:text-rose-400',
            iconSizes[size]
          )}
          strokeWidth={active ? 1.5 : 2}
        />
        <span className="sr-only">{active ? 'Liked' : 'Like'}</span>
      </button>
      
      {showCount && (
        <span className={cn(
          "text-zinc-400",
          active && "text-rose-400",
          size === 'sm' ? 'text-xs' : 'text-sm'
        )}>
          {count > 0 ? count : ''}
        </span>
      )}
    </div>
  );
}

export default LikeButton; 