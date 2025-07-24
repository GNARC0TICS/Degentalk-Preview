import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	Zap,
	Heart,
	TrendingUp,
	TrendingDown,
	Trophy,
	Coins,
	Users,
	Award,
	Star,
	Flame,
	Target
} from 'lucide-react';

import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { cn } from '@app/utils/utils';

export interface CryptoEngagementBarProps {
	engagement: {
		totalTips: number;
		uniqueTippers: number;
		tipLeaderboard?: Array<{
			username: string;
			amount: number;
			avatarUrl?: string;
		}>;
		momentum: 'bullish' | 'bearish' | 'neutral';
		reputationScore?: number;
		qualityScore?: number;
		hotScore?: number;
		bookmarks: number;
		shares?: number;
	};
	onTip?: (amount: number) => void;
	onBookmark?: () => void;
	onShare?: () => void;
	isBookmarked?: boolean;
	showDetailed?: boolean;
	className?: string;
}

const CryptoEngagementBar = memo(
	({
		engagement,
		onTip,
		onBookmark,
		onShare,
		isBookmarked = false,
		showDetailed = false,
		className
	}: CryptoEngagementBarProps) => {
		const [showTipModal, setShowTipModal] = useState(false);
		const [selectedTipAmount, setSelectedTipAmount] = useState<number>(10);

		const tipAmounts = [5, 10, 25, 50, 100];

		const getMomentumIcon = () => {
			switch (engagement.momentum) {
				case 'bullish':
					return <TrendingUp className="w-4 h-4 text-emerald-400" />;
				case 'bearish':
					return <TrendingDown className="w-4 h-4 text-red-400" />;
				default:
					return <Target className="w-4 h-4 text-zinc-400" />;
			}
		};

		const getMomentumLabel = () => {
			switch (engagement.momentum) {
				case 'bullish':
					return 'Bullish';
				case 'bearish':
					return 'Bearish';
				default:
					return 'Neutral';
			}
		};

		const getMomentumColor = () => {
			switch (engagement.momentum) {
				case 'bullish':
					return 'text-emerald-400 bg-emerald-900/20 border-emerald-500/30';
				case 'bearish':
					return 'text-red-400 bg-red-900/20 border-red-500/30';
				default:
					return 'text-zinc-400 bg-zinc-800/30 border-zinc-700/30';
			}
		};

		const handleQuickTip = (amount: number) => {
			onTip?.(amount);
			setShowTipModal(false);
		};

		const getQualityBadge = () => {
			if (!engagement.qualityScore) return null;

			if (engagement.qualityScore >= 90) {
				return (
					<Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-2 py-1 text-xs font-bold">
						<Trophy className="w-3 h-3 mr-1" />
						Legendary
					</Badge>
				);
			} else if (engagement.qualityScore >= 75) {
				return (
					<Badge className="bg-gradient-to-r from-purple-500 to-violet-500 text-white px-2 py-1 text-xs font-bold">
						<Star className="w-3 h-3 mr-1" />
						Quality
					</Badge>
				);
			}
			return null;
		};

		return (
			<div className={cn('space-y-3', className)}>
				{/* Main Engagement Stats */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						{/* Tip Stats */}
						{engagement.totalTips > 0 && (
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								className="flex items-center gap-2 text-sm"
							>
								<div className="flex items-center gap-1 text-emerald-400">
									<Zap className="w-4 h-4" />
									<span className="font-medium">{engagement.totalTips} DGT</span>
								</div>
								{engagement.uniqueTippers > 1 && (
									<div className="flex items-center gap-1 text-zinc-400">
										<Users className="w-3 h-3" />
										<span className="text-xs">{engagement.uniqueTippers} tippers</span>
									</div>
								)}
							</motion.div>
						)}

						{/* Momentum Indicator */}
						<motion.div
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							className={cn(
								'flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-medium',
								getMomentumColor()
							)}
						>
							{getMomentumIcon()}
							<span>{getMomentumLabel()}</span>
						</motion.div>

						{/* Quality Badge */}
						{getQualityBadge()}

						{/* Hot Score */}
						{engagement.hotScore && engagement.hotScore > 10 && (
							<Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 text-xs font-bold">
								<Flame className="w-3 h-3 mr-1" />
								HOT
							</Badge>
						)}
					</div>

					{/* Action Buttons */}
					<div className="flex items-center gap-2">
						{onTip && (
							<div className="relative">
								<Button
									size="sm"
									variant="ghost"
									className="h-8 px-3 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-900/20"
									onClick={() => setShowTipModal(!showTipModal)}
								>
									<Zap className="w-4 h-4 mr-1" />
									Tip
								</Button>

								{/* Quick Tip Modal */}
								<AnimatePresence>
									{showTipModal && (
										<motion.div
											initial={{ opacity: 0, scale: 0.95, y: -10 }}
											animate={{ opacity: 1, scale: 1, y: 0 }}
											exit={{ opacity: 0, scale: 0.95, y: -10 }}
											transition={{ duration: 0.15 }}
											className="absolute top-full right-0 mt-2 z-50"
										>
											<div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl p-3 min-w-[180px]">
												<div className="text-xs text-zinc-400 mb-2 font-medium">Quick Tip</div>
												<div className="grid grid-cols-3 gap-1">
													{tipAmounts.map((amount) => (
														<Button
															key={amount}
															size="sm"
															variant={selectedTipAmount === amount ? 'default' : 'ghost'}
															className="h-8 text-xs"
															onClick={() => handleQuickTip(amount)}
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
						)}

						{onBookmark && (
							<Button
								size="sm"
								variant="ghost"
								className={cn(
									'h-8 w-8 p-0 transition-colors',
									'text-zinc-400 hover:text-emerald-400 hover:bg-emerald-900/20',
									isBookmarked && 'text-amber-400'
								)}
								onClick={() => onBookmark?.()}
							>
								<Star className={cn('w-4 h-4', isBookmarked && 'fill-current')} />
							</Button>
						)}
					</div>
				</div>

				{/* Detailed Engagement Info */}
				<AnimatePresence>
					{showDetailed && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: 'auto' }}
							exit={{ opacity: 0, height: 0 }}
							transition={{ duration: 0.2 }}
							className="space-y-3 overflow-hidden"
						>
							{/* Tip Leaderboard */}
							{engagement.tipLeaderboard && engagement.tipLeaderboard.length > 0 && (
								<div className="space-y-2">
									<div className="text-xs font-medium text-zinc-300">Top Tippers</div>
									<div className="space-y-1">
										{engagement.tipLeaderboard.slice(0, 3).map((tipper, index) => (
											<motion.div
												key={tipper.username}
												initial={{ opacity: 0, x: -20 }}
												animate={{ opacity: 1, x: 0 }}
												transition={{ delay: index * 0.1 }}
												className="flex items-center justify-between p-2 rounded bg-zinc-800/40"
											>
												<div className="flex items-center gap-2">
													<Badge
														variant="outline"
														className={cn(
															'w-5 h-5 p-0 text-xs flex items-center justify-center',
															index === 0 && 'bg-amber-500/20 text-amber-400 border-amber-500/30',
															index === 1 && 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30',
															index === 2 && 'bg-orange-500/20 text-orange-400 border-orange-500/30'
														)}
													>
														{index + 1}
													</Badge>
													<span className="text-sm text-zinc-300 truncate">{tipper.username}</span>
												</div>
												<div className="flex items-center gap-1 text-xs text-emerald-400">
													<Coins className="w-3 h-3" />
													<span>{tipper.amount} DGT</span>
												</div>
											</motion.div>
										))}
									</div>
								</div>
							)}

							{/* Engagement Metrics */}
							<div className="grid grid-cols-2 gap-3 text-xs">
								{engagement.reputationScore && (
									<div className="flex items-center justify-between p-2 rounded bg-zinc-800/30">
										<span className="text-zinc-400">Reputation</span>
										<div className="flex items-center gap-1 text-blue-400">
											<Award className="w-3 h-3" />
											<span>{engagement.reputationScore}</span>
										</div>
									</div>
								)}

								{engagement.bookmarks > 0 && (
									<div className="flex items-center justify-between p-2 rounded bg-zinc-800/30">
										<span className="text-zinc-400">Bookmarks</span>
										<div className="flex items-center gap-1 text-amber-400">
											<Star className="w-3 h-3" />
											<span>{engagement.bookmarks}</span>
										</div>
									</div>
								)}
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		);
	}
);

CryptoEngagementBar.displayName = 'CryptoEngagementBar';

export { CryptoEngagementBar };
export default CryptoEngagementBar;
