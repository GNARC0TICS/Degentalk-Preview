import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
	Wallet,
	Bell,
	CheckCheck,
	Info,
	Settings,
	Mail,
	Trophy,
	AtSign,
	MessageCircleReply,
	Smile,
	CheckCircle,
	Award
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { formatDistance } from 'date-fns';
import { useNotifications } from '@/hooks/use-notifications';

// [REFAC-DGT]
interface NotificationPanelProps {}

const iconMap = {
	info: Info,
	system: Settings,
	private_message: Mail,
	achievement: Trophy,
	transaction: Wallet,
	post_mention: AtSign,
	thread_reply: MessageCircleReply,
	reaction: Smile,
	quest_complete: CheckCircle,
	badge_awarded: Award
};

export function NotificationPanel({}: NotificationPanelProps) {
	const { isLoadingNotifications, notifications, notificationsError, refreshNotifications } =
		useNotifications();

	// const [notifications, setNotifications] = useState([
	//   {
	//     user_id: 1,
	//     type: "info",
	//     title: "Welcome to DegenTalk!",
	//     body: "Thank you for joining. Explore discussions, earn XP, and trade digital goods.",
	//     data: {},
	//     is_read: false,
	//     read_at: null,
	//     created_at: "2025-06-06T12:00:00Z",
	//   },
	//   {
	//     user_id: 1,
	//     type: "system",
	//     title: "Scheduled Maintenance",
	//     body: "The platform will undergo maintenance on June 10th from 01:00 UTC to 03:00 UTC.",
	//     data: {},
	//     is_read: false,
	//     read_at: null,
	//     created_at: "2025-06-05T08:15:00Z",
	//   },
	//   {
	//     user_id: 1,
	//     type: "private_message",
	//     title: "New Message from CryptoGuru",
	//     body: "Hey! Great post on Layer 2 scaling. Would love to connect.",
	//     data: { senderId: 42, messageId: 1578 },
	//     is_read: false,
	//     read_at: null,
	//     created_at: "2025-06-05T10:30:00Z",
	//   },
	//   {
	//     user_id: 1,
	//     type: "achievement",
	//     title: "Achievement Unlocked: First Post",
	//     body: "Congrats on making your first post! You've earned 50 XP.",
	//     data: { achievementId: 1 },
	//     is_read: true,
	//     read_at: "2025-06-05T11:00:00Z",
	//     created_at: "2025-06-05T11:00:00Z",
	//   },
	//   {
	//     user_id: 1,
	//     type: "transaction",
	//     title: "Transaction Successful",
	//     body: "You purchased 'NFT Profile Frame' for 100 DGT.",
	//     data: { transactionId: 9982 },
	//     is_read: false,
	//     read_at: null,
	//     created_at: "2025-06-05T12:20:00Z",
	//   },
	//   {
	//     user_id: 1,
	//     type: "post_mention",
	//     title: "You were mentioned in a post",
	//     body: "User DeFiQueen mentioned you in 'Best Layer 1s of 2025' thread.",
	//     data: { threadId: 234, postId: 5678 },
	//     is_read: false,
	//     read_at: null,
	//     created_at: "2025-06-05T13:45:00Z",
	//   },
	//   {
	//     user_id: 1,
	//     type: "thread_reply",
	//     title: "New reply to your thread",
	//     body: "CryptoWhale replied to your thread 'Solana vs. Ethereum'.",
	//     data: { threadId: 300, postId: 8901 },
	//     is_read: false,
	//     read_at: null,
	//     created_at: "2025-06-05T14:10:00Z",
	//   },
	//   {
	//     user_id: 1,
	//     type: "reaction",
	//     title: "Your post got a reaction",
	//     body: "Your post in 'Bitcoin Ordinals' received a 👍.",
	//     data: { postId: 7890, reactionType: "like", reactorId: 88 },
	//     is_read: true,
	//     read_at: "2025-06-05T15:05:00Z",
	//     created_at: "2025-06-05T15:05:00Z",
	//   },
	//   {
	//     user_id: 1,
	//     type: "quest_complete",
	//     title: "Quest Complete: Weekly Login Streak",
	//     body: "You've maintained a 7-day login streak and earned 500 XP.",
	//     data: { questId: 23 },
	//     is_read: false,
	//     read_at: null,
	//     created_at: "2025-06-05T16:25:00Z",
	//   },
	//   {
	//     user_id: 1,
	//     type: "badge_awarded",
	//     title: "New Badge: Community Contributor",
	//     body: "You've been awarded the 'Community Contributor' badge for 50 helpful posts.",
	//     data: { badgeId: 7 },
	//     is_read: false,
	//     read_at: null,
	//     created_at: "2025-06-05T17:30:00Z",
	//   },
	//   {
	//     user_id: 1,
	//     type: "info",
	//     title: "Platform Update",
	//     body: "New XP leaderboard and advanced wallet features released.",
	//     data: {},
	//     is_read: true,
	//     read_at: "2025-06-05T18:00:00Z",
	//     created_at: "2025-06-05T18:00:00Z",
	//   },
	//   {
	//     user_id: 1,
	//     type: "system",
	//     title: "Security Reminder",
	//     body: "Enable 2FA to keep your account secure.",
	//     data: {},
	//     is_read: false,
	//     read_at: null,
	//     created_at: "2025-06-04T09:00:00Z",
	//   },
	//   {
	//     user_id: 1,
	//     type: "private_message",
	//     title: "New Message from NFTMaster",
	//     body: "Check out this new NFT drop coming soon.",
	//     data: { senderId: 55, messageId: 2019 },
	//     is_read: false,
	//     read_at: null,
	//     created_at: "2025-06-04T10:20:00Z",
	//   },
	//   {
	//     user_id: 1,
	//     type: "achievement",
	//     title: "Achievement Unlocked: 10 Reactions",
	//     body: "Your posts have received 10 reactions.",
	//     data: { achievementId: 4 },
	//     is_read: true,
	//     read_at: "2025-06-04T11:30:00Z",
	//     created_at: "2025-06-04T11:30:00Z",
	//   },
	//   {
	//     user_id: 1,
	//     type: "transaction",
	//     title: "Transaction Completed",
	//     body: "Sold 'CryptoArt #23' for 250 DGT.",
	//     data: { transactionId: 10021 },
	//     is_read: false,
	//     read_at: null,
	//     created_at: "2025-06-04T13:15:00Z",
	//   },
	//   {
	//     user_id: 1,
	//     type: "post_mention",
	//     title: "You were mentioned in a post",
	//     body: "User CoinHunter mentioned you in 'Top Airdrops This Month' thread.",
	//     data: { threadId: 260, postId: 6154 },
	//     is_read: false,
	//     read_at: null,
	//     created_at: "2025-06-04T14:50:00Z",
	//   },
	//   {
	//     user_id: 1,
	//     type: "thread_reply",
	//     title: "New reply to your thread",
	//     body: "TokenFanatic replied to your thread 'Crypto Staking 101'.",
	//     data: { threadId: 320, postId: 9901 },
	//     is_read: false,
	//     read_at: null,
	//     created_at: "2025-06-04T15:40:00Z",
	//   },
	//   {
	//     user_id: 1,
	//     type: "reaction",
	//     title: "Your post got a reaction",
	//     body: "Your post in 'Cardano Ecosystem' received a ❤️.",
	//     data: { postId: 8345, reactionType: "love", reactorId: 77 },
	//     is_read: false,
	//     read_at: null,
	//     created_at: "2025-06-04T16:10:00Z",
	//   },
	//   {
	//     user_id: 1,
	//     type: "quest_complete",
	//     title: "Quest Complete: First Marketplace Sale",
	//     body: "You've sold your first item in the marketplace!",
	//     data: { questId: 12 },
	//     is_read: true,
	//     read_at: "2025-06-04T17:05:00Z",
	//     created_at: "2025-06-04T17:05:00Z",
	//   },
	//   {
	//     user_id: 1,
	//     type: "badge_awarded",
	//     title: "New Badge: Market Pro",
	//     body: "You've been awarded the 'Market Pro' badge for 10 sales.",
	//     data: { badgeId: 15 },
	//     is_read: false,
	//     read_at: null,
	//     created_at: "2025-06-04T18:20:00Z",
	//   },
	//   {
	//     user_id: 1,
	//     type: "info",
	//     title: "DegenTalk Weekly Digest",
	//     body: "Here’s what’s trending this week on DegenTalk.",
	//     data: {},
	//     is_read: false,
	//     read_at: null,
	//     created_at: "2025-06-04T19:00:00Z",
	//   },
	//   {
	//     user_id: 1,
	//     type: "system",
	//     title: "Terms of Service Updated",
	//     body: "We've updated our Terms of Service. Please review the changes.",
	//     data: {},
	//     is_read: true,
	//     read_at: "2025-06-03T10:00:00Z",
	//     created_at: "2025-06-03T10:00:00Z",
	//   },
	//   {
	//     user_id: 1,
	//     type: "achievement",
	//     title: "Achievement Unlocked: 100 XP",
	//     body: "You've earned your first 100 XP. Keep it up!",
	//     data: { achievementId: 5 },
	//     is_read: false,
	//     read_at: null,
	//     created_at: "2025-06-03T11:30:00Z",
	//   },
	//   {
	//     user_id: 1,
	//     type: "quest_complete",
	//     title: "Quest Complete: Profile Setup",
	//     body: "You've completed your profile setup and earned 100 XP.",
	//     data: { questId: 3 },
	//     is_read: true,
	//     read_at: "2025-06-03T12:45:00Z",
	//     created_at: "2025-06-03T12:45:00Z",
	//   },
	//   {
	//     user_id: 1,
	//     type: "badge_awarded",
	//     title: "New Badge: Early Adopter",
	//     body: "You've been awarded the 'Early Adopter' badge.",
	//     data: { badgeId: 1 },
	//     is_read: false,
	//     read_at: null,
	//     created_at: "2025-06-03T13:55:00Z",
	//   },
	// ]);

	const [isRefreshing, setIsRefreshing] = useState(false);

	// Calculate responsive values
	const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

	return (
		<>
			<div>
				<div className="flex items-center justify-between px-4 py-2">
					<div className="flex items-center space-x-3">
						<div className="h-auto w-auto rounded-full flex items-center justify-center shadow-lg">
							<Bell className="size-4 text-zinc-100" />
						</div>
						<div>
							<span className="text-zinc-100">Notifications</span>
						</div>
					</div>

					<div className="flex items-center space-x-2">
						<Button
							variant="ghost"
							size="sm"
							className="text-zinc-100 hover:text-emerald-400 hover:bg-zinc-800/50 transition-colors"
							onClick={() => {
								// setNotifications(
								//   notifications.map((n) => ({ ...n, is_read: true }))
								// );
							}}
						>
							<CheckCheck className={cn('size-4', isRefreshing && 'animate-spin')} />
						</Button>
					</div>
				</div>

				<ScrollArea className="h-72 flex-1 overflow-y-auto px-4 pb-4">
					<div className="flex flex-col gap-2">
						{notifications.map((notification) => {
							const Icon = iconMap[notification.type as keyof typeof iconMap];

							return (
								<>
									<div
										className={`flex flex-row gap-2 items-center px-2 py-2 border border-zinc-700 rounded-md relative overflow-hidden ${
											!notification.isRead &&
											'bg-zinc-800 before:block before:absolute before:top-0 before:left-0 before:w-0.5 before:h-full before:bg-emerald-500'
										}`}
									>
										<div className="flex-shrink-0">
											<div className="size-7 flex items-center justify-center rounded-full bg-emerald-700 text-primary">
												<Icon className="size-4 text-emerald-100" />
											</div>
										</div>
										<div className="flex-1">
											<div className="flex justify-between items-center">
												<p
													className={`text-zinc-200 text-xs ${
														!notification.isRead ? 'font-bold' : 'font-semibold'
													}`}
												>
													{notification.title}
												</p>
												<p className="text-zinc-400 text-xs">
													{formatDistance(new Date(notification.createdAt), new Date(), {
														addSuffix: true
													})}
												</p>
											</div>
											<div className="mt-1.5">
												<p className="text-zinc-400 text-sm">{notification.body}</p>
											</div>
										</div>
									</div>
								</>
							);
						})}
					</div>
				</ScrollArea>
			</div>
		</>
	);
}
