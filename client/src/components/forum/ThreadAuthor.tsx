import React from 'react';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';
import { AvatarFrame } from '@/components/identity/AvatarFrame';
import { UserName } from '@/components/users/Username';
import { LevelBadge } from '@/components/identity/LevelBadge';
import { useIdentityDisplay } from '@/hooks/useIdentityDisplay';

type ThreadAuthorProps = {
	user: any; // Accept raw user object
	avatarUrl: string;
	size?: 'sm' | 'md' | 'lg';
	showLevelBadge?: boolean;
	className?: string;
};

/**
 * Component to display thread author information with their level badge
 */
export function ThreadAuthor({
	user,
	avatarUrl,
	size = 'md',
	showLevelBadge = true,
	className
}: ThreadAuthorProps) {
	const identity = useIdentityDisplay(user);

	// Avatar size
	const getAvatarPx = () => {
		switch (size) {
			case 'sm':
				return 24;
			case 'lg':
				return 40;
			default:
				return 32;
		}
	};

	const getUsernameSizeClass = () => {
		switch (size) {
			case 'sm':
				return 'text-xs';
			case 'lg':
				return 'text-base';
			default:
				return 'text-sm';
		}
	};

	return (
		<div className={cn('flex items-center', className)}>
			<Link href={`/profile/${user?.username}` || '#'} className="flex items-center gap-2 group">
				<AvatarFrame avatarUrl={avatarUrl} frame={identity?.avatarFrame} size={getAvatarPx()} />

				<div className="flex flex-col">
					<div className="flex items-center gap-1.5">
						<UserName user={user} className={getUsernameSizeClass()} />
						{showLevelBadge && identity?.level && <LevelBadge level={identity.level} />}
					</div>
				</div>
			</Link>
		</div>
	);
}
