import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	TrendingUp,
	TrendingDown,
	Zap,
	Target,
	Rocket,
	Flame,
	Diamond,
	Heart,
	ThumbsUp,
	ThumbsDown,
	DollarSign,
	Coins
} from 'lucide-react';

import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { cn } from '@app/utils/utils';

export interface Reaction {
	id: string;
	type:
		| 'diamond_hands'
		| 'paper_hands'
		| 'hodl'
		| 'moon'
		| 'fire'
		| 'bullish'
		| 'bearish'
		| 'love'
		| 'based'
		| 'ngmi';
	emoji: string;
	label: string;
	count: number;
	hasReacted: boolean;
	color: string;
	bgColor: string;
	borderColor: string;
}

export interface QuickReactionsProps {
	reactions: Reaction[];
	onReact: (reactionType: string) => void;
	onTip?: (amount: number) => void;
	compact?: boolean;
	showTipIntegration?: boolean;
	className?: string;
}

const cryptoReactionTypes = {
	diamond_hands: {
		emoji: '💎',
		label: 'Diamond Hands',
		color: 'text-cyan-400',
		bgColor: 'bg-cyan-900/20',
		borderColor: 'border-cyan-500/30',
		icon: Diamond
	},
	paper_hands: {
		emoji: '🧻',
		label: 'Paper Hands',
		color: 'text-red-400',
		bgColor: 'bg-red-900/20',
		borderColor: 'border-red-500/30',
		icon: TrendingDown
	},
	hodl: {
		emoji: '🚀',
		label: 'HODL',
		color: 'text-emerald-400',
		bgColor: 'bg-emerald-900/20',
		borderColor: 'border-emerald-500/30',
		icon: Rocket
	},
	moon: {
		emoji: '🌙',
		label: 'To the Moon',
		color: 'text-amber-400',
		bgColor: 'bg-amber-900/20',
		borderColor: 'border-amber-500/30',
		icon: TrendingUp
	},
	fire: {
		emoji: '🔥',
		label: 'Fire',
		color: 'text-orange-400',
		bgColor: 'bg-orange-900/20',
		borderColor: 'border-orange-500/30',
		icon: Flame
	},
	bullish: {
		emoji: '📈',
		label: 'Bullish',
		color: 'text-green-400',
		bgColor: 'bg-green-900/20',
		borderColor: 'border-green-500/30',
		icon: TrendingUp
	},
	bearish: {
		emoji: '📉',
		label: 'Bearish',
		color: 'text-red-400',
		bgColor: 'bg-red-900/20',
		borderColor: 'border-red-500/30',
		icon: TrendingDown
	},
	love: {
		emoji: '❤️',
		label: 'Love',
		color: 'text-pink-400',
		bgColor: 'bg-pink-900/20',
		borderColor: 'border-pink-500/30',
		icon: Heart
	},
	based: {
		emoji: '🎯',
		label: 'Based',
		color: 'text-purple-400',
		bgColor: 'bg-purple-900/20',
		borderColor: 'border-purple-500/30',
		icon: Target
	},
	ngmi: {
		emoji: '💀',
		label: 'NGMI',
		color: 'text-zinc-400',
		bgColor: 'bg-zinc-800/20',
		borderColor: 'border-zinc-600/30',
		icon: ThumbsDown
	}
};

const QuickReactions = memo(
	({
		reactions,
		onReact,
		onTip,
		compact = false,
		showTipIntegration = true,
		className
	}: QuickReactionsProps) => {
		const [showAll, setShowAll] = useState(false);
		const [showTipModal, setShowTipModal] = useState(false);

		// Sort reactions by count (descending) and show popular ones first
		const sortedReactions = [...reactions].sort((a, b) => b.count - a.count);
		const displayReactions = compact && !showAll ? sortedReactions.slice(0, 4) : sortedReactions;
		const hiddenCount = sortedReactions.length - 4;

		const handleReactionClick = (reactionType: string) => {
			onReact(reactionType);
		};

		const totalReactions = reactions.reduce((sum, reaction) => sum + reaction.count, 0);
		const userReactions = reactions.filter((r) => r.hasReacted);

		const tipAmounts = [5, 10, 25, 50];

		return (
			<div className={cn('space-y-3', className)}>
				{/* Reactions Grid */}
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<div className="text-xs font-medium text-zinc-300">
							Community Reactions{' '}
							{totalReactions > 0 && (
								<span className="text-zinc-500">• {totalReactions} total</span>
							)}
						</div>
						{compact && hiddenCount > 0 && (
							<Button
								size="sm"
								variant="ghost"
								className="h-6 px-2 text-xs text-zinc-400 hover:text-zinc-200"
								onClick={() => setShowAll(!showAll)}
							>
								{showAll ? 'Show Less' : `+${hiddenCount} more`}
							</Button>
						)}
					</div>

					<div className="flex flex-wrap gap-2">
						{displayReactions.map((reaction) => {
							const reactionConfig =
								cryptoReactionTypes[reaction.type as keyof typeof cryptoReactionTypes];

							return (
								<motion.div key={reaction.id}>
									<Button
										aria-label={reactionConfig?.label || reaction.type}
										size="sm"
										variant="ghost"
										className={cn(
											'h-8 px-3 transition-all duration-200 border',
											reaction.hasReacted
												? cn(
														reactionConfig?.bgColor,
														reactionConfig?.borderColor,
														reactionConfig?.color,
														'shadow-sm'
													)
												: 'border-zinc-700/50 text-zinc-400 hover:border-zinc-600/50 hover:text-zinc-200',
											'hover:scale-105 active:scale-95'
										)}
										onClick={() => handleReactionClick(reaction.type)}
									>
										<span className="mr-1.5 text-sm">{reactionConfig?.emoji || '👍'}</span>
										<span className="text-xs font-medium">
											{reaction.count > 0 ? reaction.count : reactionConfig?.label}
										</span>
										{reaction.hasReacted && (
											<motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-1">
												<Zap className="w-3 h-3" />
											</motion.div>
										)}
									</Button>
								</motion.div>
							);
						})}
					</div>

					{/* Your Reactions Summary */}
					{userReactions.length > 0 && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							className="flex items-center gap-2 text-xs text-zinc-400"
						>
							<span>You reacted:</span>
							<div className="flex gap-1">
								{userReactions.map((reaction) => {
									const config =
										cryptoReactionTypes[reaction.type as keyof typeof cryptoReactionTypes];
									return (
										<span key={reaction.id} className="flex items-center gap-1">
											<span>{config?.emoji}</span>
											<span className={config?.color}>{config?.label}</span>
										</span>
									);
								})}
							</div>
						</motion.div>
					)}
				</div>

				{/* Tip Integration */}
				{showTipIntegration && onTip && (
					<div className="flex items-center justify-between pt-2 border-t border-zinc-800/50">
						<div className="text-xs text-zinc-400">Show appreciation with DGT</div>

						<div className="relative">
							<Button
								size="sm"
								variant="ghost"
								className="h-7 px-3 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/20 border border-emerald-700/30"
								onClick={() => setShowTipModal(!showTipModal)}
							>
								<Coins className="w-3 h-3 mr-1" />
								Tip DGT
							</Button>

							<AnimatePresence>
								{showTipModal && (
									<motion.div
										initial={{ opacity: 0, scale: 0.95, y: -10 }}
										animate={{ opacity: 1, scale: 1, y: 0 }}
										exit={{ opacity: 0, scale: 0.95, y: -10 }}
										transition={{ duration: 0.15 }}
										className="absolute bottom-full right-0 mb-2 z-50"
									>
										<div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl p-3 min-w-[160px]">
											<div className="text-xs text-zinc-400 mb-2 font-medium">Quick Tip</div>
											<div className="grid grid-cols-2 gap-1">
												{tipAmounts.map((amount) => (
													<Button
														key={amount}
														size="sm"
														variant="ghost"
														className="h-7 text-xs hover:bg-emerald-900/20 hover:text-emerald-400"
														onClick={() => {
															onTip(amount);
															setShowTipModal(false);
														}}
													>
														{amount} DGT
													</Button>
												))}
											</div>
										</div>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</div>
				)}
			</div>
		);
	}
);

QuickReactions.displayName = 'QuickReactions';

export { QuickReactions };
export default QuickReactions;
