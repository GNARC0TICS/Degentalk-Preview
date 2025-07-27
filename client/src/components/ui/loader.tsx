import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/utils';

interface LoadingSpinnerProps {
	size?: 'sm' | 'md' | 'lg' | 'xl';
	color?: 'emerald' | 'cyan' | 'purple' | 'amber' | 'zinc';
	className?: string;
	text?: string; // Optional text to display next to the spinner
}

export function LoadingSpinner({
	size = 'md',
	color = 'emerald',
	className,
	text
}: LoadingSpinnerProps) {
	const sizeClasses = {
		sm: 'h-4 w-4',
		md: 'h-6 w-6',
		lg: 'h-8 w-8',
		xl: 'h-12 w-12'
	};

	const colorClasses = {
		emerald: 'text-emerald-500',
		cyan: 'text-cyan-500',
		purple: 'text-purple-500',
		amber: 'text-amber-500',
		zinc: 'text-zinc-500'
	};

	if (text) {
		return (
			<div className={cn('flex items-center', className)}>
				<Loader2 className={cn('animate-spin mr-2', sizeClasses[size], colorClasses[color])} />
				<span className={cn('text-sm', colorClasses[color])}>{text}</span>
			</div>
		);
	}

	return (
		<Loader2 className={cn('animate-spin', sizeClasses[size], colorClasses[color], className)} />
	);
}
