/**
 * LevelDisplay Component
 *
 * Displays user level with various visual styles and effects
 * based on level rarity and milestones
 */

import { cn } from '@app/utils/utils';
import { Badge } from '@app/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@app/components/ui/tooltip';
import { Crown, Sparkles, Star, Trophy, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface LevelDisplayProps {
	level: number;
	rarity?: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
	size?: 'sm' | 'md' | 'lg' | 'xl';
	showTitle?: boolean;
	levelTitle?: string;
	animated?: boolean;
	className?: string;
}

export function LevelDisplay({
	level,
	rarity = 'common',
	size = 'md',
	showTitle = false,
	levelTitle,
	animated = true,
	className
}: LevelDisplayProps) {
	// Get icon based on level milestones
	const getIcon = () => {
		if (level >= 100) return Crown;
		if (level >= 75) return Trophy;
		if (level >= 50) return Star;
		if (level >= 25) return Zap;
		return Sparkles;
	};

	const Icon = getIcon();

	// Get colors based on rarity
	const getRarityColors = () => {
		switch (rarity) {
			case 'mythic':
				return {
					bg: 'bg-gradient-to-br from-red-600 to-orange-600',
					border: 'border-red-500',
					text: 'text-red-100',
					glow: 'shadow-red-500/50',
					icon: 'text-orange-300'
				};
			case 'legendary':
				return {
					bg: 'bg-gradient-to-br from-amber-600 to-yellow-500',
					border: 'border-amber-500',
					text: 'text-amber-100',
					glow: 'shadow-amber-500/50',
					icon: 'text-yellow-300'
				};
			case 'epic':
				return {
					bg: 'bg-gradient-to-br from-purple-600 to-pink-600',
					border: 'border-purple-500',
					text: 'text-purple-100',
					glow: 'shadow-purple-500/50',
					icon: 'text-pink-300'
				};
			case 'rare':
				return {
					bg: 'bg-gradient-to-br from-blue-600 to-cyan-600',
					border: 'border-blue-500',
					text: 'text-blue-100',
					glow: 'shadow-blue-500/50',
					icon: 'text-cyan-300'
				};
			default:
				return {
					bg: 'bg-gradient-to-br from-emerald-600 to-green-600',
					border: 'border-emerald-500',
					text: 'text-emerald-100',
					glow: 'shadow-emerald-500/50',
					icon: 'text-green-300'
				};
		}
	};

	const colors = getRarityColors();

	// Get size classes
	const getSizeClasses = () => {
		switch (size) {
			case 'xl':
				return {
					container: 'w-20 h-20',
					text: 'text-2xl',
					icon: 'w-6 h-6',
					title: 'text-sm'
				};
			case 'lg':
				return {
					container: 'w-16 h-16',
					text: 'text-xl',
					icon: 'w-5 h-5',
					title: 'text-xs'
				};
			case 'sm':
				return {
					container: 'w-10 h-10',
					text: 'text-sm',
					icon: 'w-3 h-3',
					title: 'text-xs'
				};
			default:
				return {
					container: 'w-12 h-12',
					text: 'text-base',
					icon: 'w-4 h-4',
					title: 'text-xs'
				};
		}
	};

	const sizes = getSizeClasses();

	// Animation variants
	const containerVariants = {
		idle: { scale: 1, rotate: 0 },
		hover: { scale: 1.05, rotate: [0, -5, 5, 0] },
		tap: { scale: 0.95 }
	};

	const glowVariants = {
		idle: { opacity: 0.5 },
		hover: { opacity: 1 }
	};

	const levelElement = (
		<motion.div
			className={cn(
				'relative flex items-center justify-center rounded-full border-2',
				colors.bg,
				colors.border,
				sizes.container,
				animated && 'cursor-pointer',
				className
			)}
			variants={animated ? containerVariants : undefined}
			initial="idle"
			whileHover="hover"
			whileTap="tap"
		>
			{/* Glow effect */}
			{animated && (
				<motion.div
					className={cn('absolute inset-0 rounded-full blur-md', colors.bg, colors.glow)}
					variants={glowVariants}
					style={{ zIndex: -1 }}
				/>
			)}

			{/* Icon */}
			<Icon className={cn('absolute top-1 right-1', sizes.icon, colors.icon)} />

			{/* Level number */}
			<span className={cn('font-bold', sizes.text, colors.text)}>{level}</span>
		</motion.div>
	);

	// If showing title, wrap in a container
	if (showTitle && levelTitle) {
		return (
			<div className="flex flex-col items-center gap-1">
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>{levelElement}</TooltipTrigger>
						<TooltipContent>
							<p>Level {level}</p>
							<p className="text-xs text-muted-foreground">{levelTitle}</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
				<span className={cn('text-muted-foreground', sizes.title)}>{levelTitle}</span>
			</div>
		);
	}

	// Return with tooltip
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>{levelElement}</TooltipTrigger>
				<TooltipContent>
					<p>Level {level}</p>
					{levelTitle && <p className="text-xs text-muted-foreground">{levelTitle}</p>}
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}

// Compact level badge variant
export function LevelBadge({
	level,
	rarity = 'common',
	className
}: {
	level: number;
	rarity?: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
	className?: string;
}) {
	const getRarityStyle = () => {
		switch (rarity) {
			case 'mythic':
				return 'bg-gradient-to-r from-red-600 to-orange-600 text-white border-red-500';
			case 'legendary':
				return 'bg-gradient-to-r from-amber-600 to-yellow-500 text-white border-amber-500';
			case 'epic':
				return 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-500';
			case 'rare':
				return 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-blue-500';
			default:
				return 'bg-gradient-to-r from-emerald-600 to-green-600 text-white border-emerald-500';
		}
	};

	return (
		<Badge className={cn('font-bold px-2 py-0.5 border', getRarityStyle(), className)}>
			<Sparkles className="w-3 h-3 mr-1" />
			Lvl {level}
		</Badge>
	);
}
