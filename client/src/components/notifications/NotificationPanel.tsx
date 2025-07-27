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
import { cn } from '@/utils/utils';
import { formatDistance } from 'date-fns';
import { useNotifications } from '@/hooks/use-notifications';

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
	// TODO: Fix API endpoints - getPaginatedNotifications, messages, mentions, unread-count
	// For now, use mock data to prevent component from failing
	const mockNotifications = [
		{
			id: '1',
			type: 'info' as const,
			title: 'Notifications Coming Soon',
			body: 'Notification system is being set up. Check back later!',
			isRead: true,
			createdAt: new Date().toISOString()
		}
	];

	const isLoadingNotifications = false;
	const notifications = mockNotifications;
	const notificationsError = null;
	const refreshNotifications = () => {};

	const [isRefreshing, setIsRefreshing] = useState(false);

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
							onClick={() => {}}
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
