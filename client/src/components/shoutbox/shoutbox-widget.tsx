import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { format, formatDistanceToNow } from 'date-fns';

// Import UI components
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AvatarFrame } from '@/components/identity/AvatarFrame';
import { UserName } from '@/components/users/Username';
import { LevelBadge } from '@/components/economy/xp/LevelBadge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useShoutbox } from '@/contexts/shoutbox-context';
import { ShoutboxPositionSelector } from './shoutbox-position-selector';
import { useIdentityDisplay } from '@/hooks/useIdentityDisplay';

// Import icons
import {
	MessageSquareLock,
	MessagesSquare,
	Send,
	RefreshCw,
	Clock,
	AlertCircle,
	User,
	Trash2,
	MoreVertical,
	Smile,
	Pin,
	PinOff,
	MinusCircle,
	Minus,
	Plus,
	Maximize2,
	Lock as LockIcon
} from 'lucide-react';
import type { GroupId, MessageId, EntityId } from '@/types/ids';

// Types for shoutbox messages
interface ShoutboxUser {
	id: EntityId;
	username: string;
	avatarUrl: string | null;
	activeAvatarUrl: string | null;
	level: number;
	groupId: GroupId; // 1 = admin, 2 = moderator, 3 = regular user
}

interface ShoutboxMessage {
	id: MessageId;
	content: string;
	createdAt: string;
	editedAt: string | null;
	isDeleted: boolean;
	isPinned: boolean;
	tipAmount: number | null;
	user: ShoutboxUser;
}

// Types for custom emojis
interface CustomEmoji {
	id: EntityId;
	name: string;
	code: string;
	imageUrl: string;
	category: string;
	isLocked: boolean;
	unlockType: string;
	requiredPath?: string;
	requiredPathXP?: number;
	accessible: boolean;
	locked: boolean;
}

// Fallback emoji list in case API fails
const FALLBACK_EMOJI_LIST = [
	'😀',
	'😎',
	'🚀',
	'💰',
	'💎',
	'🔥',
	'👍',
	'🎉',
	'🌙',
	'⭐',
	'💯',
	'🤑',
	'💸',
	'📈',
	'📉',
	'🪙',
	'💲',
	'💹',
	'🏆',
	'✨'
];

interface ShoutboxWidgetProps {
	instanceId?: string;
}

export default function ShoutboxWidget({ instanceId }: ShoutboxWidgetProps) {
	const [message, setMessage] = useState<string>('');
	const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
	const [, setEmojiCategory] = useState<string>('all');
	const [lockedEmojiInfo, setLockedEmojiInfo] = useState<CustomEmoji | null>(null);
	const messageContainerRef = useRef<HTMLDivElement>(null);
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const { position, expansionLevel, cycleExpansionLevel, updateExpansionLevel } = useShoutbox();

	// TODO: Replace with actual auth check from user context
	// Temporarily set to true for testing purposes
	const userLoggedIn = true;
	// Mock user data for testing
	const currentUser = {
		id: 1,
		username: 'TestUser',
		avatarUrl: null,
		activeAvatarUrl: null,
		level: 5,
		groupId: 3 // Regular user
	};

	// Check if current user is admin or moderator
	const isModOrAdmin = currentUser?.groupId === 1 || currentUser?.groupId === 2;

	// Fetch custom emojis
	const {
		data: customEmojis = [],
		isLoading: isLoadingEmojis,
		isError: isErrorEmojis,
		refetch: refetchEmojis
	} = useQuery({
		queryKey: ['/api/chat/emojis'],
		queryFn: async () => {
			const response = await axios.get('/api/chat/emojis');
			return response.data;
		},
		staleTime: 5 * 60 * 1000, // Cache valid for 5 minutes
		refetchOnWindowFocus: false
	});

	// Fetch messages
	const {
		data: messages = [],
		isLoading,
		isError,
		refetch
	} = useQuery({
		queryKey: ['/api/shoutbox/messages'],
		queryFn: async () => {
			const response = await axios.get('/api/shoutbox/messages');
			return response.data || []; // Ensure we always return an array
		},
		refetchInterval: 10000 // Refetch every 10 seconds
	});

	// Post message mutation
	const postMessage = useMutation({
		mutationFn: async (content: string) => {
			const response = await axios.post('/api/shoutbox/messages', { content });
			return response.data;
		},
		onSuccess: () => {
			// Clear input and refetch messages
			setMessage('');
			setShowEmojiPicker(false);
			queryClient.invalidateQueries({ queryKey: ['/api/shoutbox/messages'] });
		},
		onError: (error: Error) => {
			toast({
				title: 'Error sending message',
				description: error.message || 'Unable to send message at this time',
				variant: 'destructive'
			});
		}
	});

	// Delete message mutation for mods/admins
	const deleteMessage = useMutation({
		mutationFn: async (messageId: MessageId) => {
			const response = await axios.delete(`/api/shoutbox/messages/${messageId}`);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['/api/shoutbox/messages'] });
			toast({
				title: 'Message deleted',
				description: 'The message has been removed from the shoutbox'
			});
		},
		onError: (error: Error) => {
			toast({
				title: 'Error deleting message',
				description: error.message || 'Unable to delete the message',
				variant: 'destructive'
			});
		}
	});

	// Pin message mutation for mods/admins
	const pinMessage = useMutation({
		mutationFn: async ({ messageId, isPinned }: { messageId: MessageId; isPinned: boolean }) => {
			const response = await axios.patch(`/api/shoutbox/messages/${messageId}`, {
				isPinned
			});
			return response.data;
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ['/api/shoutbox/messages'] });
			toast({
				title: variables.isPinned ? 'Message pinned' : 'Message unpinned',
				description: variables.isPinned
					? 'The message has been pinned to the shoutbox'
					: 'The message has been unpinned from the shoutbox'
			});
		},
		onError: (error: Error) => {
			toast({
				title: 'Error updating message',
				description: error.message || 'Unable to update the message',
				variant: 'destructive'
			});
		}
	});

	// Scroll to bottom of messages when new ones arrive
	useEffect(() => {
		if (messageContainerRef.current && messages.length > 0) {
			const container = messageContainerRef.current;
			container.scrollTop = container.scrollHeight;
		}
	}, [messages]);

	// Handle sending a message
	const handleSendMessage = () => {
		if (!message.trim()) return;

		if (!userLoggedIn) {
			toast({
				title: 'Login Required',
				description: 'You need to be logged in to send messages',
				variant: 'destructive'
			});
			return;
		}

		postMessage.mutate(message);
	};

	// Handle keypresses in the input field
	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	// Toggle expansion level
	const toggleExpanded = () => {
		// Cycle to the next expansion level
		cycleExpansionLevel();
	};

	// Format the time for display
	const formatMessageTime = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;

		if (diffInHours < 24) {
			return formatDistanceToNow(date, { addSuffix: true });
		} else {
			return format(date, 'MMM d, h:mm a');
		}
	};

	const MessageItem: React.FC<{ msg: ShoutboxMessage }> = ({ msg }) => {
		const identity = useIdentityDisplay({
			id: String(msg.user.id),
			username: msg.user.username,
			level: msg.user.level
		});
		const messageTime = formatMessageTime(msg.createdAt);

		return (
			<div
				key={msg.id}
				className={`flex items-start p-2 hover:bg-zinc-800/50 rounded-md transition-colors duration-150 ${msg.isDeleted ? 'opacity-50' : ''}`}
			>
				<AvatarFrame
					avatarUrl={msg.user.activeAvatarUrl || msg.user.avatarUrl || ''}
					frame={identity?.avatarFrame}
					size={24}
					className="mr-2"
				/>
				<div className="flex-1">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-1.5">
							<UserName user={msg.user} className="text-sm" />
							{(identity?.levelConfig || identity?.level) && (
								<LevelBadge
									levelConfig={identity?.levelConfig as any}
									level={identity?.level}
									className="text-xs px-1 py-0"
								/>
							)}
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<div className="text-xs text-zinc-500 flex items-center">
											<Clock className="h-3 w-3 mr-1" />
											{messageTime}
										</div>
									</TooltipTrigger>
									<TooltipContent>
										<p>{format(new Date(msg.createdAt), 'PPP p')}</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</div>
						{isModOrAdmin && !msg.isDeleted && (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										size="sm"
										className="h-auto p-1 ml-2 text-zinc-400 hover:text-zinc-300"
									>
										<MoreVertical className="h-3 w-3" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800">
									{msg.isPinned ? (
										<DropdownMenuItem
											className="text-zinc-300 cursor-pointer focus:text-zinc-100 focus:bg-zinc-800"
											onClick={() => pinMessage.mutate({ messageId: msg.id, isPinned: false })}
										>
											<PinOff className="mr-2 h-4 w-4" />
											<span>Unpin Message</span>
										</DropdownMenuItem>
									) : (
										<DropdownMenuItem
											className="text-emerald-400 cursor-pointer focus:text-emerald-300 focus:bg-emerald-950/30"
											onClick={() => pinMessage.mutate({ messageId: msg.id, isPinned: true })}
										>
											<Pin className="mr-2 h-4 w-4" />
											<span>Pin Message</span>
										</DropdownMenuItem>
									)}
									<DropdownMenuItem
										className="text-red-400 cursor-pointer focus:text-red-300 focus:bg-red-950/30"
										onClick={() => deleteMessage.mutate(msg.id)}
									>
										<Trash2 className="mr-2 h-4 w-4" />
										<span>Delete Message</span>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						)}
					</div>
					<div className="ml-8 text-zinc-300">
						{msg.isDeleted ? (
							<span className="italic text-zinc-500">Message deleted</span>
						) : (
							msg.content
						)}
						{msg.editedAt && <span className="ml-1 text-xs italic text-zinc-500">(edited)</span>}
					</div>
				</div>
			</div>
		);
	};

	return (
		<Card
			data-testid="shoutbox-widget"
			className={`bg-zinc-900/50 border border-zinc-800 overflow-hidden transition-all duration-300 flex flex-col ${
				expansionLevel === 'expanded'
					? 'h-[600px]'
					: expansionLevel === 'preview'
						? 'h-[400px]'
						: 'h-[200px]'
			}`}
		>
			<CardHeader className="pb-2 space-y-2 sm:space-y-0 flex flex-col sm:flex-row sm:items-center sm:justify-between">
				<CardTitle className="text-lg flex items-center">
					{userLoggedIn ? (
						<MessagesSquare className="h-5 w-5 text-emerald-500 mr-2" />
					) : (
						<MessageSquareLock className="h-5 w-5 text-emerald-500 mr-2" />
					)}
					Shoutbox
				</CardTitle>
				<div className="flex items-center space-x-1">
					{/* Hide button for floating view (both mobile and desktop) */}
					{position === 'floating' && (
						<Button
							variant="ghost"
							size="sm"
							className="text-zinc-400 hover:text-red-400 p-1 h-auto"
							onClick={() => updateExpansionLevel('collapsed')}
						>
							<MinusCircle className="h-4 w-4" />
						</Button>
					)}
					<Button
						variant="ghost"
						size="sm"
						className="text-zinc-400 hover:text-emerald-400 p-1 h-auto"
						onClick={toggleExpanded}
						title={
							expansionLevel === 'expanded'
								? 'Collapse'
								: expansionLevel === 'collapsed'
									? 'Expand'
									: 'Full View'
						}
					>
						{expansionLevel === 'expanded' ? (
							<Minus className="h-4 w-4" />
						) : expansionLevel === 'collapsed' ? (
							<Plus className="h-4 w-4" />
						) : (
							<Maximize2 className="h-4 w-4" />
						)}
					</Button>
					<Button
						variant="ghost"
						size="sm"
						className="text-zinc-400 hover:text-emerald-400 p-1 h-auto"
						onClick={() => refetch()}
						disabled={isLoading}
					>
						<RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
					</Button>
					<ShoutboxPositionSelector instanceId={instanceId} />
				</div>
			</CardHeader>

			<CardContent className="p-3 flex-1 overflow-hidden">
				{/* Messages container */}
				<div
					ref={messageContainerRef}
					className={`space-y-3 overflow-y-auto mb-3 ${
						expansionLevel === 'expanded'
							? 'h-[450px]'
							: expansionLevel === 'preview'
								? 'h-[250px]'
								: 'h-[100px]'
					} custom-scrollbar`}
				>
					{isError ? (
						<div className="flex items-center justify-center h-full text-red-400">
							<AlertCircle className="h-5 w-5 mr-2" />
							<span>Error loading messages</span>
						</div>
					) : isLoading && messages.length === 0 ? (
						<div className="flex items-center justify-center h-full text-zinc-500">
							<RefreshCw className="h-5 w-5 mr-2 animate-spin" />
							<span>Loading messages...</span>
						</div>
					) : messages.length === 0 ? (
						<div className="flex flex-col items-center justify-center h-full text-zinc-500">
							{userLoggedIn ? (
								<MessagesSquare className="h-8 w-8 mb-2" />
							) : (
								<MessageSquareLock className="h-8 w-8 mb-2" />
							)}
							<span>No messages yet</span>
							<span className="text-xs mt-1">Be the first to say something!</span>
						</div>
					) : Array.isArray(messages) ? (
						messages.map((msg: ShoutboxMessage) => <MessageItem key={msg.id} msg={msg} />)
					) : null}
				</div>
			</CardContent>

			<CardFooter className="border-t border-zinc-800 p-3 flex-col">
				<div className="flex w-full relative">
					<Input
						className="bg-zinc-800 border-zinc-700 focus:border-emerald-600 mr-2"
						placeholder={userLoggedIn ? 'Type a message...' : 'Login to chat...'}
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						onKeyDown={handleKeyPress}
						disabled={!userLoggedIn || postMessage.isPending}
						maxLength={200}
					/>

					{userLoggedIn && (
						<div className="flex">
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => setShowEmojiPicker(!showEmojiPicker)}
											className="mr-1 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800"
											disabled={postMessage.isPending}
										>
											<Smile className="h-4 w-4" />
										</Button>
									</TooltipTrigger>
									<TooltipContent>
										<p>Add emoji</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>

							<Button
								variant="default"
								className="bg-emerald-600 hover:bg-emerald-500"
								onClick={handleSendMessage}
								disabled={!userLoggedIn || !message.trim() || postMessage.isPending}
							>
								{postMessage.isPending ? (
									<RefreshCw className="h-4 w-4 animate-spin" />
								) : (
									<Send className="h-4 w-4" />
								)}
							</Button>
						</div>
					)}

					{!userLoggedIn && (
						<Button
							variant="default"
							className="bg-emerald-600 hover:bg-emerald-500"
							disabled={true}
						>
							<Send className="h-4 w-4" />
						</Button>
					)}

					{/* Emoji Picker Popover */}
					{showEmojiPicker && (
						<div className="absolute bottom-12 right-0 bg-zinc-900 border border-zinc-800 rounded-md p-2 shadow-lg z-10 w-64">
							{/* Emoji Category Tabs */}
							<Tabs defaultValue="all" className="w-full mb-2" onValueChange={setEmojiCategory}>
								<TabsList className="grid grid-cols-5 mb-2">
									<TabsTrigger value="all" className="text-xs py-1 px-2">
										All
									</TabsTrigger>
									<TabsTrigger value="standard" className="text-xs py-1 px-2">
										Standard
									</TabsTrigger>
									<TabsTrigger value="flex" className="text-xs py-1 px-2">
										Flex
									</TabsTrigger>
									<TabsTrigger value="memes" className="text-xs py-1 px-2">
										Memes
									</TabsTrigger>
									<TabsTrigger value="rare" className="text-xs py-1 px-2">
										Rare
									</TabsTrigger>
								</TabsList>

								{/* All Emojis Tab */}
								<TabsContent value="all">
									{isLoadingEmojis ? (
										<div className="flex items-center justify-center h-24 text-zinc-500">
											<RefreshCw className="h-5 w-5 mr-2 animate-spin" />
											<span>Loading emojis...</span>
										</div>
									) : isErrorEmojis || customEmojis.length === 0 ? (
										<div className="flex flex-col items-center justify-center h-24 text-zinc-500">
											<AlertCircle className="h-5 w-5 mb-2" />
											<span>No emojis available. Please try again later.</span>
											<Button
												variant="ghost"
												size="sm"
												className="mt-2"
												onClick={() => refetchEmojis()}
											>
												<RefreshCw className="h-4 w-4 mr-1" />
												Retry
											</Button>
										</div>
									) : (
										<div className="grid grid-cols-5 gap-2">
											{/* Standard Emojis */}
											{FALLBACK_EMOJI_LIST.map((emoji) => (
												<Button
													key={emoji}
													variant="ghost"
													size="sm"
													className="h-8 w-8 p-0 hover:bg-zinc-800"
													onClick={() => {
														setMessage((prev) => prev + emoji);
														setShowEmojiPicker(false);
													}}
												>
													{emoji}
												</Button>
											))}

											{/* Custom Emojis */}
											{customEmojis.map((emoji: CustomEmoji) => (
												<TooltipProvider key={emoji.id}>
													<Tooltip>
														<TooltipTrigger asChild>
															<div className="relative">
																<Button
																	variant="ghost"
																	size="sm"
																	className={`h-8 w-8 p-0 hover:bg-zinc-800 relative ${emoji.locked ? 'opacity-50 grayscale' : ''}`}
																	onClick={() => {
																		if (emoji.locked) {
																			setLockedEmojiInfo(emoji);
																		} else {
																			setMessage((prev) => prev + emoji.code);
																			setShowEmojiPicker(false);
																		}
																	}}
																>
																	<img src={emoji.imageUrl} alt={emoji.name} className="h-6 w-6" />
																</Button>
																{emoji.locked && (
																	<div className="absolute top-0 right-0 bg-zinc-900 rounded-full">
																		<LockIcon className="h-3 w-3 text-zinc-400" />
																	</div>
																)}
															</div>
														</TooltipTrigger>
														<TooltipContent>
															{emoji.locked ? (
																<p className="text-xs">
																	{emoji.unlockType === 'path_xp'
																		? `Unlock by reaching Level ${emoji.requiredPathXP || 'X'}`
																		: 'Unlock this emoji from the Shop'}
																</p>
															) : (
																<p className="text-xs">{emoji.name}</p>
															)}
														</TooltipContent>
													</Tooltip>
												</TooltipProvider>
											))}
										</div>
									)}
								</TabsContent>

								{/* Category-specific Tabs */}
								{['standard', 'flex', 'memes', 'rare'].map((category) => (
									<TabsContent key={category} value={category}>
										{isLoadingEmojis ? (
											<div className="flex items-center justify-center h-24 text-zinc-500">
												<RefreshCw className="h-5 w-5 mr-2 animate-spin" />
												<span>Loading emojis...</span>
											</div>
										) : isErrorEmojis || customEmojis.length === 0 ? (
											<div className="flex flex-col items-center justify-center h-24 text-zinc-500">
												<AlertCircle className="h-5 w-5 mb-2" />
												<span>No emojis available. Please try again later.</span>
												<Button
													variant="ghost"
													size="sm"
													className="mt-2"
													onClick={() => refetchEmojis()}
												>
													<RefreshCw className="h-4 w-4 mr-1" />
													Retry
												</Button>
											</div>
										) : (
											<div className="grid grid-cols-5 gap-2">
												{/* Filter emojis by category */}
												{customEmojis
													.filter(
														(emoji: CustomEmoji) =>
															emoji.category?.toLowerCase() === category.toLowerCase()
													)
													.map((emoji: CustomEmoji) => (
														<TooltipProvider key={emoji.id}>
															<Tooltip>
																<TooltipTrigger asChild>
																	<div className="relative">
																		<Button
																			variant="ghost"
																			size="sm"
																			className={`h-8 w-8 p-0 hover:bg-zinc-800 relative ${emoji.locked ? 'opacity-50 grayscale' : ''}`}
																			onClick={() => {
																				if (emoji.locked) {
																					setLockedEmojiInfo(emoji);
																				} else {
																					setMessage((prev) => prev + emoji.code);
																					setShowEmojiPicker(false);
																				}
																			}}
																		>
																			<img
																				src={emoji.imageUrl}
																				alt={emoji.name}
																				className="h-6 w-6"
																			/>
																		</Button>
																		{emoji.locked && (
																			<div className="absolute top-0 right-0 bg-zinc-900 rounded-full">
																				<LockIcon className="h-3 w-3 text-zinc-400" />
																			</div>
																		)}
																	</div>
																</TooltipTrigger>
																<TooltipContent>
																	{emoji.locked ? (
																		<p className="text-xs">
																			{emoji.unlockType === 'path_xp'
																				? `Unlock by reaching Level ${emoji.requiredPathXP || 'X'}`
																				: 'Unlock this emoji from the Shop'}
																		</p>
																	) : (
																		<p className="text-xs">{emoji.name}</p>
																	)}
																</TooltipContent>
															</Tooltip>
														</TooltipProvider>
													))}
												{customEmojis.filter(
													(emoji: CustomEmoji) =>
														emoji.category?.toLowerCase() === category.toLowerCase()
												).length === 0 && (
													<div className="col-span-5 flex justify-center items-center h-24 text-zinc-500">
														<span>No {category} emojis available yet</span>
													</div>
												)}
											</div>
										)}
									</TabsContent>
								))}
							</Tabs>

							{/* Footer */}
							<div className="flex justify-between items-center mt-2 pt-2 border-t border-zinc-800 text-xs text-zinc-500">
								<Button
									variant="ghost"
									size="sm"
									className="h-6 text-xs"
									onClick={() => refetchEmojis()}
								>
									<RefreshCw className="h-3 w-3 mr-1" />
									Refresh
								</Button>
								<span>
									{customEmojis.length} custom emoji{customEmojis.length !== 1 ? 's' : ''}
								</span>
							</div>
						</div>
					)}
				</div>

				{/* Character counter and status message */}
				{userLoggedIn ? (
					<div className="w-full flex justify-between items-center mt-2 text-xs">
						<div
							className={`${message.length > 180 ? (message.length > 190 ? 'text-red-400' : 'text-yellow-400') : 'text-zinc-500'}`}
						>
							{message.length}/200 characters
						</div>
						<div className="text-zinc-500">
							{message.length === 0 && 'Type a message to chat...'}
						</div>
					</div>
				) : (
					<div className="w-full text-center mt-2 text-xs text-zinc-500 flex items-center justify-center">
						<User className="h-3 w-3 mr-1" />
						<span>Login to participate in the shoutbox</span>
					</div>
				)}
			</CardFooter>

			{/* Locked Emoji Dialog */}
			<Dialog open={!!lockedEmojiInfo} onOpenChange={() => setLockedEmojiInfo(null)}>
				<DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-200 max-w-md">
					<DialogHeader>
						<DialogTitle className="text-lg font-bold flex items-center">
							<LockIcon className="h-5 w-5 mr-2 text-amber-500" />
							Locked Emoji
						</DialogTitle>
						<DialogDescription className="text-zinc-400">
							This emoji is currently locked and unavailable for use in the shoutbox.
						</DialogDescription>
					</DialogHeader>

					{lockedEmojiInfo && (
						<div className="flex flex-col items-center py-4 space-y-4">
							<div className="relative">
								<div className="h-16 w-16 bg-zinc-800 rounded-lg p-2 flex items-center justify-center grayscale opacity-70">
									<img
										src={lockedEmojiInfo.imageUrl}
										alt={lockedEmojiInfo.name}
										className="h-12 w-12"
									/>
								</div>
								<div className="absolute -top-2 -right-2 bg-zinc-900 rounded-full p-1 border border-zinc-700">
									<LockIcon className="h-5 w-5 text-amber-500" />
								</div>
							</div>

							<div className="text-center space-y-1">
								<h4 className="font-medium text-lg">{lockedEmojiInfo.name}</h4>
								<p className="text-sm text-zinc-400">Code: {lockedEmojiInfo.code}</p>
								<div className="mt-3">
									<span className="bg-zinc-800 py-1 px-2 rounded text-xs">
										{lockedEmojiInfo.category} category
									</span>
								</div>
							</div>

							<div className="bg-zinc-800/50 p-4 rounded-lg w-full mt-4">
								<h5 className="font-medium mb-2 flex items-center">
									<span className="bg-amber-500 h-2 w-2 rounded-full mr-2"></span>
									How to unlock
								</h5>
								{lockedEmojiInfo.unlockType === 'path_xp' ? (
									<div className="space-y-2">
										<p className="text-sm">
											Reach{' '}
											<span className="text-emerald-400 font-medium">
												Level {lockedEmojiInfo.requiredPathXP}
											</span>{' '}
											to unlock this emoji.
										</p>
										<div className="bg-zinc-900 p-2 rounded text-xs text-zinc-400 mt-2">
											Continue participating in discussions, creating threads, and earning XP to
											level up.
										</div>
									</div>
								) : (
									<div className="space-y-2">
										<p className="text-sm">
											Purchase this emoji from the{' '}
											<span className="text-emerald-400 font-medium">Shop</span>.
										</p>
										<div className="bg-zinc-900 p-2 rounded text-xs text-zinc-400 mt-2">
											Visit the shop section to purchase this and other exclusive emoji packs.
										</div>
									</div>
								)}
							</div>
						</div>
					)}

					<DialogFooter>
						<Button
							variant="outline"
							className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-100"
							onClick={() => setLockedEmojiInfo(null)}
						>
							Close
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</Card>
	);
}
