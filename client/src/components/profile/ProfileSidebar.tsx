import React, { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loader';
import { WhisperButton } from '@/components/messages/WhisperButton';
import { WhisperModal } from '@/components/messages/WhisperModal';
import {
	Settings,
	UserCheck,
	UserPlus,
	Crown,
	Eye,
	Twitter,
	Globe,
	MessageCircle
} from 'lucide-react';
import { cn, formatNumber, formatCurrency, formatRelativeTime } from '@/utils/utils';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/utils/queryClient';
import { useAuth } from '@/hooks/use-auth.tsx';
import type { ProfileData } from '@/types/profile';
import { useIdentityDisplay } from '@/hooks/useIdentityDisplay';
import { AvatarFrame } from '@/components/identity/AvatarFrame';
import { UserName } from '@/components/users/Username';
import { LevelBadge } from '@/features/gamification/components/LevelBadge';
import { FollowButton } from '@/components/social/FollowButton';
import { getAvatarUrl } from '@/utils/avatar';

interface Props {
	profile: ProfileData;
	isOwnProfile: boolean;
}

const ProfileSidebar: React.FC<Props> = ({ profile, isOwnProfile }) => {
	const { toast } = useToast();
	const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
	const queryClient = useQueryClient();
	const { user } = useAuth();

	// Get identity display information
	const identity = useIdentityDisplay(profile);

	// Fetch follow counts for Whale Watch
	const { data: followCounts } = useQuery({
		queryKey: [`/api/users/${profile.id}/follow-counts`],
		queryFn: async () => {
			return await apiRequest<{ following: number; followers: number }>({
				url: `/api/users/${profile.id}/follow-counts`,
				method: 'GET'
			});
		}
	});

	// Fetch whale status
	const { data: whaleStatus } = useQuery({
		queryKey: [`/api/whale-status/${profile.id}`],
		queryFn: async () => {
			return await apiRequest<{ isWhale: boolean; followerCount: number; threshold: number }>({
				url: `/api/whale-status/${profile.id}`,
				method: 'GET'
			});
		}
	});

	return (
		<div
			className={cn(
				'bg-gradient-to-b from-zinc-800/80 to-zinc-900/85 backdrop-blur-sm rounded-lg overflow-hidden shadow-xl relative border',
				identity?.avatarFrame?.rarityColor ? 'border-transparent' : 'border-zinc-700/50' // Make border transparent if glow exists
			)}
			style={
				identity?.avatarFrame?.rarityColor
					? {
							boxShadow: `0 0 15px -3px ${identity.avatarFrame.rarityColor}, 0 0 5px -2px ${identity.avatarFrame.rarityColor}`
						}
					: {}
			}
		>
			<div className="p-6 flex flex-col items-center">
				{/* Avatar with fallback */}
				<div className="relative mb-4">
					<AvatarFrame
						avatarUrl={getAvatarUrl({
							avatarUrl: profile.avatarUrl,
							email: (profile as any).email ?? null,
							username: profile.username
						})}
						frame={identity?.avatarFrame}
						size={80}
						className="mb-2"
					/>
				</div>

				{/* Username, Title, Role, Level */}
				<div className="flex items-center justify-center gap-2 mb-1">
					<UserName 
						username={profile.username}
						userId={profile.id}
						userRole={profile.role}
						className="text-2xl font-bold text-center" 
					/>
					{whaleStatus?.isWhale && (
						<Crown className="h-6 w-6 text-yellow-400" title="Whale - High Follower Count" />
					)}
				</div>

				{identity?.primaryRole && (
					<Badge
						className="mb-2 uppercase bg-gradient-to-r from-purple-600 to-violet-600 text-white border-0"
						style={{ backgroundColor: identity.primaryRole.color || undefined }}
					>
						{identity.primaryRole.name}
					</Badge>
				)}
				{identity && (
					<LevelBadge
						levelConfig={identity.levelConfig}
						level={identity.level}
						className="mb-4 text-sm"
					/>
				)}

				{/* Actions */}
				<div className="flex gap-2 w-full mb-6">
					{isOwnProfile ? (
						<Link href="/preferences">
							<Button className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white">
								<Settings className="mr-2 h-4 w-4" />
								Preferences
							</Button>
						</Link>
					) : (
						<>
							<FollowButton userId={profile.id} username={profile.username} className="flex-1" />
							<WhisperButton onClick={() => setIsMessageModalOpen(true)} className="flex-1" />
						</>
					)}
				</div>

				{isMessageModalOpen && (
					<WhisperModal
						isOpen={isMessageModalOpen}
						onClose={() => setIsMessageModalOpen(false)}
						initialUser={{
							id: profile.id,
							username: profile.username,
							avatarUrl: profile.avatarUrl || undefined
						}}
					/>
				)}

				{/* Stats */}
				<div className="grid grid-cols-2 gap-4 w-full text-center mb-4 bg-gradient-to-r from-zinc-800/40 to-zinc-900/40 p-4 rounded-lg border border-zinc-700/30 backdrop-blur-sm">
					<div className="flex flex-col">
						<span className="text-xl font-bold text-zinc-200">
							{formatNumber(profile.totalThreads)}
						</span>
						<span className="text-sm text-zinc-400">Threads</span>
					</div>
					<div className="flex flex-col">
						<span className="text-xl font-bold text-zinc-200">
							{formatNumber(profile.totalPosts)}
						</span>
						<span className="text-sm text-zinc-400">Posts</span>
					</div>
				</div>

				{/* Whale Watch Stats */}
				<div className="grid grid-cols-2 gap-4 w-full text-center mb-6 bg-gradient-to-r from-emerald-800/20 to-green-800/20 p-4 rounded-lg border border-emerald-700/30 backdrop-blur-sm">
					<div className="flex flex-col">
						<div className="flex items-center justify-center gap-1 mb-1">
							<Eye className="h-4 w-4 text-emerald-400" />
							<span className="text-lg font-bold text-zinc-200">
								{followCounts?.following || 0}
							</span>
						</div>
						<span className="text-sm text-zinc-400">Watching</span>
					</div>
					<div className="flex flex-col">
						<div className="flex items-center justify-center gap-1 mb-1">
							<Eye className="h-4 w-4 text-emerald-400" />
							<span className="text-lg font-bold text-zinc-200">
								{followCounts?.followers || 0}
							</span>
							{whaleStatus?.isWhale && <Crown className="h-4 w-4 text-yellow-400" />}
						</div>
						<span className="text-sm text-zinc-400">Watchers</span>
					</div>
				</div>

				{/* Social Handles */}
				{(profile.twitterHandle ||
					profile.discordHandle ||
					profile.telegramHandle ||
					profile.website) && (
					<div className="w-full bg-zinc-800/20 p-4 rounded-lg border border-zinc-700/30 mb-4">
						<h3 className="text-md font-semibold text-zinc-200 mb-2">Social</h3>
						<div className="flex flex-wrap gap-3">
							{profile.twitterHandle && (
								<a
									href={`https://x.com/${profile.twitterHandle.replace(/^@/, '')}`}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-1 text-zinc-300 hover:text-emerald-400 text-sm"
								>
									<Twitter className="h-4 w-4" /> @{profile.twitterHandle.replace(/^@/, '')}
								</a>
							)}
							{profile.discordHandle && (
								<span className="flex items-center gap-1 text-zinc-300 text-sm">
									<Globe className="h-4 w-4" /> {profile.discordHandle}
								</span>
							)}
							{profile.telegramHandle && (
								<a
									href={`https://t.me/${profile.telegramHandle.replace(/^@/, '')}`}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-1 text-zinc-300 hover:text-emerald-400 text-sm"
								>
									<MessageCircle className="h-4 w-4" />@{profile.telegramHandle.replace(/^@/, '')}
								</a>
							)}
							{profile.website && (
								<a
									href={profile.website}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-1 text-zinc-300 hover:text-emerald-400 text-sm"
								>
									<Globe className="h-4 w-4" /> Website
								</a>
							)}
						</div>
					</div>
				)}

				{/* About */}
				<div className="w-full bg-zinc-800/20 p-4 rounded-lg border border-zinc-700/30 mb-4">
					<h3 className="text-md font-semibold text-zinc-200 mb-2">About</h3>
					{profile.bio ? (
						<p className="text-zinc-300 text-sm">{profile.bio}</p>
					) : (
						<p className="text-zinc-500 italic text-sm">No bio provided</p>
					)}
				</div>

				{/* XP, Balance & Clout */}
				<div className="text-xs text-zinc-400 w-full bg-zinc-800/20 p-3 rounded-lg">
					<div>Member since {new Date(profile.joinedAt).toLocaleDateString()}</div>
					{profile.lastActiveAt && (
						<div className="mt-1">Last active {formatRelativeTime(profile.lastActiveAt)}</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default ProfileSidebar;
