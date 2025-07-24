import React from 'react';
import { cn } from '@app/utils/utils';
import { Progress } from '@app/components/ui/progress';
import { formatNumber } from '@app/utils/utils';
import { Badge } from '@app/components/ui/badge';
import { Sparkles, Target, Star } from 'lucide-react';

// Unified progress types
export type ProgressType = 'xp' | 'path' | 'mission' | 'achievement';

export interface ProgressPathProps {
	type: ProgressType;
	level?: number;
	currentValue: number;
	targetValue: number | null;
	progressPercent: number;
	title?: string;
	subtitle?: string;
	showBadge?: boolean;
	className?: string;
	variant?: 'default' | 'compact' | 'minimal';
	icon?: React.ReactNode;
}

/**
 * ProgressPath - Unified component for all progression displays
 *
 * Replaces:
 * - components/economy/xp/XPProgressBar.tsx
 * - components/profile/XPProgressBar.tsx
 * - components/paths/path-progress.tsx
 * - components/dashboard/DailyTasksWidget.tsx (progress parts)
 */
export function ProgressPath({
	type,
	level,
	currentValue,
	targetValue,
	progressPercent,
	title,
	subtitle,
	showBadge = false,
	className,
	variant = 'default',
	icon
}: ProgressPathProps) {
	const getIcon = () => {
		if (icon) return icon;
		switch (type) {
			case 'xp':
				return <Sparkles className="h-4 w-4" />;
			case 'path':
				return <Target className="h-4 w-4" />;
			case 'mission':
				return <Star className="h-4 w-4" />;
			default:
				return null;
		}
	};

	const getColorScheme = () => {
		switch (type) {
			case 'xp':
				return 'from-blue-500 to-purple-600';
			case 'path':
				return 'from-green-500 to-teal-600';
			case 'mission':
				return 'from-orange-500 to-red-600';
			case 'achievement':
				return 'from-yellow-500 to-orange-600';
			default:
				return 'from-gray-500 to-gray-600';
		}
	};

	if (variant === 'minimal') {
		return (
			<div className={cn('flex items-center gap-2', className)}>
				{getIcon()}
				<Progress value={progressPercent} className="flex-1 h-2" />
				<span className="text-xs text-muted-foreground">
					{formatNumber(currentValue)}/{targetValue ? formatNumber(targetValue) : '∞'}
				</span>
			</div>
		);
	}

	if (variant === 'compact') {
		return (
			<div className={cn('space-y-1', className)}>
				<div className="flex items-center justify-between text-sm">
					<div className="flex items-center gap-2">
						{getIcon()}
						{level && <span className="font-semibold">Level {level}</span>}
						{title && <span>{title}</span>}
					</div>
					<span className="text-muted-foreground">
						{formatNumber(currentValue)}/{targetValue ? formatNumber(targetValue) : '∞'}
					</span>
				</div>
				<Progress value={progressPercent} className="h-2" />
			</div>
		);
	}

	// Default variant
	return (
		<div className={cn('space-y-3 p-4 rounded-lg border bg-card', className)}>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div className={cn('p-2 rounded-full bg-gradient-to-r', getColorScheme())}>
						{getIcon()}
					</div>
					<div>
						{title && <h4 className="font-medium">{title}</h4>}
						{subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
						{level && (
							<div className="flex items-center gap-2 mt-1">
								<span className="text-lg font-bold">Level {level}</span>
								{showBadge && (
									<Badge variant="secondary" className="text-xs">
										<Sparkles className="h-3 w-3 mr-1" />
										Pro
									</Badge>
								)}
							</div>
						)}
					</div>
				</div>
				<div className="text-right text-sm">
					<div className="font-medium">
						{formatNumber(currentValue)}/{targetValue ? formatNumber(targetValue) : '∞'}
					</div>
					<div className="text-muted-foreground">{Math.round(progressPercent)}% complete</div>
				</div>
			</div>
			<Progress value={progressPercent} className="h-3" />
		</div>
	);
}

// Legacy component wrappers for migration
export const XPProgressBar = ProgressPath;
export const PathProgress = ProgressPath;
export const MissionProgress = ProgressPath;
