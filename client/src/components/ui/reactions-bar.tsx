import { useState } from 'react';
import { ThumbsUp, Heart, Laugh, Frown, Flame, Smile, Coins } from 'lucide-react';
import { Button } from '@app/components/ui/button';
import { cn } from '@app/utils/utils';
import { apiRequest, queryClient } from '@app/utils/queryClient';
import { useAuth } from '@app/hooks/use-auth';
import { useToast } from '@app/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog } from '@app/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@app/components/ui/tooltip';
import type { PostId } from '@shared/types/ids';

type Reaction = {
	type: string;
	icon: React.ElementType;
	color: string;
	count: number;
	active: boolean;
};

type ReactionsBarProps = {
	postId: PostId;
	initialReactions?: Record<string, number>;
	userReaction?: string | null;
	className?: string;
	disabled?: boolean;
	tipCount?: number;
};

export function ReactionsBar({
	postId,
	initialReactions = {},
	userReaction = null,
	className,
	disabled = false,
	tipCount = 0
}: ReactionsBarProps) {
	const { user } = useAuth();
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const [loading, setLoading] = useState<string | null>(null);
	const [tipModalOpen, setTipModalOpen] = useState(false);
	const [tipLoading, setTipLoading] = useState(false);
	const [localTipCount, setLocalTipCount] = useState(tipCount);
	const [tipSuccess, setTipSuccess] = useState(false);

	// Setup reactions with their icons and colors
	const [reactions, setReactions] = useState<Reaction[]>([
		{
			type: 'like',
			icon: ThumbsUp,
			color: 'text-cyan-400',
			count: initialReactions['like'] || 0,
			active: userReaction === 'like'
		},
		{
			type: 'love',
			icon: Heart,
			color: 'text-red-500',
			count: initialReactions['love'] || 0,
			active: userReaction === 'love'
		},
		{
			type: 'laugh',
			icon: Laugh,
			color: 'text-yellow-500',
			count: initialReactions['laugh'] || 0,
			active: userReaction === 'laugh'
		},
		{
			type: 'sad',
			icon: Frown,
			color: 'text-purple-500',
			count: initialReactions['sad'] || 0,
			active: userReaction === 'sad'
		},
		{
			type: 'wow',
			icon: Smile,
			color: 'text-green-500',
			count: initialReactions['wow'] || 0,
			active: userReaction === 'wow'
		}
	]);

	// Like mutation (optimistic)
	const likeMutation = useMutation({
		mutationFn: async (next: boolean) => {
			if (next) {
				await apiRequest({
					url: `/api/posts/${postId}/reactions`,
					method: 'POST',
					data: { reaction: 'like' }
				});
			} else {
				await apiRequest({
					url: `/api/posts/${postId}/reactions/like`,
					method: 'DELETE'
				});
			}
		},
		onMutate: async (next) => {
			setReactions((prev) =>
				prev.map((r) =>
					r.type === 'like'
						? { ...r, active: next, count: Math.max(0, r.count + (next ? 1 : -1)) }
						: r
				)
			);
			setLoading('like');
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [`/api/threads`] });
			setLoading(null);
		},
		onError: () => {
			setReactions((prev) =>
				prev.map((r) =>
					r.type === 'like'
						? { ...r, active: !r.active, count: Math.max(0, r.count + (r.active ? -1 : 1)) }
						: r
				)
			);
			setLoading(null);
			toast({ title: 'Error', description: 'Failed to update like', variant: 'destructive' });
		}
	});

	const handleReaction = async (reactionType: string) => {
		if (!user) {
			toast({
				title: 'Not logged in',
				description: 'You need to be logged in to react to posts',
				variant: 'destructive'
			});
			return;
		}

		if (disabled || loading) {
			return;
		}

		setLoading(reactionType);

		try {
			const currentReactions = [...reactions];
			const reactionIndex = currentReactions.findIndex((r) => r.type === reactionType);

			if (reactionIndex === -1) return;

			if (currentReactions[reactionIndex].active) {
				// Remove reaction
				await apiRequest({
					url: `/api/posts/${postId}/reactions/${reactionType}`,
					method: 'DELETE'
				});

				currentReactions[reactionIndex].active = false;
				currentReactions[reactionIndex].count = Math.max(
					0,
					currentReactions[reactionIndex].count - 1
				);
			} else {
				// Add reaction (first remove any existing one)
				const activeIndex = currentReactions.findIndex((r) => r.active);
				if (activeIndex !== -1) {
					// Remove previous reaction
					await apiRequest({
						url: `/api/posts/${postId}/reactions/${currentReactions[activeIndex].type}`,
						method: 'DELETE'
					});

					currentReactions[activeIndex].active = false;
					currentReactions[activeIndex].count = Math.max(
						0,
						currentReactions[activeIndex].count - 1
					);
				}

				// Add new reaction
				await apiRequest({
					url: `/api/posts/${postId}/reactions`,
					method: 'POST',
					data: { reaction: reactionType }
				});

				currentReactions[reactionIndex].active = true;
				currentReactions[reactionIndex].count += 1;
			}

			setReactions(currentReactions);

			// Invalidate any queries that might display this post's reactions
			queryClient.invalidateQueries({ queryKey: [`/api/threads`] });
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to process reaction',
				variant: 'destructive'
			});
		} finally {
			setLoading(null);
		}
	};

	const handleLike = (e: React.MouseEvent) => {
		e.preventDefault();
		if (!user) {
			toast({
				title: 'Login required',
				description: 'Please log in to like posts',
				variant: 'destructive'
			});
			return;
		}
		likeMutation.mutate(!reactions.find((r) => r.type === 'like')?.active);
	};

	// Tip mutation (mocked for now)
	const handleTip = async (amount: number) => {
		setTipLoading(true);
		try {
			setLocalTipCount((c) => c + 1);
			setTipSuccess(true);
			setTimeout(() => setTipSuccess(false), 1000);
			setTipModalOpen(false);
		} catch (err) {
			toast({ title: 'Error', description: 'Failed to tip', variant: 'destructive' });
		} finally {
			setTipLoading(false);
		}
	};

	return (
		<div className={cn('flex space-x-1', className)}>
			{reactions.map((reaction) =>
				reaction.type === 'like' ? (
					<Button
						key={reaction.type}
						variant="ghost"
						size="sm"
						aria-pressed={reaction.active}
						tabIndex={0}
						className={cn(
							'text-xs font-medium flex items-center space-x-1 h-8 px-2 transition-all outline-none',
							reaction.active
								? 'text-cyan-400 bg-zinc-900/60 shadow-[0_0_8px_2px_rgba(34,211,238,0.3)] animate-pulse'
								: 'text-zinc-400 hover:text-cyan-400',
							loading === 'like' && 'scale-105'
						)}
						disabled={disabled || likeMutation.isPending}
						onClick={handleLike}
					>
						<reaction.icon
							className={cn('h-4 w-4 transition-all', reaction.active && 'text-cyan-400')}
						/>
						{reaction.count > 0 && (
							<span className={cn(reaction.active && 'text-cyan-400')}>{reaction.count}</span>
						)}
					</Button>
				) : (
					<Button
						key={reaction.type}
						variant="ghost"
						size="sm"
						className={cn(
							'text-xs font-medium flex items-center space-x-1 h-8 px-2',
							reaction.active && `${reaction.color} bg-gray-100`
						)}
						disabled={disabled || !user}
						onClick={() => handleReaction(reaction.type)}
					>
						<reaction.icon className={cn('h-4 w-4', reaction.active && reaction.color)} />
						{reaction.count > 0 && (
							<span className={cn(reaction.active && reaction.color)}>{reaction.count}</span>
						)}
					</Button>
				)
			)}
			{/* Tip Button */}
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant="ghost"
						size="sm"
						aria-label="Tip this post"
						className={cn(
							'text-xs font-medium flex items-center space-x-1 h-8 px-2 transition-all outline-none',
							tipSuccess
								? 'text-emerald-400 bg-zinc-900/60 shadow-[0_0_8px_2px_rgba(16,185,129,0.3)] animate-pulse'
								: 'text-zinc-400 hover:text-emerald-400',
							tipLoading && 'scale-105 opacity-70 pointer-events-none'
						)}
						disabled={disabled || tipLoading}
						onClick={() => setTipModalOpen(true)}
					>
						<Coins className={cn('h-4 w-4 transition-all', tipSuccess && 'text-emerald-400')} />
						{localTipCount > 0 && (
							<span className={cn(tipSuccess && 'text-emerald-400')}>{localTipCount}</span>
						)}
					</Button>
				</TooltipTrigger>
				<TooltipContent>Tip this post</TooltipContent>
			</Tooltip>
			{/* Tip Modal */}
			<Dialog open={tipModalOpen} onOpenChange={setTipModalOpen}>
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
					<div className="bg-zinc-900 rounded-lg p-6 w-80 flex flex-col items-center">
						<h3 className="text-lg font-semibold mb-2 text-emerald-400">Tip this post</h3>
						<p className="text-zinc-400 mb-4 text-sm">Support the author with a USDT tip</p>
						<div className="flex space-x-2 mb-4">
							{[1, 5, 10].map((amt) => (
								<Button
									key={amt}
									variant="outline"
									className="border-emerald-600 text-emerald-400 hover:bg-emerald-900/30"
									onClick={() => handleTip(amt)}
									disabled={tipLoading}
								>
									{amt} USDT
								</Button>
							))}
						</div>
						<Button
							variant="ghost"
							className="mt-2 text-zinc-400"
							onClick={() => setTipModalOpen(false)}
							disabled={tipLoading}
						>
							Cancel
						</Button>
					</div>
				</div>
			</Dialog>
		</div>
	);
}
