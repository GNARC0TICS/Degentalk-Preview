import React from 'react';
import { AlertTriangle, Settings, RefreshCw, Shield } from 'lucide-react';
import { Button } from '@app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@app/components/ui/card';
import { ErrorBoundary } from './ErrorBoundary';
import { logger } from '@app/lib/logger";

/**
 * Specialized Error Boundary for Admin operations
 * Provides context-aware error handling for administrative functions
 */

interface AdminErrorFallbackProps {
	error: Error;
	resetErrorBoundary: () => void;
	context?: string | undefined;
}

function AdminErrorFallback({ error, resetErrorBoundary, context }: AdminErrorFallbackProps) {
	const isPermissionError =
		error.message.includes('permission') || error.message.includes('unauthorized');
	const isDataError = error.message.includes('validation') || error.message.includes('invalid');

	return (
		<div className="p-6">
			<Card className="max-w-2xl mx-auto bg-red-950/10 border-red-800/30">
				<CardHeader>
					<div className="flex items-center gap-3">
						<div className="p-3 bg-red-600 rounded-full">
							<Shield className="w-6 h-6 text-white" />
						</div>
						<div>
							<CardTitle className="text-xl text-red-400">
								{isPermissionError
									? 'Permission Error'
									: isDataError
										? 'Data Validation Error'
										: 'Admin Operation Failed'}
							</CardTitle>
							{context && <p className="text-sm text-zinc-400 mt-1">Context: {context}</p>}
						</div>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="bg-zinc-900 p-4 rounded-lg">
						<h4 className="text-sm font-medium text-red-300 mb-2">Error Details:</h4>
						<p className="text-sm text-zinc-300 font-mono">{error.message}</p>
					</div>

					{isPermissionError && (
						<div className="bg-yellow-950/20 border border-yellow-800/30 p-4 rounded-lg">
							<h4 className="text-sm font-medium text-yellow-400 mb-2">Permission Issue:</h4>
							<p className="text-sm text-zinc-300">
								Your current role may not have sufficient permissions for this operation. Contact a
								system administrator if you believe this is an error.
							</p>
						</div>
					)}

					{isDataError && (
						<div className="bg-blue-950/20 border border-blue-800/30 p-4 rounded-lg">
							<h4 className="text-sm font-medium text-blue-400 mb-2">Data Validation:</h4>
							<p className="text-sm text-zinc-300">
								The data provided doesn't meet the required format or constraints. Please check your
								input and try again.
							</p>
						</div>
					)}

					<div className="flex gap-3 pt-2">
						<Button onClick={resetErrorBoundary} className="gap-2">
							<RefreshCw className="w-4 h-4" />
							Try Again
						</Button>
						<Button
							variant="outline"
							onClick={() => (window.location.href = '/admin')}
							className="gap-2"
						>
							<Settings className="w-4 h-4" />
							Admin Dashboard
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

interface AdminErrorBoundaryProps {
	children: React.ReactNode;
	context?: string | undefined;
}

export function AdminErrorBoundary({ children, context }: AdminErrorBoundaryProps) {
	return (
		<ErrorBoundary
			level="page"
			context={context}
			fallback={
				<AdminErrorFallback
					error={new Error('Admin component error')}
					resetErrorBoundary={() => {}}
					context={context}
				/>
			}
			onError={(error, errorInfo) => {
				// Enhanced logging for admin errors
				console.group('🔴 Admin Error');
				logger.error('AdminErrorBoundary', 'Error: ' + error.toString(), { context });
				logger.error('AdminErrorBoundary', 'Component Stack: ' + errorInfo.componentStack);
				console.groupEnd();

				// In production, send to admin error monitoring
				if (process.env.NODE_ENV === 'production') {
					// Example: sendToAdminErrorTracking(error, context, errorInfo);
				}
			}}
		>
			{children}
		</ErrorBoundary>
	);
}
