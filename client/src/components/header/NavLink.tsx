import React from 'react';
import { Link } from 'react-router-dom';
import { trackNavigation } from '@/config/navigation';

interface NavLinkProps {
	href: string;
	children: React.ReactNode;
	className?: string;
	prefetch?: boolean;
	analyticsLabel?: string;
	onClick?: () => void;
	'aria-label'?: string;
}

export function NavLink({
	href,
	children,
	className,
	prefetch = false,
	analyticsLabel,
	onClick,
	'aria-label': ariaLabel,
	...props
}: NavLinkProps) {
	const handleClick = () => {
		if (analyticsLabel) {
			trackNavigation(analyticsLabel, href);
		}
		onClick?.();
	};

	return (
		<Link
			to={href}
			className={className}
			onClick={handleClick}
			aria-label={ariaLabel}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					handleClick();
				}
			}}
			{...props}
		>
			{children}
		</Link>
	);
}
