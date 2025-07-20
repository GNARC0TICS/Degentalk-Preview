/**
 * LevelUpModal Component
 *
 * Celebratory modal shown when user levels up
 */

import { useEffect } from 'react';
import { cn } from '@/utils/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LevelDisplay } from './level-display.tsx';
import { formatNumber } from '@/utils/utils';
import { Sparkles, Trophy, Gift, ArrowRight, Zap, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import type { LevelInfo } from '@/features/gamification/services/gamification-api.service';
import { type BadgeId, type TitleId } from '@shared/types/ids';

interface LevelUpModalProps {
	isOpen: boolean;
	onClose: () => void;
	previousLevel: number;
	newLevel: number;
	levelInfo: LevelInfo;
	rewards?: {
		dgt?: number;
		titleId?: TitleId;
		badgeId?: BadgeId;
		unlocks?: string[];
	};
}

export function LevelUpModal({
	isOpen,
	onClose,
	previousLevel,
	newLevel,
	levelInfo,
	rewards
}: LevelUpModalProps) {
	// Trigger confetti on mount
	useEffect(() => {
		if (isOpen) {
			// Center burst
			confetti({
				particleCount: 100,
				spread: 70,
				origin: { y: 0.6 }
			});

			// Side bursts
			setTimeout(() => {
				confetti({
					particleCount: 50,
					angle: 60,
					spread: 55,
					origin: { x: 0 }
				});
				confetti({
					particleCount: 50,
					angle: 120,
					spread: 55,
					origin: { x: 1 }
				});
			}, 250);
		}
	}, [isOpen]);

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

	const glowVariants = {
		animate: {
			boxShadow: [
				'0 0 20px rgba(168, 85, 247, 0.4)',
				'0 0 40px rgba(168, 85, 247, 0.6)',
				'0 0 20px rgba(168, 85, 247, 0.4)'
			],
			transition: {
				duration: 2,
				repeat: Infinity
			}
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md bg-popover border-border">
				<motion.div
					variants={containerVariants}
					initial="hidden"
					animate="visible"
					className="text-center space-y-6 py-4"
				>
					{/* Header */}
					<motion.div variants={itemVariants}>
						<DialogHeader>
							<DialogTitle className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
								Level Up!
							</DialogTitle>
						</DialogHeader>
					</motion.div>

					{/* Level Transition */}
					<motion.div variants={itemVariants} className="flex items-center justify-center gap-4">
						<LevelDisplay level={previousLevel} size="lg" animated={false} />

						<motion.div
							animate={{ x: [0, 10, 0] }}
							transition={{ repeat: Infinity, duration: 1.5 }}
						>
							<ArrowRight className="w-8 h-8 text-purple-400" />
						</motion.div>

						<motion.div variants={glowVariants} animate="animate" className="rounded-full">
							<LevelDisplay level={newLevel} rarity={levelInfo.rarity} size="xl" />
						</motion.div>
					</motion.div>

					{/* New Level Info */}
					<motion.div variants={itemVariants} className="space-y-2">
						<h3 className="text-xl font-semibold">{levelInfo.name}</h3>
						<Badge
							className={cn(
								'text-sm',
								levelInfo.rarity === 'mythic' && 'bg-red-600',
								levelInfo.rarity === 'legendary' && 'bg-amber-600',
								levelInfo.rarity === 'epic' && 'bg-purple-600',
								levelInfo.rarity === 'rare' && 'bg-blue-600',
								levelInfo.rarity === 'common' && 'bg-emerald-600'
							)}
						>
							{levelInfo.rarity.toUpperCase()} TIER
						</Badge>
					</motion.div>

					{/* Rewards */}
					{rewards && (
						<motion.div variants={itemVariants} className="space-y-3">
							<div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
								<Gift className="w-4 h-4" />
								<span>Rewards Unlocked</span>
							</div>

							<div className="grid grid-cols-1 gap-2">
								{rewards.dgt && (
									<motion.div
										className="flex items-center justify-center gap-2 p-3 bg-emerald-900/20 rounded-lg border border-emerald-700/50"
										whileHover={{ scale: 1.05 }}
									>
										<Zap className="w-5 h-5 text-emerald-400" />
										<span className="font-bold text-emerald-300">
											+{formatNumber(rewards.dgt)} DGT
										</span>
									</motion.div>
								)}

								{rewards.titleId && (
									<motion.div
										className="flex items-center justify-center gap-2 p-3 bg-purple-900/20 rounded-lg border border-purple-700/50"
										whileHover={{ scale: 1.05 }}
									>
										<Star className="w-5 h-5 text-purple-400" />
										<span className="font-bold text-purple-300">New Title Unlocked</span>
									</motion.div>
								)}

								{rewards.badgeId && (
									<motion.div
										className="flex items-center justify-center gap-2 p-3 bg-amber-900/20 rounded-lg border border-amber-700/50"
										whileHover={{ scale: 1.05 }}
									>
										<Trophy className="w-5 h-5 text-amber-400" />
										<span className="font-bold text-amber-300">New Badge Unlocked</span>
									</motion.div>
								)}

								{rewards.unlocks && rewards.unlocks.length > 0 && (
									<div className="space-y-1 text-sm text-muted-foreground">
										{rewards.unlocks.map((unlock, index) => (
											<motion.div
												key={index}
												className="flex items-center justify-center gap-2"
												initial={{ opacity: 0, x: -20 }}
												animate={{ opacity: 1, x: 0 }}
												transition={{ delay: 0.5 + index * 0.1 }}
											>
												<Sparkles className="w-3 h-3 text-purple-400" />
												<span>{unlock}</span>
											</motion.div>
										))}
									</div>
								)}
							</div>
						</motion.div>
					)}

					{/* Continue Button */}
					<motion.div variants={itemVariants}>
						<Button
							onClick={onClose}
							className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
						>
							<Sparkles className="w-4 h-4 mr-2" />
							Continue Your Journey
						</Button>
					</motion.div>
				</motion.div>
			</DialogContent>
		</Dialog>
	);
}
