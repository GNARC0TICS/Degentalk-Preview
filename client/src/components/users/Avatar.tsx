import React from 'react';
import { cn } from '@/lib/utils';
import { FramedAvatar } from './framed-avatar';
import { useUserCosmetics } from '@/hooks/useUserCosmetics';

interface AvatarProps {
	avatarUrl: string | null;
	username: string;
	size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
	shape?: 'circle' | 'square';
	className?: string;
	frameClassName?: string;
	showFrame?: boolean;
	userId?: string;
}

/**
 * Avatar component that automatically applies cosmetic avatar frames from user inventory
 */
export function Avatar({
	avatarUrl,
	username,
	size = 'md',
	shape = 'circle',
	className,
	frameClassName,
	showFrame = true,
	userId
}: AvatarProps) {
	const { cosmetics, isLoading: isLoadingCosmetics } = useUserCosmetics();

	if (isLoadingCosmetics) {
		return (
			<FramedAvatar
				avatarUrl={avatarUrl}
				frameUrl={null}
				username={username}
				size={size}
				shape={shape}
				className={className}
				frameClassName={frameClassName}
			/>
		);
	}

	const frameUrl = showFrame ? cosmetics.avatarFrameUrl : null;

	return (
		<FramedAvatar
			avatarUrl={avatarUrl}
			frameUrl={frameUrl || null}
			username={username}
			size={size}
			shape={shape}
			className={className}
			frameClassName={frameClassName}
		/>
	);
}

// Export a simple avatar without cosmetics for performance-critical lists
export function SimpleAvatar({
	avatarUrl,
	username,
	size = 'md',
	shape = 'circle',
	className
}: Omit<AvatarProps, 'userInventory' | 'frameClassName' | 'showFrame' | 'userId'>) {
	// Size classes for the avatar container
	const sizeClasses = {
		xs: 'h-8 w-8',
		sm: 'h-10 w-10',
		md: 'h-12 w-12',
		lg: 'h-16 w-16',
		xl: 'h-24 w-24'
	};

	// Font size for initials fallback
	const fallbackSize = {
		xs: 'text-xs',
		sm: 'text-sm',
		md: 'text-base',
		lg: 'text-xl',
		xl: 'text-2xl'
	};

	// Get initials from username for fallback
	const initials = username?.charAt(0)?.toUpperCase() || '?';

	// Default avatar path
	const defaultAvatarPath = '/images/ART/defaultavatar.png';

	return (
		<div
			className={cn(
				'relative overflow-hidden bg-slate-800 flex items-center justify-center',
				sizeClasses[size],
				shape === 'circle' ? 'rounded-full' : 'rounded-md',
				className
			)}
		>
			{avatarUrl ? (
				<img src={avatarUrl} alt={`${username}'s avatar`} className="w-full h-full object-cover" />
			) : (
				<img
					src={defaultAvatarPath}
					alt={`${username}'s avatar`}
					className="w-full h-full object-cover"
					onError={(e) => {
						e.currentTarget.style.display = 'none';
						const parent = e.currentTarget.parentElement;
						if (parent) {
							const span = document.createElement('span');
							span.className = cn('font-bold text-slate-200', fallbackSize[size]);
							span.textContent = initials;
							parent.appendChild(span);
						}
					}}
				/>
			)}
		</div>
	);
}
