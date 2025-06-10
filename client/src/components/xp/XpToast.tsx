import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity as XPIcon, Award } from 'lucide-react';
import {
	MessageSquare,
	FileText,
	Heart,
	LogIn,
	AtSign,
	MessageCircleReply,
	UserCheck
} from 'lucide-react';

// Types
interface XpToastProps {
	action: string;
	amount: number;
	description: string;
	isLevelUp?: boolean;
	newLevel?: number;
	onClose: () => void;
	autoCloseDelay?: number;
}

// Icon mapping
const actionIcons: Record<string, JSX.Element> = {
	post_created: <MessageSquare className="h-4 w-4" />,
	thread_created: <FileText className="h-4 w-4" />,
	received_like: <Heart className="h-4 w-4" />,
	daily_login: <LogIn className="h-4 w-4" />,
	user_mentioned: <AtSign className="h-4 w-4" />,
	reply_received: <MessageCircleReply className="h-4 w-4" />,
	profile_completed: <UserCheck className="h-4 w-4" />
};

// Default icon
const DefaultIcon = () => <XPIcon className="h-4 w-4" />;

// Helper to get XP color gradient based on amount
const getXpGradient = (amount: number) => {
	if (amount >= 50) return 'from-purple-400 to-purple-600';
	if (amount >= 30) return 'from-blue-400 to-blue-600';
	if (amount >= 10) return 'from-green-400 to-green-600';
	return 'from-yellow-400 to-yellow-600';
};

const XpToast: React.FC<XpToastProps> = ({
	action,
	amount,
	description,
	isLevelUp = false,
	newLevel,
	onClose,
	autoCloseDelay = 4000
}) => {
	const timerRef = useRef<NodeJS.Timeout | null>(null);

	// Auto close the toast after the specified delay
	useEffect(() => {
		timerRef.current = setTimeout(() => {
			onClose();
		}, autoCloseDelay);

		return () => {
			if (timerRef.current) {
				clearTimeout(timerRef.current);
			}
		};
	}, [autoCloseDelay, onClose]);

	// Icon for the action
	const actionIcon = actionIcons[action] || <DefaultIcon />;

	// Color gradient based on XP amount
	const xpGradient = getXpGradient(amount);

	return (
		<motion.div
			initial={{ x: -100, opacity: 0 }}
			animate={{ x: 0, opacity: 1 }}
			exit={{ x: -100, opacity: 0 }}
			transition={{ duration: 0.3, type: 'spring', stiffness: 120 }}
			className="fixed bottom-4 left-4 z-50 w-64 sm:w-72 rounded-2xl bg-black/80 backdrop-blur-md border border-white/10 shadow-2xl overflow-hidden"
			onMouseEnter={() => {
				if (timerRef.current) clearTimeout(timerRef.current);
			}}
			onMouseLeave={() => {
				timerRef.current = setTimeout(() => onClose(), autoCloseDelay);
			}}
		>
			<div className="p-4">
				<div className="flex items-center mb-2">
					<div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-800 to-gray-900 flex items-center justify-center mr-2 border border-white/10">
						{actionIcon}
					</div>
					<div className="flex-1">
						<div className="flex justify-between items-center">
							<h3 className="font-semibold text-sm">XP Earned</h3>
							<button onClick={onClose} className="text-gray-400 hover:text-white">
								<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>
						<p className="text-xs text-gray-400">{description}</p>
					</div>
				</div>

				<div className="flex items-center justify-between">
					<div
						className={`text-xl font-bold bg-gradient-to-r ${xpGradient} bg-clip-text text-transparent`}
					>
						+{amount} XP
					</div>
				</div>

				{/* Progress bar */}
				<div className="mt-2 w-full bg-gray-800 rounded-full h-1 overflow-hidden">
					<motion.div
						initial={{ width: 0 }}
						animate={{ width: '100%' }}
						transition={{ duration: autoCloseDelay / 1000 }}
						className={`h-full bg-gradient-to-r ${xpGradient}`}
					/>
				</div>

				{/* Level Up Section (only shown if level up occurred) */}
				{isLevelUp && newLevel && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: 'auto', opacity: 1 }}
						transition={{ delay: 0.3 }}
						className="mt-3 pt-3 border-t border-white/10"
					>
						<div className="flex items-center text-sm">
							<Award className="h-4 w-4 mr-1 text-yellow-400" />
							<span className="font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
								Level Up! You're now level {newLevel}
							</span>
						</div>
					</motion.div>
				)}
			</div>
		</motion.div>
	);
};

export default XpToast;
