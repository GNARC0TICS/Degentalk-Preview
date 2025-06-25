import React from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingCard } from '@/components/common/LoadingCard';
import { StandardErrorDisplay } from '@/components/common/StandardErrorDisplay';
import { StatsBar, type StatItem } from '@/components/common/StatsBar';
import { AvatarFrame } from '@/components/identity/AvatarFrame';
import { UserName } from '@/components/users/Username';
import { LevelBadge } from '@/components/economy/xp/LevelBadge';
import { useIdentityDisplay } from '@/hooks/useIdentityDisplay';
import { brandConfig } from '@/config/brand.config';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import {
	MessageSquare,
	Calendar,
	Award,
	Shield,
	Users,
	TrendingUp,
	Eye,
	Crown
} from 'lucide-react';
import type { ProfileData } from '@/types/profile';

interface UnifiedProfileCardProps {
	username: string;
	variant?: 'compact' | 'full' | 'sidebar' | 'mini';
	className?: string;
	showStats?: boolean;
	showJoinDate?: boolean;
	showLevel?: boolean;
	showRole?: boolean;
	showOnlineStatus?: boolean;
	animated?: boolean;
}

// Helper to create mock profile data when running in dev mode or API fails
function createMockProfile(username: string): ProfileData {
	return {
		id: `mock-${username}`,
		username,
		avatarUrl: 'https://i.pravatar.cc/300',
		role: 'Degen',
		bio: 'This is a mock profile used in development mode.',
		signature: 'Keep calm and degen on',
		joinedAt: new Date().toISOString(),
		lastActiveAt: new Date().toISOString(),
		dgtBalance: 1234,
		totalPosts: 420,
		totalThreads: 69,
		totalLikes: 777,
		totalTips: 0,
		clout: 100,
		level: 5,
		xp: 4200,
		nextLevelXp: 5000,
		bannerUrl: null,
		activeFrameId: null,
		activeFrame: null,
		activeTitleId: null,
		activeTitle: null,
		activeBadgeId: null,
		activeBadge: null,
		badges: [],
		titles: [],
		inventory: [],
		relationships: { friends: [], friendRequestsSent: 0, friendRequestsReceived: 0 },
		stats: { threadViewCount: 0, posterRank: null, tipperRank: null, likerRank: null }
	};
}

export function UnifiedProfileCard({
	username,
	variant = 'compact',
	className = '',
	showStats = true,
	showJoinDate = true,
	showLevel = true,
	showRole = true,
	showOnlineStatus = true,
	animated = true
}: UnifiedProfileCardProps) {
	const {
		data: profile,
		isLoading,
		isError,
		error,
		refetch
	} = useQuery<ProfileData>({
		queryKey: ['profile', username],
		queryFn: async () => {
			if (import.meta.env.DEV) {
				return createMockProfile(username);
			}
			const res = await fetch(`/api/profile/${username}`);
			if (!res.ok) {
				return createMockProfile(username);
			}
			return res.json();
		},
		enabled: !!username
	});

	const identity = useIdentityDisplay(profile);
	const joinedAgo = profile?.joinedAt
		? formatDistanceToNow(new Date(profile.joinedAt), { addSuffix: true })
		: null;

	// Motion variants for animations
	const variants = {
		initial: brandConfig.animation.stagger.initial,
		animate: brandConfig.animation.stagger.animate,
		exit: { x: -50, opacity: 0, transition: { duration: 0.2 } }
	};

	// Loading state
	if (isLoading) {
		return (
			<LoadingCard
				title={`${username}'s Profile`}
				variant={variant === 'mini' ? 'inline' : 'card'}
				className={className}
			/>
		);
	}

	// Error state
	if (isError || !profile) {
		return (
			<StandardErrorDisplay
				title="Profile Error"
				message="Could not load profile information at this time."
				error={error}
				onRetry={refetch}
				variant="card"
				className={className}
			/>
		);
	}

	// Prepare stats for StatsBar
	const stats: StatItem[] = [
		{
			icon: <Users className="h-4 w-4" />,
			label: 'online',
			value: '12', // Mock online count
			color: 'primary',
			animate: true
		},
		{
			icon: <TrendingUp className="h-4 w-4" />,
			label: 'total members',
			value: profile.totalPosts + profile.totalThreads,
			color: 'secondary'
		},
		{
			icon: <Eye className="h-4 w-4" />,
			label: 'views',
			value: profile.stats.threadViewCount,
			color: 'muted'
		}
	];

	// Mini variant - just avatar + username (like inline mention)
	if (variant === 'mini') {
		return (
			<motion.div
				variants={animated ? variants : undefined}
				initial={animated ? 'initial' : undefined}
				animate={animated ? 'animate' : undefined}
				className={cn('flex items-center space-x-2', className)}
			>
				<AvatarFrame avatarUrl={profile.avatarUrl || ''} frame={identity?.avatarFrame} size={32} />
				<div className="flex items-center space-x-2">
					<Link href={`/profile/${username}`}>
						<UserName
							user={profile}
							className={cn(
								'hover:text-emerald-400 transition-colors',
								brandConfig.typography.body
							)}
						/>
					</Link>
					{showLevel && (profile.levelConfig || profile.level) && (
						<LevelBadge levelConfig={profile.levelConfig as any} level={profile.level} compact />
					)}
				</div>
			</motion.div>
		);
	}

	// Full variant - comprehensive profile card (like degen-index quality)
	return (
		<AnimatePresence mode="wait" initial={false}>
			<motion.div
				key={username}
				variants={animated ? variants : undefined}
				initial={animated ? 'initial' : undefined}
				animate={animated ? 'animate' : undefined}
				exit={animated ? 'exit' : undefined}
				className={cn(className)}
			>
				<Card
					className={cn(
						brandConfig.cards.feature.background,
						brandConfig.cards.feature.border,
						brandConfig.cards.feature.shadow,
						'overflow-hidden'
					)}
				>
					<CardContent className={cn('p-6', brandConfig.spacing.stack.md)}>
						{/* Header with avatar and title */}
						<motion.div
							className="text-center mb-6"
							initial={animated ? { opacity: 0, y: -20 } : undefined}
							animate={animated ? { opacity: 1, y: 0 } : undefined}
						>
							<Link href={`/profile/${username}`} className="block mb-3">
								<AvatarFrame
									avatarUrl={profile.avatarUrl || ''}
									frame={identity?.avatarFrame}
									size={80}
									className="mx-auto"
								/>
							</Link>

							<div className="flex items-center justify-center gap-2 mb-2">
								<Link href={`/profile/${username}`}>
									<UserName
										user={profile}
										className={cn(
											'hover:text-emerald-400 transition-colors',
											brandConfig.typography.h3
										)}
									/>
								</Link>
								{profile.role === 'admin' && (
									<Crown className="h-5 w-5 text-yellow-400" title="Admin" />
								)}
							</div>

							{profile.activeTitle && (
								<p className={brandConfig.typography.caption}>{profile.activeTitle.name}</p>
							)}
						</motion.div>

						{/* Stats Bar */}
						{showStats && (
							<motion.div
								initial={animated ? { opacity: 0, y: 20 } : undefined}
								animate={animated ? { opacity: 1, y: 0 } : undefined}
								transition={animated ? { delay: 0.1 } : undefined}
								className="mb-6"
							>
								<StatsBar stats={stats} animated={animated} />
							</motion.div>
						)}

						{/* Bio */}
						{profile.bio && (
							<motion.div
								initial={animated ? { opacity: 0 } : undefined}
								animate={animated ? { opacity: 1 } : undefined}
								transition={animated ? { delay: 0.2 } : undefined}
								className={cn(
									'p-4 rounded-lg border border-zinc-700/30 mb-4',
									brandConfig.cards.default.background
								)}
							>
								<h3 className={cn('mb-2', brandConfig.typography.caption)}>About</h3>
								<p className={brandConfig.typography.body}>{profile.bio}</p>
							</motion.div>
						)}

						{/* Join date and activity */}
						<motion.div
							initial={animated ? { opacity: 0 } : undefined}
							animate={animated ? { opacity: 1 } : undefined}
							transition={animated ? { delay: 0.3 } : undefined}
							className={cn(
								'p-3 rounded-lg',
								brandConfig.cards.default.background,
								brandConfig.typography.micro
							)}
						>
							<div>Member since {new Date(profile.joinedAt).toLocaleDateString()}</div>
							{profile.lastActiveAt && (
								<div className="mt-1">
									Last active{' '}
									{formatDistanceToNow(new Date(profile.lastActiveAt), { addSuffix: true })}
								</div>
							)}
						</motion.div>
					</CardContent>
				</Card>
			</motion.div>
		</AnimatePresence>
	);
}
