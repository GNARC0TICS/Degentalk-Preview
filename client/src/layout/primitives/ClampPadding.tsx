import React from 'react';
import { cn } from '@/utils/utils';

interface ClampPaddingProps extends React.HTMLAttributes<HTMLDivElement> {
	as?: keyof JSX.IntrinsicElements;
	min?: string; // e.g. '1rem'
	ideal?: string; // e.g. '4vw'
	max?: string; // e.g. '3rem'
}

export const ClampPadding: React.FC<ClampPaddingProps> = ({
	children,
	as: Component = 'div',
	className = '',
	min = '1rem',
	ideal = '4vw',
	max = '3rem',
	style,
	...props
}) => {
	return (
		<Component
			{...props}
			style={{ paddingInline: `clamp(${min},${ideal},${max})`, ...style }}
			className={cn(className)}
		>
			{children}
		</Component>
	);
};
