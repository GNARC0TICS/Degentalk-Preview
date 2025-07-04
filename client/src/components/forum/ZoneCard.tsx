import type { UserId } from '@shared/types';
import React, { memo } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import {
	Users,
	MessageSquare,
	TrendingUp,
	Zap,
	Activity,
	ArrowRight,
	Crown,
	Sparkles
} from 'lucide-react';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { CARD_STYLES } from '@/utils/card-constants';
import { useShowHotRibbon } from '@/hooks/useShowHotRibbon';
import { SafeImage } from '@/components/ui/safe-image';
import { animationConfig } from '@/config/animation.config';
import { getZoneTheme } from '@shared/config/zoneThemes.config';
import XpBoostBadge from './XpBoostBadge';

export interface ZoneCardProps {
	zone: {
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
			id: string;
			name: string;
			threadCount: number;
			isPopular?: boolean;
			subforums?: Array<{
				id: UserId;
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

// Generate CSS custom properties for zone theming using shared config
export const getZoneThemeVars = (colorTheme: string): React.CSSProperties => {
	const theme = getZoneTheme(colorTheme);

	// Convert Tailwind classes to CSS custom properties
	const accentColorMap: Record<string, string> = {
		'text-red-400': '#f87171',
		'text-blue-400': '#60a5fa',
		'text-purple-400': '#c084fc',
		'text-amber-400': '#fbbf24',
		'text-gray-400': '#9ca3af',
		'text-violet-400': '#a78bfa',
		'text-zinc-400': '#a1a1aa'
	};

	const accentColor = accentColorMap[theme.accent] || '#a1a1aa';

	return {
		'--zone-accent': accentColor,
		'--zone-gradient-from': `${accentColor}33`, // 20% opacity
		'--zone-gradient-to': `${accentColor}1a`, // 10% opacity
		'--zone-glow': `${accentColor}33`, // 20% opacity
		'--zone-border': `${accentColor}4d` // 30% opacity
	};
};

// -------- Pure component that expects the new { zone } prop --------
const ZoneCardPure = memo(
	({
		zone,
		layout = 'default',
		variant = 'default',
		showStats = true,
		slots,
		className,
		onEnter,
		onCtaClick
	}: ZoneCardProps) => {
		const derivedZone = zone;

		// Use consolidated theme configuration
		const theme = getZoneTheme(zone.colorTheme);
		const IconComponent = theme.icon;

		// Generate CSS variables for theming
		const themeVars = getZoneThemeVars(zone.colorTheme);

		// Map layout to CARD_STYLES height constants
		const getCardHeight = (layout: string) => {
			switch (layout) {
				case 'compact':
					// Use responsive min-heights so the card never clips on very small devices
					return 'min-h-[240px] sm:min-h-[260px] md:min-h-[280px]';
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
			return derivedZone.forums?.some((f) => f.isPopular);
		}, [derivedZone]);

		// Compute preview forums: prefer top-level, then subforums to fill to 3
		const previewForums = React.useMemo(() => {
			if (!derivedZone.forums) return [];
			const topLevel = derivedZone.forums.slice(0, 3);
			if (topLevel.length >= 3) return topLevel;
			const sub = derivedZone.forums.flatMap((f) => f.subforums ?? []);
			return [...topLevel, ...sub].slice(0, 3);
		}, [derivedZone.forums]);

		const handleEnter = () => {
			onEnter?.(zone.id);
		};

		const handleCtaClick = (e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();
			if (onCtaClick) {
				onCtaClick(zone.id);
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
				<Link href={`/forums`} aria-label={`Browse ${derivedZone.name} forums`}>
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

						{/* Background Image if available */}
						{zone.bannerImage && (
							<SafeImage
								src={zone.bannerImage}
								alt={`${zone.name} banner`}
								className="absolute inset-0 w-full h-full object-cover opacity-20 transition-opacity duration-500 group-hover:opacity-30"
							/>
						)}

						{/* Special Badges */}
						<div className="absolute top-3 right-3 flex gap-2 z-10">
							{zone.features?.isEventActive && (
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

							{zone.features?.isPremium && (
								<Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-2 py-1 text-xs font-bold">
									<Crown className="w-3 h-3 mr-1" />
									PREMIUM
								</Badge>
							)}
						</div>

						{/* XP Boost Badge */}
						{zone.features?.hasXpBoost && (
							<XpBoostBadge boostMultiplier={zone.features?.boostMultiplier ?? 1} />
						)}

						{/* HOT Ribbon */}
						{showHotRibbonFeature && hasHotForums && (
							<Link
								href={`/forums`}
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

						<CardHeader className="relative z-10 pb-3">
							{slots?.header ?? (
								<div className="flex items-center gap-3">
									<motion.div
										whileHover={{ scale: 1.1, rotate: 5 }}
										transition={{
											duration: animationConfig.durations.fast,
											ease: animationConfig.easings.standard
										}}
										className="w-12 h-12 rounded-full bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 flex items-center justify-center text-2xl"
										style={{ color: 'var(--zone-accent)' }}
									>
										{derivedZone.icon ? (
											<span>{derivedZone.icon}</span>
										) : (
											<IconComponent className="w-6 h-6" />
										)}
									</motion.div>

									<div className="flex-1 min-w-0">
										<h3 className="text-xl font-bold text-white mb-1 group-hover:text-[var(--zone-accent)] transition-colors">
											{derivedZone.name}
										</h3>
										<p className="text-sm text-zinc-400 line-clamp-1 leading-tight">
											{derivedZone.description}
										</p>
									</div>
								</div>
							)}
						</CardHeader>

						<CardContent className="relative z-10 space-y-3">
							{/* Activity Stats */}
							{showStats &&
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
											<div className="text-sm font-semibold text-white mt-0.5">
												{derivedZone.stats.activeUsers}
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
												<span className="text-xs">Forums</span>
											</div>
											<div className="text-sm font-semibold text-white mt-0.5">
												{derivedZone.forums?.length ?? 0}
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
												<span className="text-xs">Threads</span>
											</div>
											<div className="text-sm font-semibold text-white mt-0.5">
												{derivedZone.forums?.reduce((sum, f) => sum + (f.threadCount || 0), 0)}
											</div>
										</motion.div>
									</div>
								))}

							{/* Activity Momentum */}
							{zone.activity && (
								<div className="flex items-center justify-between text-sm">
									<div className="flex items-center gap-2">
										{zone.activity.momentum === 'rising' && (
											<div className="flex items-center gap-1 text-emerald-400">
												<TrendingUp className="w-4 h-4" />
												<span className="font-medium">Rising</span>
											</div>
										)}
										{zone.activity.trendingThreads > 0 && (
											<Badge variant="outline" className="text-xs">
												{zone.activity.trendingThreads} trending
											</Badge>
										)}
									</div>

									{zone.activity.lastActiveUser && (
										<div className="flex items-center gap-2">
											<Avatar className="h-6 w-6">
												<AvatarImage
													src={zone.activity.lastActiveUser.avatarUrl}
													alt={zone.activity.lastActiveUser.username}
												/>
												<AvatarFallback className="text-xs bg-zinc-700">
													{zone.activity.lastActiveUser.username.slice(0, 2).toUpperCase()}
												</AvatarFallback>
											</Avatar>
											<span className="text-xs text-zinc-400">
												{zone.activity.lastActiveUser.username}
											</span>
										</div>
									)}
								</div>
							)}

							{/* Forum Previews - Always Visible */}
							{derivedZone.forums &&
								derivedZone.forums.length > 0 &&
								(slots?.preview ?? (
									<div className="space-y-2">
										<div className="text-xs font-medium text-zinc-300 mb-2">Forums:</div>
										{previewForums.map((forumItem: any) => (
											<div
												key={forumItem.id}
												className="flex items-center justify-between p-2 rounded bg-zinc-800/40 hover:bg-zinc-800/60 transition-colors"
											>
												<span className="text-sm text-zinc-300 truncate">{forumItem.name}</span>
												<div className="flex items-center gap-1 text-xs text-zinc-500">
													<MessageSquare className="w-3 h-3" />
													<span>{forumItem.threadCount ?? 0}</span>
												</div>
											</div>
										))}
									</div>
								))}
						</CardContent>

						<CardFooter className="relative z-10 pt-2">
							{slots?.footer ?? (
								<Button
									className="w-full transition-all duration-300 bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 hover:border-[var(--zone-accent)] hover:shadow-lg text-[var(--zone-accent)]"
									style={
										{
											'--tw-shadow-color': 'var(--zone-glow)'
										} as React.CSSProperties
									}
									onClick={handleCtaClick}
									aria-label={`Enter zone ${derivedZone.name}`}
								>
									<span>Enter {derivedZone.name}</span>
									<ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
								</Button>
							)}
						</CardFooter>
					</Card>
				</Link>
			</motion.div>
		);
	}
);

ZoneCardPure.displayName = 'ZoneCard';

export default ZoneCardPure;
export { ZoneCardPure as ZoneCard };
