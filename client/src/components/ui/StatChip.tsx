import { ReactNode, useState, useEffect } from 'react';
import type { LucideProps } from 'lucide-react';
import { useAnimatedNumber } from '@/lib/utils/animateNumber';
import type { ComponentType } from 'react';

// Local alias to avoid value import
type LucideIcon = ComponentType<LucideProps>;

export interface StatChipProps {
	icon?: LucideIcon;
	value: number;
	label: string;
	accent?: string;
	size?: 'sm' | 'md';
	isAnimating?: boolean;
	animate?: boolean;
	className?: string;
	children?: ReactNode;
}

/**
 * StatChip - A reusable component for displaying statistics with glass morphism effects
 *
 * Can be used anywhere stats need to be displayed: forum listings, thread headers, profiles, etc.
 */
export function StatChip({
	icon: Icon,
	value,
	label,
	accent = '#10b981',
	size = 'sm',
	isAnimating = false,
	animate = true,
	className = '',
	children
}: StatChipProps) {
	const sizeClasses = {
		sm: 'px-3 py-1 text-xs',
		md: 'px-4 py-1.5 text-sm'
	};

	const [prevValue, setPrevValue] = useState(value);

	const displayValue = animate ? useAnimatedNumber(value, { immediate: prevValue === 0 }) : value;

	useEffect(() => {
		setPrevValue(value);
	}, [value]);

	return (
		<div
			className={`bg-zinc-900/60 backdrop-blur-sm rounded-full border border-zinc-800 flex items-center gap-1.5 
        ${sizeClasses[size]} ${className}`}
		>
			{Icon && (
				<Icon className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} style={{ color: accent }} />
			)}
			<span className={`${isAnimating ? 'animate-pulse' : ''} transition-all`}>
				{typeof displayValue === 'number' ? displayValue.toLocaleString() : displayValue}
			</span>
			<span className="text-zinc-400 ml-0.5">{label}</span>
			{children}
		</div>
	);
}
