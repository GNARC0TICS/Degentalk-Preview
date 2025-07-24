import React, { ReactNode, useState, useEffect } from 'react';
import { ShoutboxProvider } from './shoutbox-context';
import { MockShoutboxProvider } from './mock-shoutbox-context';
import { IS_PRODUCTION } from '@app/constants/env';
import { logger } from '@app/lib/logger";

interface SafeShoutboxProviderProps {
	children: ReactNode;
}

/**
 * A wrapper around ShoutboxProvider that provides enhanced error handling
 * and ensures proper WebSocket initialization
 */
export function SafeShoutboxProvider({ children }: SafeShoutboxProviderProps) {
	const [hasError, setHasError] = useState(false);

	// In development mode, always use the mock provider to avoid WebSocket issues
	if (!IS_PRODUCTION) {
		return <MockShoutboxProvider>{children}</MockShoutboxProvider>;
	}

	// React Error Boundary is class-based, so we're using try/catch and state for functional components
	try {
		if (hasError) {
			return <MockShoutboxProvider>{children}</MockShoutboxProvider>;
		}

		// Error handler for runtime errors
		const handleError = (error: Error) => {
			logger.error('SafeShoutboxProvider', 'Error in ShoutboxProvider:', error);
			setHasError(true);
		};

		// Try to use the real shoutbox provider with error handling
		return (
			<ErrorCatcher onError={handleError}>
				<ShoutboxProvider>{children}</ShoutboxProvider>
			</ErrorCatcher>
		);
	} catch (error) {
		logger.error('SafeShoutboxProvider', 'Error initializing ShoutboxProvider:', error);
		return <MockShoutboxProvider>{children}</MockShoutboxProvider>;
	}
}

// Simple error boundary wrapper for functional components
function ErrorCatcher({
	children,
	onError
}: {
	children: ReactNode;
	onError: (error: Error) => void;
}) {
	useEffect(() => {
		const handler = (event: ErrorEvent) => {
			event.preventDefault();
			onError(event.error);
		};

		window.addEventListener('error', handler);
		return () => window.removeEventListener('error', handler);
	}, [onError]);

	return <>{children}</>;
}
