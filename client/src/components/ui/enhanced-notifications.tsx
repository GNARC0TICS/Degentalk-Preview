import React, { useState, useEffect, memo, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import {
	CheckCircle,
	AlertCircle,
	AlertTriangle,
	Info,
	X,
	Zap,
	TrendingUp,
	MessageSquare,
	Crown,
	Heart,
	Gift,
	Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBreakpoint } from '@/hooks/useMediaQuery';

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'achievement' | 'social';

export interface NotificationData {
	id: string;
	type: NotificationType;
	title: string;
	description?: string;
	action?: {
		label: string;
		onClick: () => void;
	};
	duration?: number;
	persistent?: boolean;
	avatar?: string;
	metadata?: Record<string, any>;
}

interface NotificationContextType {
	notifications: NotificationData[];
	addNotification: (notification: Omit<NotificationData, 'id'>) => void;
	removeNotification: (id: string) => void;
	clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotifications = () => {
	const context = useContext(NotificationContext);
	if (!context) {
		throw new Error('useNotifications must be used within NotificationProvider');
	}
	return context;
};

// Enhanced notification item with rich interactions
const NotificationItem = memo(
	({
		notification,
		onRemove,
		index
	}: {
		notification: NotificationData;
		onRemove: (id: string) => void;
		index: number;
	}) => {
		const { isMobile } = useBreakpoint();
		const [isVisible, setIsVisible] = useState(true);
		const [progress, setProgress] = useState(100);

		const typeConfig = {
			success: {
				icon: CheckCircle,
				color: 'emerald',
				bgColor: 'bg-emerald-500/20',
				borderColor: 'border-emerald-500/50',
				iconColor: 'text-emerald-400'
			},
			error: {
				icon: AlertCircle,
				color: 'red',
				bgColor: 'bg-red-500/20',
				borderColor: 'border-red-500/50',
				iconColor: 'text-red-400'
			},
			warning: {
				icon: AlertTriangle,
				color: 'yellow',
				bgColor: 'bg-yellow-500/20',
				borderColor: 'border-yellow-500/50',
				iconColor: 'text-yellow-400'
			},
			info: {
				icon: Info,
				color: 'blue',
				bgColor: 'bg-blue-500/20',
				borderColor: 'border-blue-500/50',
				iconColor: 'text-blue-400'
			},
			achievement: {
				icon: Crown,
				color: 'purple',
				bgColor: 'bg-purple-500/20',
				borderColor: 'border-purple-500/50',
				iconColor: 'text-purple-400'
			},
			social: {
				icon: Heart,
				color: 'pink',
				bgColor: 'bg-pink-500/20',
				borderColor: 'border-pink-500/50',
				iconColor: 'text-pink-400'
			}
		};

		const config = typeConfig[notification.type];
		const Icon = config.icon;

		// Auto-remove timer
		useEffect(() => {
			if (!notification.persistent && notification.duration) {
				const timer = setInterval(() => {
					setProgress((prev) => {
						const newProgress = prev - 100 / (notification.duration! / 100);
						if (newProgress <= 0) {
							setIsVisible(false);
							setTimeout(() => onRemove(notification.id), 300);
							return 0;
						}
						return newProgress;
					});
				}, 100);

				return () => clearInterval(timer);
			}
		}, [notification.duration, notification.persistent, notification.id, onRemove]);

		// Gesture handling for mobile
		const handleDragEnd = (event: any, info: PanInfo) => {
			if (Math.abs(info.offset.x) > 100) {
				setIsVisible(false);
				setTimeout(() => onRemove(notification.id), 300);
			}
		};

		const handleClose = () => {
			setIsVisible(false);
			setTimeout(() => onRemove(notification.id), 300);
		};

		const itemVariants = {
			initial: {
				opacity: 0,
				y: -50,
				scale: 0.95,
				x: isMobile ? 300 : 400
			},
			animate: {
				opacity: 1,
				y: 0,
				scale: 1,
				x: 0,
				transition: {
					type: 'spring',
					stiffness: 500,
					damping: 30,
					delay: index * 0.1
				}
			},
			exit: {
				opacity: 0,
				x: isMobile ? 300 : 400,
				transition: { duration: 0.3 }
			}
		};

		return (
			<motion.div
				variants={itemVariants}
				initial="initial"
				animate={isVisible ? 'animate' : 'exit'}
				exit="exit"
				drag={isMobile ? 'x' : false}
				dragConstraints={{ left: 0, right: 0 }}
				dragElastic={0.2}
				onDragEnd={handleDragEnd}
				whileHover={{ scale: 1.02 }}
				whileTap={{ scale: 0.98 }}
				className={cn(
					'relative overflow-hidden rounded-lg border backdrop-blur-lg shadow-lg',
					'bg-zinc-900/95 border-zinc-700/50',
					config.bgColor,
					config.borderColor,
					isMobile ? 'mx-4 max-w-sm' : 'max-w-md w-full'
				)}
			>
				{/* Progress bar */}
				{!notification.persistent && notification.duration && (
					<div className="absolute top-0 left-0 right-0 h-1 bg-black/20">
						<motion.div
							className={cn('h-full', `bg-${config.color}-400`)}
							initial={{ width: '100%' }}
							animate={{ width: `${progress}%` }}
						/>
					</div>
				)}

				<div className="p-4">
					<div className="flex items-start gap-3">
						{/* Icon or Avatar */}
						<div className="flex-shrink-0">
							{notification.avatar ? (
								<img src={notification.avatar} alt="" className="w-8 h-8 rounded-full" />
							) : (
								<Icon className={cn('w-5 h-5', config.iconColor)} />
							)}
						</div>

						{/* Content */}
						<div className="flex-1 min-w-0">
							<h4 className="text-sm font-semibold text-white mb-1">{notification.title}</h4>
							{notification.description && (
								<p className="text-xs text-zinc-300 leading-relaxed">{notification.description}</p>
							)}

							{/* Action button */}
							{notification.action && (
								<motion.button
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									onClick={notification.action.onClick}
									className={cn(
										'mt-2 px-3 py-1 rounded text-xs font-medium transition-colors',
										`bg-${config.color}-500/20 text-${config.color}-400 hover:bg-${config.color}-500/30`
									)}
								>
									{notification.action.label}
								</motion.button>
							)}
						</div>

						{/* Close button */}
						<motion.button
							whileHover={{ scale: 1.1 }}
							whileTap={{ scale: 0.9 }}
							onClick={handleClose}
							className="flex-shrink-0 text-zinc-400 hover:text-white transition-colors"
						>
							<X className="w-4 h-4" />
						</motion.button>
					</div>
				</div>

				{/* Special effects for achievements */}
				{notification.type === 'achievement' && (
					<div className="absolute inset-0 pointer-events-none">
						<motion.div
							initial={{ scale: 0, opacity: 0 }}
							animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0] }}
							transition={{ duration: 1, times: [0, 0.5, 1] }}
							className="absolute top-2 right-2"
						>
							<Star className="w-4 h-4 text-yellow-400 fill-current" />
						</motion.div>
					</div>
				)}
			</motion.div>
		);
	}
);

// Notification container component
const NotificationContainer = memo(() => {
	const { notifications, removeNotification } = useNotifications();
	const { isMobile } = useBreakpoint();

	return (
		<div
			className={cn(
				'fixed z-[100] pointer-events-none',
				isMobile ? 'top-4 left-0 right-0' : 'top-4 right-4'
			)}
		>
			<div className={cn('space-y-2', isMobile ? 'flex flex-col items-center' : '')}>
				<AnimatePresence mode="popLayout">
					{notifications.map((notification, index) => (
						<div key={notification.id} className="pointer-events-auto">
							<NotificationItem
								notification={notification}
								onRemove={removeNotification}
								index={index}
							/>
						</div>
					))}
				</AnimatePresence>
			</div>
		</div>
	);
});

// Provider component
export const NotificationProvider = memo(({ children }: { children: React.ReactNode }) => {
	const [notifications, setNotifications] = useState<NotificationData[]>([]);

	const addNotification = (notification: Omit<NotificationData, 'id'>) => {
		const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
		const newNotification: NotificationData = {
			...notification,
			id,
			duration: notification.duration ?? 5000
		};

		setNotifications((prev) => [newNotification, ...prev].slice(0, 5)); // Max 5 notifications
	};

	const removeNotification = (id: string) => {
		setNotifications((prev) => prev.filter((n) => n.id !== id));
	};

	const clearAll = () => {
		setNotifications([]);
	};

	const value = {
		notifications,
		addNotification,
		removeNotification,
		clearAll
	};

	return (
		<NotificationContext.Provider value={value}>
			{children}
			<NotificationContainer />
		</NotificationContext.Provider>
	);
});

// Convenience hooks for common notification types
export const useNotificationHelpers = () => {
	const { addNotification } = useNotifications();

	return {
		success: (title: string, description?: string) =>
			addNotification({ type: 'success', title, description }),

		error: (title: string, description?: string) =>
			addNotification({ type: 'error', title, description, persistent: true }),

		warning: (title: string, description?: string) =>
			addNotification({ type: 'warning', title, description }),

		info: (title: string, description?: string) =>
			addNotification({ type: 'info', title, description }),

		achievement: (title: string, description?: string) =>
			addNotification({
				type: 'achievement',
				title,
				description,
				duration: 8000,
				action: {
					label: 'View Profile',
					onClick: () => (window.location.href = '/profile')
				}
			}),

		social: (title: string, description?: string, avatar?: string) =>
			addNotification({
				type: 'social',
				title,
				description,
				avatar,
				action: {
					label: 'View',
					onClick: () => {} // Will be overridden by caller
				}
			}),

		// Specialized notifications for forum actions
		threadCreated: (threadTitle: string, forumName: string) =>
			addNotification({
				type: 'success',
				title: 'Thread Created',
				description: `"${threadTitle}" in ${forumName}`,
				action: {
					label: 'View Thread',
					onClick: () => {} // Will be overridden
				}
			}),

		postLiked: (username: string, postContent: string) =>
			addNotification({
				type: 'social',
				title: `${username} liked your post`,
				description: postContent.slice(0, 50) + '...',
				duration: 6000
			}),

		xpGained: (amount: number, action: string) =>
			addNotification({
				type: 'achievement',
				title: `+${amount} XP`,
				description: `Earned from ${action}`,
				duration: 4000
			}),

		tipReceived: (amount: number, fromUser: string) =>
			addNotification({
				type: 'social',
				title: 'Tip Received!',
				description: `${fromUser} tipped you ${amount} DGT`,
				duration: 6000,
				action: {
					label: 'View Wallet',
					onClick: () => (window.location.href = '/wallet')
				}
			})
	};
};

NotificationItem.displayName = 'NotificationItem';
NotificationContainer.displayName = 'NotificationContainer';
NotificationProvider.displayName = 'NotificationProvider';
