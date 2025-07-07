import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog';
import {
	Users,
	UserPlus,
	UserMinus,
	MessageCircle,
	Eye,
	Activity,
	Check,
	X,
	Block,
	Search,
	Clock,
	Send,
	Settings
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { RequestId, EntityId } from '@/types/ids';
import { type EntityId } from "@shared/types";

interface FriendUser {
	id: string;
	username: string;
	avatarUrl?: string | null;
	activeAvatarUrl?: string | null;
	level?: number | null;
	role?: string | null;
	clout?: number | null;
	friendshipStatus?: 'friends' | 'request_sent' | 'request_received' | 'blocked' | null;
}

interface Friendship {
	id: EntityId;
	friendedAt: string;
	permissions: {
		allowWhispers: boolean;
		allowProfileView: boolean;
		allowActivityView: boolean;
	};
	friend: FriendUser;
}

interface FriendRequest {
	id: EntityId;
	requestMessage?: string | null;
	createdAt: string;
	requester?: FriendUser;
	addressee?: FriendUser;
}

interface FriendCounts {
	friends: number;
	incomingRequests: number;
}

export function FriendsManager() {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const [searchQuery, setSearchQuery] = useState('');
	const [sendRequestOpen, setSendRequestOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState<FriendUser | null>(null);
	const [requestMessage, setRequestMessage] = useState('');

	// Fetch friend counts
	const { data: counts } = useQuery<FriendCounts>({
		queryKey: ['/api/social/friends/counts'],
		queryFn: async () => {
			return await apiRequest<FriendCounts>({
				url: '/api/social/friends/counts',
				method: 'GET'
			});
		}
	});

	// Fetch friends list
	const { data: friendsData, isLoading: friendsLoading } = useQuery({
		queryKey: ['/api/social/friends'],
		queryFn: async () => {
			return await apiRequest<{
				friends: Friendship[];
				pagination: { page: number; limit: number; hasMore: boolean };
			}>({
				url: '/api/social/friends?page=1&limit=50',
				method: 'GET'
			});
		}
	});

	// Fetch incoming requests
	const { data: incomingRequestsData, isLoading: incomingLoading } = useQuery({
		queryKey: ['/api/social/friends/requests/incoming'],
		queryFn: async () => {
			return await apiRequest<{ requests: FriendRequest[] }>({
				url: '/api/social/friends/requests/incoming',
				method: 'GET'
			});
		}
	});

	// Fetch outgoing requests
	const { data: outgoingRequestsData, isLoading: outgoingLoading } = useQuery({
		queryKey: ['/api/social/friends/requests/outgoing'],
		queryFn: async () => {
			return await apiRequest<{ requests: FriendRequest[] }>({
				url: '/api/social/friends/requests/outgoing',
				method: 'GET'
			});
		}
	});

	// Search users
	const { data: searchData, isLoading: searchLoading } = useQuery({
		queryKey: ['/api/social/friends/search', searchQuery],
		queryFn: async () => {
			if (!searchQuery || searchQuery.length < 1) return { users: [] };

			return await apiRequest<{ users: FriendUser[] }>({
				url: `/api/social/friends/search?q=${encodeURIComponent(searchQuery)}&limit=10`,
				method: 'GET'
			});
		},
		enabled: searchQuery.length >= 1
	});

	// Send friend request
	const sendRequestMutation = useMutation({
		mutationFn: async ({ userId, message }: { userId: string; message?: string }) => {
			return await apiRequest({
				url: '/api/social/friends/request',
				method: 'POST',
				data: { userId, message }
			});
		},
		onSuccess: () => {
			toast({
				title: 'Friend request sent',
				variant: 'default'
			});
			queryClient.invalidateQueries({ queryKey: ['/api/social/friends'] });
			setSendRequestOpen(false);
			setRequestMessage('');
			setSelectedUser(null);
		},
		onError: (error: any) => {
			toast({
				title: 'Error',
				description: error.message || 'Failed to send friend request',
				variant: 'destructive'
			});
		}
	});

	// Respond to friend request
	const respondMutation = useMutation({
		mutationFn: async ({
			requestId,
			response
		}: {
			requestId: RequestId;
			response: 'accept' | 'decline' | 'block';
		}) => {
			return await apiRequest({ url: `/api/social/friends/requests/${requestId}/respond`,
				method: 'POST',
				data: { response }
			});
		},
		onSuccess: (_, { response }) => {
			toast({
				title: `Friend request ${response}ed`,
				variant: 'default'
			});
			queryClient.invalidateQueries({ queryKey: ['/api/social/friends'] });
		},
		onError: (error: any) => {
			toast({
				title: 'Error',
				description: error.message || 'Failed to respond to friend request',
				variant: 'destructive'
			});
		}
	});

	// Remove friend
	const removeFriendMutation = useMutation({
		mutationFn: async (userId: string) => {
			return await apiRequest({
				url: '/api/social/friends',
				method: 'DELETE',
				data: { userId }
			});
		},
		onSuccess: () => {
			toast({
				title: 'Friend removed',
				variant: 'default'
			});
			queryClient.invalidateQueries({ queryKey: ['/api/social/friends'] });
		},
		onError: (error: any) => {
			toast({
				title: 'Error',
				description: error.message || 'Failed to remove friend',
				variant: 'destructive'
			});
		}
	});

	const handleSendRequest = (user: FriendUser) => {
		setSelectedUser(user);
		setSendRequestOpen(true);
	};

	const handleConfirmSendRequest = () => {
		if (selectedUser) {
			sendRequestMutation.mutate({
				userId: selectedUser.id,
				message: requestMessage.trim() || undefined
			});
		}
	};

	const getRoleColor = (role?: string | null) => {
		switch (role) {
			case 'admin':
				return 'bg-red-900/60 text-red-300 border-red-700/30';
			case 'mod':
				return 'bg-blue-900/60 text-blue-300 border-blue-700/30';
			default:
				return 'bg-zinc-700/60 text-zinc-300 border-zinc-600/30';
		}
	};

	const getRoleLabel = (role?: string | null) => {
		switch (role) {
			case 'admin':
				return 'Admin';
			case 'mod':
				return 'Mod';
			default:
				return 'User';
		}
	};

	const FriendCard = ({ friendship }: { friendship: Friendship }) => (
		<div className="flex items-center justify-between p-4 border border-zinc-800 rounded-lg hover:bg-zinc-900/50 transition-colors">
			<div className="flex items-center gap-3">
				<Avatar className="h-12 w-12 border border-zinc-700">
					<AvatarImage
						src={friendship.friend.activeAvatarUrl || friendship.friend.avatarUrl || ''}
						alt={friendship.friend.username}
					/>
					<AvatarFallback className="bg-zinc-800 text-zinc-300">
						{friendship.friend.username.slice(0, 2).toUpperCase()}
					</AvatarFallback>
				</Avatar>

				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 mb-1">
						<Link
							href={`/profile/${friendship.friend.username}`}
							className="font-medium text-zinc-200 hover:text-emerald-400 transition-colors"
						>
							{friendship.friend.username}
						</Link>

						{friendship.friend.role && friendship.friend.role !== 'user' && (
							<Badge className={cn('text-xs px-1.5 py-0', getRoleColor(friendship.friend.role))}>
								{getRoleLabel(friendship.friend.role)}
							</Badge>
						)}
					</div>

					<div className="flex items-center gap-4 text-xs text-zinc-500">
						{friendship.friend.level && <span>Level {friendship.friend.level}</span>}
						{friendship.friend.clout && (
							<span>{friendship.friend.clout.toLocaleString()} Clout</span>
						)}
						<span>
							Friends since{' '}
							{formatDistanceToNow(new Date(friendship.friendedAt), { addSuffix: true })}
						</span>
					</div>

					<div className="flex items-center gap-2 mt-2">
						{friendship.permissions.allowWhispers && (
							<Badge variant="outline" className="text-xs">
								<MessageCircle className="h-3 w-3 mr-1" />
								Messages
							</Badge>
						)}
						{friendship.permissions.allowProfileView && (
							<Badge variant="outline" className="text-xs">
								<Eye className="h-3 w-3 mr-1" />
								Profile
							</Badge>
						)}
						{friendship.permissions.allowActivityView && (
							<Badge variant="outline" className="text-xs">
								<Activity className="h-3 w-3 mr-1" />
								Activity
							</Badge>
						)}
					</div>
				</div>
			</div>

			<div className="flex items-center gap-2">
				{friendship.permissions.allowWhispers && (
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							// Navigate to whispers/messages
							window.location.href = `/messages?user=${friendship.friend.username}`;
						}}
					>
						<MessageCircle className="h-4 w-4" />
					</Button>
				)}

				<Button
					variant="outline"
					size="sm"
					onClick={() => removeFriendMutation.mutate(friendship.friend.id)}
					disabled={removeFriendMutation.isPending}
				>
					<UserMinus className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);

	const RequestCard = ({
		request,
		type
	}: {
		request: FriendRequest;
		type: 'incoming' | 'outgoing';
	}) => {
		const user = type === 'incoming' ? request.requester : request.addressee;
		if (!user) return null;

		return (
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
								href={`/profile/${user.username}`}
								className="font-medium text-zinc-200 hover:text-emerald-400 transition-colors"
							>
								{user.username}
							</Link>

							{user.role && user.role !== 'user' && (
								<Badge className={cn('text-xs px-1.5 py-0', getRoleColor(user.role))}>
									{getRoleLabel(user.role)}
								</Badge>
							)}
						</div>

						<div className="flex items-center gap-4 text-xs text-zinc-500 mb-2">
							{user.level && <span>Level {user.level}</span>}
							<span>{formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}</span>
						</div>

						{request.requestMessage && (
							<p className="text-sm text-zinc-400 italic">"{request.requestMessage}"</p>
						)}
					</div>
				</div>

				{type === 'incoming' && (
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => respondMutation.mutate({ requestId: request.id, response: 'accept' })}
							disabled={respondMutation.isPending}
						>
							<Check className="h-4 w-4" />
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => respondMutation.mutate({ requestId: request.id, response: 'decline' })}
							disabled={respondMutation.isPending}
						>
							<X className="h-4 w-4" />
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => respondMutation.mutate({ requestId: request.id, response: 'block' })}
							disabled={respondMutation.isPending}
						>
							<Block className="h-4 w-4" />
						</Button>
					</div>
				)}

				{type === 'outgoing' && (
					<Badge variant="secondary" className="bg-yellow-900/60 text-yellow-300">
						<Clock className="h-3 w-3 mr-1" />
						Pending
					</Badge>
				)}
			</div>
		);
	};

	const UserSearchCard = ({ user }: { user: FriendUser }) => (
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
							href={`/profile/${user.username}`}
							className="font-medium text-zinc-200 hover:text-emerald-400 transition-colors"
						>
							{user.username}
						</Link>

						{user.role && user.role !== 'user' && (
							<Badge className={cn('text-xs px-1.5 py-0', getRoleColor(user.role))}>
								{getRoleLabel(user.role)}
							</Badge>
						)}
					</div>

					<div className="flex items-center gap-4 text-xs text-zinc-500">
						{user.level && <span>Level {user.level}</span>}
						{user.clout && <span>{user.clout.toLocaleString()} Clout</span>}
					</div>
				</div>
			</div>

			<div className="flex items-center gap-2">
				{user.friendshipStatus === 'friends' && (
					<Badge variant="secondary" className="bg-emerald-900/60 text-emerald-300">
						Friends
					</Badge>
				)}
				{user.friendshipStatus === 'request_sent' && (
					<Badge variant="secondary" className="bg-yellow-900/60 text-yellow-300">
						Request Sent
					</Badge>
				)}
				{user.friendshipStatus === 'request_received' && (
					<Badge variant="secondary" className="bg-blue-900/60 text-blue-300">
						Request Received
					</Badge>
				)}
				{user.friendshipStatus === 'blocked' && (
					<Badge variant="secondary" className="bg-red-900/60 text-red-300">
						Blocked
					</Badge>
				)}
				{!user.friendshipStatus && (
					<Button
						variant="outline"
						size="sm"
						onClick={() => handleSendRequest(user)}
						disabled={sendRequestMutation.isPending}
					>
						<UserPlus className="h-4 w-4 mr-1" />
						Add Friend
					</Button>
				)}
			</div>
		</div>
	);

	return (
		<div className="space-y-6">
			{/* Header Stats */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Card>
					<CardContent className="p-6">
						<div className="flex items-center gap-3">
							<div className="p-3 bg-emerald-900/60 rounded-lg">
								<Users className="h-6 w-6 text-emerald-300" />
							</div>
							<div>
								<p className="text-sm text-zinc-400">Friends</p>
								<p className="text-2xl font-bold text-zinc-200">
									{counts?.friends?.toLocaleString() || 0}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center gap-3">
							<div className="p-3 bg-blue-900/60 rounded-lg">
								<Clock className="h-6 w-6 text-blue-300" />
							</div>
							<div>
								<p className="text-sm text-zinc-400">Pending Requests</p>
								<p className="text-2xl font-bold text-zinc-200">
									{counts?.incomingRequests?.toLocaleString() || 0}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Main Friends Manager */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Users className="h-5 w-5" />
						Friends Manager
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Tabs defaultValue="friends">
						<TabsList className="grid w-full grid-cols-4">
							<TabsTrigger value="friends">
								Friends {counts?.friends ? `(${counts.friends})` : ''}
							</TabsTrigger>
							<TabsTrigger value="incoming">
								Incoming {counts?.incomingRequests ? `(${counts.incomingRequests})` : ''}
							</TabsTrigger>
							<TabsTrigger value="outgoing">Outgoing</TabsTrigger>
							<TabsTrigger value="search">Find Friends</TabsTrigger>
						</TabsList>

						<TabsContent value="friends" className="mt-6">
							<div className="space-y-4">
								{friendsLoading ? (
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
								) : friendsData?.friends && friendsData.friends.length > 0 ? (
									<ScrollArea className="h-96">
										<div className="space-y-3">
											{friendsData.friends.map((friendship) => (
												<FriendCard key={friendship.id} friendship={friendship} />
											))}
										</div>
									</ScrollArea>
								) : (
									<div className="text-center py-8 text-zinc-400">
										<Users className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
										<p className="mb-2">No friends yet</p>
										<p className="text-sm">Search for users to send friend requests</p>
									</div>
								)}
							</div>
						</TabsContent>

						<TabsContent value="incoming" className="mt-6">
							<div className="space-y-4">
								{incomingLoading ? (
									<div className="space-y-3">
										{Array.from({ length: 2 }).map((_, i) => (
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
								) : incomingRequestsData?.requests && incomingRequestsData.requests.length > 0 ? (
									<ScrollArea className="h-96">
										<div className="space-y-3">
											{incomingRequestsData.requests.map((request) => (
												<RequestCard key={request.id} request={request} type="incoming" />
											))}
										</div>
									</ScrollArea>
								) : (
									<div className="text-center py-8 text-zinc-400">
										<Clock className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
										<p>No incoming friend requests</p>
									</div>
								)}
							</div>
						</TabsContent>

						<TabsContent value="outgoing" className="mt-6">
							<div className="space-y-4">
								{outgoingLoading ? (
									<div className="space-y-3">
										{Array.from({ length: 2 }).map((_, i) => (
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
								) : outgoingRequestsData?.requests && outgoingRequestsData.requests.length > 0 ? (
									<ScrollArea className="h-96">
										<div className="space-y-3">
											{outgoingRequestsData.requests.map((request) => (
												<RequestCard key={request.id} request={request} type="outgoing" />
											))}
										</div>
									</ScrollArea>
								) : (
									<div className="text-center py-8 text-zinc-400">
										<Send className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
										<p>No outgoing friend requests</p>
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
											placeholder="Search users to add as friends..."
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
														<UserSearchCard key={user.id} user={user} />
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
										<p>Search for users to send friend requests</p>
									</div>
								)}
							</div>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>

			{/* Send Friend Request Dialog */}
			<Dialog open={sendRequestOpen} onOpenChange={setSendRequestOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Send Friend Request</DialogTitle>
						<DialogDescription>Send a friend request to {selectedUser?.username}</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div className="flex items-center gap-3">
							{selectedUser && (
								<>
									<Avatar className="h-12 w-12 border border-zinc-700">
										<AvatarImage
											src={selectedUser.activeAvatarUrl || selectedUser.avatarUrl || ''}
											alt={selectedUser.username}
										/>
										<AvatarFallback className="bg-zinc-800 text-zinc-300">
											{selectedUser.username.slice(0, 2).toUpperCase()}
										</AvatarFallback>
									</Avatar>
									<div>
										<p className="font-medium text-zinc-200">{selectedUser.username}</p>
										{selectedUser.level && (
											<p className="text-sm text-zinc-500">Level {selectedUser.level}</p>
										)}
									</div>
								</>
							)}
						</div>
						<div>
							<label className="text-sm font-medium text-zinc-300 mb-2 block">
								Message (optional)
							</label>
							<Textarea
								placeholder="Add a personal message to your friend request..."
								value={requestMessage}
								onChange={(e) => setRequestMessage(e.target.value)}
								maxLength={500}
								rows={3}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setSendRequestOpen(false);
								setRequestMessage('');
								setSelectedUser(null);
							}}
						>
							Cancel
						</Button>
						<Button onClick={handleConfirmSendRequest} disabled={sendRequestMutation.isPending}>
							<Send className="h-4 w-4 mr-1" />
							Send Request
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
