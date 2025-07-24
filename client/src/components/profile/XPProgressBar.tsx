import React from 'react';
import { cn } from '@app/utils/utils';
import { Progress } from '@app/components/ui/progress';
import { formatNumber } from '@app/utils/utils';

type XPProgressBarProps = {
	level: number;
	currentXP: number;
	nextLevelXP: number;
	showProBadge?: boolean;
	className?: string;
	variant?: 'default' | 'compact';
};

/**
 * XPProgressBar component for displaying user level progression
 *
 * Features:
 * - Shows current level with glow effect
 * - Displays XP progress towards next level
 * - Optional PRO badge for higher level users
 * - Different layout variants
 */
export function XPProgressBar({
	level,
	currentXP,
	nextLevelXP,
	showProBadge = false,
	className,
	variant = 'default'
}: XPProgressBarProps) {
	// Calculate progress percentage
	const progressPercentage = Math.min(Math.floor((currentXP / nextLevelXP) * 100), 100);

	// Generate glow color based on level range
	const getGlowColor = () => {
		if (level < 10) return 'from-emerald-500/10 to-emerald-500/5'; // Beginner: Emerald
		if (level < 25) return 'from-cyan-500/10 to-cyan-500/5'; // Intermediate: Cyan
		if (level < 50) return 'from-purple-500/10 to-purple-500/5'; // Advanced: Purple
		return 'from-amber-500/10 to-amber-500/5'; // Expert: Gold
	};

	// Get progress bar color based on level range
	const getProgressColor = () => {
		if (level < 10) return 'bg-emerald-500';
		if (level < 25) return 'bg-cyan-500';
		if (level < 50) return 'bg-purple-500';
		return 'bg-amber-500';
	};

	// Get level text color
	const getLevelTextColor = () => {
		if (level < 10) return 'text-emerald-400';
		if (level < 25) return 'text-cyan-400';
		if (level < 50) return 'text-purple-400';
		return 'text-amber-400';
	};

	// Get border color for level circle
	const getLevelBorderColor = () => {
		if (level < 10) return 'border-emerald-500';
		if (level < 25) return 'border-cyan-500';
		if (level < 50) return 'border-purple-500';
		return 'border-amber-500';
	};

	if (variant === 'compact') {
		return (
			<div className={cn('relative rounded-md overflow-hidden', className)}>
				<div className="flex items-center justify-between mb-1">
					<div className="flex items-center gap-1">
						<span className="text-xs font-medium text-slate-400">LVL</span>
						<span className={cn('text-sm font-bold', getLevelTextColor())}>{level}</span>
					</div>
					<span className="text-xs text-slate-500">
						{formatNumber(currentXP)} / {formatNumber(nextLevelXP)}
					</span>
				</div>
				<div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden">
					<div
						className={cn('h-full rounded-full transition-all duration-300', getProgressColor())}
						style={{ width: `${progressPercentage}%` }}
					/>
				</div>
			</div>
		);
	}

	return (
		<div
			className={cn(
				'bg-zinc-800/80 rounded-lg p-4 relative overflow-hidden shadow-md border border-zinc-700/50',
				className
			)}
		>
			{/* Background Glow Effect - Much more subtle */}
			<div className={cn('absolute inset-0 bg-gradient-to-br opacity-10', getGlowColor())}></div>

			{/* Content */}
			<div className="relative z-10">
				<div className="flex items-center justify-between mb-3">
					<div className="flex items-center gap-3">
						<div
							className={cn(
								'flex items-center justify-center w-12 h-12 rounded-full bg-black/40 border-2',
								getLevelBorderColor(),
								getLevelTextColor()
							)}
						>
							<span className="text-xl font-bold">{level}</span>
						</div>
						<div>
							<h3 className="text-white font-bold">Level {level}</h3>
							<p className="text-xs text-slate-400">{getLevelText(level)}</p>
						</div>
					</div>

					{/* PRO Badge - Only shown if showProBadge is true */}
					{showProBadge && (
						<div className="flex items-center">
							<div className="bg-amber-600 text-black px-3 py-1 rounded-full text-xs font-bold">
								PRO
							</div>
						</div>
					)}
				</div>

				{/* Progress Bar */}
				<div className="mb-2">
					<div className="flex justify-between items-center mb-2">
						<span className="text-xs text-slate-400">Progress to Level {level + 1}</span>
						<span className="text-xs text-slate-500">
							{formatNumber(currentXP)} / {formatNumber(nextLevelXP)} XP
						</span>
					</div>
					<div className="relative h-3 bg-zinc-800 rounded-full overflow-hidden">
						<div
							className={cn(
								'h-full rounded-full transition-all duration-500 ease-out',
								getProgressColor()
							)}
							style={{ width: `${progressPercentage}%` }}
						/>
					</div>
				</div>

				{/* Percentage Display */}
				<div className="text-right">
					<span className={cn('text-sm font-medium', getLevelTextColor())}>
						{progressPercentage}% Complete
					</span>
				</div>
			</div>
		</div>
	);
}

function getLevelText(level: number): string {
	if (level < 5) return 'Newcomer';
	if (level < 10) return 'Explorer';
	if (level < 15) return 'Regular';
	if (level < 25) return 'Forum Enjoyer';
	if (level < 40) return 'Forum Veteran';
	if (level < 60) return 'Forum Expert';
	if (level < 80) return 'Forum Master';
	return 'Forum Legend';
}
