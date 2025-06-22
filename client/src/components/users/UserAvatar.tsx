import React from 'react';
import { FramedAvatar } from './framed-avatar';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
	user: {
		username: string;
		avatarUrl?: string | null;
		activeFrame?: {
			id: number;
			name: string;
			imageUrl: string;
			rarity: string;
			animated: boolean;
		} | null;
	};
	size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
	shape?: 'circle' | 'square';
	className?: string;
	frameClassName?: string;
	showFrame?: boolean;
}

/**
 * UserAvatar - Unified avatar component that consistently shows user avatars with frames
 * This should be used throughout the app instead of direct img tags or basic Avatar components
 */
export function UserAvatar({
	user,
	size = 'md',
	shape = 'circle',
	className,
	frameClassName,
	showFrame = true
}: UserAvatarProps) {
	const frameUrl = showFrame && user.activeFrame ? user.activeFrame.imageUrl : null;

	return (
		<FramedAvatar
			avatarUrl={user.avatarUrl}
			frameUrl={frameUrl}
			username={user.username}
			size={size}
			shape={shape}
			className={cn(className)}
			frameClassName={cn(frameClassName)}
		/>
	);
}

// Convenience wrapper with different default props for different contexts
export function PostAvatar({ user, ...props }: Omit<UserAvatarProps, 'size'>) {
	return <UserAvatar user={user} size="md" {...props} />;
}

export function ThreadListAvatar({ user, ...props }: Omit<UserAvatarProps, 'size'>) {
	return <UserAvatar user={user} size="sm" {...props} />;
}

export function ProfileAvatar({ user, ...props }: Omit<UserAvatarProps, 'size'>) {
	return <UserAvatar user={user} size="xl" {...props} />;
}

export function MiniAvatar({ user, ...props }: Omit<UserAvatarProps, 'size'>) {
	return <UserAvatar user={user} size="xs" {...props} />;
}