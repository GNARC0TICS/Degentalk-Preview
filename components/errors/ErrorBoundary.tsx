'use client';

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { logger } from '@/lib/logger';

interface Props {
	children: ReactNode;
	fallback?: ReactNode | undefined;
	onError?: (error: Error, errorInfo: ErrorInfo) => void | undefined;
	level?: 'page' | 'component' | 'critical' | undefined;
	context?: string | undefined;
}

interface State {
	hasError: boolean;
	error: Error | null;
	errorInfo: ErrorInfo | null;
	eventId?: string | undefined;
}

/**
 * Comprehensive Error Boundary with different severity levels
 * and appropriate fallback UI for each context
 */
export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			hasError: false,
			error: null,
			errorInfo: null
		};
	}

	static getDerivedStateFromError(error: Error): Partial<State> {
		return {
			hasError: true,
			error
		};
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		logger.error('ErrorBoundary', 'ErrorBoundary caught an error:', { data: [error, errorInfo] });

		// Log to external service in production
		this.logErrorToService(error, errorInfo);

		// Call custom error handler if provided
		this.props.onError?.(error, errorInfo);

		this.setState({
			error,
			errorInfo,
			eventId: this.generateEventId()
		});
	}

	private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
		// Log error details
		logger.error('ErrorBoundary', '🚨 Error Boundary Report', {
			error: error.toString(),
			componentStack: errorInfo.componentStack,
			context: this.props.context || 'Unknown',
			timestamp: new Date().toISOString()
		});
	};

	private generateEventId = (): string => {
		// In production, use Sentry's event ID
		if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined' && (window as any).Sentry) {
			return (window as any).Sentry.lastEventId() || `error_${Date.now()}`;
		}
		return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	};

	private handleRetry = () => {
		this.setState({
			hasError: false,
			error: null,
			errorInfo: null,
			eventId: undefined
		});
	};

	private handleReload = () => {
		window.location.reload();
	};

	private handleGoHome = () => {
		window.location.href = '/';
	};

	private renderFallbackUI = () => {
		const { level = 'component', context } = this.props;
		const { error, eventId } = this.state;

		// Critical level - full page error
		if (level === 'critical') {
			return (
				<div className="min-h-screen bg-black flex items-center justify-center p-4">
					<Card className="max-w-lg w-full bg-red-950/20 border-red-800">
						<CardHeader className="text-center">
							<div className="mx-auto w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mb-4">
								<AlertTriangle className="w-8 h-8 text-white" />
							</div>
							<CardTitle className="text-2xl text-red-400">Critical Error</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4 text-center">
							<p className="text-zinc-300">
								A critical error occurred that prevents the application from running.
							</p>
							<details className="text-left">
								<summary className="cursor-pointer text-sm text-zinc-400 hover:text-zinc-300">
									Error Details
								</summary>
								<div className="mt-2 p-3 bg-zinc-900 rounded text-xs text-red-300 font-mono">
									<div>Error: {error?.message}</div>
									{eventId && <div>Event ID: {eventId}</div>}
									{context && <div>Context: {context}</div>}
								</div>
							</details>
							<div className="flex gap-2 justify-center">
								<Button onClick={this.handleReload} variant="outline" className="gap-2">
									<RefreshCw className="w-4 h-4" />
									Reload App
								</Button>
								<Button onClick={this.handleGoHome} className="gap-2">
									<Home className="w-4 h-4" />
									Go Home
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			);
		}

		// Page level error
		if (level === 'page') {
			return (
				<div className="min-h-96 flex items-center justify-center p-8">
					<Card className="max-w-md w-full bg-orange-950/20 border-orange-800">
						<CardHeader className="text-center">
							<div className="mx-auto w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center mb-3">
								<Bug className="w-6 h-6 text-white" />
							</div>
							<CardTitle className="text-lg text-orange-400">Page Error</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3 text-center">
							<p className="text-sm text-zinc-300">
								This page encountered an error and couldn't load properly.
							</p>
							{context && <p className="text-xs text-zinc-400">Context: {context}</p>}
							<div className="flex gap-2 justify-center">
								<Button size="sm" onClick={this.handleRetry} variant="outline" className="gap-2">
									<RefreshCw className="w-3 h-3" />
									Retry
								</Button>
								<Button size="sm" onClick={this.handleGoHome} className="gap-2">
									<Home className="w-3 h-3" />
									Home
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			);
		}

		// Component level error (minimal fallback)
		return (
			<div className="p-4 border border-yellow-800 bg-yellow-950/20 rounded-lg">
				<div className="flex items-center gap-2 text-yellow-400 mb-2">
					<AlertTriangle className="w-4 h-4" />
					<span className="text-sm font-medium">Component Error</span>
				</div>
				<p className="text-xs text-zinc-400 mb-3">
					This component failed to render. {context && `(${context})`}
				</p>
				<Button size="sm" onClick={this.handleRetry} variant="outline" className="gap-1">
					<RefreshCw className="w-3 h-3" />
					Retry
				</Button>
			</div>
		);
	};

	render() {
		if (this.state.hasError) {
			// Use custom fallback if provided
			if (this.props.fallback) {
				return this.props.fallback;
			}

			// Use contextual fallback UI
			return this.renderFallbackUI();
		}

		return this.props.children;
	}
}

/**
 * Higher-order component for wrapping components with error boundaries
 */
export function withErrorBoundary<P extends object>(
	Component: React.ComponentType<P>,
	errorBoundaryConfig?: Partial<Props>
) {
	const WrappedComponent = (props: P) => (
		<ErrorBoundary {...errorBoundaryConfig}>
			<Component {...props} />
		</ErrorBoundary>
	);

	WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

	return WrappedComponent;
}

/**
 * Hook for imperatively triggering error boundaries
 */
export function useErrorHandler() {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	return React.useCallback((error: Error, _errorInfo?: Partial<ErrorInfo>) => {
		// Throw error to be caught by nearest error boundary
		throw error;
	}, []);
}
