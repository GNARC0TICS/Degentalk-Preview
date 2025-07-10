import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { LevelVisualConfig } from '@/features/gamification/components/LevelBadge';
import { LevelBadge } from '@/features/gamification/components/LevelBadge';

type UserLevelDisplayProps = {
	level?: number;
	levelConfig?: LevelVisualConfig;
	rankName?: string;
	showRank?: boolean;
	className?: string;
	variant?: 'default' | 'badge' | 'text';
};

/**
 * Component to display user level beside username in posts and comments
 *
 * @param level - User's level
 * @param levelConfig - User's level configuration
 * @param rankName - User's rank title (optional)
 * @param showRank - Whether to show the rank name
 * @param className - Additional class names
 * @param variant - Display style (default, badge, or text)
 */
export function UserLevelDisplay({
	level,
	levelConfig,
	rankName,
	showRank = false,
	className,
	variant = 'default'
}: UserLevelDisplayProps) {
	const resolvedLevel = levelConfig?.level ?? level ?? 0;

	// Get level color based on level range
	const getLevelColor = () => {
		if (resolvedLevel < 10) return 'text-emerald-400';
		if (resolvedLevel < 25) return 'text-cyan-400';
		if (resolvedLevel < 50) return 'text-purple-400';
		return 'text-amber-400';
	};

	// Get badge background based on level range
	const getBadgeClasses = () => {
		if (resolvedLevel < 10) return 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300';
		if (resolvedLevel < 25) return 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300';
		if (resolvedLevel < 50) return 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-300';
		return 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300';
	};

	// Text-only variant (simplest)
	if (variant === 'text') {
		return (
			<span className={cn('text-xs font-medium', getLevelColor(), className)}>
				Lvl {resolvedLevel}
			</span>
		);
	}

	// Badge variant
	if (variant === 'badge') {
		return (
			<LevelBadge levelConfig={levelConfig} level={resolvedLevel} size="xs" className={className} />
		);
	}

	// Default variant
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<div className={cn('flex items-center gap-1', className)} role="button" tabIndex={0}>
						<Sparkles className={cn('h-3.5 w-3.5', getLevelColor())} />
						<span className={cn('text-xs font-medium', getLevelColor())}>{resolvedLevel}</span>
						{showRank && rankName && <span className="text-xs text-zinc-400">• {rankName}</span>}
					</div>
				</TooltipTrigger>
				{!showRank && rankName && (
					<TooltipContent side="top" className="text-xs">
						{rankName}
					</TooltipContent>
				)}
			</Tooltip>
		</TooltipProvider>
	);
}
