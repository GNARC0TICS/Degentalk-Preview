import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@app/components/ui/card';
import { Wide } from '@app/layout/primitives';
import { Button } from '@app/components/ui/button';
import { ErrorBoundary } from '@app/components/errors/ErrorBoundary';
import { logger } from '@app/lib/logger";

interface FallbackProps {
	error: Error;
	resetErrorBoundary: () => void;
}

function ForumErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
	return (
		<Wide className="py-12 flex justify-center">
			<Card className="max-w-lg w-full bg-red-900/30 border-red-800 text-red-200">
				<CardHeader>
					<CardTitle>Something went wrong</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<p className="text-sm break-all">{error.message}</p>
					<Button onClick={resetErrorBoundary} variant="outline">
						Retry
					</Button>
				</CardContent>
			</Card>
		</Wide>
	);
}

export default function ForumErrorBoundary({ children }: { children: React.ReactNode }) {
	return (
		<ErrorBoundary
			fallback={
				<ForumErrorFallback
					error={new Error()}
					resetErrorBoundary={() => window.location.reload()}
				/>
			}
			onError={(error, errorInfo) => {
				// Log error details for debugging
				if (error.message) {
					logger.debug('ForumErrorBoundary', 'Forum error details:', { data: [{ error: error.message, errorInfo }] });
				}
			}}
			context="forum"
		>
			{children}
		</ErrorBoundary>
	);
}
