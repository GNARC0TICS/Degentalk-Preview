import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/utils/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
	Eye,
	Users,
	Crown,
	ExternalLink,
	TrendingUp,
	Activity,
	User,
	MoreHorizontal
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/utils/utils';

interface FollowUser {
	id: string;
	username: string;
	avatarUrl?: string | null;
	activeAvatarUrl?: string | null;
	level?: number | null;
	role?: string | null;
	clout?: number | null;
	followedAt: string;
	followerCount?: number;
}

interface FollowCounts {
	following: number;
	followers: number;
}

interface WhaleWatchDisplayProps {
	userId: string;
	username: string;
	isCurrentUser?: boolean;
	compact?: boolean;
}

export function WhaleWatchDisplay({
	userId,
	username,
	isCurrentUser = false,
	compact = false
}: WhaleWatchDisplayProps) {
	const [activeTab, setActiveTab] = useState('following');

	// Fetch follow counts
	const { data: followCounts, isLoading: countsLoading } = useQuery<FollowCounts>({
		queryKey: [`/api/users/${userId}/follow-counts`],
		queryFn: async () => {
			return await apiRequest<FollowCounts>({
				url: `/api/users/${userId}/follow-counts`,
				method: 'GET'
			});
		}
	});

	// Fetch following list
	const { data: followingData, isLoading: followingLoading } = useQuery<unknown>({
		queryKey: [`/api/users/${userId}/following`],
		queryFn: async () => {
			return await apiRequest<{
				following: FollowUser[];
				pagination: { page: number; limit: number; hasMore: boolean };
			}>({
				url: `/api/users/${userId}/following?page=1&limit=20`,
				method: 'GET'
			});
		}
	});

	// Fetch followers list
	const { data: followersData, isLoading: followersLoading } = useQuery<unknown>({
		queryKey: [`/api/users/${userId}/followers`],
		queryFn: async () => {
			return await apiRequest<{
				followers: FollowUser[];
				pagination: { page: number; limit: number; hasMore: boolean };
			}>({
				url: `/api/users/${userId}/followers?page=1&limit=20`,
				method: 'GET'
			});
		},
		enabled: activeTab === 'followers'
	});

	// Fetch whale status
	const { data: whaleStatus } = useQuery<unknown>({
		queryKey: [`/api/whale-status/${userId}`],
		queryFn: async () => {
			return await apiRequest<{ isWhale: boolean; followerCount: number; threshold: number }>({
				url: `/api/whale-status/${userId}`,
				method: 'GET'
			});
		}
	});

	const getRoleColor = (role?: string | null) => {
		switch (role) {
			case 'admin':
				return 'bg-red-900/60 text-red-300 border-red-700/30';
			case 'moderator':
				return 'bg-blue-900/60 text-blue-300 border-blue-700/30';
			default:
				return 'bg-zinc-700/60 text-zinc-300 border-zinc-600/30';
		}
	};

	const UserCard = ({
		user,
		showFollowDate = true
	}: {
		user: FollowUser;
		showFollowDate?: boolean;
	}) => (
		<div className="flex items-center justify-between p-3 border border-zinc-800 rounded-lg hover:bg-zinc-900/50 transition-colors">
			<div className="flex items-center gap-3 flex-1 min-w-0">
				<Avatar className="h-10 w-10 border border-zinc-700">
					<AvatarImage src={user.activeAvatarUrl || user.avatarUrl || ''} alt={user.username} />
					<AvatarFallback className="bg-zinc-800 text-zinc-300">
						{user.username.slice(0, 2).toUpperCase()}
					</AvatarFallback>
				</Avatar>

				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 mb-1">
						<Link
							to={`/profile/${user.username}`}
							className="font-medium text-zinc-200 hover:text-emerald-400 transition-colors truncate"
						>
							{user.username}
						</Link>

						{user.role && user.role !== 'user' && (
							<Badge className={cn('text-xs px-1.5 py-0', getRoleColor(user.role))}>
								{user.role === 'admin' ? 'Admin' : 'Moderator'}
							</Badge>
						)}

						{whaleStatus?.isWhale &&
							user.followerCount &&
							user.followerCount >= whaleStatus.threshold && (
								<Crown className="h-4 w-4 text-yellow-400" aria-label="Whale" />
							)}
					</div>

					<div className="flex items-center gap-3 text-xs text-zinc-500">
						{user.level && <span>Level {user.level}</span>}
						{user.followerCount !== undefined && <span>{user.followerCount} followers</span>}
						{showFollowDate && (
							<span>{formatDistanceToNow(new Date(user.followedAt), { addSuffix: true })}</span>
						)}
					</div>
				</div>
			</div>

			<Button variant="ghost" size="sm" asChild>
				<Link to={`/profile/${user.username}`}>
					<ExternalLink className="h-4 w-4" />
				</Link>
			</Button>
		</div>
	);

	if (compact) {
		// Compact view for smaller spaces
		return (
			<Card className="border-zinc-800">
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center gap-2 text-lg">
						<Eye className="h-5 w-5 text-emerald-400" />
						Whale Watch
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 gap-4 mb-4">
						<div className="text-center">
							<div className="text-2xl font-bold text-zinc-200">
								{countsLoading ? (
									<Skeleton className="h-6 w-8 mx-auto" />
								) : (
									followCounts?.following || 0
								)}
							</div>
							<div className="text-xs text-zinc-400">Watching</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold text-zinc-200">
								{countsLoading ? (
									<Skeleton className="h-6 w-8 mx-auto" />
								) : (
									followCounts?.followers || 0
								)}
							</div>
							<div className="text-xs text-zinc-400">Watchers</div>
						</div>
					</div>

					{followingData?.following && followingData.following.length > 0 ? (
						<div className="space-y-2">
							<h4 className="text-sm font-medium text-zinc-300">Recently Watching</h4>
							<div className="space-y-2 max-h-48 overflow-y-auto">
								{followingData.following.slice(0, 3).map((user) => (
									<UserCard key={user.id} user={user} showFollowDate={false} />
								))}
							</div>
							{followingData.following.length > 3 && (
								<Button variant="ghost" size="sm" className="w-full">
									<MoreHorizontal className="h-4 w-4 mr-2" />
									View all {followCounts?.following} users
								</Button>
							)}
						</div>
					) : (
						<div className="text-center py-4 text-zinc-400">
							<Eye className="h-8 w-8 mx-auto mb-2 text-zinc-600" />
							<p className="text-sm">
								{isCurrentUser
									? "You're not watching anyone yet"
									: `${username} isn't watching anyone yet`}
							</p>
						</div>
					)}
				</CardContent>
			</Card>
		);
	}

	// Full view for profile pages
	return (
		<Card className="border-zinc-800">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="flex items-center gap-2">
							<Eye className="h-5 w-5 text-emerald-400" />
							Whale Watch
							{whaleStatus?.isWhale && (
								<Crown className="h-5 w-5 text-yellow-400" aria-label="This user is a whale!" />
							)}
						</CardTitle>
						<CardDescription>
							{isCurrentUser ? "Users you're watching" : `Users ${username} is watching`}
						</CardDescription>
					</div>

					{/* Follow counts */}
					<div className="flex items-center gap-6">
						<div className="text-center">
							<div className="text-xl font-bold text-zinc-200">
								{countsLoading ? <Skeleton className="h-6 w-8" /> : followCounts?.following || 0}
							</div>
							<div className="text-xs text-zinc-400">Watching</div>
						</div>
						<div className="text-center">
							<div className="text-xl font-bold text-zinc-200">
								{countsLoading ? <Skeleton className="h-6 w-8" /> : followCounts?.followers || 0}
							</div>
							<div className="text-xs text-zinc-400">Watchers</div>
						</div>
					</div>
				</div>
			</CardHeader>

			<CardContent>
				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="following" className="flex items-center gap-2">
							<Eye className="h-4 w-4" />
							Watching ({followCounts?.following || 0})
						</TabsTrigger>
						<TabsTrigger value="followers" className="flex items-center gap-2">
							<Users className="h-4 w-4" />
							Watchers ({followCounts?.followers || 0})
						</TabsTrigger>
					</TabsList>

					<TabsContent value="following" className="mt-4">
						{followingLoading ? (
							<div className="space-y-3">
								{Array.from({ length: 3 }).map((_, i) => (
									<div
										key={i}
										className="flex items-center gap-3 p-3 border border-zinc-800 rounded-lg"
									>
										<Skeleton className="h-10 w-10 rounded-full" />
										<div className="flex-1 space-y-2">
											<Skeleton className="h-4 w-32" />
											<Skeleton className="h-3 w-24" />
										</div>
									</div>
								))}
							</div>
						) : followingData?.following && followingData.following.length > 0 ? (
							<ScrollArea className="h-96">
								<div className="space-y-3">
									{followingData.following.map((user) => (
										<UserCard key={user.id} user={user} />
									))}
								</div>
							</ScrollArea>
						) : (
							<div className="text-center py-8 text-zinc-400">
								<Eye className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
								<p className="mb-2">
									{isCurrentUser
										? "You're not watching anyone yet"
										: `${username} isn't watching anyone yet`}
								</p>
								<p className="text-sm">
									{isCurrentUser
										? 'Find some whales to follow!'
										: "Maybe they'll start following some whales soon."}
								</p>
							</div>
						)}
					</TabsContent>

					<TabsContent value="followers" className="mt-4">
						{followersLoading ? (
							<div className="space-y-3">
								{Array.from({ length: 3 }).map((_, i) => (
									<div
										key={i}
										className="flex items-center gap-3 p-3 border border-zinc-800 rounded-lg"
									>
										<Skeleton className="h-10 w-10 rounded-full" />
										<div className="flex-1 space-y-2">
											<Skeleton className="h-4 w-32" />
											<Skeleton className="h-3 w-24" />
										</div>
									</div>
								))}
							</div>
						) : followersData?.followers && followersData.followers.length > 0 ? (
							<ScrollArea className="h-96">
								<div className="space-y-3">
									{followersData.followers.map((user) => (
										<UserCard key={user.id} user={user} showFollowDate={false} />
									))}
								</div>
							</ScrollArea>
						) : (
							<div className="text-center py-8 text-zinc-400">
								<Users className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
								<p className="mb-2">
									{isCurrentUser
										? "Nobody's watching you yet"
										: `Nobody's watching ${username} yet`}
								</p>
								<p className="text-sm">
									{isCurrentUser
										? 'Build your reputation to gain watchers!'
										: 'Give them time to build their reputation.'}
								</p>
							</div>
						)}
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	);
}
