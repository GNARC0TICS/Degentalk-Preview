import { cn } from '@app/utils/utils';
import { ReactNode } from 'react';

interface ContainerProps {
	children: ReactNode;
	className?: string;
	size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
	padding?: 'none' | 'sm' | 'md' | 'lg';
}

const containerSizes = {
	sm: 'max-w-3xl',
	md: 'max-w-5xl',
	lg: 'max-w-7xl',
	xl: 'max-w-screen-xl',
	full: 'max-w-full'
};

const containerPadding = {
	none: '',
	sm: 'px-2 py-4',
	md: 'px-4 py-6',
	lg: 'px-4 py-8 md:py-12'
};

export function Container({ children, className, size = 'lg', padding = 'md' }: ContainerProps) {
	return (
		<div
			className={cn(
				'container mx-auto',
				containerSizes[size],
				containerPadding[padding],
				className
			)}
		>
			{children}
		</div>
	);
}
