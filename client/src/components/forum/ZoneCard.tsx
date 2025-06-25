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
	Target,
	Flame
} from 'lucide-react';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useForumStructure } from '@/contexts/ForumStructureContext';
import { getCardStyle, CARD_STYLES } from '@/utils/card-constants';

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
		}>;
	};
	layout?: 'default' | 'compact' | 'hero' | 'mobile';
	variant?: 'default' | 'premium' | 'event';
	showStats?: boolean;
	showPreview?: boolean;
	className?: string;
	onEnter?: (zoneId: string) => void;
}

// -------- Pure component that expects the new { zone } prop --------
const ZoneCardPure = memo(
	({
		zone,
		layout = 'default',
		variant = 'default',
		showStats = true,
		showPreview = true,
		className,
		onEnter
	}: ZoneCardProps) => {
		const { getZone } = useForumStructure();
		const derivedZone = React.useMemo(() => {
			if (zone && zone.forums && zone.forums.length > 0) return zone;
			const z = getZone(zone.slug);
			if (!z) return zone;
			return {
				...zone,
				forums: z.forums.map((f) => ({
					id: String(f.id),
					name: f.name,
					threadCount: f.threadCount,
					isPopular: f.threadCount > 100
				}))
			};
		}, [zone, getZone]);

		const [isHovered, setIsHovered] = useState(false);

		const zoneThemes = {
			pit: {
				gradient: 'from-red-900/40 via-red-800/20 to-red-700/10',
				accent: 'text-red-400',
				border: 'border-red-500/30 hover:border-red-500/60',
				glow: 'shadow-red-500/20',
				icon: Flame
			},
			mission: {
				gradient: 'from-blue-900/40 via-blue-800/20 to-blue-700/10',
				accent: 'text-blue-400',
				border: 'border-blue-500/30 hover:border-blue-500/60',
				glow: 'shadow-blue-500/20',
				icon: Target
			},
			casino: {
				gradient: 'from-purple-900/40 via-purple-800/20 to-purple-700/10',
				accent: 'text-purple-400',
				border: 'border-purple-500/30 hover:border-purple-500/60',
				glow: 'shadow-purple-500/20',
				icon: Sparkles
			},
			briefing: {
				gradient: 'from-amber-900/40 via-amber-800/20 to-amber-700/10',
				accent: 'text-amber-400',
				border: 'border-amber-500/30 hover:border-amber-500/60',
				glow: 'shadow-amber-500/20',
				icon: MessageSquare
			},
			archive: {
				gradient: 'from-gray-900/40 via-gray-800/20 to-gray-700/10',
				accent: 'text-gray-400',
				border: 'border-gray-500/30 hover:border-gray-500/60',
				glow: 'shadow-gray-500/20',
				icon: MessageSquare
			},
			shop: {
				gradient: 'from-violet-900/30 via-pink-900/20 to-blue-900/30',
				accent: 'text-violet-400',
				border: 'border-violet-500/30 hover:border-violet-500/60',
				glow: 'shadow-violet-500/20',
				icon: Crown
			}
		} as const;

		const theme = zoneThemes[zone.colorTheme as keyof typeof zoneThemes] || zoneThemes.archive;
		const IconComponent = theme.icon;

		const cardSizes = {
			default: CARD_STYLES.height.large,
			compact: CARD_STYLES.height.standard,
			hero: CARD_STYLES.height.hero,
			mobile: CARD_STYLES.height.compact
		} as const;

		const handleEnter = () => {
			onEnter?.(zone.id);
		};

		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
				onHoverStart={() => setIsHovered(true)}
				onHoverEnd={() => setIsHovered(false)}
			>
				<Link href={`/zones/${derivedZone.slug}`}>
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
							<div
								className="absolute inset-0 bg-cover bg-center opacity-20 transition-opacity duration-500 group-hover:opacity-30"
								style={{ backgroundImage: `url(${zone.bannerImage})` }}
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

						<CardHeader className="relative z-10 pb-3">
							<div className="flex items-center gap-3">
								<motion.div
									whileHover={{ scale: 1.1, rotate: 5 }}
									transition={{ duration: 0.2 }}
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
						</CardHeader>

						<CardContent className="relative z-10 space-y-4">
							{/* Activity Stats */}
							{showStats && (
								<div className="grid grid-cols-3 gap-3">
									<motion.div
										className="text-center p-2 rounded-lg bg-zinc-800/30 backdrop-blur-sm"
										whileHover={{ scale: 1.05 }}
										transition={{ duration: 0.2 }}
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
										whileHover={{ scale: 1.05 }}
										transition={{ duration: 0.2, delay: 0.1 }}
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
										whileHover={{ scale: 1.05 }}
										transition={{ duration: 0.2, delay: 0.2 }}
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
							)}

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
												<AvatarImage src={zone.activity.lastActiveUser.avatarUrl} />
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
									derivedZone.forums.length > 0 && (
										<motion.div
											initial={{ opacity: 0, height: 0 }}
											animate={{ opacity: 1, height: 'auto' }}
											exit={{ opacity: 0, height: 0 }}
											transition={{ duration: 0.3 }}
											className="space-y-2 overflow-hidden"
										>
											<div className="text-xs font-medium text-zinc-300 mb-2">Popular Forums:</div>
											{derivedZone.forums.slice(0, 3).map((forum, index) => (
												<motion.div
													key={forum.id}
													initial={{ opacity: 0, x: -20 }}
													animate={{ opacity: 1, x: 0 }}
													transition={{ delay: index * 0.1 }}
													className="flex items-center justify-between p-2 rounded bg-zinc-800/40 hover:bg-zinc-800/60 transition-colors"
												>
													<span className="text-sm text-zinc-300 truncate">{forum.name}</span>
													<div className="flex items-center gap-1 text-xs text-zinc-500">
														<MessageSquare className="w-3 h-3" />
														<span>{forum.threadCount}</span>
													</div>
												</motion.div>
											))}
										</motion.div>
									)}
							</AnimatePresence>
						</CardContent>

						<CardFooter className="relative z-10 pt-2">
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: isHovered ? 1 : 0 }}
								transition={{ duration: 0.2 }}
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
								>
									<span>Enter {derivedZone.name}</span>
									<ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
								</Button>
							</motion.div>
						</CardFooter>
					</Card>
				</Link>
			</motion.div>
		);
	}
);

// ---------------- Legacy compatibility wrapper -------------------
function isLegacyProps(props: any): boolean {
	return !('zone' in props);
}

const ZoneCardCompat = memo((props: any) => {
	if (!isLegacyProps(props)) {
		// Already in new format
		return <ZoneCardPure {...props} />;
	}

	// Build zone object from legacy flat props
	const {
		id,
		name,
		slug,
		description,
		icon,
		colorTheme = 'archive',
		themeColor,
		forumCount,
		threadCount = 0,
		postCount = 0,
		activeUsersCount = 0,
		lastActivityAt,
		lastActivityUser,
		forums = [],
		hasXpBoost = false,
		boostMultiplier = 1,
		isEventActive = false,
		eventData,
		rarity = 'common',
		className = '',
		onClick,
		layout = 'vertical',
		showForumPreviews = false,
		...rest
	} = props;

	const zoneObj = {
		id: String(id),
		name,
		slug,
		description,
		icon,
		colorTheme,
		bannerImage: undefined,
		stats: {
			activeUsers: activeUsersCount,
			totalThreads: threadCount,
			totalPosts: postCount,
			todaysPosts: 0
		},
		features: {
			hasXpBoost,
			boostMultiplier,
			isEventActive,
			isPremium: rarity !== 'common'
		},
		activity: lastActivityAt
			? {
					trendingThreads: 0,
					momentum: 'stable' as const,
					lastActiveUser: lastActivityUser
						? {
								username: lastActivityUser.username,
								avatarUrl: lastActivityUser.activeAvatarUrl || lastActivityUser.avatarUrl,
								timestamp: lastActivityAt.toISOString()
							}
						: undefined
				}
			: undefined,
		forums: forums?.map((f: any) => ({
			id: String(f.id),
			name: f.name,
			threadCount: f.threadCount,
			isPopular: f.threadCount > 100
		}))
	};

	const enhancedLayout = layout === 'horizontal' ? 'compact' : 'default';
	let variant: 'default' | 'premium' | 'event' = 'default';
	if (isEventActive) variant = 'event';
	else if (rarity !== 'common') variant = 'premium';

	const handleEnter = () => {
		onClick?.();
	};

	return (
		<ZoneCardPure
			zone={zoneObj}
			layout={enhancedLayout}
			variant={variant}
			showStats={true}
			showPreview={showForumPreviews}
			className={className}
			onEnter={handleEnter}
			{...rest}
		/>
	);
});

ZoneCardPure.displayName = 'ZoneCardPure';
ZoneCardCompat.displayName = 'ZoneCard';

export default ZoneCardCompat;
export { ZoneCardCompat as ZoneCard, ZoneCardPure };
