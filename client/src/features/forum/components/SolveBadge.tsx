import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

interface SolveBadgeProps {
	size?: 'sm' | 'md' | 'lg';
	className?: string;
}

export function SolveBadge({ size = 'md', className = '' }: SolveBadgeProps) {
	// Configure size props
	const sizeProps = {
		sm: {
			badgeClasses: 'px-1.5 py-0.5 text-xs',
			iconSize: 'h-3 w-3 mr-1'
		},
		md: {
			badgeClasses: 'px-2 py-1 text-sm',
			iconSize: 'h-3.5 w-3.5 mr-1.5'
		},
		lg: {
			badgeClasses: 'px-2.5 py-1 text-base',
			iconSize: 'h-4 w-4 mr-2'
		}
	};

	const { badgeClasses, iconSize } = sizeProps[size];

	return (
		<Badge
			className={`bg-emerald-900/60 text-emerald-300 border-emerald-700/30 ${badgeClasses} ${className}`}
		>
			<Check className={iconSize} />
			Solved
		</Badge>
	);
}

export default SolveBadge;
