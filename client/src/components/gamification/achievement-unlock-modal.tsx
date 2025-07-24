/**
 * AchievementUnlockModal Component
 *
 * Celebratory modal shown when user unlocks an achievement
 */

import { useEffect } from 'react';
import { cn } from '@app/utils/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@app/components/ui/dialog';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { formatNumber } from '@app/utils/utils';
import { Trophy, Sparkles, Zap, Star, CheckCircle2, Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import type { Achievement } from '@app/features/gamification/services/gamification-api.service';

interface AchievementUnlockModalProps {
	isOpen: boolean;
	onClose: () => void;
	achievement: Achievement;
	onShare?: () => void;
}

export function AchievementUnlockModal({
	isOpen,
	onClose,
	achievement,
	onShare
}: AchievementUnlockModalProps) {
	// Trigger confetti based on rarity
	useEffect(() => {
		if (isOpen) {
			const colors = {
				mythic: ['#ef4444', '#f97316', '#eab308'],
				legendary: ['#f59e0b', '#fbbf24', '#fde047'],
				epic: ['#a855f7', '#d946ef', '#ec4899'],
				rare: ['#3b82f6', '#06b6d4', '#14b8a6'],
				common: ['#10b981', '#22c55e', '#84cc16']
			};

			const selectedColors = colors[achievement.rarity] || colors.common;

			// Main burst
			confetti({
				particleCount: 100,
				spread: 70,
				origin: { y: 0.6 },
				colors: selectedColors
			});

			// Rarity-specific effects
			if (achievement.rarity === 'mythic' || achievement.rarity === 'legendary') {
				// Extra bursts for rare achievements
				setTimeout(() => {
					confetti({
						particleCount: 50,
						angle: 60,
						spread: 55,
						origin: { x: 0 },
						colors: selectedColors
					});
					confetti({
						particleCount: 50,
						angle: 120,
						spread: 55,
						origin: { x: 1 },
						colors: selectedColors
					});
				}, 250);
			}
		}
	}, [isOpen, achievement.rarity]);

	// Get rarity-specific styles
	const getRarityStyle = () => {
		switch (achievement.rarity) {
			case 'mythic':
				return {
					border: 'border-red-500',
					bg: 'bg-gradient-to-br from-red-900/30 to-orange-900/30',
					iconBg: 'bg-red-600',
					textColor: 'text-red-400',
					badge: 'bg-red-600'
				};
			case 'legendary':
				return {
					border: 'border-amber-500',
					bg: 'bg-gradient-to-br from-amber-900/30 to-yellow-900/30',
					iconBg: 'bg-amber-600',
					textColor: 'text-amber-400',
					badge: 'bg-amber-600'
				};
			case 'epic':
				return {
					border: 'border-purple-500',
					bg: 'bg-gradient-to-br from-purple-900/30 to-pink-900/30',
					iconBg: 'bg-purple-600',
					textColor: 'text-purple-400',
					badge: 'bg-purple-600'
				};
			case 'rare':
				return {
					border: 'border-blue-500',
					bg: 'bg-gradient-to-br from-blue-900/30 to-cyan-900/30',
					iconBg: 'bg-blue-600',
					textColor: 'text-blue-400',
					badge: 'bg-blue-600'
				};
			default:
				return {
					border: 'border-emerald-500',
					bg: 'bg-gradient-to-br from-emerald-900/30 to-green-900/30',
					iconBg: 'bg-emerald-600',
					textColor: 'text-emerald-400',
					badge: 'bg-emerald-600'
				};
		}
	};

	const style = getRarityStyle();

	// Animation variants
	const containerVariants = {
		hidden: { opacity: 0, scale: 0.8 },
		visible: {
			opacity: 1,
			scale: 1,
			transition: {
				duration: 0.3,
				when: 'beforeChildren',
				staggerChildren: 0.1
			}
		}
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: { opacity: 1, y: 0 }
	};

	const iconVariants = {
		hidden: { scale: 0, rotate: -180 },
		visible: {
			scale: 1,
			rotate: 0,
			transition: {
				type: 'spring',
				stiffness: 200,
				damping: 15
			}
		}
	};

	const shineVariants = {
		animate: {
			backgroundPosition: ['200% 0%', '-200% 0%'],
			transition: {
				duration: 3,
				repeat: Infinity,
				ease: 'linear'
			}
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className={cn('sm:max-w-md bg-zinc-900', style.border)}>
				<motion.div
					variants={containerVariants}
					initial="hidden"
					animate="visible"
					className="text-center space-y-6 py-4"
				>
					{/* Header */}
					<motion.div variants={itemVariants}>
						<DialogHeader>
							<DialogTitle className="text-2xl font-bold">
								<span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
									Achievement Unlocked!
								</span>
							</DialogTitle>
						</DialogHeader>
					</motion.div>

					{/* Achievement Icon */}
					<motion.div variants={iconVariants} className="relative inline-block">
						<motion.div
							className={cn(
								'w-24 h-24 rounded-full flex items-center justify-center relative overflow-hidden',
								style.iconBg
							)}
							animate={{
								boxShadow: [
									`0 0 20px ${style.textColor.replace('text-', 'rgb(')}`,
									`0 0 40px ${style.textColor.replace('text-', 'rgb(')}`,
									`0 0 20px ${style.textColor.replace('text-', 'rgb(')}`
								]
							}}
							transition={{ duration: 2, repeat: Infinity }}
						>
							{/* Shine effect */}
							<motion.div
								className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
								style={{
									backgroundSize: '200% 100%'
								}}
								variants={shineVariants}
								animate="animate"
							/>
							<Trophy className="w-12 h-12 text-white relative z-10" />
						</motion.div>
						<motion.div
							className="absolute -top-2 -right-2"
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ delay: 0.5, type: 'spring' }}
						>
							<CheckCircle2 className="w-8 h-8 text-green-400" />
						</motion.div>
					</motion.div>

					{/* Achievement Details */}
					<motion.div variants={itemVariants} className="space-y-3">
						<div className={cn('p-4 rounded-lg', style.bg)}>
							<h3 className="text-xl font-bold mb-1">{achievement.name}</h3>
							<p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
							<div className="flex items-center justify-center gap-3">
								<Badge className={cn(style.badge, 'text-white')}>
									{achievement.rarity.toUpperCase()}
								</Badge>
								<Badge variant="secondary">{achievement.category}</Badge>
							</div>
						</div>

						{/* Rewards */}
						<div className="flex items-center justify-center gap-4 text-sm">
							<div className="flex items-center gap-1">
								<Zap className="w-4 h-4 text-amber-500" />
								<span className="font-bold">+{formatNumber(achievement.rewardXp)} XP</span>
							</div>
							{achievement.rewardPoints && (
								<div className="flex items-center gap-1">
									<Star className="w-4 h-4 text-purple-500" />
									<span className="font-bold">
										+{formatNumber(achievement.rewardPoints)} Points
									</span>
								</div>
							)}
						</div>
					</motion.div>

					{/* Action Buttons */}
					<motion.div variants={itemVariants} className="space-y-2">
						{onShare && (
							<Button onClick={onShare} variant="outline" className="w-full">
								<Gift className="w-4 h-4 mr-2" />
								Share Achievement
							</Button>
						)}
						<Button
							onClick={onClose}
							className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
						>
							<Sparkles className="w-4 h-4 mr-2" />
							Continue
						</Button>
					</motion.div>
				</motion.div>
			</DialogContent>
		</Dialog>
	);
}
