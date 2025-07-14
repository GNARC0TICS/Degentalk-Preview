import React from 'react';
import { LoadingSpinner } from '@/components/ui/loader';
import { brandConfig } from '@/config/brand.config';
import { cn } from '@/utils/utils';

interface LoadingCardProps {
	title: string;
	size?: 'sm' | 'md' | 'lg' | 'xl';
	className?: string;
	variant?: 'card' | 'inline' | 'full';
}

export function LoadingCard({
	title,
	size = 'lg',
	className = '',
	variant = 'card'
}: LoadingCardProps) {
	if (variant === 'inline') {
		return (
			<div className={cn('flex items-center justify-center py-4', className)}>
				<LoadingSpinner size={size} color="emerald" />
				<p className={cn('ml-3', brandConfig.loading.message.className)}>
					{brandConfig.loading.message.prefix} {title}...
				</p>
			</div>
		);
	}

	if (variant === 'full') {
		return (
			<div
				className={cn(
					'flex flex-col items-center justify-center min-h-[400px] space-y-4',
					className
				)}
			>
				<LoadingSpinner size="xl" color="emerald" />
				<p className={brandConfig.loading.message.className}>
					{brandConfig.loading.message.prefix} {title}...
				</p>
			</div>
		);
	}

	// Card variant (default)
	return (
		<div
			className={cn(
				brandConfig.cards.default.background,
				brandConfig.cards.default.border,
				'rounded-lg p-6 flex flex-col items-center justify-center min-h-[200px]',
				brandConfig.spacing.stack.sm,
				className
			)}
		>
			<LoadingSpinner size={size} color="emerald" />
			<p className={brandConfig.loading.message.className}>
				{brandConfig.loading.message.prefix} {title}...
			</p>
		</div>
	);
}
