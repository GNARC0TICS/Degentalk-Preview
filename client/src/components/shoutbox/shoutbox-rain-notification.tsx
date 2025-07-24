import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CoinsIcon, CloudRain, Gift, X, DollarSign } from 'lucide-react';
import { Card } from '@app/components/ui/card';

export interface RainNotificationProps {
	type: 'rain' | 'tip';
	amount: number;
	currency: 'DGT' | 'USDT';
	sender: string;
	timestamp: string;
	onClose: () => void;
	autoCloseDelay?: number; // in milliseconds
}

export function ShoutboxRainNotification({
	type,
	amount,
	currency,
	sender,
	timestamp,
	onClose,
	autoCloseDelay = 6000 // default to 6 seconds
}: RainNotificationProps) {
	const [isVisible, setIsVisible] = useState(true);

	// Auto close after delay
	useEffect(() => {
		const timer = setTimeout(() => {
			setIsVisible(false);
			setTimeout(onClose, 300); // Remove from DOM after exit animation
		}, autoCloseDelay);

		return () => clearTimeout(timer);
	}, [autoCloseDelay, onClose]);

	// Get the right icon and color based on type and currency
	const getTypeConfig = () => {
		if (type === 'tip') {
			return {
				icon: <Gift className="h-5 w-5 mr-2" />,
				bgColor: currency === 'DGT' ? 'bg-amber-500/10' : 'bg-blue-500/10',
				borderColor: currency === 'DGT' ? 'border-amber-500/30' : 'border-blue-500/30',
				textColor: currency === 'DGT' ? 'text-amber-400' : 'text-blue-400',
				title: 'You received a tip!'
			};
		} else {
			return {
				icon: <CloudRain className="h-5 w-5 mr-2" />,
				bgColor: currency === 'DGT' ? 'bg-emerald-500/10' : 'bg-cyan-500/10',
				borderColor: currency === 'DGT' ? 'border-emerald-500/30' : 'border-cyan-500/30',
				textColor: currency === 'DGT' ? 'text-emerald-400' : 'text-cyan-400',
				title: 'You got rained on!'
			};
		}
	};

	const config = getTypeConfig();

	return (
		<AnimatePresence>
			{isVisible && (
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 10 }}
					className="fixed bottom-4 right-4 z-50"
				>
					<Card className={`${config.bgColor} border ${config.borderColor} shadow-lg max-w-sm`}>
						<div className="flex items-start p-4">
							<div className={`${config.textColor} flex-shrink-0`}>{config.icon}</div>

							<div className="ml-2 flex-1">
								<h4 className={`font-medium ${config.textColor}`}>{config.title}</h4>
								<p className="text-white text-sm mt-1">
									{type === 'rain'
										? `@${sender} made it rain ${amount} ${currency} and you got some!`
										: `@${sender} sent you ${amount} ${currency}!`}
								</p>
								<div className="flex items-center mt-2 space-x-2">
									<span className="text-xs text-zinc-400">
										{new Date(timestamp).toLocaleTimeString()}
									</span>
									<div className="flex items-center">
										<DollarSign className="h-3 w-3 text-zinc-400 mr-1" />
										<span className={`text-xs font-medium ${config.textColor}`}>
											{amount} {currency}
										</span>
									</div>
								</div>
							</div>

							<button
								onClick={() => {
									setIsVisible(false);
									setTimeout(onClose, 300);
								}}
								className="text-zinc-400 hover:text-white"
							>
								<X className="h-4 w-4" />
							</button>
						</div>
					</Card>
				</motion.div>
			)}
		</AnimatePresence>
	);
}

// Container component to manage multiple notifications
export interface RainNotification {
	id: string;
	type: 'rain' | 'tip';
	amount: number;
	currency: 'DGT' | 'USDT';
	sender: string;
	timestamp: string;
}

interface RainNotificationsProps {
	notifications: RainNotification[];
	onDismiss: (id: string) => void;
}

export function RainNotifications({ notifications, onDismiss }: RainNotificationsProps) {
	return (
		<div className="fixed bottom-4 right-4 z-50 space-y-2">
			{notifications.map((notification) => (
				<ShoutboxRainNotification
					key={notification.id}
					type={notification.type}
					amount={notification.amount}
					currency={notification.currency}
					sender={notification.sender}
					timestamp={notification.timestamp}
					onClose={() => onDismiss(notification.id)}
				/>
			))}
		</div>
	);
}
