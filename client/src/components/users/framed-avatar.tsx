import React from 'react';
import { cn } from '@/lib/utils';

type FramedAvatarProps = {
	avatarUrl: string | null;
	frameUrl: string | null;
	username: string;
	size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
	shape?: 'circle' | 'square';
	className?: string;
	frameClassName?: string;
};

/**
 * FramedAvatar component for displaying user avatars with optional decorative frames
 *
 * This component handles both circle (default) and square avatar shapes
 * Follows the design guideline of having frames wrap around avatars
 */
export function FramedAvatar({
	avatarUrl,
	frameUrl,
	username,
	size = 'md',
	shape = 'circle',
	className,
	frameClassName
}: FramedAvatarProps) {
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

	// Calculate frame size (slightly larger than avatar)
	const frameSizeClasses = {
		xs: 'h-10 w-10', // +2px
		sm: 'h-12 w-12', // +2px
		md: 'h-14 w-14', // +2px
		lg: 'h-[72px] w-[72px]', // +8px
		xl: 'h-[108px] w-[108px]' // +12px
	};

	return (
		<div data-testid="framed-avatar" className={cn('relative inline-block', className)}>
			{/* Frame (if available) */}
			{frameUrl && (
				<img
					src={frameUrl}
					alt="Avatar frame"
					className={cn(
						'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none',
						frameSizeClasses[size],
						frameClassName
					)}
				/>
			)}

			{/* Avatar */}
			<div
				className={cn(
					'relative overflow-hidden bg-slate-800 flex items-center justify-center z-0',
					sizeClasses[size],
					shape === 'circle' ? 'rounded-full' : 'rounded-md'
				)}
			>
				{avatarUrl ? (
					<img
						src={avatarUrl}
						alt={`${username}'s avatar`}
						className="w-full h-full object-cover"
					/>
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
		</div>
	);
}
