import React, { useState } from 'react';
import { UserPlus, MessageCircle, DollarSign, Heart, Share2, Flag } from 'lucide-react';
import { Button } from '@app/components/ui/button';
import { cn } from '@app/utils/utils';
import { useAuth } from '@app/hooks/use-auth';
import { toast } from 'sonner';

interface QuickActionsCardProps {
	profileId: string;
	username: string;
	userContext: 'visitor' | 'friend' | 'self';
	isOnline?: boolean;
	className?: string;
}

export function QuickActionsCard({
	profileId,
	username,
	userContext,
	isOnline = false,
	className
}: QuickActionsCardProps) {
	const { user } = useAuth();
	const [isFollowing, setIsFollowing] = useState(false);
	const [isFriend, setIsFriend] = useState(userContext === 'friend');
	const [loading, setLoading] = useState<string | null>(null);

	if (userContext === 'self') {
		return null; // Don't show quick actions for own profile
	}

	const handleFollow = async () => {
		setLoading('follow');
		try {
			// API call to follow/unfollow user
			await new Promise((resolve) => setTimeout(resolve, 1000)); // Mock delay
			setIsFollowing(!isFollowing);
			toast.success(isFollowing ? `Unfollowed ${username}` : `Following ${username}`);
		} catch (error) {
			toast.error('Failed to update follow status');
		} finally {
			setLoading(null);
		}
	};

	const handleSendMessage = async () => {
		setLoading('message');
		try {
			// Navigate to DM or open chat modal
			await new Promise((resolve) => setTimeout(resolve, 500));
			toast.success('Opening chat...');
		} catch (error) {
			toast.error('Failed to open chat');
		} finally {
			setLoading(null);
		}
	};

	const handleSendTip = async () => {
		setLoading('tip');
		try {
			// Open tip modal or navigate to tip page
			await new Promise((resolve) => setTimeout(resolve, 500));
			toast.success('Opening tip dialog...');
		} catch (error) {
			toast.error('Failed to open tip dialog');
		} finally {
			setLoading(null);
		}
	};

	const handleAddFriend = async () => {
		setLoading('friend');
		try {
			// API call to send friend request
			await new Promise((resolve) => setTimeout(resolve, 1000));
			setIsFriend(true);
			toast.success(`Friend request sent to ${username}`);
		} catch (error) {
			toast.error('Failed to send friend request');
		} finally {
			setLoading(null);
		}
	};

	const handleShare = async () => {
		try {
			await navigator.share({
				title: `${username}'s Profile`,
				url: window.location.href
			});
		} catch (error) {
			// Fallback to clipboard copy
			await navigator.clipboard.writeText(window.location.href);
			toast.success('Profile link copied to clipboard');
		}
	};

	return (
		<div
			className={cn(
				'bg-gradient-to-br from-zinc-900/80 to-zinc-800/60 backdrop-blur-sm',
				'border border-zinc-700/40 rounded-lg p-4 space-y-4',
				className
			)}
		>
			<div className="flex items-center justify-between">
				<h3 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
					<Heart className="h-4 w-4 text-pink-400" />
					Quick Actions
				</h3>
				{isOnline && (
					<div className="flex items-center gap-1">
						<div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
						<span className="text-xs text-emerald-400">Online</span>
					</div>
				)}
			</div>

			<div className="grid grid-cols-2 gap-3">
				<ActionButton
					icon={<UserPlus className="h-4 w-4" />}
					label={isFriend ? 'Friends' : 'Add Friend'}
					onClick={handleAddFriend}
					loading={loading === 'friend'}
					disabled={isFriend}
					variant={isFriend ? 'success' : 'default'}
				/>

				<ActionButton
					icon={
						<Heart
							className={cn(
								'h-4 w-4 transition-colors',
								isFollowing ? 'text-pink-400 fill-current' : 'text-zinc-400'
							)}
						/>
					}
					label={isFollowing ? 'Following' : 'Follow'}
					onClick={handleFollow}
					loading={loading === 'follow'}
					variant={isFollowing ? 'success' : 'default'}
				/>

				<ActionButton
					icon={<MessageCircle className="h-4 w-4" />}
					label="Message"
					onClick={handleSendMessage}
					loading={loading === 'message'}
					variant="default"
				/>

				<ActionButton
					icon={<DollarSign className="h-4 w-4" />}
					label="Tip DGT"
					onClick={handleSendTip}
					loading={loading === 'tip'}
					variant="accent"
				/>
			</div>

			<div className="flex gap-2 pt-2 border-t border-zinc-700/30">
				<Button
					variant="ghost"
					size="sm"
					onClick={handleShare}
					className="flex-1 text-zinc-400 hover:text-zinc-200"
				>
					<Share2 className="h-3 w-3 mr-1" />
					Share
				</Button>
				<Button variant="ghost" size="sm" className="text-zinc-400 hover:text-red-400">
					<Flag className="h-3 w-3 mr-1" />
					Report
				</Button>
			</div>
		</div>
	);
}

interface ActionButtonProps {
	icon: React.ReactNode;
	label: string;
	onClick: () => void;
	loading?: boolean;
	disabled?: boolean;
	variant?: 'default' | 'success' | 'accent';
}

function ActionButton({
	icon,
	label,
	onClick,
	loading = false,
	disabled = false,
	variant = 'default'
}: ActionButtonProps) {
	const baseClasses =
		'flex flex-col items-center gap-2 p-3 rounded-lg border transition-all duration-200 hover:scale-105 active:scale-95';

	const variantClasses = {
		default: 'bg-zinc-700/30 border-zinc-600/40 hover:bg-zinc-600/40 text-zinc-300',
		success: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
		accent: 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
	};

	return (
		<button
			onClick={onClick}
			disabled={disabled || loading}
			className={cn(
				baseClasses,
				variantClasses[variant],
				(disabled || loading) && 'opacity-50 cursor-not-allowed hover:scale-100'
			)}
		>
			<div className={cn('transition-transform', loading && 'animate-spin')}>{icon}</div>
			<span className="text-xs font-medium">{label}</span>
		</button>
	);
}
