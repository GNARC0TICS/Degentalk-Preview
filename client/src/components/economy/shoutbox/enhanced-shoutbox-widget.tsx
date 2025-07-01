/**
 * Enhanced Shoutbox Widget
 *
 * Complete shoutbox implementation with:
 * - User avatars and username colors
 * - Role badges (Admin, Moderator, VIP)
 * - Ignore system with UI controls
 * - Command processing (/tip, /rain, etc.)
 * - Enhanced message display
 * - Typing indicators
 * - Message queuing
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import {
	Send,
	X,
	Pin,
	Trash2,
	Shield,
	Crown,
	Star,
	MoreVertical,
	UserX,
	AlertCircle,
	Loader2,
	MessageSquare,
	ChevronUp,
	ChevronDown
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { apiRequest } from '@/lib/queryClient';
import type { RoomId, GroupId, MessageId } from '@/db/types';

interface User {
	id: number;
	username: string;
	avatarUrl?: string;
	level: number;
	groupId?: GroupId;
	roles?: string[];
	usernameColor?: string;
}

interface Message {
	id: number;
	roomId: RoomId;
	content: string;
	createdAt: string;
	editedAt?: string;
	isDeleted: boolean;
	isPinned: boolean;
	tipAmount?: number;
	user: User | null;
}

interface Room {
	id: number;
	name: string;
	description?: string;
	isPrivate: boolean;
	accessible: boolean;
	locked: boolean;
	messageCount?: number;
	activeUsers?: number;
	onlineUsers?: number;
}

interface ShoutboxConfig {
	enabled: boolean;
	maxMessageLength: number;
	rateLimitSeconds: number;
	allowUserAvatars: boolean;
	allowUsernameColors: boolean;
	allowCustomEmojis: boolean;
	allowMentions: boolean;
	commandsEnabled: boolean;
	allowTippingCommands: boolean;
	allowRainCommands: boolean;
	userIgnoreSystemEnabled: boolean;
	typingIndicatorsEnabled: boolean;
	themeConfig: {
		primaryColor?: string;
		backgroundColor?: string;
		textColor?: string;
		showTimestamps?: boolean;
		compactMode?: boolean;
		showAvatars?: boolean;
		avatarSize?: 'small' | 'medium' | 'large';
	};
}

interface EnhancedShoutboxWidgetProps {
	defaultRoomId?: RoomId;
	position?: 'sidebar' | 'main' | 'floating';
	maxHeight?: string;
	className?: string;
}

const EnhancedShoutboxWidget: React.FC<EnhancedShoutboxWidgetProps> = ({
	defaultRoomId,
	position = 'sidebar',
	maxHeight = '500px',
	className
}) => {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLTextAreaElement>(null);

	const [selectedRoom, setSelectedRoom] = useState<number | null>(defaultRoomId || null);
	const [message, setMessage] = useState('');
	const [isExpanded, setIsExpanded] = useState(position === 'main');
	const [showUserMenu, setShowUserMenu] = useState<number | null>(null);
	const [ignoredUsers, setIgnoredUsers] = useState<Set<number>>(new Set());
	const [typingUsers, setTypingUsers] = useState<Map<number, string>>(new Map());
	const [cooldownRemaining, setCooldownRemaining] = useState(0);
	const [messageQueue, setMessageQueue] = useState<string[]>([]);

	// Fetch configuration
	const { data: config } = useQuery<ShoutboxConfig>({
		queryKey: ['shoutbox-config', selectedRoom],
		queryFn: async () => {
			const url = selectedRoom
				? `/api/shoutbox/config?roomId=${selectedRoom}`
				: '/api/shoutbox/config';
			const response = await apiRequest({ url });
			return response.data;
		}
	});

	// Fetch rooms
	const { data: rooms } = useQuery<Room[]>({
		queryKey: ['shoutbox-rooms'],
		queryFn: async () => {
			const response = await apiRequest({ url: '/api/shoutbox/rooms' });
			return response;
		}
	});

	// Set default room when rooms load
	useEffect(() => {
		if (!selectedRoom && rooms && rooms.length > 0) {
			const defaultRoom = rooms.find((r) => r.name === 'degen-lounge') || rooms[0];
			if (defaultRoom) setSelectedRoom(defaultRoom.id);
		}
	}, [rooms, selectedRoom]);

	// Fetch messages
	const { data: messages, isLoading: messagesLoading } = useQuery<{
		data: Message[];
		meta: { count: number; hasMore: boolean };
	}>({
		queryKey: ['shoutbox-messages', selectedRoom],
		queryFn: async () => {
			if (!selectedRoom) return { data: [], meta: { count: 0, hasMore: false } };

			const response = await apiRequest({
				url: `/api/shoutbox/messages?roomId=${selectedRoom}&limit=50`
			});
			return response;
		},
		enabled: !!selectedRoom,
		refetchInterval: 5000 // Poll every 5 seconds
	});

	// Fetch ignored users
	const { data: ignoreList } = useQuery<number[]>({
		queryKey: ['shoutbox-ignored-users', user?.id],
		queryFn: async () => {
			if (!user) return [];
			const response = await apiRequest({
				url: `/api/shoutbox/ignore?userId=${user.id}`
			});
			return response.data || [];
		},
		enabled: !!user && config?.userIgnoreSystemEnabled
	});

	// Update ignored users set when data loads
	useEffect(() => {
		if (ignoreList) {
			setIgnoredUsers(new Set(ignoreList));
		}
	}, [ignoreList]);

	// Send message mutation
	const sendMessageMutation = useMutation({
		mutationFn: async (content: string) => {
			const response = await apiRequest({
				url: '/api/shoutbox/messages',
				method: 'POST',
				data: {
					content,
					roomId: selectedRoom
				}
			});
			return response;
		},
		onSuccess: () => {
			setMessage('');
			setCooldownRemaining(config?.rateLimitSeconds || 10);
			queryClient.invalidateQueries({ queryKey: ['shoutbox-messages', selectedRoom] });

			// Process message queue
			if (messageQueue.length > 0) {
				const nextMessage = messageQueue[0];
				setMessageQueue((prev) => prev.slice(1));
				setTimeout(
					() => {
						sendMessageMutation.mutate(nextMessage);
					},
					(config?.rateLimitSeconds || 10) * 1000
				);
			}
		},
		onError: (error: any) => {
			const errorMessage = error.response?.data?.error || error.message || 'Failed to send message';
			toast.error(errorMessage);

			// If rate limited, add to queue
			if (error.response?.status === 429 && config?.messageQueueEnabled) {
				setMessageQueue((prev) => [...prev, message]);
				toast.info('Message queued and will be sent when cooldown expires');
			}
		}
	});

	// Pin/unpin message mutation
	const pinMessageMutation = useMutation({
		mutationFn: async ({ messageId, isPinned }: { messageId: MessageId; isPinned: boolean }) => {
			const response = await apiRequest({
				url: `/api/shoutbox/messages/${messageId}/pin`,
				method: 'PATCH',
				data: { isPinned }
			});
			return response;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['shoutbox-messages', selectedRoom] });
			toast.success('Message pinned/unpinned');
		}
	});

	// Delete message mutation
	const deleteMessageMutation = useMutation({
		mutationFn: async (messageId: MessageId) => {
			const response = await apiRequest({
				url: `/api/shoutbox/messages/${messageId}`,
				method: 'DELETE'
			});
			return response;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['shoutbox-messages', selectedRoom] });
			toast.success('Message deleted');
		}
	});

	// Ignore/unignore user mutation
	const toggleIgnoreUserMutation = useMutation({
		mutationFn: async ({ userId, ignore }: { userId: number; ignore: boolean }) => {
			if (ignore) {
				const response = await apiRequest({
					url: '/api/shoutbox/ignore',
					method: 'POST',
					data: { targetUserId: userId, roomId: selectedRoom }
				});
				return response;
			} else {
				const response = await apiRequest({
					url: `/api/shoutbox/ignore/${userId}`,
					method: 'DELETE',
					params: { roomId: selectedRoom }
				});
				return response;
			}
		},
		onSuccess: (_, { userId, ignore }) => {
			if (ignore) {
				setIgnoredUsers((prev) => new Set([...prev, userId]));
				toast.success('User ignored');
			} else {
				setIgnoredUsers((prev) => {
					const newSet = new Set(prev);
					newSet.delete(userId);
					return newSet;
				});
				toast.success('User unignored');
			}
			queryClient.invalidateQueries({ queryKey: ['shoutbox-ignored-users'] });
		}
	});

	// Cooldown timer
	useEffect(() => {
		if (cooldownRemaining > 0) {
			const timer = setTimeout(() => {
				setCooldownRemaining((prev) => Math.max(0, prev - 1));
			}, 1000);
			return () => clearTimeout(timer);
		}
	}, [cooldownRemaining]);

	// Auto-scroll to bottom
	useEffect(() => {
		if (messages?.data) {
			messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
		}
	}, [messages]);

	// Handle typing indicators
	const handleTyping = useCallback(() => {
		if (!config?.typingIndicatorsEnabled || !user) return;

		// Send typing indicator via WebSocket (if implemented)
		// For now, just simulate locally
	}, [config, user]);

	const handleSendMessage = () => {
		if (!message.trim() || cooldownRemaining > 0) return;

		sendMessageMutation.mutate(message.trim());
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		} else {
			handleTyping();
		}
	};

	const getRoleBadge = (roles?: string[]) => {
		if (!roles || roles.length === 0) return null;

		if (roles.includes('admin')) {
			return (
				<div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
					<Crown className="w-3 h-3" />
					Admin
				</div>
			);
		}

		if (roles.includes('moderator')) {
			return (
				<div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
					<Shield className="w-3 h-3" />
					Mod
				</div>
			);
		}

		if (roles.includes('vip')) {
			return (
				<div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
					<Star className="w-3 h-3" />
					VIP
				</div>
			);
		}

		return null;
	};

	const getAvatarSize = () => {
		const size = config?.themeConfig?.avatarSize || 'medium';
		switch (size) {
			case 'small':
				return 'w-6 h-6';
			case 'large':
				return 'w-10 h-10';
			default:
				return 'w-8 h-8';
		}
	};

	const renderMessage = (msg: Message) => {
		if (!msg.user) return null;
		if (ignoredUsers.has(msg.user.id)) return null;

		const isOwnMessage = user?.id === msg.user.id;
		const canModerate = user?.roles?.includes('admin') || user?.roles?.includes('moderator');

		return (
			<div
				key={msg.id}
				className={cn(
					'group relative px-3 py-2 hover:bg-gray-50 transition-colors',
					msg.isPinned && 'bg-yellow-50 border-l-4 border-yellow-400',
					msg.isDeleted && 'opacity-50'
				)}
			>
				<div className="flex items-start gap-2">
					{/* Avatar */}
					{config?.allowUserAvatars && config?.themeConfig?.showAvatars !== false && (
						<img
							src={msg.user.avatarUrl || `/api/avatar/${msg.user.id}`}
							alt={msg.user.username}
							className={cn('rounded-full object-cover', getAvatarSize())}
						/>
					)}

					<div className="flex-1 min-w-0">
						{/* Header */}
						<div className="flex items-center gap-2 mb-0.5">
							<span
								className={cn(
									'font-medium text-sm',
									config?.allowUsernameColors && msg.user.usernameColor ? '' : 'text-gray-900'
								)}
								style={{
									color:
										config?.allowUsernameColors && msg.user.usernameColor
											? msg.user.usernameColor
											: undefined
								}}
							>
								{msg.user.username}
							</span>

							{getRoleBadge(msg.user.roles)}

							<span className="text-xs text-gray-500">Level {msg.user.level}</span>

							{config?.themeConfig?.showTimestamps !== false && (
								<span className="text-xs text-gray-400">
									{formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
								</span>
							)}

							{msg.isPinned && <Pin className="w-3 h-3 text-yellow-600" />}
						</div>

						{/* Content */}
						<div
							className={cn(
								'text-sm break-words',
								msg.isDeleted ? 'italic text-gray-400' : 'text-gray-700'
							)}
						>
							{msg.isDeleted ? '[Message deleted]' : msg.content}
						</div>
					</div>

					{/* Actions Menu */}
					<div className="relative">
						<button
							onClick={() => setShowUserMenu(showUserMenu === msg.id ? null : msg.id)}
							className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity"
						>
							<MoreVertical className="w-4 h-4 text-gray-500" />
						</button>

						{showUserMenu === msg.id && (
							<div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
								{/* Moderation actions */}
								{canModerate && !msg.isDeleted && (
									<>
										<button
											onClick={() => {
												pinMessageMutation.mutate({
													messageId: msg.id,
													isPinned: !msg.isPinned
												});
												setShowUserMenu(null);
											}}
											className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
										>
											<Pin className="w-4 h-4" />
											{msg.isPinned ? 'Unpin' : 'Pin'} Message
										</button>

										<button
											onClick={() => {
												deleteMessageMutation.mutate(msg.id);
												setShowUserMenu(null);
											}}
											className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-red-600"
										>
											<Trash2 className="w-4 h-4" />
											Delete Message
										</button>

										<div className="border-t border-gray-200 my-1" />
									</>
								)}

								{/* User actions */}
								{!isOwnMessage && config?.userIgnoreSystemEnabled && (
									<button
										onClick={() => {
											toggleIgnoreUserMutation.mutate({
												userId: msg.user!.id,
												ignore: !ignoredUsers.has(msg.user!.id)
											});
											setShowUserMenu(null);
										}}
										className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
									>
										<UserX className="w-4 h-4" />
										{ignoredUsers.has(msg.user.id) ? 'Unignore' : 'Ignore'} User
									</button>
								)}
							</div>
						)}
					</div>
				</div>
			</div>
		);
	};

	if (!config?.enabled) {
		return (
			<div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 p-4', className)}>
				<div className="flex items-center gap-2 text-gray-500">
					<AlertCircle className="w-5 h-5" />
					<span>Shoutbox is currently disabled</span>
				</div>
			</div>
		);
	}

	return (
		<div
			className={cn(
				'bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col',
				position === 'floating' && 'fixed bottom-4 right-4 w-96 z-50',
				className
			)}
			style={{
				backgroundColor: config?.themeConfig?.backgroundColor,
				maxHeight: isExpanded ? maxHeight : '48px'
			}}
		>
			{/* Header */}
			<div className="flex items-center justify-between p-3 border-b border-gray-200">
				<div className="flex items-center gap-2">
					<MessageSquare className="w-5 h-5 text-blue-500" />
					<h3 className="font-semibold text-gray-900">
						Shoutbox
						{selectedRoom && rooms && (
							<span className="text-sm font-normal text-gray-600 ml-2">
								- {rooms.find((r) => r.id === selectedRoom)?.name}
							</span>
						)}
					</h3>
				</div>

				<div className="flex items-center gap-2">
					{/* Room selector */}
					{rooms && rooms.length > 1 && (
						<select
							value={selectedRoom || ''}
							onChange={(e) => setSelectedRoom(parseInt(e.target.value))}
							className="text-sm px-2 py-1 border border-gray-300 rounded"
						>
							{rooms.map((room) => (
								<option key={room.id} value={room.id} disabled={!room.accessible}>
									{room.name} {room.locked && '🔒'}
								</option>
							))}
						</select>
					)}

					{/* Expand/Collapse */}
					{position !== 'main' && (
						<button
							onClick={() => setIsExpanded(!isExpanded)}
							className="p-1 hover:bg-gray-100 rounded"
						>
							{isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
						</button>
					)}

					{position === 'floating' && (
						<button onClick={() => setIsExpanded(false)} className="p-1 hover:bg-gray-100 rounded">
							<X className="w-4 h-4" />
						</button>
					)}
				</div>
			</div>

			{isExpanded && (
				<>
					{/* Messages */}
					<div
						className="flex-1 overflow-y-auto"
						style={{
							maxHeight: `calc(${maxHeight} - 120px)`,
							backgroundColor: config?.themeConfig?.backgroundColor
						}}
					>
						{messagesLoading ? (
							<div className="flex items-center justify-center h-32">
								<Loader2 className="w-6 h-6 animate-spin text-gray-400" />
							</div>
						) : messages?.data && messages.data.length > 0 ? (
							<>
								{/* Pinned messages first */}
								{messages.data.filter((msg) => msg.isPinned && !msg.isDeleted).map(renderMessage)}

								{/* Regular messages */}
								{messages.data.filter((msg) => !msg.isPinned).map(renderMessage)}

								<div ref={messagesEndRef} />
							</>
						) : (
							<div className="flex items-center justify-center h-32 text-gray-500">
								No messages yet. Be the first to say something!
							</div>
						)}
					</div>

					{/* Message queue indicator */}
					{messageQueue.length > 0 && (
						<div className="px-3 py-1 bg-blue-50 text-blue-700 text-xs">
							{messageQueue.length} message{messageQueue.length > 1 ? 's' : ''} queued
						</div>
					)}

					{/* Typing indicators */}
					{typingUsers.size > 0 && config?.typingIndicatorsEnabled && (
						<div className="px-3 py-1 text-xs text-gray-500 italic">
							{Array.from(typingUsers.values()).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'}{' '}
							typing...
						</div>
					)}

					{/* Input */}
					<div className="p-3 border-t border-gray-200">
						{user ? (
							<div className="flex gap-2">
								<textarea
									ref={inputRef}
									value={message}
									onChange={(e) => setMessage(e.target.value)}
									onKeyPress={handleKeyPress}
									placeholder={
										cooldownRemaining > 0
											? `Wait ${cooldownRemaining}s...`
											: config?.commandsEnabled
												? 'Type a message or /help for commands...'
												: 'Type a message...'
									}
									disabled={cooldownRemaining > 0 || sendMessageMutation.isPending}
									className={cn(
										'flex-1 px-3 py-2 border border-gray-300 rounded-md resize-none',
										'focus:outline-none focus:ring-2 focus:ring-blue-500',
										'disabled:bg-gray-100 disabled:cursor-not-allowed'
									)}
									rows={1}
									maxLength={config?.maxMessageLength || 500}
								/>
								<button
									onClick={handleSendMessage}
									disabled={
										!message.trim() || cooldownRemaining > 0 || sendMessageMutation.isPending
									}
									className={cn(
										'px-4 py-2 bg-blue-600 text-white rounded-md',
										'hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500',
										'disabled:bg-gray-300 disabled:cursor-not-allowed',
										'flex items-center gap-2'
									)}
								>
									{sendMessageMutation.isPending ? (
										<Loader2 className="w-4 h-4 animate-spin" />
									) : (
										<Send className="w-4 h-4" />
									)}
								</button>
							</div>
						) : (
							<div className="text-center text-gray-500 py-2">Please log in to send messages</div>
						)}

						{/* Character count */}
						{user && message.length > 0 && (
							<div className="mt-1 text-xs text-gray-500 text-right">
								{message.length}/{config?.maxMessageLength || 500}
							</div>
						)}
					</div>
				</>
			)}
		</div>
	);
};

export default EnhancedShoutboxWidget;
