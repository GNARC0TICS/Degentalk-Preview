import React, { useState, useEffect } from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMessages } from '@/hooks/use-messages';
import { useAsyncButton } from '@/hooks/use-async-button';
import { Loader2, Search, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { getInitials } from '@/lib/utils';

interface User {
	id: number;
	username: string;
	avatarUrl?: string;
}

interface WhisperModalProps {
	isOpen: boolean;
	onClose: () => void;
	initialUser?: User;
}

export function WhisperModal({ isOpen, onClose, initialUser }: WhisperModalProps) {
	const [selectedUser, setSelectedUser] = useState<User | null>(initialUser || null);
	const [searchTerm, setSearchTerm] = useState('');
	const [message, setMessage] = useState('');
	const [isRateLimited, setIsRateLimited] = useState(false);
	const { toast } = useToast();

	// Reset state when modal opens
	useEffect(() => {
		if (isOpen) {
			if (!initialUser) {
				setSelectedUser(null);
				setSearchTerm('');
			} else {
				setSelectedUser(initialUser);
			}
			setMessage('');
		}
	}, [isOpen, initialUser]);

	// Get the users list for the search
	const { data: users, isLoading: isLoadingUsers } = useQuery({
		queryKey: ['/api/users/search', searchTerm],
		queryFn: async () => {
			if (!searchTerm || searchTerm.length < 2) return [];
			const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchTerm)}`);
			if (!response.ok) throw new Error('Failed to search users');
			return response.json();
		},
		enabled: searchTerm.length >= 2
	});

	// Get messaging functionality
	const { useSendMessage } = useMessages();
	const { mutate: sendMessage, isPending: isSendingMessage } = useSendMessage();

	// Use async button for the send action
	const { handleClick: handleSend, isLoading: isSending } = useAsyncButton(async () => {
		if (!selectedUser) {
			toast({
				title: 'No recipient selected',
				description: 'Please select a user to send a message to',
				variant: 'destructive'
			});
			return;
		}

		if (!message.trim()) {
			toast({
				title: 'Empty message',
				description: 'Please enter a message to send',
				variant: 'destructive'
			});
			return;
		}

		// Rate limiting check
		if (isRateLimited) {
			toast({
				title: 'Please wait',
				description: "You're sending messages too quickly. Please wait a moment.",
				variant: 'destructive'
			});
			return;
		}

		// Set rate limiting
		setIsRateLimited(true);

		// Reset rate limiting after 2 seconds
		setTimeout(() => {
			setIsRateLimited(false);
		}, 2000);

		await new Promise<void>((resolve, reject) => {
			sendMessage(
				{ recipientId: selectedUser.id, content: message.trim() },
				{
					onSuccess: () => {
						toast({
							title: 'Message sent',
							description: `Your message was sent to ${selectedUser.username}`
						});
						onClose();
						resolve();
					},
					onError: (error) => {
						toast({
							title: 'Failed to send message',
							description: error instanceof Error ? error.message : 'An unknown error occurred',
							variant: 'destructive'
						});
						reject(error);
					}
				}
			);
		});
	});

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-w-md border border-purple-500/20 bg-black/90 backdrop-blur-xl text-white">
				<DialogHeader>
					<DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
						New Whisper
					</DialogTitle>
					<DialogDescription className="text-gray-400">
						Send a private message to another user
					</DialogDescription>
				</DialogHeader>

				{!initialUser && (
					<div className="space-y-4">
						<div className="relative">
							<Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
							<Input
								placeholder="Search for a user..."
								className="pl-9 bg-gray-900/50 border-purple-500/30 focus:border-purple-500"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>

						{searchTerm.length >= 2 && (
							<div className="border border-purple-500/20 rounded-md max-h-[200px] overflow-y-auto">
								{isLoadingUsers ? (
									<div className="p-4 flex justify-center">
										<Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
									</div>
								) : !users || users.length === 0 ? (
									<div className="p-4 text-center text-gray-400">
										No users found for '{searchTerm}'
									</div>
								) : (
									<div>
										{users.map((user: User) => (
											<div
												key={user.id}
												className="flex items-center gap-3 p-3 hover:bg-purple-500/10 cursor-pointer transition"
												onClick={() => {
													setSelectedUser(user);
													setSearchTerm('');
												}}
											>
												<Avatar className="h-8 w-8 border border-purple-500/40">
													<AvatarImage src={user.avatarUrl || undefined} />
													<AvatarFallback className="bg-purple-900 text-white">
														{getInitials(user.username)}
													</AvatarFallback>
												</Avatar>
												<div className="font-medium">{user.username}</div>
											</div>
										))}
									</div>
								)}
							</div>
						)}
					</div>
				)}

				{selectedUser && (
					<div className="space-y-4">
						<div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg border border-purple-500/20">
							<Avatar className="h-10 w-10 border border-purple-500/40">
								<AvatarImage src={selectedUser.avatarUrl || undefined} />
								<AvatarFallback className="bg-purple-900 text-white">
									{getInitials(selectedUser.username)}
								</AvatarFallback>
							</Avatar>
							<div>
								<div className="font-medium">{selectedUser.username}</div>
								<div className="text-sm text-gray-400">Recipient</div>
							</div>

							{!initialUser && (
								<Button
									variant="ghost"
									size="sm"
									className="ml-auto text-gray-400 hover:text-white"
									onClick={() => setSelectedUser(null)}
								>
									Change
								</Button>
							)}
						</div>

						<Textarea
							placeholder="Write your message here..."
							className="min-h-[120px] bg-gray-900/50 border-purple-500/30 focus:border-purple-500"
							value={message}
							onChange={(e) => setMessage(e.target.value)}
						/>
					</div>
				)}

				<DialogFooter className="flex space-x-2 justify-end">
					<Button
						variant="outline"
						onClick={onClose}
						className="border-purple-500/30 hover:bg-purple-500/10"
					>
						Cancel
					</Button>
					<Button
						onClick={handleSend}
						disabled={!selectedUser || !message.trim() || isSending || isRateLimited}
						className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
					>
						{isSending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Sending...
							</>
						) : (
							'Send Whisper'
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
