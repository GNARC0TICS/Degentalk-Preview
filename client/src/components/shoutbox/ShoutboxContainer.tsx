import React, { useState } from 'react';
import { MessageSquare, Send, Lock } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import FeatureGate from '@/components/ui/feature-gate';
import { Username } from '@/components/users/Username';
import RainButton from '@/components/economy/wallet/rain-button';
import type { UserId } from "@shared/types/ids";

// ShoutMessage type definition
interface ShoutMessage {
	id: string;
	userId: UserId;
	username: string;
	avatarUrl?: string;
	message: string;
	timestamp: string;
	userLevel?: number;
}

/**
 * ShoutboxContainer component
 *
 * A global chat box that requires users to be at least level 3 to participate.
 * Uses FeatureGate to restrict access to the shoutbox.
 */
const ShoutboxContainer: React.FC = () => {
	const { user } = useAuth();
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const [message, setMessage] = useState('');

	// Fetch recent shoutbox messages
	const { data: messages, isLoading: messagesLoading } = useQuery<ShoutMessage[]>({
		queryKey: ['shoutboxMessages'],
		queryFn: async () => {
			return apiRequest({ url: '/api/shoutbox/messages', method: 'GET' });
		},
		refetchInterval: 10000 // Poll every 10 seconds
	});

	// Send message mutation
	const sendMessageMutation = useMutation({
		mutationFn: async (newMessage: string) => {
			return apiRequest({
				url: '/api/shoutbox/messages',
				method: 'POST',
				data: { message: newMessage }
			});
		},
		onSuccess: () => {
			setMessage('');
			queryClient.invalidateQueries({ queryKey: ['shoutboxMessages'] });
		},
		onError: (error: any) => {
			toast({
				title: 'Error',
				description: `Failed to send message: ${error.message}`,
				variant: 'destructive'
			});
		}
	});

	const handleSendMessage = () => {
		if (!message.trim()) return;
		sendMessageMutation.mutate(message);
	};

	// Format timestamp for display
	const formatTimestamp = (timestamp: string) => {
		const date = new Date(timestamp);
		return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	};

	// Content shown to users who don't have access yet
	const lockedContent = (
		<div className="flex flex-col items-center justify-center p-8 text-center">
			<Lock className="h-12 w-12 text-zinc-500 mb-4" />
			<h3 className="text-lg font-bold mb-1">Shoutbox Locked</h3>
			<p className="text-zinc-400 mb-4 max-w-sm">
				The global shoutbox is available to members who have reached Level 3. Keep participating in
				the forum to earn XP and level up!
			</p>
			<Button variant="outline" onClick={() => (window.location.href = '/profile/xp')}>
				View Your XP Progress
			</Button>
		</div>
	);

	return (
		<Card className="w-full bg-zinc-900 border-zinc-800">
			<CardHeader className="pb-2">
				<CardTitle className="text-lg flex items-center">
					<MessageSquare className="h-5 w-5 mr-2 text-blue-400" />
					Global Shoutbox
				</CardTitle>
				<CardDescription>Chat with other forum members in real-time</CardDescription>
			</CardHeader>
			<FeatureGate featureId="shoutbox" fallback={lockedContent}>
				<CardContent className="p-0">
					<div className="h-64 overflow-y-auto p-4 space-y-3 border-y border-zinc-800">
						{messagesLoading ? (
							// Loading skeletons
							Array.from({ length: 5 }).map((_, i) => (
								<div key={i} className="flex items-start space-x-2">
									<Skeleton className="h-8 w-8 rounded-full" />
									<div className="space-y-2 flex-grow">
										<Skeleton className="h-4 w-32" />
										<Skeleton className="h-3 w-full" />
									</div>
								</div>
							))
						) : Array.isArray(messages) && messages.length > 0 ? (
							// Message list
							messages.map((msg: ShoutMessage) => (
								<div key={msg.id} className="flex items-start space-x-2">
									<Avatar className="h-8 w-8">
										<AvatarImage src={msg.avatarUrl} alt={msg.username} />
										<AvatarFallback>{msg.username.substring(0, 2).toUpperCase()}</AvatarFallback>
									</Avatar>
									<div className="flex-grow">
										<div className="flex items-center">
											<Username
												username={msg.username}
												className="font-semibold text-sm cursor-pointer hover:underline"
											/>
											{msg.userLevel && (
												<Badge variant="outline" className="ml-2 text-xs">
													LVL {msg.userLevel}
												</Badge>
											)}
											<span className="ml-auto text-xs text-zinc-500">
												{formatTimestamp(msg.timestamp)}
											</span>
										</div>
										<p className="text-sm mt-0.5">{msg.message}</p>
									</div>
								</div>
							))
						) : (
							// Empty state
							<div className="flex items-center justify-center h-full text-zinc-500">
								<p>No messages yet. Be the first to chat!</p>
							</div>
						)}
					</div>
				</CardContent>

				<CardFooter className="p-4 border-t border-zinc-800">
					<div className="flex w-full items-center space-x-2">
						<Input
							placeholder="Type your message..."
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
							className="flex-grow"
						/>
						<RainButton
							buttonText="Rain"
							buttonVariant="outline"
							buttonSize="sm"
							defaultChannel="general"
							className="bg-gradient-to-r from-emerald-600/10 to-cyan-600/10 border-emerald-500/30 hover:border-emerald-400 text-emerald-400"
						/>
						<Button
							onClick={handleSendMessage}
							disabled={!message.trim() || sendMessageMutation.isPending}
							className="bg-gradient-to-r from-blue-600 to-indigo-600"
						>
							<Send className="h-4 w-4" />
						</Button>
					</div>
				</CardFooter>
			</FeatureGate>
		</Card>
	);
};

export default ShoutboxContainer;
