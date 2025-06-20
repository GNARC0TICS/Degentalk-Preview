import React from 'react';
import { Link } from 'wouter';
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
		<Link href={href} {...props}>
			<div
				className={className}
				onClick={handleClick}
				aria-label={ariaLabel}
				role="link"
				tabIndex={0}
				onKeyDown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						handleClick();
					}
				}}
			>
				{children}
			</div>
		</Link>
	);
}
