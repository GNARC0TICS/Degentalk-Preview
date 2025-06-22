import React from 'react';
import { Link } from 'wouter';
import { Badge } from '@/components/ui/badge';
import { PostAvatar } from '@/components/users/UserAvatar';
import { UserName } from '@/components/users/Username';
import { LevelBadge } from '@/components/identity/LevelBadge';
import { RoleBadge } from '@/components/identity/RoleBadge';
import { useIdentityDisplay } from '@/hooks/useIdentityDisplay';
import { formatDistanceToNow } from 'date-fns';
import { Star, TrendingUp, Zap, Coins, Calendar, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { User } from '@db_types/user.types';

export interface UserProfileRendererProps {
	user: User;
	variant?: 'post-sidebar' | 'card-compact' | 'card-full' | 'inline' | 'mini';
	className?: string;
	showStats?: boolean;
	showBio?: boolean;
	showJoinDate?: boolean;
	showOnlineStatus?: boolean;
	showVerifiedBadge?: boolean;
	showLevel?: boolean;
	showRole?: boolean;
	linkToProfile?: boolean;
}

export function UserProfileRenderer({
	user,
	variant = 'card-compact',
	className = '',
	showStats = true,
	showBio = true,
	showJoinDate = true,
	showOnlineStatus = true,
	showVerifiedBadge = true,
	showLevel = true,
	showRole = true,
	linkToProfile = true
}: UserProfileRendererProps) {
	const identity = useIdentityDisplay(user);

	const UserNameComponent = linkToProfile ? (
		<Link href={`/profile/${user.id}`}>
			<UserName user={user} className="hover:text-emerald-400 transition-colors" />
		</Link>
	) : (
		<UserName user={user} />
	);

	const AvatarComponent = linkToProfile ? (
		<Link href={`/profile/${user.id}`}>
			<PostAvatar
				user={{
					username: user.username,
					avatarUrl: user.avatarUrl,
					activeFrame: identity?.avatarFrame
				}}
			/>
		</Link>
	) : (
		<PostAvatar
			user={{
				username: user.username,
				avatarUrl: user.avatarUrl,
				activeFrame: identity?.avatarFrame
			}}
		/>
	);

	// Mini variant - just avatar + username
	if (variant === 'mini') {
		return (
			<div className={cn('flex items-center space-x-2', className)}>
				{AvatarComponent}
				<div className="flex items-center space-x-2">
					{UserNameComponent}
					{showVerifiedBadge && user.isVerified && (
						<Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
					)}
					{showLevel && user.level && <LevelBadge level={user.level} size="sm" />}
				</div>
			</div>
		);
	}

	// Inline variant - horizontal layout
	if (variant === 'inline') {
		return (
			<div className={cn('flex items-center space-x-3 p-2', className)}>
				<div className="relative">
					{AvatarComponent}
					{showVerifiedBadge && user.isVerified && (
						<Star className="absolute -top-1 -right-1 h-3 w-3 text-yellow-400 fill-yellow-400" />
					)}
				</div>
				<div className="flex-1 min-w-0">
					<div className="flex items-center space-x-2">
						{UserNameComponent}
						{showLevel && user.level && <LevelBadge level={user.level} size="sm" />}
					</div>
					{showRole && identity?.primaryRole && <RoleBadge role={identity.primaryRole} size="sm" />}
				</div>
				{showStats && (
					<div className="text-xs text-zinc-500 flex items-center">
						<MessageSquare className="h-3 w-3 mr-1" />
						{user.postCount || 0}
					</div>
				)}
			</div>
		);
	}

	// Card compact variant - traditional forum card
	if (variant === 'card-compact') {
		return (
			<div
				className={cn(
					'bg-zinc-900/60 border border-zinc-800 rounded-lg p-4 text-center',
					className
				)}
			>
				<div className="relative mb-3">
					{AvatarComponent}
					{showVerifiedBadge && user.isVerified && (
						<Star className="absolute -top-1 -right-1 h-4 w-4 text-yellow-400 fill-yellow-400" />
					)}
				</div>
				<div className="space-y-2">
					{UserNameComponent}
					{showRole && identity?.primaryRole && <RoleBadge role={identity.primaryRole} size="sm" />}
					{showLevel && user.level && <LevelBadge level={user.level} size="sm" />}
				</div>
				{showOnlineStatus && (
					<Badge variant="outline" className="text-[10px] px-2 py-0.5 mt-2">
						{user.isActive ? (
							<>
								<div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5" />
								Online
							</>
						) : (
							<>
								<div className="w-1.5 h-1.5 bg-zinc-500 rounded-full mr-1.5" />
								Offline
							</>
						)}
					</Badge>
				)}
			</div>
		);
	}

	// Card full variant - comprehensive profile card
	if (variant === 'card-full') {
		return (
			<div
				className={cn('bg-zinc-900/60 border border-zinc-800 rounded-lg p-4 space-y-4', className)}
			>
				{/* Header with avatar and basic info */}
				<div className="text-center">
					<div className="relative mb-3">
						{AvatarComponent}
						{showVerifiedBadge && user.isVerified && (
							<Star className="absolute -top-1 -right-1 h-4 w-4 text-yellow-400 fill-yellow-400" />
						)}
					</div>
					<div className="space-y-2">
						{UserNameComponent}
						{showRole && identity?.primaryRole && (
							<RoleBadge role={identity.primaryRole} size="sm" />
						)}
						{showLevel && user.level && <LevelBadge level={user.level} showProgress />}
					</div>
				</div>

				{/* Stats */}
				{showStats && (
					<div className="space-y-2 pt-2 border-t border-zinc-800/50">
						<div className="flex items-center justify-between text-sm">
							<span className="text-zinc-400 flex items-center">
								<MessageSquare className="h-3.5 w-3.5 mr-1.5" />
								Posts
							</span>
							<span className="text-zinc-300 font-medium">
								{(user.postCount || 0).toLocaleString()}
							</span>
						</div>
						{user.xp !== undefined && (
							<div className="flex items-center justify-between text-sm">
								<span className="text-zinc-400 flex items-center">
									<Zap className="h-3.5 w-3.5 mr-1.5" />
									XP
								</span>
								<span className="text-zinc-300 font-medium">{user.xp.toLocaleString()}</span>
							</div>
						)}
					</div>
				)}

				{/* Bio */}
				{showBio && user.bio && (
					<div className="pt-2 border-t border-zinc-800/50">
						<p className="text-sm text-zinc-400">{user.bio}</p>
					</div>
				)}

				{/* Meta info */}
				<div className="pt-2 border-t border-zinc-800/50 space-y-2">
					{showJoinDate && user.createdAt && (
						<div className="flex items-center justify-between text-sm">
							<span className="text-zinc-400 flex items-center">
								<Calendar className="h-3.5 w-3.5 mr-1.5" />
								Joined
							</span>
							<span className="text-zinc-300 text-xs">
								{formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
							</span>
						</div>
					)}
					{showOnlineStatus && (
						<div className="flex items-center justify-center">
							<Badge variant="outline" className="text-[10px] px-2 py-0.5">
								{user.isActive ? (
									<>
										<div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5" />
										Online
									</>
								) : (
									<>
										<div className="w-1.5 h-1.5 bg-zinc-500 rounded-full mr-1.5" />
										Offline
									</>
								)}
							</Badge>
						</div>
					)}
				</div>
			</div>
		);
	}

	// Post sidebar variant - comprehensive inline profile for posts
	if (variant === 'post-sidebar') {
		return (
			<div
				className={cn(
					'sm:w-64 bg-zinc-800/40 border-b sm:border-b-0 sm:border-r border-zinc-700/50 p-4',
					className
				)}
			>
				<div className="flex flex-col items-center text-center space-y-3">
					{/* Avatar and Frame */}
					<div className="relative">
						{AvatarComponent}
						{showVerifiedBadge && user.isVerified && (
							<Star className="absolute -top-1 -right-1 h-4 w-4 text-yellow-400 fill-yellow-400" />
						)}
					</div>

					{/* Username and Role */}
					<div className="space-y-1">
						<div className="font-semibold text-sm">{UserNameComponent}</div>
						{showRole && identity?.primaryRole && (
							<RoleBadge role={identity.primaryRole} size="sm" />
						)}
					</div>

					{/* Stats Grid */}
					{showStats && (
						<div className="grid grid-cols-2 gap-2 w-full text-xs">
							<div className="bg-zinc-900/50 rounded-lg p-2">
								<div className="flex items-center justify-center gap-1 text-emerald-400">
									<TrendingUp className="h-3 w-3" />
									<span className="font-mono">{user.level || 1}</span>
								</div>
								<div className="text-zinc-400 text-[10px]">Level</div>
							</div>
							<div className="bg-zinc-900/50 rounded-lg p-2">
								<div className="flex items-center justify-center gap-1 text-blue-400">
									<Zap className="h-3 w-3" />
									<span className="font-mono">{user.xp || 0}</span>
								</div>
								<div className="text-zinc-400 text-[10px]">XP</div>
							</div>
							<div className="bg-zinc-900/50 rounded-lg p-2">
								<div className="flex items-center justify-center gap-1 text-amber-400">
									<Coins className="h-3 w-3" />
									<span className="font-mono">{user.dgtWalletBalance || 0}</span>
								</div>
								<div className="text-zinc-400 text-[10px]">DGT</div>
							</div>
							<div className="bg-zinc-900/50 rounded-lg p-2">
								<div className="flex items-center justify-center gap-1 text-purple-400">
									<Star className="h-3 w-3" />
									<span className="font-mono">{user.clout || 0}</span>
								</div>
								<div className="text-zinc-400 text-[10px]">Clout</div>
							</div>
						</div>
					)}

					{/* Bio Preview */}
					{showBio && user.bio && (
						<div className="w-full">
							<p className="text-xs text-zinc-400 line-clamp-2">{user.bio}</p>
						</div>
					)}

					{/* Online Status & Join Date */}
					<div className="w-full space-y-1">
						{showOnlineStatus && (
							<Badge variant="outline" className="text-[10px] px-2 py-0.5">
								{user.isActive ? (
									<>
										<div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5" />
										Online
									</>
								) : (
									<>
										<div className="w-1.5 h-1.5 bg-zinc-500 rounded-full mr-1.5" />
										Offline
									</>
								)}
							</Badge>
						)}
						{showJoinDate && user.createdAt && (
							<p className="text-[10px] text-zinc-500">
								Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
							</p>
						)}
					</div>
				</div>
			</div>
		);
	}

	return null;
}
