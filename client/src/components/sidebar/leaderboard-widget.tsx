import React from 'react';
import { Link } from 'wouter';
import { Award, ArrowRight, Sparkles } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useContentFeedState } from '@/contexts/content-feed-context';
import { cn } from '@/lib/utils';
import type { User } from '@/types/compat/user';

// Define structure needed by the component
type FormattedUser = {
	id: string;
	username: string;
	xp: number;
	level: number;
	rank: number;
	avatar?: string;
};

interface LeaderboardWidgetProps {
	users?: User[] | FormattedUser[] | null;
	isLoading?: boolean;
	// List of usernames currently active in the main feed
	activeFeedUsers?: string[];
}

export default function LeaderboardWidget({
	users,
	isLoading = false,
	activeFeedUsers = []
}: LeaderboardWidgetProps) {
	const { activeTab } = useContentFeedState();
	// Format users from API if available, or use predefined sample data if not
	const formattedUsers: FormattedUser[] = React.useMemo(() => {
		if (isLoading || !users) {
			return [];
		}

		if (users && users.length > 0) {
			// Check if the data is already in the right format
			if ('rank' in users[0]) {
				return users as FormattedUser[];
			}

			// If data is from API (User[] type), transform it
			return (users as User[]).map((user, index) => ({
				id: String(user.id),
				username: user.username,
				xp: user.xp || 0,
				level: user.level || 1,
				rank: index + 1,
				avatar: user.avatarUrl || undefined
			}));
		}

		// Fallback to empty array
		return [];
	}, [users, isLoading]);

	// Sample data for when the API isn't available yet
	const sampleUsers: FormattedUser[] = [
		{ id: '1', username: 'degenking', xp: 24500, level: 42, rank: 1 },
		{ id: '2', username: 'cryptoqueen', xp: 21300, level: 38, rank: 2 },
		{ id: '3', username: 'satoshi_fan', xp: 19800, level: 35, rank: 3 },
		{ id: '4', username: 'ethmaxi', xp: 18200, level: 33, rank: 4 },
		{ id: '5', username: 'moonboi', xp: 17500, level: 32, rank: 5 }
	];

	// Use formatted users if available, otherwise use sample data
	const displayUsers = formattedUsers.length > 0 ? formattedUsers : sampleUsers;

	// Check if a user is currently active in the main feed
	const isUserActiveInFeed = (username: string) => {
		return activeFeedUsers.includes(username);
	};

	return (
		<Card className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden text-[clamp(0.75rem,0.9vw,0.95rem)]">
			<CardHeader className="pb-3">
				<CardTitle className="text-lg flex items-center justify-between">
					<div className="flex items-center">
						<Award className="h-5 w-5 text-emerald-500 mr-2" />
						Weekly Leaderboard
					</div>
					{activeFeedUsers.length > 0 && (
						<Badge
							variant="secondary"
							className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
						>
							{activeFeedUsers.length} active
						</Badge>
					)}
				</CardTitle>
			</CardHeader>

			<CardContent className="pb-2">
				<div className="space-y-3">
					{isLoading
						? // Loading skeletons
							Array.from({ length: 5 }).map((_, i) => (
								<div
									key={i}
									className="grid grid-cols-[max-content_minmax(0,1fr)_max-content] items-center gap-3 p-2 rounded-md bg-zinc-800/50 overflow-hidden"
								>
									<div className="flex items-center gap-3">
										<Skeleton className="w-[clamp(20px,3.5vw,28px)] h-[clamp(20px,3.5vw,28px)] rounded-full" />
										<div className="flex items-center gap-2">
											<Skeleton className="h-7 w-7 rounded-full" />
											<div className="flex flex-col">
												<Skeleton className="h-4 w-20 mb-1" />
												<Skeleton className="h-3 w-12" />
											</div>
										</div>
									</div>
									<Skeleton className="h-4 w-14" />
								</div>
							))
						: // Actual users
							displayUsers.map((user) => {
								const isActiveInFeed = isUserActiveInFeed(user.username);
								return (
									<div
										key={user.id}
										className={cn(
											'grid grid-cols-[max-content_minmax(0,1fr)_max-content] items-center gap-3 p-2 rounded-md transition-colors min-w-0 overflow-hidden relative',
											user.rank === 1
												? 'bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20'
												: isActiveInFeed
													? 'bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/15'
													: 'hover:bg-zinc-800 bg-zinc-800/50'
										)}
									>
										<div className="flex items-center gap-3 min-w-0">
											<div
												className={`rounded-full flex items-center justify-center font-bold w-[clamp(20px,3.5vw,28px)] h-[clamp(20px,3.5vw,28px)] ${
													user.rank === 1
														? 'bg-yellow-500 text-yellow-900'
														: user.rank === 2
															? 'bg-zinc-300 text-zinc-800'
															: user.rank === 3
																? 'bg-amber-700 text-amber-200'
																: 'bg-zinc-700 text-zinc-300'
												}`}
											>
												{user.rank}
											</div>

											<div className="flex items-center gap-2 min-w-0">
												<Avatar className="h-7 w-7">
													<AvatarFallback className="bg-zinc-700 text-zinc-300 text-xs">
														{user.username.slice(0, 2).toUpperCase()}
													</AvatarFallback>
												</Avatar>

												<div className="flex flex-col">
													<Link
														href={`/profile/${user.username}`}
														className="text-sm font-medium hover:text-emerald-400 transition-colors truncate max-w-[40vw]"
													>
														{user.username}
													</Link>
													<div className="text-xs text-zinc-500">Lvl {user.level}</div>
												</div>
											</div>
										</div>

										<div className="text-sm text-emerald-400 font-mono min-w-max pl-2 text-right whitespace-nowrap truncate">
											{user.xp.toLocaleString()}{' '}
											<span className="inline-block ms-1 font-normal opacity-60">XP</span>
											{/* Active in feed indicator */}
											{isActiveInFeed && (
												<Sparkles className="h-3 w-3 text-emerald-400 animate-pulse ml-1 inline-block" />
											)}
										</div>
									</div>
								);
							})}
				</div>
			</CardContent>

			<CardFooter className="pt-2 border-t border-zinc-800">
				<Button
					variant="outline"
					size="sm"
					className="w-full justify-between border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800"
					onClick={() => (window.location.href = '/leaderboard')}
				>
					<span>View Full Leaderboard</span>
					<ArrowRight className="h-4 w-4" />
				</Button>
			</CardFooter>
		</Card>
	);
}
