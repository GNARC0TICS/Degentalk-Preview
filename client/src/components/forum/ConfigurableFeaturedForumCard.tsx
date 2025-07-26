import type { UserId, ForumId } from '@shared/types/ids';
import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
	Users,
	MessageSquare,
	TrendingUp,
	Zap,
	Activity,
	ArrowRight,
	Crown,
	Sparkles,
	Flame,
	Target
} from 'lucide-react';

import { Card, CardContent, CardFooter, CardHeader } from '@app/components/ui/card';
import { Badge } from '@app/components/ui/badge';
import { Button } from '@app/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@app/components/ui/avatar';
import { cn } from '@app/utils/utils';
import { useUIConfig, buildResponsiveClasses } from '@app/contexts/UIConfigContext';
import { SafeImage } from '@app/components/ui/safe-image';
import { animationConfig } from '@app/config/animation.config';
import { getForumTheme } from '@shared/config/forumThemes.config';
import XpBoostBadge from './XpBoostBadge';

export interface ConfigurableFeaturedForumCardProps {
	forum: {
		id: string;
		name: string;
		slug: string;
		description: string;
		icon?: string;
		colorTheme: string;
		bannerImage?: string;
		stats: {
			activeUsers: number;
			totalThreads: number;
			totalPosts: number;
			todaysPosts: number;
		};
		features?: {
			hasXpBoost?: boolean;
			boostMultiplier?: number;
			isEventActive?: boolean;
			isPremium?: boolean;
		};
		/** Admin-defined custom forum properties */
		customization?: {
			primaryIcon?: string;
			secondaryIcon?: string;
			headerText?: string;
			subText?: string;
			ctaText?: string;
			backgroundColor?: string;
			foregroundColor?: string;
			accentColor?: string;
		};
		/** Hot/trending indicator */
		trending?: {
			isHot?: boolean;
			rank?: number;
			label?: string;
		};
	};
	layout?: 'default' | 'compact' | 'detailed' | 'grid';
	variant?: 'default' | 'elevated' | 'flat' | 'bordered';
	showStats?: boolean;
	slots?: {
		header?: React.ReactNode;
		footer?: React.ReactNode;
		actions?: React.ReactNode;
	};
	className?: string;
	onEnter?: (forumId: string) => void;
	onCtaClick?: (forumId: string) => void;
}

// Helper function to get accent color mapping
const accentColorMap: Record<string, string> = {
	blue: '#3b82f6',
	green: '#10b981',
	purple: '#8b5cf6',
	orange: '#f97316',
	red: '#ef4444',
	pink: '#ec4899',
	cyan: '#06b6d4',
	yellow: '#eab308',
	emerald: '#059669',
	indigo: '#6366f1',
	neutral: '#6b7280'
};

const getForumThemeVars = (colorTheme: string) => {
	const theme = getForumTheme(colorTheme);
	const accentColor = accentColorMap[theme.accent] || '#a1a1aa';

	return {
		'--forum-accent': accentColor,
		'--forum-gradient-from': `${accentColor}33`,
		'--forum-gradient-to': `${accentColor}1a`,
		'--forum-glow': `${accentColor}33`,
		'--forum-border': `${accentColor}4d`
	};
};

// Configurable Forum Card Component
const ConfigurableFeaturedForumCard = memo(
	({
		forum,
		layout = 'default',
		variant = 'default',
		showStats = true,
		slots,
		className,
		onEnter,
		onCtaClick
	}: ConfigurableFeaturedForumCardProps) => {
		// Get UI configuration
		const { components, spacing } = useUIConfig();
		const { cards } = components;

		// Use consolidated theme configuration
		const theme = getForumTheme(forum.colorTheme);

		// Map string icon names to React components
		const iconMap: Record<string, React.ComponentType<any>> = {
			Flame,
			Target,
			Sparkles,
			MessageSquare,
			Crown,
			Activity,
			TrendingUp,
			Zap,
			Users,
			ArrowRight
		};

		const IconComponent = iconMap[theme.icon] || MessageSquare;

		// Generate CSS variables for theming
		const themeVars = getForumThemeVars(forum.colorTheme);

		// Build configurable classes
		const cardPadding = buildResponsiveClasses(
			cards.variant === 'compact' ? spacing.cardCompact : spacing.card
		);

		// Determine if banner should be shown based on config
		const showBanner = cards.showBanner && forum.bannerImage;

		// Build card classes from configuration
		const cardClasses = cn(
			// Base styling
			'group relative overflow-hidden transition-all duration-300',
			'bg-zinc-900/90',
			'hover:bg-zinc-900',
			
			// Enhanced hover state for clickability
			'cursor-pointer',
			'hover:transform hover:translate-y-[-2px]',

			// Configurable styling
			cards.borderRadius,
			cards.shadow,

			// Variant-specific classes
			{
				'hover:shadow-lg': variant === 'elevated',
				'shadow-none': variant === 'flat'
			},

			// 72:32 aspect ratio (9:4) for banner style
			'aspect-[9/4]',

			className
		);

		return (
			<motion.div
				layout
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -20 }}
				transition={animationConfig.card}
				style={themeVars as React.CSSProperties}
				className="relative p-2"
			>
				<Link to={`/forum/${forum.slug}`} className="block">
					<Card className={cardClasses}>
						{/* Border overlay to fix rendering issues */}
						<div className={cn(
							"absolute inset-0 pointer-events-none z-20 transition-all duration-300",
							cards.borderRadius,
							{
								"ring-1 ring-inset ring-zinc-700/50 group-hover:ring-zinc-400/60": variant === 'default',
								"ring-2 ring-inset ring-[var(--forum-border)] group-hover:ring-zinc-300/50": variant === 'bordered'
							}
						)} />
						
						{/* Background Banner */}
						{showBanner && (
							<div className="absolute inset-0 overflow-hidden">
								<SafeImage
									src={forum.bannerImage!}
									alt={`${forum.name} banner`}
									className="absolute inset-0 w-full h-full object-cover"
								/>
								{/* Gradient overlay for text readability */}
								<div className="absolute inset-0 bg-gradient-to-b from-zinc-900/80 via-transparent to-zinc-900/80" />
								<div className="absolute inset-0 bg-gradient-to-r from-zinc-900/60 via-transparent to-zinc-900/60" />
							</div>
						)}

						{/* Grid-based layout with zones */}
						<div className="relative h-full grid grid-cols-3 grid-rows-3 gap-2 p-4">
							{/* Top Left Zone - XP Boost Badge */}
							<div className="col-start-1 row-start-1 flex items-start justify-start">
								{forum.features?.hasXpBoost && (
									<XpBoostBadge boostMultiplier={forum.features.boostMultiplier} />
								)}
							</div>

							{/* Top Center Zone - Reserved for artwork title */}
							<div className="col-start-2 row-start-1" />

							{/* Top Right Zone - Hot/Trending & Premium */}
							<div className="col-start-3 row-start-1 flex items-start justify-end gap-2">
								{forum.trending?.isHot && (
									<Badge variant="destructive" className="bg-red-500/90 text-white animate-pulse">
										🔥 HOT
									</Badge>
								)}
								{forum.features?.isPremium && (
									<Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50">
										<Crown className="h-3.5 w-3.5 mr-1" />
										Premium
									</Badge>
								)}
							</div>

							{/* Middle Left Zone - Empty */}
							<div className="col-start-1 row-start-2" />

							{/* Middle Center Zone - Reserved for artwork CTA */}
							<div className="col-start-2 row-start-2" />

							{/* Middle Right Zone - Empty for balance */}
							<div className="col-start-3 row-start-2" />

							{/* Bottom Left Zone - Icon, Forum Name and Stats */}
							<div className="col-start-1 row-start-3 flex items-end">
								<div className="bg-zinc-900/80 backdrop-blur-sm rounded-lg p-3 max-w-[200px]">
									<div className="p-1.5 rounded-md bg-[var(--forum-accent)]/20 border border-[var(--forum-border)] inline-flex mb-2">
										<IconComponent className="h-4 w-4 text-[var(--forum-accent)]" />
									</div>
									<h3 className="font-semibold text-white text-base mb-2">
										{forum.name}
									</h3>
									{showStats && (
										<div className="flex flex-col gap-1 text-xs">
											<div className="flex items-center gap-1.5">
												<Users className="h-3 w-3 text-zinc-400" />
												<span className="text-zinc-300">{forum.stats.activeUsers} active</span>
											</div>
											<div className="flex items-center gap-1.5">
												<MessageSquare className="h-3 w-3 text-zinc-400" />
												<span className="text-zinc-300">{forum.stats.totalThreads} threads</span>
											</div>
										</div>
									)}
								</div>
							</div>

							{/* Bottom Center Zone - Reserved */}
							<div className="col-start-2 row-start-3" />

							{/* Bottom Right Zone - Additional Stats */}
							<div className="col-start-3 row-start-3 flex items-end justify-end gap-2">
								{showStats && forum.stats.todaysPosts > 0 && (
									<Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50 text-xs">
										<TrendingUp className="h-3 w-3 mr-1" />
										+{forum.stats.todaysPosts} today
									</Badge>
								)}
								{forum.trending?.rank && (
									<Badge variant="secondary" className="text-xs">
										#{forum.trending.rank} trending
									</Badge>
								)}
								{/* Subtle hover indicator */}
								<div className="opacity-0 group-hover:opacity-100 transition-opacity">
									<ArrowRight className="h-4 w-4 text-zinc-400" />
								</div>
							</div>
						</div>
					</Card>
				</Link>
			</motion.div>
		);
	}
);

ConfigurableFeaturedForumCard.displayName = 'ConfigurableFeaturedForumCard';

export { ConfigurableFeaturedForumCard };
