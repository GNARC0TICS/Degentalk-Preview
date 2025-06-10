import React from 'react';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';

export interface NavItemProps {
	/** Icon component to display */
	icon?: React.ReactNode;
	/** Text label for the nav item */
	label: string;
	/** Link destination */
	href: string;
	/** Whether this item is currently active */
	isActive?: boolean;
	/** Optional notification badge number */
	badge?: number;
	/** Optional click handler */
	onClick?: () => void;
	/** Visual variant */
	variant?: 'default' | 'ghost' | 'subtle';
	/** Size variant */
	size?: 'sm' | 'md' | 'lg';
	/** Whether this is a mobile navigation item */
	isMobile?: boolean;
	/** Optional class name for additional styling */
	className?: string;
}

export function NavItem({
	icon,
	label,
	href,
	isActive = false,
	badge,
	onClick,
	variant = 'default',
	size = 'md',
	isMobile = false,
	className
}: NavItemProps) {
	// Size-related classes
	const sizeClasses = {
		sm: 'text-xs py-1 px-2',
		md: 'text-sm py-2 px-3',
		lg: 'text-base py-2.5 px-4'
	};

	// Variant-related classes
	const variantClasses = {
		default: isActive
			? 'bg-zinc-800 text-white'
			: 'text-zinc-300 hover:bg-zinc-800 hover:text-white',
		ghost: isActive ? 'text-white' : 'text-zinc-300 hover:text-white',
		subtle: isActive
			? 'bg-zinc-800/50 text-white'
			: 'text-zinc-400 hover:bg-zinc-800/30 hover:text-zinc-200'
	};

	const classes = cn(
		// Base styles
		'rounded-md font-medium transition-colors flex items-center',
		// Responsive margin/padding
		isMobile ? 'justify-center w-full' : '',
		// Size and variant classes
		sizeClasses[size],
		variantClasses[variant],
		// Additional custom classes
		className
	);

	return (
		<Link href={href}>
			<a
				className={classes}
				onClick={(e) => {
					onClick?.();
				}}
			>
				{/* Conditionally render icon */}
				{icon && (
					<span
						className={cn(
							'flex-shrink-0',
							isMobile ? 'mr-0' : 'mr-2',
							`h-${size === 'sm' ? '4' : '5'} w-${size === 'sm' ? '4' : '5'}`
						)}
					>
						{icon}
					</span>
				)}

				{/* Text label - hidden on smallest mobile if specified */}
				<span className={cn(isMobile && size !== 'lg' ? 'sr-only sm:not-sr-only' : '')}>
					{label}
				</span>

				{/* Badge */}
				{badge !== undefined && badge > 0 && (
					<span className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
						{badge > 99 ? '99+' : badge}
					</span>
				)}
			</a>
		</Link>
	);
}
