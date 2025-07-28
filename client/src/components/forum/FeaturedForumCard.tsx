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
	Target,
	Waves,
	Sun,
	Trees,
	Star,
	Snowflake,
	Moon
} from 'lucide-react';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/utils/utils';
import { CARD_STYLES } from '@/utils/card-constants';
import { useShowHotRibbon } from '@/hooks/useShowHotRibbon';
import { SafeImage } from '@/components/ui/safe-image';
import { animationConfig } from '@/config/animation.config';
import { getForumTheme } from '@shared/config/forumThemes.config';
// Theme is now applied via useTheme hook in RootLayout
import XpBoostBadge from './XpBoostBadge';

export interface FeaturedForumCardProps {
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
		activity?: {
			trendingThreads: number;
			momentum: 'rising' | 'stable' | 'declining';
			lastActiveUser?: {
				username: string;
				avatarUrl?: string;
				timestamp: string;
			};
		};
		forums?: Array<{
			id: ForumId;
			name: string;
			threadCount: number;
			isPopular?: boolean;
			subforums?: Array<{
				id: ForumId;
				name: string;
			}>;
		}>;
	};
	layout?: 'default' | 'compact' | 'hero' | 'mobile';
	variant?: 'default' | 'premium' | 'event' | 'minimal' | 'promo';
	showStats?: boolean;
	slots?: {
		header?: React.ReactNode;
		stats?: React.ReactNode;
		preview?: React.ReactNode;
		footer?: React.ReactNode;
	};
	className?: string;
	onEnter?: (zoneId: string) => void;
	onCtaClick?: (zoneId: string) => void;
}

// Generate CSS custom properties for forum theming using shared config
export const getForumThemeVars = (colorTheme: string): React.CSSProperties => {
	const theme = getForumTheme(colorTheme);
	return getForumThemeVarsFromTheme(theme);
};

// Generate CSS custom properties from a theme object
export const getForumThemeVarsFromTheme = (
	theme: ReturnType<typeof getForumTheme>
): React.CSSProperties => {
	// Convert Tailwind classes to CSS custom properties
	const accentColorMap: Record<string, string> = {
		'text-red-400': '#f87171',
		'text-blue-400': '#60a5fa',
		'text-purple-400': '#c084fc',
		'text-amber-400': '#fbbf24',
		'text-gray-400': '#9ca3af',
		'text-violet-400': '#a78bfa',
		'text-zinc-400': '#a1a1aa',
		'text-cyan-400': '#22d3ee',
		'text-orange-400': '#fb923c',
		'text-emerald-400': '#34d399',
		'text-indigo-400': '#818cf8',
		'text-orange-500': '#f97316',
		'text-sky-400': '#38bdf8',
		'text-pink-400': '#f472b6',
		'text-yellow-400': '#facc15',
		'text-purple-300': '#d8b4fe'
	};

	const accentColor = accentColorMap[theme.accent] || '#a1a1aa';

	return {
		'--zone-accent': accentColor,
		'--zone-gradient-from': `${accentColor}33`, // 20% opacity
		'--zone-gradient-to': `${accentColor}1a`, // 10% opacity
		'--zone-glow': `${accentColor}33`, // 20% opacity
		'--zone-border': `${accentColor}4d` // 30% opacity
	} as React.CSSProperties;
};

// -------- Pure component that expects the new { forum } prop --------
const FeaturedForumCardPure = memo(
	({
		forum,
		layout = 'default',
		variant = 'default',
		showStats = true,
		slots,
		className,
		onEnter,
		onCtaClick
	}: FeaturedForumCardProps) => {
		const derivedForum = forum;

		// Theme configuration is now handled by the theme system
		// Default theme values for forum cards
		const theme = {
			gradient: 'from-zinc-900/30 via-zinc-800/20 to-zinc-700/10',
			accent: 'text-zinc-400',
			border: 'border-zinc-500/30 hover:border-zinc-500/60',
			glow: 'shadow-zinc-500/20',
			icon: 'MessageSquare',
			glowIntensity: 'medium' as const,
			rarityOverlay: 'common' as const
		};

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
			ArrowRight,
			Waves,
			Sun,
			Trees,
			Star,
			Snowflake,
			Moon
		};

		const IconComponent = iconMap[theme.icon] || MessageSquare;

		// Generate CSS variables for theming
		const themeVars = getForumThemeVarsFromTheme(theme);

		// Map layout to CARD_STYLES height constants
		const getCardHeight = (layout: string) => {
			switch (layout) {
				case 'compact':
					// Banner-style height for carousel
					return 'min-h-[180px] max-h-[200px]';
				case 'hero':
					return CARD_STYLES.height.hero;
				case 'mobile':
					return CARD_STYLES.height.compact;
				default:
					return CARD_STYLES.height.large;
			}
		};

		const showHotRibbonFeature = useShowHotRibbon();
		const hasHotForums = React.useMemo(() => {
			return derivedForum.forums?.some((f) => f.isPopular);
		}, [derivedForum]);

		// Compute preview forums: prefer top-level, then subforums to fill to 3
		const previewForums = React.useMemo(() => {
			if (!derivedForum.forums) return [];
			const topLevel = derivedForum.forums.slice(0, 3);
			if (topLevel.length >= 3) return topLevel;
			const sub = derivedForum.forums.flatMap((f) => f.subforums ?? []);
			return [...topLevel, ...sub].slice(0, 3);
		}, [derivedForum.forums]);

		const handleEnter = () => {
			onEnter?.(forum.id);
		};

		const handleCtaClick = (e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();
			if (onCtaClick) {
				onCtaClick(forum.id);
			} else {
				handleEnter();
			}
		};

		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{
					duration: animationConfig.durations.enter,
					ease: animationConfig.easings.standard
				}}
			>
				<Link to={`/forums`} aria-label={`Browse ${derivedForum.name} forums`}>
					<Card
						style={themeVars}
						className={cn(
							'group relative cursor-pointer overflow-hidden backdrop-blur-sm',
							CARD_STYLES.background.primary,
							'hover:bg-zinc-800/40 hover:shadow-xl transition-all duration-300',
							CARD_STYLES.radius.standard,
							CARD_STYLES.shadow.standard,
							'border-[var(--zone-border)]',
							'hover:shadow-2xl',
							getCardHeight(layout),
							layout === 'compact' && 'flex flex-col',
							variant === 'premium' && 'ring-2 ring-amber-500/30',
							variant === 'event' && 'ring-2 ring-emerald-500/30',
							className
						)}
					>
						{/* Background Gradient */}
						<div
							className="absolute inset-0 opacity-60 group-hover:opacity-80 transition-opacity duration-500"
							style={{
								background: `linear-gradient(to bottom right, var(--zone-gradient-from), var(--zone-gradient-to))`
							}}
						/>

						{/* Fallback pattern when no banner image */}
						{!forum.bannerImage && (
							<div
								className="absolute inset-0 opacity-10"
								style={{
									backgroundImage: `radial-gradient(circle at 20% 80%, var(--zone-accent) 0%, transparent 50%),
													  radial-gradient(circle at 80% 20%, var(--zone-accent) 0%, transparent 50%),
													  radial-gradient(circle at 40% 40%, var(--zone-accent) 0%, transparent 50%)`,
									mixBlendMode: 'screen'
								}}
							/>
						)}

						{/* Background Image if available */}
						{forum.bannerImage && (
							<SafeImage
								src={forum.bannerImage}
								alt={`${forum.name} banner`}
								className="absolute inset-0 w-full h-full object-cover opacity-20 transition-opacity duration-500 group-hover:opacity-30"
							/>
						)}

						{/* Special Badges */}
						<div className="absolute top-3 right-3 flex gap-2 z-10">
							{forum.features?.isEventActive && (
								<motion.div
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									transition={{ delay: 0.3 }}
								>
									<Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 text-xs font-bold animate-pulse">
										<Sparkles className="w-3 h-3 mr-1" />
										EVENT
									</Badge>
								</motion.div>
							)}

							{forum.features?.isPremium && (
								<Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-2 py-1 text-xs font-bold">
									<Crown className="w-3 h-3 mr-1" />
									PREMIUM
								</Badge>
							)}
						</div>

						{/* XP Boost Badge */}
						{forum.features?.hasXpBoost && (
							<XpBoostBadge boostMultiplier={forum.features?.boostMultiplier ?? 1} />
						)}

						{/* HOT Ribbon */}
						{showHotRibbonFeature && hasHotForums && (
							<Link
								to={`/forums`}
								className={cn(
									'absolute -left-6 top-3 -rotate-45 badge--primary text-[10px] font-bold px-8 py-1 shadow-lg z-20',
									'text-[var(--zone-accent)]'
								)}
								onClick={(e) => {
									e.stopPropagation();
									e.preventDefault();
								}}
							>
								HOT
							</Link>
						)}

						<CardHeader
							className={cn('relative z-10', layout === 'compact' ? 'pb-2 pt-3' : 'pb-3')}
						>
							{slots?.header ?? (
								<div className="flex items-center gap-3">
									<motion.div
										whileHover={{ scale: 1.1, rotate: 5 }}
										transition={{
											duration: animationConfig.durations.fast,
											ease: animationConfig.easings.standard
										}}
										className={cn(
											'rounded-full bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 flex items-center justify-center',
											layout === 'compact' ? 'w-10 h-10' : 'w-12 h-12'
										)}
										style={{ color: 'var(--zone-accent)' }}
									>
										{derivedForum.icon ? (
											<span className={layout === 'compact' ? 'text-xl' : 'text-2xl'}>
												{derivedForum.icon}
											</span>
										) : (
											<IconComponent className={layout === 'compact' ? 'w-5 h-5' : 'w-6 h-6'} />
										)}
									</motion.div>

									<div className="flex-1 min-w-0">
										<h3
											className={cn(
												'font-bold text-white group-hover:text-[var(--zone-accent)] transition-colors',
												layout === 'compact' ? 'text-sm mb-0.5' : 'text-base mb-1'
											)}
										>
											{derivedForum.name}
										</h3>
										<p
											className={cn(
												'text-zinc-400 line-clamp-1 leading-tight',
												'text-xs'
											)}
										>
											{derivedForum.description}
										</p>
									</div>
								</div>
							)}
						</CardHeader>

						<CardContent
							className={cn('relative z-10', layout === 'compact' ? 'space-y-2 py-2' : 'space-y-3')}
						>
							{/* Activity Stats */}
							{showStats &&
								layout !== 'compact' &&
								(slots?.stats ?? (
									<div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
										<motion.div
											className="text-center px-2 py-1 rounded bg-zinc-800/30 backdrop-blur-sm"
											whileHover={{ scale: animationConfig.hoverScale }}
											transition={{
												duration: animationConfig.durations.fast,
												ease: animationConfig.easings.standard
											}}
										>
											<div className="flex items-center justify-center gap-1 text-xs text-zinc-500">
												<Users className="w-2.5 h-2.5" />
												<span className="text-xs">Active</span>
											</div>
											<div className="text-xs font-semibold text-white mt-0.5">
												{derivedForum.stats.activeUsers}
											</div>
										</motion.div>

										<motion.div
											className="text-center px-2 py-1 rounded bg-zinc-800/30 backdrop-blur-sm"
											whileHover={{ scale: animationConfig.hoverScale }}
											transition={{
												duration: animationConfig.durations.fast,
												delay: animationConfig.stagger,
												ease: animationConfig.easings.standard
											}}
										>
											<div className="flex items-center justify-center gap-1 text-xs text-zinc-500">
												<MessageSquare className="w-2.5 h-2.5" />
												<span className="text-xs">Subforums</span>
											</div>
											<div className="text-xs font-semibold text-white mt-0.5">
												{derivedForum.forums?.length ?? 0}
											</div>
										</motion.div>

										<motion.div
											className="text-center px-2 py-1 rounded bg-zinc-800/30 backdrop-blur-sm"
											whileHover={{ scale: animationConfig.hoverScale }}
											transition={{
												duration: animationConfig.durations.fast,
												delay: animationConfig.stagger * 2,
												ease: animationConfig.easings.standard
											}}
										>
											<div className="flex items-center justify-center gap-1 text-xs text-zinc-500">
												<Activity className="w-2.5 h-2.5" />
												<span className="text-xs">Posts</span>
											</div>
											<div className="text-xs font-semibold text-white mt-0.5">
												{derivedForum.forums?.reduce((sum, f) => sum + (f.threadCount || 0), 0)}
											</div>
										</motion.div>
									</div>
								))}

							{/* Activity Momentum */}
							{forum.activity && (
								<div className="flex items-center justify-between text-xs">
									<div className="flex items-center gap-2">
										{forum.activity.momentum === 'rising' && (
											<div className="flex items-center gap-1 text-emerald-400">
												<TrendingUp className="w-4 h-4" />
												<span className="font-medium">Rising</span>
											</div>
										)}
										{forum.activity.trendingThreads > 0 && (
											<Badge variant="outline" className="text-xs">
												{forum.activity.trendingThreads} trending
											</Badge>
										)}
									</div>

									{forum.activity.lastActiveUser && (
										<div className="flex items-center gap-2">
											<Avatar className="h-6 w-6">
												<AvatarImage
													src={forum.activity.lastActiveUser.avatarUrl}
													alt={forum.activity.lastActiveUser.username}
												/>
												<AvatarFallback className="text-xs bg-zinc-700">
													{forum.activity.lastActiveUser.username.slice(0, 2).toUpperCase()}
												</AvatarFallback>
											</Avatar>
											<span className="text-xs text-zinc-400">
												{forum.activity.lastActiveUser.username}
											</span>
										</div>
									)}
								</div>
							)}

							{/* Forum Previews - Always Visible */}
							{derivedForum.forums &&
								derivedForum.forums.length > 0 &&
								(slots?.preview ??
									(layout === 'compact' ? (
										<div className="flex flex-wrap gap-2">
											{previewForums.map(
												(forumItem: { id: ForumId; name: string; threadCount?: number }) => (
													<div
														key={forumItem.id}
														className="flex items-center gap-1 px-2 py-1 rounded-full bg-zinc-800/40 hover:bg-zinc-800/60 transition-colors text-xs"
													>
														<span className="text-zinc-300">{forumItem.name}</span>
														<span className="text-zinc-500">({forumItem.threadCount ?? 0})</span>
													</div>
												)
											)}
										</div>
									) : (
										<div className="space-y-2">
											<div className="text-xs font-medium text-zinc-300 mb-2">Subforums:</div>
											{previewForums.map(
												(forumItem: { id: ForumId; name: string; threadCount?: number }) => (
													<div
														key={forumItem.id}
														className="flex items-center justify-between p-2 rounded bg-zinc-800/40 hover:bg-zinc-800/60 transition-colors"
													>
														<span className="text-xs text-zinc-300 truncate">{forumItem.name}</span>
														<div className="flex items-center gap-1 text-xs text-zinc-500">
															<MessageSquare className="w-3 h-3" />
															<span>{forumItem.threadCount ?? 0}</span>
														</div>
													</div>
												)
											)}
										</div>
									)))}
						</CardContent>

						<CardFooter
							className={cn('relative z-10', layout === 'compact' ? 'pt-1 pb-2' : 'pt-2')}
						>
							{slots?.footer ?? (
								<Button
									size={layout === 'compact' ? 'sm' : 'default'}
									className={cn(
										'w-full transition-all duration-300 bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 hover:border-[var(--zone-accent)] hover:shadow-lg text-[var(--zone-accent)]',
										layout === 'compact' && 'h-8 text-sm'
									)}
									style={
										{
											'--tw-shadow-color': 'var(--zone-glow)'
										} as React.CSSProperties
									}
									onClick={handleCtaClick}
									aria-label={`Enter forum ${derivedForum.name}`}
								>
									<span>Enter {derivedForum.name}</span>
									<ArrowRight
										className={cn(
											'ml-2 group-hover:translate-x-1 transition-transform',
											layout === 'compact' ? 'w-3 h-3' : 'w-4 h-4'
										)}
									/>
								</Button>
							)}
						</CardFooter>
					</Card>
				</Link>
			</motion.div>
		);
	}
);

FeaturedForumCardPure.displayName = 'FeaturedForumCard';

export default FeaturedForumCardPure;
export { FeaturedForumCardPure as FeaturedForumCard };
