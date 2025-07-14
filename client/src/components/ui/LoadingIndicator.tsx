import React from 'react';
import { Loader2, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIConfig } from '@/contexts/UIConfigContext';

interface LoadingIndicatorProps {
	/** Loading message to display */
	message?: string;
	/** Size override (will use config if not provided) */
	size?: 'sm' | 'md' | 'lg';
	/** Style override (will use config if not provided) */
	style?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
	/** Whether to show message (will use config if not provided) */
	showMessage?: boolean;
	/** Additional CSS classes */
	className?: string;
	/** Center the loading indicator */
	centered?: boolean;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
	message,
	size: sizeProp,
	style: styleProp,
	showMessage: showMessageProp,
	className,
	centered = false
}) => {
	const { components } = useUIConfig();
	const { loaders } = components;

	// Use props or fall back to configuration
	const size = sizeProp || loaders.size;
	const style = styleProp || loaders.style;
	const showMessage = showMessageProp ?? loaders.showMessage;

	// Size classes
	const sizeClasses = {
		sm: 'w-4 h-4',
		md: 'w-6 h-6',
		lg: 'w-8 h-8'
	};

	const textSizeClasses = {
		sm: 'text-xs',
		md: 'text-sm',
		lg: 'text-base'
	};

	const iconSize = sizeClasses[size];
	const textSize = textSizeClasses[size];

	const renderLoader = () => {
		switch (style) {
			case 'spinner':
				return <Loader2 className={cn('animate-spin text-zinc-400', iconSize)} />;

			case 'dots':
				return (
					<div className="flex space-x-1">
						{[0, 1, 2].map((i) => (
							<div
								key={i}
								className={cn(
									'bg-zinc-400 rounded-full animate-pulse',
									size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-1.5 h-1.5' : 'w-2 h-2'
								)}
								style={{
									animationDelay: `${i * 0.2}s`,
									animationDuration: '1.4s'
								}}
							/>
						))}
					</div>
				);

			case 'pulse':
				return <div className={cn('bg-zinc-700 rounded animate-pulse', iconSize)} />;

			case 'skeleton':
				return (
					<div className="space-y-2 animate-pulse">
						<div className="bg-zinc-700 h-4 rounded w-3/4" />
						<div className="bg-zinc-700 h-4 rounded w-1/2" />
						<div className="bg-zinc-700 h-4 rounded w-5/6" />
					</div>
				);

			default:
				return <MoreHorizontal className={cn('animate-pulse text-zinc-400', iconSize)} />;
		}
	};

	const content = (
		<div
			className={cn(
				'flex items-center gap-2',
				centered && 'justify-center',
				style === 'skeleton' && 'flex-col items-start gap-0',
				className
			)}
		>
			{renderLoader()}
			{showMessage && message && style !== 'skeleton' && (
				<span className={cn('text-zinc-400 animate-pulse', textSize)}>{message}</span>
			)}
		</div>
	);

	if (centered) {
		return <div className="flex items-center justify-center min-h-32">{content}</div>;
	}

	return content;
};

// Preset components for common use cases
export const SpinnerLoader: React.FC<Omit<LoadingIndicatorProps, 'style'>> = (props) => (
	<LoadingIndicator {...props} style="spinner" />
);

export const DotsLoader: React.FC<Omit<LoadingIndicatorProps, 'style'>> = (props) => (
	<LoadingIndicator {...props} style="dots" />
);

export const PulseLoader: React.FC<Omit<LoadingIndicatorProps, 'style'>> = (props) => (
	<LoadingIndicator {...props} style="pulse" />
);

export const SkeletonLoader: React.FC<Omit<LoadingIndicatorProps, 'style'>> = (props) => (
	<LoadingIndicator {...props} style="skeleton" />
);

// Page-level loading component
export const PageLoader: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
	<div className="flex items-center justify-center min-h-screen">
		<LoadingIndicator message={message} size="lg" centered />
	</div>
);

// Inline loading for buttons
export const ButtonLoader: React.FC<{ className?: string }> = ({ className }) => (
	<LoadingIndicator size="sm" showMessage={false} className={className} />
);

export default LoadingIndicator;
