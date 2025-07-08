import React from 'react';
import { Crown, Shield, User, Calendar, MessageSquare, Award, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AvatarFrame } from '@/components/identity/AvatarFrame';
import { UserName } from '@/components/users/Username';
import { LevelBadge } from '@/components/economy/xp/LevelBadge';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { brandConfig } from '@/config/brand.config';
import { cn } from '@/lib/utils';
import type { ProfileData } from '@/types/profile';

interface PostSidebarProps {
	username: string;
	authorAvatar?: string | null | undefined;
	isFirst?: boolean | undefined;
	className?: string | undefined;
}

export function PostSidebar({
	username,
	authorAvatar,
	isFirst = false,
	className = ''
}: PostSidebarProps) {
	const { data: profile, isLoading } = useQuery<ProfileData>({
		queryKey: ['profile', username],
		queryFn: async () => {
			const res = await fetch(`/api/profile/${username}`);
			if (!res.ok) throw new Error('Failed to fetch profile');
			return res.json();
		},
		enabled: Boolean(username)
	});

	if (isLoading) {
		return (
			<div
				className={cn(
					'w-[180px] p-4 border-r border-zinc-700/50 bg-gradient-to-b from-zinc-800/30 to-zinc-900/50',
					className
				)}
			>
				<div className="animate-pulse space-y-3">
					<div className="w-16 h-16 bg-zinc-700 rounded-full mx-auto" />
					<div className="h-4 bg-zinc-700 rounded w-3/4 mx-auto" />
					<div className="h-3 bg-zinc-700 rounded w-1/2 mx-auto" />
					<div className="space-y-2">
						<div className="h-3 bg-zinc-700 rounded" />
						<div className="h-3 bg-zinc-700 rounded" />
					</div>
				</div>
			</div>
		);
	}

	if (!profile) {
		return (
			<div
				className={cn(
					'w-[180px] p-4 border-r border-zinc-700/50 bg-gradient-to-b from-zinc-800/30 to-zinc-900/50',
					className
				)}
			>
				<div className="text-center text-zinc-500 text-sm">
					<User className="h-8 w-8 mx-auto mb-2 opacity-50" />
					Profile unavailable
				</div>
			</div>
		);
	}

	const joinedAgo = profile.joinedAt
		? formatDistanceToNow(new Date(profile.joinedAt), { addSuffix: true })
		: 'Unknown';

	const totalPosts = (profile.totalPosts || 0) + (profile.totalThreads || 0);
	const isOnline =
		profile.lastActiveAt &&
		new Date().getTime() - new Date(profile.lastActiveAt).getTime() < 5 * 60 * 1000; // 5 minutes

	// Role styling
	const getRoleColor = (role?: string) => {
		switch (role) {
			case 'admin':
				return 'text-yellow-400';
			case 'moderator':
				return 'text-emerald-400';
			case 'developer':
				return 'text-purple-400';
			default:
				return 'text-zinc-300';
		}
	};

	const getRoleIcon = (role?: string) => {
		switch (role) {
			case 'admin':
				return <Crown className="h-3 w-3" />;
			case 'moderator':
				return <Shield className="h-3 w-3" />;
			case 'developer':
				return <Award className="h-3 w-3" />;
			default:
				return null;
		}
	};

	return (
		<div
			className={cn(
				'w-[180px] p-4 border-r border-zinc-700/50 backdrop-blur-sm',
				isFirst
					? 'bg-gradient-to-b from-zinc-800/40 to-zinc-900/60'
					: 'bg-gradient-to-b from-zinc-800/30 to-zinc-900/50',
				className
			)}
		>
			{/* Avatar */}
			<div className="text-center mb-4">
				<AvatarFrame
					avatarUrl={authorAvatar || profile.avatarUrl || ''}
					frame={null} // TODO: Integrate with cosmetics system
					size={64}
					className="mx-auto mb-2 ring-2 ring-zinc-700/50"
				/>

				{/* Online status indicator */}
				{isOnline && (
					<div className="flex items-center justify-center mb-2">
						<Circle className="w-2 h-2 text-emerald-400 fill-emerald-400 animate-pulse" />
						<span className={cn('ml-1 text-xs text-emerald-400', brandConfig.typography.micro)}>
							Online
						</span>
					</div>
				)}
			</div>

			{/* Username and role */}
			<div className="text-center mb-4">
				<div className={cn('font-semibold mb-1', getRoleColor(profile.role))}>
					<UserName user={profile} className="hover:text-emerald-400 transition-colors" />
				</div>

				{/* Role badge */}
				{profile.role && profile.role !== 'user' && (
					<Badge
						className={cn(
							'text-xs mb-2',
							profile.role === 'admin'
								? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
								: profile.role === 'moderator'
									? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
									: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
						)}
					>
						{getRoleIcon(profile.role)}
						<span className="ml-1 capitalize">{profile.role}</span>
					</Badge>
				)}

				{/* Custom title */}
				{profile.activeTitle && (
					<div className={cn('text-xs text-zinc-400 italic', brandConfig.typography.micro)}>
						{profile.activeTitle.name}
					</div>
				)}
			</div>

			{/* Level badge */}
			{profile.level && (
				<div className="flex justify-center mb-4">
					<LevelBadge
						level={profile.level}
						compact={true}
					/>
				</div>
			)}

			{/* Stats */}
			<div className="space-y-2 text-xs border-t border-zinc-700/30 pt-3">
				{/* Join date */}
				<div className="flex items-center text-zinc-400">
					<Calendar className="h-3 w-3 mr-2 flex-shrink-0" />
					<span>Joined {joinedAgo.replace(' ago', '')}</span>
				</div>

				{/* Post count */}
				<div className="flex items-center text-zinc-400">
					<MessageSquare className="h-3 w-3 mr-2 flex-shrink-0" />
					<span>Posts: {totalPosts.toLocaleString()}</span>
				</div>

				{/* Reputation/Clout */}
				{profile.reputation && profile.reputation > 0 && (
					<div className="flex items-center text-zinc-400">
						<TrendingUp className="h-3 w-3 mr-2 flex-shrink-0" />
						<span>Rep: {profile.reputation.toLocaleString()}</span>
					</div>
				)}

				{/* XP Display */}
				{profile.totalXp && profile.totalXp > 0 && (
					<div className="flex items-center text-zinc-400">
						<Award className="h-3 w-3 mr-2 flex-shrink-0" />
						<span>XP: {profile.totalXp.toLocaleString()}</span>
					</div>
				)}
			</div>
		</div>
	);
}
