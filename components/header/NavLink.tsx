import React from 'react';
import { Link } from '@/lib/router-compat';
import { trackNavigation } from '@/config/navigation';

interface NavLinkProps {
	href: string;
	children: React.ReactNode;
	className?: string;
	prefetch?: boolean;
	analyticsLabel?: string;
	onClick?: () => void;
	'aria-label'?: string;
	disabled?: boolean;
}

export function NavLink({
	href,
	children,
	className,
	prefetch = false,
	analyticsLabel,
	onClick,
	'aria-label': ariaLabel,
	disabled = false,
	...props
}: NavLinkProps) {
	const handleClick = (e: React.MouseEvent) => {
		if (disabled) {
			e.preventDefault();
			return;
		}
		if (analyticsLabel) {
			trackNavigation(analyticsLabel, href);
		}
		onClick?.();
	};

	// If disabled, render a span instead of a Link
	if (disabled) {
		return (
			<span
				className={className}
				aria-label={ariaLabel}
				aria-disabled="true"
				{...props}
			>
				{children}
			</span>
		);
	}

	return (
		<Link
			href={href}
			className={className}
			onClick={handleClick}
			aria-label={ariaLabel}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					handleClick(e as any);
				}
			}}
			{...props}
		>
			{children}
		</Link>
	);
}
