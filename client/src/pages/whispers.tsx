import React from 'react';
import { WhispersInbox } from '@/components/messages/WhispersInbox';
import { WhisperButton } from '@/components/messages/WhisperButton';
import { useMessages } from '@/hooks/use-messages';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquareWave } from '@/components/messages/icons/MessageSquareWave';

export default function WhispersPage() {
	const { useUnreadCount } = useMessages();
	const { data: unreadCountData } = useUnreadCount();

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="flex flex-col lg:flex-row gap-6">
				<div className="w-full lg:w-3/4">
					<WhispersInbox className="w-full h-full" />
				</div>

				<div className="w-full lg:w-1/4 space-y-6">
					<Card className="bg-black/90 backdrop-blur-xl border border-purple-500/20">
						<CardHeader className="pb-4">
							<CardTitle className="text-xl text-white flex items-center gap-2">
								<MessageSquareWave className="h-6 w-6 text-indigo-400" />
								<span>Start a New Whisper</span>
							</CardTitle>
							<CardDescription className="text-gray-400">
								Send a private message to any DegenTalk user
							</CardDescription>
						</CardHeader>
						<CardContent>
							<WhisperButton
								className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
								variant="default"
								size="lg"
							>
								New Whisper
							</WhisperButton>
						</CardContent>
					</Card>

					<Card className="bg-black/90 backdrop-blur-xl border border-purple-500/20">
						<CardHeader className="pb-4">
							<CardTitle className="text-xl text-white">Whispers Stats</CardTitle>
							<CardDescription className="text-gray-400">Your messaging activity</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<StatItem
									label="Unread Messages"
									value={unreadCountData?.total || 0}
									icon={
										<Badge
											variant="outline"
											className="bg-purple-900/50 text-white border-purple-500/40"
										>
											New
										</Badge>
									}
								/>
								{/* More stats can be added here as the system expands */}
							</div>
						</CardContent>
					</Card>

					<Card className="bg-black/90 backdrop-blur-xl border border-purple-500/20">
						<CardHeader className="pb-4">
							<CardTitle className="text-xl text-white">Whispers Help</CardTitle>
							<CardDescription className="text-gray-400">
								How to use the messaging system
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-3 text-gray-300 text-sm">
								<p>
									<span className="text-indigo-400 font-semibold">Whispers</span> are private
									messages between you and another user.
								</p>
								<p>
									Click <span className="text-indigo-400 font-semibold">New Whisper</span> to start
									a new conversation.
								</p>
								<p>
									Use the <span className="text-indigo-400 font-semibold">search</span> to find
									specific conversations.
								</p>
								<p>
									Messages are <span className="text-indigo-400 font-semibold">private</span> and
									only visible to you and the recipient.
								</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}

// Helper component for stats
function StatItem({
	label,
	value,
	icon
}: {
	label: string;
	value: number | string;
	icon?: React.ReactNode;
}) {
	return (
		<div className="flex items-center justify-between">
			<div className="text-gray-400">{label}</div>
			<div className="flex items-center gap-2">
				<span className="text-white font-medium">{value}</span>
				{icon}
			</div>
		</div>
	);
}
