import { cn } from '@/utils/utils';
import { Progress } from '@/components/ui/progress';
import { formatNumber } from '@/utils/utils';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

type XPProgressBarProps = {
	level: number;
	currentXP: number;
	nextLevelXP: number | null;
	progressPercent: number;
	showProBadge?: boolean;
	className?: string;
	variant?: 'default' | 'compact' | 'minimal';
};

/**
 * XPProgressBar component for displaying user level progression
 *
 * @param level - Current user level
 * @param currentXP - Current XP amount
 * @param nextLevelXP - XP required for next level
 * @param progressPercent - Percentage progress to next level (0-100)
 * @param showProBadge - Whether to show a PRO badge for higher level users
 * @param className - Additional class names
 * @param variant - Display style variant (default, compact, minimal)
 */
export function XPProgressBar({
	level,
	currentXP,
	nextLevelXP,
	progressPercent,
	showProBadge = false,
	className,
	variant = 'default'
}: XPProgressBarProps) {
	// Generate glow color based on level range
	const getGlowColor = () => {
		if (level < 10) return 'from-emerald-500/20 to-emerald-500/5'; // Beginner: Emerald
		if (level < 25) return 'from-cyan-500/20 to-cyan-500/5'; // Intermediate: Cyan
		if (level < 50) return 'from-purple-500/20 to-purple-500/5'; // Advanced: Purple
		return 'from-amber-500/20 to-amber-500/5'; // Expert: Gold
	};

	// Get progress bar color based on level range
	const getProgressColor = () => {
		if (level < 10) return 'bg-emerald-500';
		if (level < 25) return 'bg-cyan-500';
		if (level < 50) return 'bg-purple-500';
		return 'bg-amber-500';
	};

	// Get level title
	const getLevelTitle = (level: number): string => {
		if (level < 5) return 'Newcomer';
		if (level < 10) return 'Explorer';
		if (level < 15) return 'Regular';
		if (level < 25) return 'Forum Enjoyer';
		if (level < 40) return 'Forum Veteran';
		if (level < 60) return 'Forum Expert';
		if (level < 80) return 'Forum Master';
		return 'Forum Legend';
	};

	// Minimal variant - just the level badge
	if (variant === 'minimal') {
		return (
			<Badge
				className={cn(
					'flex items-center gap-1 font-semibold',
					level < 10
						? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
						: level < 25
							? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
							: level < 50
								? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
								: 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30',
					className
				)}
			>
				<Sparkles className="h-3.5 w-3.5" />
				Lvl {level}
			</Badge>
		);
	}

	// Compact variant - minimal info with smaller footprint
	if (variant === 'compact') {
		return (
			<div className={cn('relative rounded-md', className)}>
				<div className="flex items-center justify-between mb-1">
					<div className="flex items-center gap-1">
						<span className="text-xs font-medium text-slate-400">LVL</span>
						<span
							className={cn(
								'text-sm font-bold',
								level < 10
									? 'text-emerald-400'
									: level < 25
										? 'text-cyan-400'
										: level < 50
											? 'text-purple-400'
											: 'text-amber-400'
							)}
						>
							{level}
						</span>
					</div>
					{nextLevelXP && (
						<span className="text-xs text-slate-500">
							{formatNumber(currentXP)} / {formatNumber(nextLevelXP)}
						</span>
					)}
				</div>
				<div className="relative h-1.5">
					<div className="absolute inset-0 bg-zinc-800 rounded-full"></div>
					<Progress
						value={progressPercent}
						className={cn('h-full animate-pulse-glow', getProgressColor())}
					/>
				</div>
			</div>
		);
	}

	// Default variant - full display
	return (
		<div
			className={cn(
				'bg-zinc-850 rounded-lg p-4 relative overflow-hidden shadow-md border border-zinc-750',
				className
			)}
		>
			{/* Background Glow Effect */}
			<div className={cn('absolute inset-0 bg-gradient-to-br opacity-20', getGlowColor())}></div>

			{/* Content */}
			<div className="relative z-10">
				<div className="flex items-center justify-between mb-3">
					<div className="flex items-center gap-2">
						<div
							className={cn(
								'flex items-center justify-center w-12 h-12 rounded-full bg-black/40 border',
								level < 10
									? 'border-emerald-500 text-emerald-400'
									: level < 25
										? 'border-cyan-500 text-cyan-400'
										: level < 50
											? 'border-purple-500 text-purple-400'
											: 'border-amber-500 text-amber-400'
							)}
						>
							<span className="text-xl font-bold">{level}</span>
						</div>
						<div>
							<h3 className="text-white font-bold">Level {level}</h3>
							<p className="text-xs text-slate-400">{getLevelTitle(level)}</p>
						</div>
					</div>

					{/* PRO Badge - Only shown if showProBadge is true */}
					{showProBadge && (
						<div className="flex items-center">
							<Badge className="py-1 px-2 rounded-md text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-600 border-amber-700">
								<Sparkles className="h-3.5 w-3.5 mr-1" />
								PRO
							</Badge>
						</div>
					)}
				</div>

				{/* Progress Bar */}
				<div className="mb-1">
					<div className="flex justify-between items-center mb-1">
						<span className="text-xs text-slate-400">
							{nextLevelXP ? `Progress to Level ${level + 1}` : 'Max Level Reached'}
						</span>
						{nextLevelXP ? (
							<span className="text-xs text-slate-500">
								{formatNumber(currentXP)} / {formatNumber(nextLevelXP)} XP
							</span>
						) : (
							<span className="text-xs text-slate-500">{formatNumber(currentXP)} XP</span>
						)}
					</div>
					<div className="relative h-2.5">
						<div className="absolute inset-0 bg-zinc-800 rounded-full"></div>
						<Progress
							value={progressPercent}
							className={cn('h-full animate-pulse-glow', getProgressColor())}
						/>
					</div>
				</div>

				{/* Percentage Display */}
				<div className="text-right text-xs text-slate-400">
					{nextLevelXP ? `${progressPercent}% Complete` : 'Maximum Level Achieved'}
				</div>
			</div>
		</div>
	);
}
