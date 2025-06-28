import React, { useState, memo } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
	Users,
	MessageSquare,
	TrendingUp,
	Zap,
	Activity,
	ArrowRight,
	Crown,
	Sparkles,
	Folder
} from 'lucide-react';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { CARD_STYLES } from '@/utils/card-constants';
import { featureFlags } from '@/config/featureFlags';
import { SafeImage } from '@/components/ui/SafeImage';
import { animationConfig } from '@/config/animation.config';

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
				id: string | number;
				name: string;
			}>;
		}>;
	};
	layout?: 'default' | 'compact' | 'hero' | 'mobile';
	variant?: 'default' | 'premium' | 'event' | 'minimal' | 'promo';
	showStats?: boolean;
	showPreview?: boolean;
	slots?: {
		header?: React.ReactNode;
		stats?: React.ReactNode;
		preview?: React.ReactNode;
		footer?: React.ReactNode;
	};
	className?: string;
	onEnter?: (zoneId: string) => void;
}

// Generate dynamic theme based on colorTheme
const getDynamicTheme = (colorTheme: string) => {
	// Map colorTheme to CSS classes and icon
	const themeMap: Record<
		string,
		{
			gradient: string;
			border: string;
			accent: string;
			glow: string;
			icon: typeof Folder;
			color: string;
		}
	> = {
		pit: {
			gradient: 'from-red-500/20 to-orange-500/20',
			border: 'border-red-500/30',
			accent: 'text-red-400',
			glow: 'shadow-red-500/20',
			icon: TrendingUp,
			color: '#ef4444'
		},
		mission: {
			gradient: 'from-blue-500/20 to-cyan-500/20',
			border: 'border-blue-500/30',
			accent: 'text-blue-400',
			glow: 'shadow-blue-500/20',
			icon: Activity,
			color: '#3b82f6'
		},
		casino: {
			gradient: 'from-purple-500/20 to-pink-500/20',
			border: 'border-purple-500/30',
			accent: 'text-purple-400',
			glow: 'shadow-purple-500/20',
			icon: Sparkles,
			color: '#8b5cf6'
		},
		briefing: {
			gradient: 'from-amber-500/20 to-yellow-500/20',
			border: 'border-amber-500/30',
			accent: 'text-amber-400',
			glow: 'shadow-amber-500/20',
			icon: MessageSquare,
			color: '#f59e0b'
		},
		archive: {
			gradient: 'from-gray-500/20 to-slate-500/20',
			border: 'border-gray-500/30',
			accent: 'text-gray-400',
			glow: 'shadow-gray-500/20',
			icon: Folder,
			color: '#6b7280'
		},
		shop: {
			gradient: 'from-emerald-500/20 to-green-500/20',
			border: 'border-emerald-500/30',
			accent: 'text-emerald-400',
			glow: 'shadow-emerald-500/20',
			icon: Crown,
			color: '#10b981'
		},
		// Default fallback
		default: {
			gradient: 'from-zinc-500/20 to-gray-500/20',
			border: 'border-zinc-500/30',
			accent: 'text-zinc-400',
			glow: 'shadow-zinc-500/20',
			icon: Folder,
			color: '#71717a'
		}
	};

	return themeMap[colorTheme] || themeMap.default;
};

// -------- Pure component that expects the new { zone } prop --------
const ZoneCardPure = memo(
	({
		zone,
		layout = 'default',
		variant = 'default',
		showStats = true,
		showPreview = true,
		slots,
		className,
		onEnter
	}: ZoneCardProps) => {
		const derivedZone = zone;

		const [isHovered, setIsHovered] = useState(false);

		// Use dynamic theme generation instead of static ZONE_THEMES
		const theme = getDynamicTheme(zone.colorTheme);
		const IconComponent = theme.icon;

		const cardSizes = {
			default: CARD_STYLES.height.large,
			compact: CARD_STYLES.height.standard,
			hero: CARD_STYLES.height.hero,
			mobile: CARD_STYLES.height.compact
		} as const;

		const showHotRibbonFeature = featureFlags?.forum?.showHotRibbon ?? true;
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

		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{
					duration: animationConfig.durations.enter,
					ease: animationConfig.easings.standard
				}}
				onHoverStart={() => setIsHovered(true)}
				onHoverEnd={() => setIsHovered(false)}
			>
				<Link href={`/zones/${derivedZone.slug}`} aria-label={`Enter zone ${derivedZone.name}`}>
					<Card
						className={cn(
							'group relative cursor-pointer overflow-hidden backdrop-blur-sm',
							CARD_STYLES.background.primary,
							CARD_STYLES.hover.combined,
							CARD_STYLES.radius.standard,
							CARD_STYLES.shadow.standard,
							theme.border,
							isHovered && `hover:shadow-2xl ${theme.glow}`,
							cardSizes[layout],
							variant === 'premium' && 'ring-2 ring-amber-500/30',
							variant === 'event' && 'ring-2 ring-emerald-500/30',
							className
						)}
					>
						{/* Animated Background Gradient */}
						<div
							className={cn(
								'absolute inset-0 bg-gradient-to-br opacity-60 transition-opacity duration-500',
								theme.gradient,
								isHovered && 'opacity-80'
							)}
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
							{zone.features?.hasXpBoost && (
								<motion.div
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									transition={{ delay: 0.2 }}
								>
									<Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-black px-2 py-1 text-xs font-bold">
										<Zap className="w-3 h-3 mr-1" />
										{zone.features.boostMultiplier}x XP
									</Badge>
								</motion.div>
							)}

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

						{/* HOT Ribbon */}
						{showHotRibbonFeature && hasHotForums && (
							<Link
								href={`/zones/${derivedZone.slug}?filter=popular`}
								className={cn(
									'absolute -left-6 top-3 -rotate-45 badge--primary text-[10px] font-bold px-8 py-1 shadow-lg z-20',
									theme.accent
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
										className={cn(
											'w-12 h-12 rounded-full bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50',
											'flex items-center justify-center text-2xl',
											theme.accent
										)}
									>
										{derivedZone.icon ? (
											<span>{derivedZone.icon}</span>
										) : (
											<IconComponent className="w-6 h-6" />
										)}
									</motion.div>

									<div className="flex-1 min-w-0">
										<h3
											className={cn(
												'text-xl font-bold text-white mb-1 group-hover:text-current transition-colors',
												theme.accent
											)}
										>
											{derivedZone.name}
										</h3>
										<p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed">
											{derivedZone.description}
										</p>
									</div>
								</div>
							)}
						</CardHeader>

						<CardContent className="relative z-10 space-y-4">
							{/* Activity Stats */}
							{showStats &&
								(slots?.stats ?? (
									<div className="grid grid-cols-3 gap-3">
										<motion.div
											className="text-center p-2 rounded-lg bg-zinc-800/30 backdrop-blur-sm"
											whileHover={{ scale: animationConfig.hoverScale }}
											transition={{
												duration: animationConfig.durations.fast,
												ease: animationConfig.easings.standard
											}}
										>
											<div className="flex items-center justify-center gap-1 text-xs text-zinc-400 mb-1">
												<Users className="w-3 h-3" />
												<span>Active</span>
											</div>
											<div className="text-lg font-bold text-white">
												{derivedZone.stats.activeUsers}
											</div>
										</motion.div>

										<motion.div
											className="text-center p-2 rounded-lg bg-zinc-800/30 backdrop-blur-sm"
											whileHover={{ scale: animationConfig.hoverScale }}
											transition={{
												duration: animationConfig.durations.fast,
												delay: animationConfig.stagger,
												ease: animationConfig.easings.standard
											}}
										>
											<div className="flex items-center justify-center gap-1 text-xs text-zinc-400 mb-1">
												<MessageSquare className="w-3 h-3" />
												<span>Forums</span>
											</div>
											<div className="text-lg font-bold text-white">
												{derivedZone.forums?.length ?? 0}
											</div>
										</motion.div>

										<motion.div
											className="text-center p-2 rounded-lg bg-zinc-800/30 backdrop-blur-sm"
											whileHover={{ scale: animationConfig.hoverScale }}
											transition={{
												duration: animationConfig.durations.fast,
												delay: animationConfig.stagger * 2,
												ease: animationConfig.easings.standard
											}}
										>
											<div className="flex items-center justify-center gap-1 text-xs text-zinc-400 mb-1">
												<Activity className="w-3 h-3" />
												<span>Threads</span>
											</div>
											<div className="text-lg font-bold text-white">
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

							{/* Forum Previews */}
							<AnimatePresence>
								{isHovered &&
									showPreview &&
									derivedZone.forums &&
									derivedZone.forums.length > 0 &&
									(slots?.preview ?? (
										<motion.div
											initial={{ opacity: 0, height: 0 }}
											animate={{ opacity: 1, height: 'auto' }}
											exit={{ opacity: 0, height: 0 }}
											transition={{ duration: animationConfig.durations.enter }}
											className="space-y-2 overflow-hidden"
										>
											<div className="text-xs font-medium text-zinc-300 mb-2">Forums:</div>
											{previewForums.map((forumItem: any, index: number) => (
												<motion.div
													key={forumItem.id}
													initial={{ opacity: 0, x: -20 }}
													animate={{ opacity: 1, x: 0 }}
													transition={{ delay: index * animationConfig.stagger }}
													className="flex items-center justify-between p-2 rounded bg-zinc-800/40 hover:bg-zinc-800/60 transition-colors"
												>
													<span className="text-sm text-zinc-300 truncate">{forumItem.name}</span>
													<div className="flex items-center gap-1 text-xs text-zinc-500">
														<MessageSquare className="w-3 h-3" />
														<span>{forumItem.threadCount ?? 0}</span>
													</div>
												</motion.div>
											))}
										</motion.div>
									))}
							</AnimatePresence>
						</CardContent>

						<CardFooter className="relative z-10 pt-2">
							{slots?.footer ?? (
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: isHovered ? 1 : 0 }}
									transition={{
										duration: animationConfig.durations.fast,
										ease: animationConfig.easings.standard
									}}
									className="w-full"
								>
									<Button
										className={cn(
											'w-full transition-all duration-300',
											'bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50',
											`hover:border-current hover:shadow-lg hover:${theme.glow}`,
											theme.accent
										)}
										onClick={(e) => {
											if (onEnter) {
												handleEnter();
											}
										}}
										aria-label={`Enter zone ${derivedZone.name}`}
									>
										<span>Enter {derivedZone.name}</span>
										<ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
									</Button>
								</motion.div>
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
