import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
	Bell,
	BellOff,
	MessageSquare,
	FileText,
	Hash,
	MessageCircle,
	Check,
	CheckCheck,
	Settings
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';

interface MentionNotification {
	id: number;
	type: 'thread' | 'post' | 'shoutbox' | 'whisper';
	threadId?: string;
	postId?: string;
	messageId?: string;
	mentionText: string;
	context: string;
	isRead: boolean;
	createdAt: string;
	mentioningUser: {
		id: string;
		username: string;
		avatarUrl?: string | null;
		activeAvatarUrl?: string | null;
	};
}

interface MentionsNotificationsProps {
	showUnreadOnly?: boolean;
	limit?: number;
	className?: string;
}

export function MentionsNotifications({
	showUnreadOnly = false,
	limit = 20,
	className
}: MentionsNotificationsProps) {
	const queryClient = useQueryClient();
	const [selectedMentions, setSelectedMentions] = useState<number[]>([]);

	// Fetch mentions
	const {
		data: mentionsData,
		isLoading,
		refetch
	} = useQuery({
		queryKey: ['/api/social/mentions', { showUnreadOnly, limit }],
		queryFn: async () => {
			const params = new URLSearchParams({
				page: '1',
				limit: limit.toString()
			});

			return await apiRequest<{
				mentions: MentionNotification[];
				unreadCount: number;
				pagination: { page: number; limit: number; hasMore: boolean };
			}>({
				url: `/api/social/mentions?${params.toString()}`,
				method: 'GET'
			});
		},
		refetchInterval: 30000 // Refetch every 30 seconds
	});

	// Mark mentions as read
	const markAsReadMutation = useMutation({
		mutationFn: async (mentionIds?: number[]) => {
			return await apiRequest({
				url: '/api/social/mentions/mark-read',
				method: 'POST',
				data: { mentionIds }
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['/api/social/mentions'] });
			queryClient.invalidateQueries({ queryKey: ['/api/social/mentions/unread-count'] });
			setSelectedMentions([]);
		}
	});

	const mentions = mentionsData?.mentions || [];
	const unreadCount = mentionsData?.unreadCount || 0;

	const getMentionIcon = (type: string) => {
		switch (type) {
			case 'thread':
				return <FileText className="h-4 w-4" />;
			case 'post':
				return <MessageSquare className="h-4 w-4" />;
			case 'shoutbox':
				return <Hash className="h-4 w-4" />;
			case 'whisper':
				return <MessageCircle className="h-4 w-4" />;
			default:
				return <Bell className="h-4 w-4" />;
		}
	};

	const getMentionUrl = (mention: MentionNotification) => {
		switch (mention.type) {
			case 'thread':
			case 'post':
				return mention.threadId
					? `/threads/${mention.threadId}${mention.postId ? `#post-${mention.postId}` : ''}`
					: '#';
			case 'shoutbox':
				return '/'; // Navigate to main page with shoutbox
			case 'whisper':
				return '/messages'; // Navigate to messages/whispers page
			default:
				return '#';
		}
	};

	const handleMentionClick = (mention: MentionNotification) => {
		// Mark as read when clicked
		if (!mention.isRead) {
			markAsReadMutation.mutate([mention.id]);
		}
	};

	const handleMarkAllAsRead = () => {
		const unreadMentionIds = mentions.filter((m) => !m.isRead).map((m) => m.id);
		if (unreadMentionIds.length > 0) {
			markAsReadMutation.mutate(unreadMentionIds);
		}
	};

	const handleMarkSelectedAsRead = () => {
		if (selectedMentions.length > 0) {
			markAsReadMutation.mutate(selectedMentions);
		}
	};

	const toggleMentionSelection = (mentionId: number) => {
		setSelectedMentions((prev) =>
			prev.includes(mentionId) ? prev.filter((id) => id !== mentionId) : [...prev, mentionId]
		);
	};

	if (isLoading) {
		return (
			<Card className={className}>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Bell className="h-5 w-5" />
						Mentions
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{Array.from({ length: 3 }).map((_, i) => (
							<div key={i} className="flex items-center gap-3">
								<Skeleton className="h-10 w-10 rounded-full" />
								<div className="flex-1 space-y-2">
									<Skeleton className="h-4 w-24" />
									<Skeleton className="h-3 w-32" />
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	const filteredMentions = showUnreadOnly ? mentions.filter((m) => !m.isRead) : mentions;

	return (
		<Card className={className}>
			<CardHeader className="pb-4">
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<Bell className="h-5 w-5" />
						Mentions
						{unreadCount > 0 && (
							<Badge variant="secondary" className="bg-emerald-900/60 text-emerald-300">
								{unreadCount}
							</Badge>
						)}
					</CardTitle>
					<div className="flex items-center gap-2">
						{selectedMentions.length > 0 && (
							<Button
								size="sm"
								variant="outline"
								onClick={handleMarkSelectedAsRead}
								disabled={markAsReadMutation.isPending}
							>
								<CheckCheck className="h-4 w-4 mr-1" />
								Mark Selected
							</Button>
						)}
						{unreadCount > 0 && (
							<Button
								size="sm"
								variant="outline"
								onClick={handleMarkAllAsRead}
								disabled={markAsReadMutation.isPending}
							>
								<Check className="h-4 w-4 mr-1" />
								Mark All Read
							</Button>
						)}
					</div>
				</div>
			</CardHeader>
			<CardContent className="p-0">
				{filteredMentions.length === 0 ? (
					<div className="flex flex-col items-center justify-center p-8 text-center">
						<BellOff className="h-12 w-12 text-zinc-500 mb-4" />
						<p className="text-zinc-400 mb-2">
							{showUnreadOnly ? 'No unread mentions' : 'No mentions yet'}
						</p>
						<p className="text-sm text-zinc-500">
							You'll see notifications here when someone mentions you
						</p>
					</div>
				) : (
					<ScrollArea className="h-96">
						<div className="px-6 pb-6 space-y-2">
							{filteredMentions.map((mention) => (
								<div
									key={mention.id}
									className={cn(
										'flex items-start gap-3 p-3 border-b border-zinc-800 last:border-b-0',
										'hover:bg-zinc-900/50 transition-colors cursor-pointer',
										!mention.isRead && 'bg-emerald-900/10 border-l-2 border-l-emerald-500'
									)}
								>
									<div className="flex items-center gap-2">
										<input
											type="checkbox"
											checked={selectedMentions.includes(mention.id)}
											onChange={() => toggleMentionSelection(mention.id)}
											className="w-4 h-4 text-emerald-600 bg-zinc-800 border-zinc-600 rounded focus:ring-emerald-500"
										/>
										<Avatar className="h-10 w-10 border border-zinc-700">
											<AvatarImage
												src={
													mention.mentioningUser.activeAvatarUrl ||
													mention.mentioningUser.avatarUrl ||
													''
												}
												alt={mention.mentioningUser.username}
											/>
											<AvatarFallback className="bg-zinc-800 text-zinc-300">
												{mention.mentioningUser.username.slice(0, 2).toUpperCase()}
											</AvatarFallback>
										</Avatar>
									</div>

									<div className="flex-1 min-w-0">
										<Link
											href={getMentionUrl(mention)}
											onClick={() => handleMentionClick(mention)}
											className="block"
										>
											<div className="flex items-center gap-2 mb-1">
												<span className="font-medium text-zinc-200">
													{mention.mentioningUser.username}
												</span>
												<span className="text-zinc-400">mentioned you in</span>
												<div className="flex items-center gap-1 text-zinc-500">
													{getMentionIcon(mention.type)}
													<span className="text-xs capitalize">{mention.type}</span>
												</div>
											</div>

											<p className="text-sm text-zinc-400 truncate mb-2">{mention.context}</p>

											<div className="flex items-center justify-between">
												<span className="text-xs text-zinc-500">
													{formatDistanceToNow(new Date(mention.createdAt), {
														addSuffix: true
													})}
												</span>
												{!mention.isRead && (
													<Badge
														variant="secondary"
														className="bg-emerald-900/60 text-emerald-300 text-xs"
													>
														New
													</Badge>
												)}
											</div>
										</Link>
									</div>
								</div>
							))}
						</div>
					</ScrollArea>
				)}
			</CardContent>
		</Card>
	);
}
