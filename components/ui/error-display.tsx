import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ErrorDisplayProps {
	title?: string;
	message?: string;
	error?: Error | unknown; // Can pass an actual error object
	onRetry?: () => void;
	variant?: 'default' | 'inline' | 'card';
	className?: string;
}

export function ErrorDisplay({
	title = 'An Error Occurred',
	message,
	error,
	onRetry,
	variant = 'default',
	className
}: ErrorDisplayProps) {
	// Extract message from error object if provided and no specific message is set
	const errorMessage =
		message || (error instanceof Error ? error.message : 'Please try again later.');

	const content = (
		<Alert variant="destructive" className={cn(variant === 'inline' && 'border-0 p-0', className)}>
			<AlertCircle className="h-4 w-4" />
			<AlertTitle>{title}</AlertTitle>
			<AlertDescription className="mt-1">{errorMessage}</AlertDescription>
			{onRetry && (
				<Button variant="destructive" size="sm" onClick={onRetry} className="mt-3">
					<RefreshCw className="mr-2 h-4 w-4" />
					Retry
				</Button>
			)}
		</Alert>
	);

	if (variant === 'card') {
		return (
			<div className={cn('border border-red-900/50 bg-red-950/30 rounded-lg p-4', className)}>
				{content}
			</div>
		);
	}

	return content;
}
