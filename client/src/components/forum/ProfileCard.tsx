import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AvatarFrame } from '@/components/identity/AvatarFrame';
import { UserName } from '@/components/users/Username';
import { LevelBadge } from '@/components/identity/LevelBadge';
import { useIdentityDisplay } from '@/hooks/useIdentityDisplay';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Calendar, Award, Shield } from 'lucide-react';
import type { User } from '@db_types/user.types';

interface ProfileCardProps {
	user: User;
	compact?: boolean;
	className?: string;
	showPostCount?: boolean;
	showJoinDate?: boolean;
	showLevel?: boolean;
	showFlair?: boolean;
	showTitle?: boolean;
}

export function ProfileCard({
	user,
	compact = false,
	className = '',
	showPostCount = true,
	showJoinDate = true,
	showLevel = true,
	showFlair = true,
	showTitle = true
}: ProfileCardProps) {
	const identity = useIdentityDisplay(user);
	const joinedAgo = user.createdAt ? formatDistanceToNow(new Date(user.createdAt), { addSuffix: true }) : null;

	if (compact) {
		// Mobile/horizontal layout
		return (
			<div className={`flex items-center space-x-3 p-3 bg-zinc-900/60 border border-zinc-800 rounded-lg ${className}`}>
				<AvatarFrame
					avatarUrl={user.avatarUrl || ''}
					frame={identity?.avatarFrame}
					size={40}
				/>
				<div className="flex-grow min-w-0">
					<div className="flex items-center space-x-2 mb-1">
						<Link href={`/profile/${user.id}`} className="flex-shrink-0">
							<UserName user={user} className="hover:text-emerald-400 transition-colors" />
						</Link>
						{showLevel && user.level && (
							<LevelBadge level={user.level} compact />
						)}
					</div>
					{showTitle && user.title && (
						<p className="text-xs text-zinc-400 truncate">{user.title}</p>
					)}
				</div>
				{showPostCount && (
					<div className="text-xs text-zinc-500 flex items-center">
						<MessageSquare className="h-3 w-3 mr-1" />
						{user.postCount || 0}
					</div>
				)}
			</div>
		);
	}

	// Desktop vertical layout - traditional forum sidebar
	return (
		<Card className={`bg-zinc-900/60 border-zinc-800 ${className}`}>
			<CardContent className="p-4 space-y-4">
				{/* Avatar and basic info */}
				<div className="text-center">
					<Link href={`/profile/${user.id}`} className="block mb-2">
						<AvatarFrame
							avatarUrl={user.avatarUrl || ''}
							frame={identity?.avatarFrame}
							size={80}
							className="mx-auto"
						/>
					</Link>
					<Link href={`/profile/${user.id}`}>
						<UserName user={user} className="hover:text-emerald-400 transition-colors font-medium" />
					</Link>
					
					{/* User title/role */}
					{showTitle && user.title && (
						<p className="text-sm text-zinc-400 mt-1">{user.title}</p>
					)}
					
					{/* Moderator badge */}
					{user.role === 'moderator' && (
						<Badge variant="outline" className="mt-2 bg-blue-500/20 text-blue-400 border-blue-500/30">
							<Shield className="h-3 w-3 mr-1" />
							Moderator
						</Badge>
					)}
					
					{/* Admin badge */}
					{user.role === 'admin' && (
						<Badge variant="outline" className="mt-2 bg-red-500/20 text-red-400 border-red-500/30">
							<Shield className="h-3 w-3 mr-1" />
							Admin
						</Badge>
					)}
				</div>

				{/* Level and XP */}
				{showLevel && user.level && (
					<div className="space-y-2">
						<LevelBadge level={user.level} showProgress />
						{user.xp !== undefined && (
							<div className="text-xs text-zinc-500 text-center">
								{user.xp.toLocaleString()} XP
							</div>
						)}
					</div>
				)}

				{/* User stats */}
				<div className="space-y-2 pt-2 border-t border-zinc-800/50">
					{showPostCount && (
						<div className="flex items-center justify-between text-sm">
							<span className="text-zinc-400 flex items-center">
								<MessageSquare className="h-3.5 w-3.5 mr-1.5" />
								Posts
							</span>
							<span className="text-zinc-300 font-medium">{(user.postCount || 0).toLocaleString()}</span>
						</div>
					)}
					
					{showJoinDate && joinedAgo && (
						<div className="flex items-center justify-between text-sm">
							<span className="text-zinc-400 flex items-center">
								<Calendar className="h-3.5 w-3.5 mr-1.5" />
								Joined
							</span>
							<span className="text-zinc-300 text-xs">{joinedAgo}</span>
						</div>
					)}
				</div>

				{/* Flair/Achievements */}
				{showFlair && user.flair && user.flair.length > 0 && (
					<div className="pt-2 border-t border-zinc-800/50">
						<div className="flex items-center mb-2">
							<Award className="h-3.5 w-3.5 mr-1.5 text-zinc-400" />
							<span className="text-xs text-zinc-400">Achievements</span>
						</div>
						<div className="flex flex-wrap gap-1">
							{user.flair.slice(0, 3).map((flair, index) => (
								<Badge key={index} variant="secondary" className="text-xs">
									{flair}
								</Badge>
							))}
							{user.flair.length > 3 && (
								<Badge variant="outline" className="text-xs">
									+{user.flair.length - 3} more
								</Badge>
							)}
						</div>
					</div>
				)}

				{/* Online status indicator */}
				<div className="pt-2 border-t border-zinc-800/50">
					<div className="flex items-center justify-center">
						<div className="flex items-center space-x-2">
							<div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
							<span className="text-xs text-emerald-400">Online</span>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}