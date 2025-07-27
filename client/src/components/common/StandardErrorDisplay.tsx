import React from 'react';
import { ErrorDisplay } from '@/components/ui/error-display';
import { brandConfig } from '@/config/brand.config';

interface StandardErrorDisplayProps {
	title?: string;
	message?: string;
	error?: Error | unknown;
	onRetry?: () => void;
	variant?: 'card' | 'inline' | 'default';
	className?: string;
}

export function StandardErrorDisplay({
	title,
	message,
	error,
	onRetry,
	variant = 'card',
	className = ''
}: StandardErrorDisplayProps) {
	// Use brand config defaults if not provided
	const errorTitle = title || brandConfig.error.title;
	const errorMessage = message || 'Could not load content at this time.';

	return (
		<ErrorDisplay
			title={errorTitle}
			message={errorMessage}
			error={error}
			{...(onRetry && { onRetry })}
			variant={variant}
			className={className}
		/>
	);
}
