import React from 'react';
import { cn } from '@app/utils/utils';
import { Sparkles } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@app/components/ui/tooltip';

export interface LevelVisualConfig {
	level: number;
	iconUrl?: string | null;
	colorTheme?: string | null;
	rarity?: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic' | null;
	animationEffect?: string | null;
	frameUrl?: string | null; // not used here but accepted for parity
}

type LevelBadgeProps = {
	/**
	 * Either provide legacy numeric level OR the new rich config.
	 * If both supplied, levelConfig takes precedence.
	 */
	level?: number;
	levelConfig?: LevelVisualConfig;
	showTooltip?: boolean;
	className?: string;
	size?: 'xs' | 'sm' | 'md';
};

/**
 * Compact component to display a user's level next to their username
 *
 * @param level - User's current level
 * @param showTooltip - Whether to show a tooltip with more info on hover
 * @param className - Additional class names
 * @param size - Size variant of the badge
 */
export function LevelBadge({
	level,
	levelConfig,
	showTooltip = true,
	className,
	size = 'sm'
}: LevelBadgeProps) {
	const resolvedLevel = levelConfig?.level ?? level ?? 0;

	// Get level title based on level
	const getLevelTitle = (lvl: number): string => {
		if (lvl < 5) return 'Newcomer';
		if (lvl < 10) return 'Explorer';
		if (lvl < 15) return 'Regular';
		if (lvl < 25) return 'Forum Enjoyer';
		if (lvl < 40) return 'Forum Veteran';
		if (lvl < 60) return 'Forum Expert';
		if (lvl < 80) return 'Forum Master';
		return 'Forum Legend';
	};

	// Resolve color classes or inline style from colorTheme
	const buildColorClasses = (): { classes: string; style?: React.CSSProperties } => {
		if (levelConfig?.colorTheme) {
			// Hex code → inline style
			if (levelConfig.colorTheme.startsWith('#')) {
				return {
					classes: 'border',
					style: { backgroundColor: `${levelConfig.colorTheme}20`, color: levelConfig.colorTheme }
				};
			}
			// Named theme (emerald, cyan, etc.)
			const name = levelConfig.colorTheme;
			return {
				classes: `bg-${name}-500/20 text-${name}-400 hover:bg-${name}-500/30 border-${name}-500/30 border`
			};
		}
		// Legacy fallback using numeric level tiers
		if (resolvedLevel < 10)
			return {
				classes: 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border-emerald-500/30'
			};
		if (resolvedLevel < 25)
			return { classes: 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border-cyan-500/30' };
		if (resolvedLevel < 50)
			return {
				classes: 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border-purple-500/30'
			};
		return { classes: 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border-amber-500/30' };
	};

	const { classes: badgeColorClasses, style: badgeStyle } = buildColorClasses();

	// Get size-related classes
	const getSizeClasses = () => {
		switch (size) {
			case 'xs':
				return 'text-[10px] px-1 py-0.5 rounded';
			case 'sm':
				return 'text-xs px-1.5 py-0.5 rounded';
			case 'md':
				return 'text-sm px-2 py-1 rounded-md';
			default:
				return 'text-xs px-1.5 py-0.5 rounded';
		}
	};

	// Get icon size classes
	const getIconSizeClasses = () => {
		switch (size) {
			case 'xs':
				return 'h-2.5 w-2.5 mr-0.5';
			case 'sm':
				return 'h-3 w-3 mr-0.5';
			case 'md':
				return 'h-3.5 w-3.5 mr-1';
			default:
				return 'h-3 w-3 mr-0.5';
		}
	};

	// Choose icon image or sparkles
	const iconNode = levelConfig?.iconUrl ? (
		<img
			src={levelConfig.iconUrl}
			alt="level icon"
			className={cn(getIconSizeClasses(), 'object-contain')}
		/>
	) : (
		<Sparkles className={getIconSizeClasses()} />
	);

	// Animation effect class
	const animationClass = levelConfig?.animationEffect
		? `animate-${levelConfig.animationEffect}`
		: undefined;

	const badgeContent = (
		<div
			className={cn(
				'inline-flex items-center font-medium border',
				badgeColorClasses,
				getSizeClasses(),
				animationClass,
				className
			)}
			style={badgeStyle}
		>
			{iconNode}
			{resolvedLevel}
		</div>
	);

	if (!showTooltip) {
		return badgeContent;
	}

	return (
		<TooltipProvider>
			<Tooltip delayDuration={300}>
				<TooltipTrigger asChild>{badgeContent}</TooltipTrigger>
				<TooltipContent side="top" align="center" className="p-2">
					<div className="text-center">
						<p className="font-semibold">Level {resolvedLevel}</p>
						<p className="text-xs text-zinc-400">{getLevelTitle(resolvedLevel)}</p>
					</div>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
