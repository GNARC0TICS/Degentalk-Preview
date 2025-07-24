import React from 'react';
import { cn } from '@app/utils/utils';

interface OnlineIndicatorProps {
	isOnline?: boolean;
	size?: 'xs' | 'sm' | 'md' | 'lg';
	className?: string;
	showOffline?: boolean;
	position?: 'inline' | 'absolute-bottom-right' | 'absolute-top-right';
}

export function OnlineIndicator({ 
	isOnline = false, 
	size = 'sm',
	className,
	showOffline = false,
	position = 'inline'
}: OnlineIndicatorProps) {
	// If offline and showOffline is false, don't render
	if (!isOnline && !showOffline) {
		return null;
	}

	const sizeClasses = {
		xs: 'w-1.5 h-1.5',
		sm: 'w-2 h-2',
		md: 'w-3 h-3',
		lg: 'w-4 h-4'
	};

	const positionClasses = {
		inline: 'inline-block',
		'absolute-bottom-right': 'absolute bottom-0 right-0',
		'absolute-top-right': 'absolute top-0 right-0'
	};

	return (
		<span
			className={cn(
				'rounded-full',
				sizeClasses[size],
				positionClasses[position],
				isOnline ? 'bg-green-500 animate-pulse' : 'bg-zinc-600',
				position !== 'inline' && 'ring-2 ring-zinc-900',
				className
			)}
			title={isOnline ? 'Online' : 'Offline'}
		/>
	);
}

// Wrapper component for avatar with online indicator
interface AvatarWithOnlineProps {
	children: React.ReactNode;
	isOnline?: boolean;
	size?: 'xs' | 'sm' | 'md' | 'lg';
	showOffline?: boolean;
}

export function AvatarWithOnline({ 
	children, 
	isOnline = false,
	size = 'sm',
	showOffline = false 
}: AvatarWithOnlineProps) {
	return (
		<div className="relative inline-block">
			{children}
			<OnlineIndicator 
				isOnline={isOnline} 
				size={size}
				showOffline={showOffline}
				position="absolute-bottom-right"
			/>
		</div>
	);
}