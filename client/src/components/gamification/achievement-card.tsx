/**
 * AchievementCard Component
 *
 * Displays individual achievement with progress tracking,
 * visual effects based on rarity, and completion status
 */

import { cn } from '@/utils/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Lock, Trophy, CheckCircle2, Star, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import type { UserAchievement } from '@/features/gamification/services/gamification-api.service';

interface AchievementCardProps {
	achievement: UserAchievement;
	size?: 'sm' | 'md' | 'lg';
	showProgress?: boolean;
	onClick?: () => void;
	className?: string;
}

export function AchievementCard({
	achievement,
	size = 'md',
	showProgress = true,
	onClick,
	className
}: AchievementCardProps) {
	const { achievement: data, isCompleted, progressPercentage, currentProgress } = achievement;

	// Get rarity colors and effects
	const getRarityStyle = () => {
		switch (data.rarity) {
			case 'mythic':
				return {
					border: 'border-red-500/50',
					bg: 'bg-gradient-to-br from-red-900/20 to-orange-900/20',
					icon: 'text-red-400',
					badge: 'bg-red-600 text-white',
					glow: 'shadow-red-500/20',
					progressColor: 'bg-gradient-to-r from-red-600 to-orange-600'
				};
			case 'legendary':
				return {
					border: 'border-amber-500/50',
					bg: 'bg-gradient-to-br from-amber-900/20 to-yellow-900/20',
					icon: 'text-amber-400',
					badge: 'bg-amber-600 text-white',
					glow: 'shadow-amber-500/20',
					progressColor: 'bg-gradient-to-r from-amber-600 to-yellow-500'
				};
			case 'epic':
				return {
					border: 'border-purple-500/50',
					bg: 'bg-gradient-to-br from-purple-900/20 to-pink-900/20',
					icon: 'text-purple-400',
					badge: 'bg-purple-600 text-white',
					glow: 'shadow-purple-500/20',
					progressColor: 'bg-gradient-to-r from-purple-600 to-pink-600'
				};
			case 'rare':
				return {
					border: 'border-blue-500/50',
					bg: 'bg-gradient-to-br from-blue-900/20 to-cyan-900/20',
					icon: 'text-blue-400',
					badge: 'bg-blue-600 text-white',
					glow: 'shadow-blue-500/20',
					progressColor: 'bg-gradient-to-r from-blue-600 to-cyan-600'
				};
			default:
				return {
					border: 'border-emerald-500/50',
					bg: 'bg-gradient-to-br from-emerald-900/20 to-green-900/20',
					icon: 'text-emerald-400',
					badge: 'bg-emerald-600 text-white',
					glow: 'shadow-emerald-500/20',
					progressColor: 'bg-gradient-to-r from-emerald-600 to-green-600'
				};
		}
	};

	const style = getRarityStyle();

	// Get size-specific classes
	const getSizeClasses = () => {
		switch (size) {
			case 'lg':
				return {
					card: 'p-4',
					icon: 'w-12 h-12',
					title: 'text-base',
					description: 'text-sm',
					reward: 'text-sm'
				};
			case 'sm':
				return {
					card: 'p-2',
					icon: 'w-8 h-8',
					title: 'text-sm',
					description: 'text-xs',
					reward: 'text-xs'
				};
			default:
				return {
					card: 'p-3',
					icon: 'w-10 h-10',
					title: 'text-sm',
					description: 'text-xs',
					reward: 'text-xs'
				};
		}
	};

	const sizes = getSizeClasses();

	// Animation variants
	const cardVariants = {
		idle: { scale: 1 },
		hover: { scale: 1.02 },
		tap: { scale: 0.98 }
	};

	const iconVariants = {
		idle: { rotate: 0 },
		hover: { rotate: [0, -10, 10, -10, 0] }
	};

	// Progress text
	const getProgressText = () => {
		if (isCompleted) return 'Completed!';
		if (data.requirement.type === 'count' || data.requirement.type === 'threshold') {
			return `${currentProgress} / ${data.requirement.target}`;
		}
		return `${progressPercentage}%`;
	};

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<motion.div
						variants={cardVariants}
						initial="idle"
						whileHover="hover"
						whileTap={onClick ? 'tap' : undefined}
						className={cn('relative', className)}
					>
						<Card
							className={cn(
								'relative overflow-hidden border transition-all cursor-pointer',
								style.border,
								style.bg,
								style.glow,
								isCompleted && 'ring-2 ring-green-500/50',
								sizes.card,
								onClick && 'hover:shadow-lg'
							)}
							onClick={onClick}
						>
							{/* Completion overlay */}
							{isCompleted && (
								<div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent pointer-events-none" />
							)}

							<CardContent className="p-0">
								<div className="flex items-start gap-3">
									{/* Icon container */}
									<motion.div
										className={cn(
											'relative rounded-lg flex items-center justify-center',
											'bg-black/40',
											sizes.icon
										)}
										variants={iconVariants}
									>
										{isCompleted ? (
											<CheckCircle2 className={cn('w-2/3 h-2/3', 'text-green-400')} />
										) : progressPercentage > 0 ? (
											<Trophy className={cn('w-2/3 h-2/3', style.icon)} />
										) : (
											<Lock className={cn('w-2/3 h-2/3', 'text-zinc-600')} />
										)}
									</motion.div>

									{/* Content */}
									<div className="flex-1 min-w-0">
										<div className="flex items-start justify-between gap-2 mb-1">
											<h4 className={cn('font-semibold truncate', sizes.title)}>{data.name}</h4>
											<Badge
												variant="secondary"
												className={cn('shrink-0', style.badge, 'text-xs px-1.5 py-0')}
											>
												{data.rarity}
											</Badge>
										</div>

										<p className={cn('text-muted-foreground line-clamp-2 mb-2', sizes.description)}>
											{data.description}
										</p>

										{/* Progress section */}
										{showProgress && (
											<div className="space-y-1">
												<div className="flex items-center justify-between">
													<span className={cn('text-muted-foreground', sizes.reward)}>
														{isCompleted ? (
															<span className="text-green-400">
																<Star className="w-3 h-3 inline mr-1" />
																Earned{' '}
																{achievement.earnedAt
																	? new Date(achievement.earnedAt).toLocaleDateString()
																	: ''}
															</span>
														) : (
															<span>
																<Zap className="w-3 h-3 inline mr-1" />+{data.rewardXp} XP
															</span>
														)}
													</span>
													<span className={cn('font-medium', sizes.reward)}>
														{getProgressText()}
													</span>
												</div>

												{!isCompleted && progressPercentage > 0 && (
													<div className="relative h-1.5 bg-zinc-800 rounded-full overflow-hidden">
														<motion.div
															className={cn('h-full', style.progressColor)}
															initial={{ width: 0 }}
															animate={{ width: `${progressPercentage}%` }}
															transition={{ duration: 0.5, ease: 'easeOut' }}
														/>
													</div>
												)}
											</div>
										)}

										{/* Category badge */}
										<Badge variant="outline" className="mt-2 text-xs">
											{data.category}
										</Badge>
									</div>
								</div>
							</CardContent>
						</Card>
					</motion.div>
				</TooltipTrigger>

				<TooltipContent side="bottom" className="max-w-xs">
					<div className="space-y-2">
						<p className="font-semibold">{data.name}</p>
						<p className="text-sm">{data.description}</p>
						<div className="flex items-center gap-4 text-sm">
							<span>
								<Zap className="w-3 h-3 inline mr-1" />
								{data.rewardXp} XP
							</span>
							{data.rewardPoints && (
								<span>
									<Trophy className="w-3 h-3 inline mr-1" />
									{data.rewardPoints} Points
								</span>
							)}
						</div>
						{!isCompleted && (
							<p className="text-sm text-muted-foreground">
								Progress: {currentProgress} / {data.requirement.target}
							</p>
						)}
					</div>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
