import React, { useState, useEffect } from 'react';
import type { EntityId, FollowId } from '@shared/types/ids';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@app/utils/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@app/components/ui/card';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Badge } from '@app/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@app/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@app/components/ui/tabs';
import { ScrollArea } from '@app/components/ui/scroll-area';
import { Skeleton } from '@app/components/ui/skeleton';
import {
	Users,
	UserPlus,
	UserMinus,
	Crown,
	TrendingUp,
	Bell,
	BellOff,
	Search,
	Star,
	BarChart3,
	Activity,
	Settings
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { cn } from '@app/utils/utils';
import { useToast } from '@app/hooks/use-toast';

interface FollowUser {
	id: string;
	username: string;
	avatarUrl?: string | null;
	activeAvatarUrl?: string | null;
	level?: number | null;
	role?: string | null;
	reputation?: number | null;
	isFollowing?: boolean;
}

interface FollowRelationship {
	id: EntityId;
	followedAt: string;
	notificationSettings: {
		notifyOnPosts: boolean;
		notifyOnThreads: boolean;
		notifyOnTrades: boolean;
		notifyOnLargeStakes: boolean;
		minStakeNotification: number;
	};
	user: FollowUser;
}

interface FollowCounts {
	following: number;
	followers: number;
}

export function WhaleWatchDashboard() {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const [searchQuery, setSearchQuery] = useState('');
	const [activeTab, setActiveTab] = useState('following');

	// Fetch follow counts
	const { data: counts } = useQuery<FollowCounts>({
		queryKey: ['/api/social/follows/counts'],
		queryFn: async () => {
			return await apiRequest<FollowCounts>({
				url: '/api/social/follows/counts',
				method: 'GET'
			});
		}
	});

	// Fetch following list
	const { data: followingData, isLoading: followingLoading } = useQuery({
		queryKey: ['/api/social/follows/following'],
		queryFn: async () => {
			return await apiRequest<{
				following: FollowRelationship[];
				pagination: { page: number; limit: number; hasMore: boolean };
			}>({
				url: '/api/social/follows/following?page=1&limit=50',
				method: 'GET'
			});
		}
	});

	// Fetch followers list
	const { data: followersData, isLoading: followersLoading } = useQuery({
		queryKey: ['/api/social/follows/followers'],
		queryFn: async () => {
			return await apiRequest<{
				followers: FollowRelationship[];
				pagination: { page: number; limit: number; hasMore: boolean };
			}>({
				url: '/api/social/follows/followers?page=1&limit=50',
				method: 'GET'
			});
		}
	});

	// Fetch whale candidates
	const { data: whalesData, isLoading: whalesLoading } = useQuery({
		queryKey: ['/api/social/follows/whales'],
		queryFn: async () => {
			return await apiRequest<{ whales: FollowUser[] }>({
				url: '/api/social/follows/whales?limit=20',
				method: 'GET'
			});
		}
	});

	// Search users
	const { data: searchData, isLoading: searchLoading } = useQuery({
		queryKey: ['/api/social/follows/search', searchQuery],
		queryFn: async () => {
			if (!searchQuery || searchQuery.length < 1) return { users: [] };

			return await apiRequest<{ users: FollowUser[] }>({
				url: `/api/social/follows/search?q=${encodeURIComponent(searchQuery)}&limit=10`,
				method: 'GET'
			});
		},
		enabled: searchQuery.length >= 1
	});

	// Follow/Unfollow mutation
	const followMutation = useMutation({
		mutationFn: async ({ userId, action }: { userId: string; action: 'follow' | 'unfollow' }) => {
			if (action === 'follow') {
				return await apiRequest({
					url: '/api/social/follows',
					method: 'POST',
					data: { userId }
				});
			} else {
				return await apiRequest({
					url: '/api/social/follows',
					method: 'DELETE',
					data: { userId }
				});
			}
		},
		onSuccess: (_, { action }) => {
			toast({
				title: action === 'follow' ? 'User followed' : 'User unfollowed',
				variant: 'default'
			});
			// Invalidate relevant queries
			queryClient.invalidateQueries({ queryKey: ['/api/social/follows'] });
		},
		onError: (error: any) => {
			toast({
				title: 'Error',
				description: error.message || 'Failed to update follow status',
				variant: 'destructive'
			});
		}
	});

	const handleFollowToggle = (user: FollowUser) => {
		followMutation.mutate({
			userId: user.id,
			action: user.isFollowing ? 'unfollow' : 'follow'
		});
	};

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

	const getRoleLabel = (role?: string | null) => {
		switch (role) {
			case 'admin':
				return 'Admin';
			case 'moderator':
				return 'Moderator';
			default:
				return 'User';
		}
	};

	const isWhale = (user: FollowUser) => {
		return (user.level && user.level >= 25) || (user.reputation && user.reputation >= 10000);
	};

	const UserCard = ({
		user,
		relationship,
		showNotificationSettings = false
	}: {
		user: FollowUser;
		relationship?: FollowRelationship;
		showNotificationSettings?: boolean;
	}) => (
		<div className="flex items-center justify-between p-4 border border-zinc-800 rounded-lg hover:bg-zinc-900/50 transition-colors">
			<div className="flex items-center gap-3">
				<Avatar className="h-12 w-12 border border-zinc-700">
					<AvatarImage src={user.activeAvatarUrl || user.avatarUrl || ''} alt={user.username} />
					<AvatarFallback className="bg-zinc-800 text-zinc-300">
						{user.username.slice(0, 2).toUpperCase()}
					</AvatarFallback>
				</Avatar>

				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 mb-1">
						<Link
							to={`/profile/${user.username}`}
							className="font-medium text-zinc-200 hover:text-emerald-400 transition-colors"
						>
							{user.username}
						</Link>

						{isWhale(user) && (
							<Badge className="bg-yellow-900/60 text-yellow-300 border-yellow-700/30 px-1.5 py-0.5 text-xs">
								<Crown className="h-3 w-3 mr-1" />
								Whale
							</Badge>
						)}

						{user.role && user.role !== 'user' && (
							<Badge className={cn('text-xs px-1.5 py-0', getRoleColor(user.role))}>
								{getRoleLabel(user.role)}
							</Badge>
						)}
					</div>

					<div className="flex items-center gap-4 text-xs text-zinc-500">
						{user.level && <span>Level {user.level}</span>}
						{user.reputation && <span>{user.reputation.toLocaleString()} Reputation</span>}
						{relationship && (
							<span>
								Followed{' '}
								{formatDistanceToNow(new Date(relationship.followedAt), { addSuffix: true })}
							</span>
						)}
					</div>

					{showNotificationSettings && relationship && (
						<div className="flex items-center gap-2 mt-2">
							{relationship.notificationSettings.notifyOnPosts && (
								<Badge variant="outline" className="text-xs">
									Posts
								</Badge>
							)}
							{relationship.notificationSettings.notifyOnThreads && (
								<Badge variant="outline" className="text-xs">
									Threads
								</Badge>
							)}
							{relationship.notificationSettings.notifyOnTrades && (
								<Badge variant="outline" className="text-xs">
									Trades
								</Badge>
							)}
							{relationship.notificationSettings.notifyOnLargeStakes && (
								<Badge variant="outline" className="text-xs">
									Stakes ${relationship.notificationSettings.minStakeNotification}+
								</Badge>
							)}
						</div>
					)}
				</div>
			</div>

			<Button
				variant={user.isFollowing ? 'outline' : 'default'}
				size="sm"
				onClick={() => handleFollowToggle(user)}
				disabled={followMutation.isPending}
				className="ml-4"
			>
				{user.isFollowing ? (
					<>
						<UserMinus className="h-4 w-4 mr-1" />
						Unfollow
					</>
				) : (
					<>
						<UserPlus className="h-4 w-4 mr-1" />
						Follow
					</>
				)}
			</Button>
		</div>
	);

	return (
		<div className="space-y-6">
			{/* Header Stats */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Card>
					<CardContent className="p-6">
						<div className="flex items-center gap-3">
							<div className="p-3 bg-emerald-900/60 rounded-lg">
								<Users className="h-6 w-6 text-emerald-300" />
							</div>
							<div>
								<p className="text-sm text-zinc-400">Following</p>
								<p className="text-2xl font-bold text-zinc-200">
									{counts?.following?.toLocaleString() || 0}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center gap-3">
							<div className="p-3 bg-blue-900/60 rounded-lg">
								<TrendingUp className="h-6 w-6 text-blue-300" />
							</div>
							<div>
								<p className="text-sm text-zinc-400">Followers</p>
								<p className="text-2xl font-bold text-zinc-200">
									{counts?.followers?.toLocaleString() || 0}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center gap-3">
							<div className="p-3 bg-yellow-900/60 rounded-lg">
								<Crown className="h-6 w-6 text-yellow-300" />
							</div>
							<div>
								<p className="text-sm text-zinc-400">Whales Followed</p>
								<p className="text-2xl font-bold text-zinc-200">
									{followingData?.following?.filter((f) => isWhale(f.user)).length || 0}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Main Dashboard */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Activity className="h-5 w-5" />
						Whale Watch Dashboard
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Tabs value={activeTab} onValueChange={setActiveTab}>
						<TabsList className="grid w-full grid-cols-4">
							<TabsTrigger value="following">Following</TabsTrigger>
							<TabsTrigger value="followers">Followers</TabsTrigger>
							<TabsTrigger value="whales">Discover Whales</TabsTrigger>
							<TabsTrigger value="search">Search Users</TabsTrigger>
						</TabsList>

						<TabsContent value="following" className="mt-6">
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<h3 className="text-lg font-semibold">Users You Follow</h3>
									<Badge variant="secondary">
										{followingData?.following?.length || 0} following
									</Badge>
								</div>

								{followingLoading ? (
									<div className="space-y-3">
										{Array.from({ length: 3 }).map((_, i) => (
											<div
												key={i}
												className="flex items-center gap-3 p-4 border border-zinc-800 rounded-lg"
											>
												<Skeleton className="h-12 w-12 rounded-full" />
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
											{followingData.following.map((relationship) => (
												<UserCard
													key={relationship.id}
													user={{ ...relationship.user, isFollowing: true }}
													relationship={relationship}
													showNotificationSettings={true}
												/>
											))}
										</div>
									</ScrollArea>
								) : (
									<div className="text-center py-8 text-zinc-400">
										<Users className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
										<p className="mb-2">You're not following anyone yet</p>
										<p className="text-sm">Discover whales and interesting users to follow</p>
									</div>
								)}
							</div>
						</TabsContent>

						<TabsContent value="followers" className="mt-6">
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<h3 className="text-lg font-semibold">Your Followers</h3>
									<Badge variant="secondary">
										{followersData?.followers?.length || 0} followers
									</Badge>
								</div>

								{followersLoading ? (
									<div className="space-y-3">
										{Array.from({ length: 3 }).map((_, i) => (
											<div
												key={i}
												className="flex items-center gap-3 p-4 border border-zinc-800 rounded-lg"
											>
												<Skeleton className="h-12 w-12 rounded-full" />
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
											{followersData.followers.map((relationship) => (
												<UserCard
													key={relationship.id}
													user={relationship.user}
													relationship={relationship}
												/>
											))}
										</div>
									</ScrollArea>
								) : (
									<div className="text-center py-8 text-zinc-400">
										<Users className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
										<p className="mb-2">No followers yet</p>
										<p className="text-sm">Be active in the community to gain followers</p>
									</div>
								)}
							</div>
						</TabsContent>

						<TabsContent value="whales" className="mt-6">
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<h3 className="text-lg font-semibold flex items-center gap-2">
										<Crown className="h-5 w-5 text-yellow-500" />
										Discover Whales
									</h3>
									<Badge variant="secondary" className="bg-yellow-900/60 text-yellow-300">
										High-value users
									</Badge>
								</div>

								{whalesLoading ? (
									<div className="space-y-3">
										{Array.from({ length: 5 }).map((_, i) => (
											<div
												key={i}
												className="flex items-center gap-3 p-4 border border-zinc-800 rounded-lg"
											>
												<Skeleton className="h-12 w-12 rounded-full" />
												<div className="flex-1 space-y-2">
													<Skeleton className="h-4 w-32" />
													<Skeleton className="h-3 w-24" />
												</div>
											</div>
										))}
									</div>
								) : whalesData?.whales && whalesData.whales.length > 0 ? (
									<ScrollArea className="h-96">
										<div className="space-y-3">
											{whalesData.whales.map((user) => (
												<UserCard key={user.id} user={user} />
											))}
										</div>
									</ScrollArea>
								) : (
									<div className="text-center py-8 text-zinc-400">
										<Crown className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
										<p>No whales found</p>
									</div>
								)}
							</div>
						</TabsContent>

						<TabsContent value="search" className="mt-6">
							<div className="space-y-4">
								<div className="flex items-center gap-2">
									<div className="relative flex-1">
										<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
										<Input
											placeholder="Search users to follow..."
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
											className="pl-10"
										/>
									</div>
								</div>

								{searchQuery.length > 0 && (
									<div className="space-y-3">
										{searchLoading ? (
											<div className="space-y-3">
												{Array.from({ length: 3 }).map((_, i) => (
													<div
														key={i}
														className="flex items-center gap-3 p-4 border border-zinc-800 rounded-lg"
													>
														<Skeleton className="h-12 w-12 rounded-full" />
														<div className="flex-1 space-y-2">
															<Skeleton className="h-4 w-32" />
															<Skeleton className="h-3 w-24" />
														</div>
													</div>
												))}
											</div>
										) : searchData?.users && searchData.users.length > 0 ? (
											<ScrollArea className="h-96">
												<div className="space-y-3">
													{searchData.users.map((user) => (
														<UserCard key={user.id} user={user} />
													))}
												</div>
											</ScrollArea>
										) : (
											<div className="text-center py-8 text-zinc-400">
												<Search className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
												<p>No users found matching "{searchQuery}"</p>
											</div>
										)}
									</div>
								)}

								{searchQuery.length === 0 && (
									<div className="text-center py-8 text-zinc-400">
										<Search className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
										<p>Search for users to follow</p>
									</div>
								)}
							</div>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</div>
	);
}
