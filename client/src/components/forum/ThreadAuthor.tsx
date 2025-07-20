import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils/utils';
import { AvatarFrame } from '@/components/identity/AvatarFrame';
import { UserName } from '@/components/users/Username';
import { LevelBadge } from '@/features/gamification/components/LevelBadge';
import { useIdentityDisplay } from '@/hooks/useIdentityDisplay';
import type { User } from '@/types/compat/user';

type ThreadAuthorProps = {
	user: Partial<User>; // Accept partial user object
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
			<Link to={`/profile/${user?.username}` || '#'} className="flex items-center gap-2 group">
				<AvatarFrame avatarUrl={avatarUrl} frame={identity?.avatarFrame} size={getAvatarPx()} />

				<div className="flex flex-col">
					<div className="flex items-center gap-1.5">
						<UserName 
							username={user?.username || 'Unknown'} 
							className={getUsernameSizeClass()}
							isVerified={user?.isVerified}
							userId={user?.id}
							userRole={user?.role}
						/>
						{showLevelBadge && (identity?.levelConfig || identity?.level) && (
							<LevelBadge levelConfig={identity?.levelConfig} level={identity?.level} />
						)}
					</div>
				</div>
			</Link>
		</div>
	);
}
