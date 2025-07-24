/**
 * MissionCard Component
 *
 * Displays individual mission with progress, rewards, and claim functionality
 */

import { cn } from '@app/utils/utils';
import { Card, CardContent } from '@app/components/ui/card';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { Progress } from '@app/components/ui/progress';
import {
	Target,
	Clock,
	CheckCircle2,
	Gift,
	Zap,
	Coins,
	Calendar,
	CalendarDays,
	Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MissionProgress } from '@app/features/gamification/services/gamification-api.service';

interface MissionCardProps {
	mission: MissionProgress;
	onClaim?: () => void;
	isClaimingReward?: boolean;
	size?: 'sm' | 'md' | 'lg';
	className?: string;
}

export function MissionCard({
	mission,
	onClaim,
	isClaimingReward = false,
	size = 'md',
	className
}: MissionCardProps) {
	const { mission: data, currentCount, isCompleted, isRewardClaimed } = mission;
	const progressPercentage = Math.min((currentCount / data.requiredCount) * 100, 100);
	const canClaim = isCompleted && !isRewardClaimed;

	// Get mission type icon and color
	const getMissionStyle = () => {
		if (data.isDaily) {
			return {
				icon: Calendar,
				badge: 'bg-blue-600 text-white',
				border: 'border-blue-500/50',
				bg: 'bg-gradient-to-br from-blue-900/20 to-cyan-900/20',
				progressColor: 'bg-gradient-to-r from-blue-600 to-cyan-600'
			};
		} else if (data.isWeekly) {
			return {
				icon: CalendarDays,
				badge: 'bg-purple-600 text-white',
				border: 'border-purple-500/50',
				bg: 'bg-gradient-to-br from-purple-900/20 to-pink-900/20',
				progressColor: 'bg-gradient-to-r from-purple-600 to-pink-600'
			};
		} else {
			return {
				icon: Target,
				badge: 'bg-amber-600 text-white',
				border: 'border-amber-500/50',
				bg: 'bg-gradient-to-br from-amber-900/20 to-orange-900/20',
				progressColor: 'bg-gradient-to-r from-amber-600 to-orange-600'
			};
		}
	};

	const style = getMissionStyle();
	const Icon = style.icon;

	// Get size classes
	const getSizeClasses = () => {
		switch (size) {
			case 'lg':
				return {
					card: 'p-4',
					icon: 'w-10 h-10',
					title: 'text-base',
					description: 'text-sm',
					progress: 'h-2',
					button: 'h-9'
				};
			case 'sm':
				return {
					card: 'p-2',
					icon: 'w-6 h-6',
					title: 'text-sm',
					description: 'text-xs',
					progress: 'h-1.5',
					button: 'h-7 text-xs'
				};
			default:
				return {
					card: 'p-3',
					icon: 'w-8 h-8',
					title: 'text-sm',
					description: 'text-xs',
					progress: 'h-1.5',
					button: 'h-8 text-sm'
				};
		}
	};

	const sizes = getSizeClasses();

	// Calculate time remaining
	const getTimeRemaining = () => {
		if (!data.expiresAt) return null;

		const now = new Date();
		const expires = new Date(data.expiresAt);
		const diff = expires.getTime() - now.getTime();

		if (diff <= 0) return 'Expired';

		const hours = Math.floor(diff / (1000 * 60 * 60));
		const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

		if (hours > 24) {
			const days = Math.floor(hours / 24);
			return `${days}d ${hours % 24}h`;
		}

		return `${hours}h ${minutes}m`;
	};

	const timeRemaining = getTimeRemaining();

	return (
		<Card
			className={cn(
				'relative overflow-hidden border transition-all',
				style.border,
				style.bg,
				isRewardClaimed && 'opacity-60',
				canClaim && 'ring-2 ring-green-500/50 shadow-green-500/20',
				sizes.card,
				className
			)}
		>
			{/* Completion overlay */}
			{isRewardClaimed && <div className="absolute inset-0 bg-zinc-900/50 pointer-events-none" />}

			<CardContent className="p-0">
				<div className="flex items-start gap-3">
					{/* Icon */}
					<div
						className={cn('rounded-lg flex items-center justify-center bg-black/40', sizes.icon)}
					>
						{isRewardClaimed ? (
							<CheckCircle2 className="w-2/3 h-2/3 text-green-400" />
						) : (
							<Icon className="w-2/3 h-2/3 text-white" />
						)}
					</div>

					{/* Content */}
					<div className="flex-1 min-w-0">
						<div className="flex items-start justify-between gap-2 mb-1">
							<h4 className={cn('font-semibold', sizes.title)}>{data.title}</h4>
							<Badge className={cn(style.badge, 'text-xs')}>
								{data.isDaily ? 'Daily' : data.isWeekly ? 'Weekly' : 'Special'}
							</Badge>
						</div>

						<p className={cn('text-muted-foreground mb-2', sizes.description)}>
							{data.description}
						</p>

						{/* Progress */}
						{!isRewardClaimed && (
							<div className="space-y-2">
								<div className="flex items-center justify-between text-xs">
									<span className="text-muted-foreground">Progress</span>
									<span className="font-medium">
										{currentCount} / {data.requiredCount}
									</span>
								</div>
								<div
									className={cn(
										'relative bg-zinc-800 rounded-full overflow-hidden',
										sizes.progress
									)}
								>
									<motion.div
										className={cn('h-full', style.progressColor)}
										initial={{ width: 0 }}
										animate={{ width: `${progressPercentage}%` }}
										transition={{ duration: 0.5, ease: 'easeOut' }}
									/>
								</div>
							</div>
						)}

						{/* Rewards */}
						<div className="flex items-center gap-3 mt-3">
							{data.xpReward > 0 && (
								<div className="flex items-center gap-1 text-xs">
									<Zap className="w-3 h-3 text-amber-500" />
									<span>{data.xpReward} XP</span>
								</div>
							)}
							{data.dgtReward && data.dgtReward > 0 && (
								<div className="flex items-center gap-1 text-xs">
									<Coins className="w-3 h-3 text-emerald-500" />
									<span>{data.dgtReward} DGT</span>
								</div>
							)}
							{data.badgeReward && (
								<div className="flex items-center gap-1 text-xs">
									<Gift className="w-3 h-3 text-purple-500" />
									<span>Badge</span>
								</div>
							)}
						</div>

						{/* Footer with timer and claim button */}
						<div className="flex items-center justify-between mt-3">
							{timeRemaining && !isRewardClaimed && (
								<div className="flex items-center gap-1 text-xs text-muted-foreground">
									<Clock className="w-3 h-3" />
									<span>{timeRemaining}</span>
								</div>
							)}

							{canClaim && onClaim && (
								<AnimatePresence>
									<motion.div
										initial={{ scale: 0, opacity: 0 }}
										animate={{ scale: 1, opacity: 1 }}
										exit={{ scale: 0, opacity: 0 }}
										transition={{ type: 'spring', stiffness: 500, damping: 30 }}
									>
										<Button
											size="sm"
											variant="default"
											className={cn('bg-green-600 hover:bg-green-700', sizes.button)}
											onClick={onClaim}
											disabled={isClaimingReward}
										>
											{isClaimingReward ? (
												<>
													<Loader2 className="w-3 h-3 mr-1 animate-spin" />
													Claiming...
												</>
											) : (
												<>
													<Gift className="w-3 h-3 mr-1" />
													Claim Reward
												</>
											)}
										</Button>
									</motion.div>
								</AnimatePresence>
							)}

							{isRewardClaimed && (
								<Badge variant="secondary" className="text-xs">
									<CheckCircle2 className="w-3 h-3 mr-1" />
									Claimed
								</Badge>
							)}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
