import React from 'react';
import { useFollowing } from '@/hooks/useFollowing';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { cn } from '@/utils/utils';

interface FollowingListProps {
	userId: string;
	isCurrentUser?: boolean;
	className?: string;
}

export function FollowingList({ userId, isCurrentUser = false, className }: FollowingListProps) {
	const { users, isLoading } = useFollowing(userId);

	return (
		<div className={cn('space-y-3', className)}>
			{isLoading ? (
				<div className="space-y-3">
					{Array.from({ length: 5 }).map((_, i) => (
						<div key={i} className="flex items-center gap-3 p-3 border border-zinc-800 rounded-lg">
							<Skeleton className="h-10 w-10 rounded-full" />
							<div className="flex-1 space-y-2">
								<Skeleton className="h-4 w-32" />
								<Skeleton className="h-3 w-24" />
							</div>
						</div>
					))}
				</div>
			) : users.length > 0 ? (
				users.map((u) => (
					<div
						key={u.id}
						className="flex items-center justify-between p-3 border border-zinc-800 rounded-lg hover:bg-zinc-900/50 transition-colors"
					>
						<div className="flex items-center gap-3 min-w-0">
							<Avatar className="h-10 w-10 border border-zinc-700">
								<AvatarImage src={u.activeAvatarUrl || u.avatarUrl || ''} alt={u.username} />
								<AvatarFallback className="bg-zinc-800 text-zinc-300">
									{u.username.slice(0, 2).toUpperCase()}
								</AvatarFallback>
							</Avatar>

							<Link
								to={`/profile/${u.username}`}
								className="font-medium text-zinc-200 hover:text-emerald-400 transition-colors truncate"
							>
								{u.username}
							</Link>
						</div>

						<Badge variant="secondary" className="bg-emerald-900/50 text-emerald-300 text-xs">
							{isCurrentUser ? 'FOLLOWING' : 'FOLLOWED'}
						</Badge>
					</div>
				))
			) : (
				<div className="text-center py-8 text-zinc-400">
					{isCurrentUser ? "You're not following anyone yet" : 'Not following anyone yet'}
				</div>
			)}
		</div>
	);
}
