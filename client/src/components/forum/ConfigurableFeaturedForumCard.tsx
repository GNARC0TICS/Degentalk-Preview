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
			'bg-zinc-900/50 backdrop-blur-sm',
			'hover:scale-[1.02] hover:bg-zinc-900/80',

			// Configurable styling
			cards.borderRadius,
			cards.shadow,
			cards.borderStyle,

			// Variant-specific classes
			{
				'hover:shadow-lg hover:shadow-[var(--forum-glow)]': variant === 'elevated',
				'border-2 border-[var(--forum-border)]': variant === 'bordered',
				'shadow-none border-none': variant === 'flat'
			},

			// Layout-specific height
			{
				'min-h-[200px]': layout === 'default',
				'min-h-[150px]': layout === 'compact',
				'min-h-[250px]': layout === 'detailed',
				'aspect-square': layout === 'grid'
			},

			className
		);

		const handleEnterForum = () => {
			onEnter?.(forum.id);
		};

		const HandleCtaClick = (e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();
			onCtaClick?.(forum.id);
		};

		return (
			<motion.div
				layout
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -20 }}
				transition={animationConfig.card}
				style={themeVars as React.CSSProperties}
				className="relative"
			>
				<Link to={`/forum/${forum.slug}`}>
					<Card className={cardClasses}>
						{/* Background Banner */}
						{showBanner && (
							<div className="absolute inset-0 overflow-hidden">
								<SafeImage
									src={forum.bannerImage!}
									alt={`${forum.name} banner`}
									className="absolute inset-0 w-full h-full object-cover opacity-20 transition-opacity group-hover:opacity-30"
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent" />
							</div>
						)}

						{/* Hot/Trending Ribbon */}
						{forum.trending?.isHot && (
							<div className="absolute top-2 right-2 z-10">
								<Badge variant="destructive" className="bg-red-500/90 text-white animate-pulse">
									🔥 HOT
								</Badge>
							</div>
						)}

						{/* XP Boost Badge */}
						{forum.features?.hasXpBoost && (
							<div className="absolute top-2 left-2 z-10">
								<XpBoostBadge boostMultiplier={forum.features.boostMultiplier} />
							</div>
						)}

						<CardHeader className={cardPadding}>
							{slots?.header}

							<div className="flex items-start justify-between relative z-10">
								<div className="flex items-center gap-3">
									<div className="p-2 rounded-lg bg-[var(--forum-accent)]/20 border border-[var(--forum-border)]">
										<IconComponent className="h-5 w-5 text-[var(--forum-accent)]" />
									</div>

									<div>
										<h3 className="font-semibold text-lg group-hover:text-[var(--forum-accent)] transition-colors">
											{forum.name}
										</h3>
										<p className="text-sm text-zinc-400 line-clamp-2">{forum.description}</p>
									</div>
								</div>

								{forum.features?.isPremium && <Crown className="h-5 w-5 text-yellow-500" />}
							</div>
						</CardHeader>

						{showStats && (
							<CardContent className={cn('pt-0', cardPadding)}>
								<div className="grid grid-cols-2 gap-4 text-sm relative z-10">
									<div className="flex items-center gap-2">
										<Users className="h-4 w-4 text-zinc-400" />
										<span className="text-zinc-300">{forum.stats.activeUsers} active</span>
									</div>

									<div className="flex items-center gap-2">
										<MessageSquare className="h-4 w-4 text-zinc-400" />
										<span className="text-zinc-300">{forum.stats.totalThreads} threads</span>
									</div>

									<div className="flex items-center gap-2">
										<Activity className="h-4 w-4 text-zinc-400" />
										<span className="text-zinc-300">{forum.stats.totalPosts} posts</span>
									</div>

									<div className="flex items-center gap-2">
										<TrendingUp className="h-4 w-4 text-emerald-400" />
										<span className="text-emerald-400">+{forum.stats.todaysPosts} today</span>
									</div>
								</div>
							</CardContent>
						)}

						<CardFooter className={cn('pt-4', cardPadding)}>
							{slots?.actions || (
								<div className="flex items-center justify-between w-full relative z-10">
									<Button
										variant="ghost"
										size="sm"
										onClick={handleEnterForum}
										className="text-[var(--forum-accent)] hover:bg-[var(--forum-accent)]/10"
									>
										Enter Forum
										<ArrowRight className="h-4 w-4 ml-2" />
									</Button>

									{forum.trending?.rank && (
										<Badge variant="secondary" className="text-xs">
											#{forum.trending.rank} trending
										</Badge>
									)}
								</div>
							)}

							{slots?.footer}
						</CardFooter>
					</Card>
				</Link>
			</motion.div>
		);
	}
);

ConfigurableFeaturedForumCard.displayName = 'ConfigurableFeaturedForumCard';

export { ConfigurableFeaturedForumCard };
