import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, AlertCircle, Wifi } from 'lucide-react';
import { Button } from '@app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@app/components/ui/card';
import { Alert, AlertDescription } from '@app/components/ui/alert';
import { logger } from '@app/lib/logger';

interface NetworkErrorProps {
	onRetry: () => void;
	error?: Error;
	autoRetry?: boolean;
	maxRetries?: number;
	retryDelay?: number;
}

export function NetworkError({
	onRetry,
	error,
	autoRetry = true,
	maxRetries = 3,
	retryDelay = 5000
}: NetworkErrorProps) {
	const [isRetrying, setIsRetrying] = useState(false);
	const [retryCount, setRetryCount] = useState(0);
	const [isOnline, setIsOnline] = useState(navigator.onLine);
	const [countdown, setCountdown] = useState(0);

	// Monitor online status
	useEffect(() => {
		const handleOnline = () => setIsOnline(true);
		const handleOffline = () => setIsOnline(false);

		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);

		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
		};
	}, []);

	// Auto-retry mechanism
	useEffect(() => {
		if (!autoRetry || !isOnline || retryCount >= maxRetries) return;

		const timer = setTimeout(() => {
			handleRetry();
		}, retryDelay);

		return () => clearTimeout(timer);
	}, [autoRetry, isOnline, retryCount, maxRetries, retryDelay]);

	// Countdown for next retry
	useEffect(() => {
		if (!autoRetry || !isOnline || retryCount >= maxRetries) return;

		setCountdown(Math.ceil(retryDelay / 1000));
		const interval = setInterval(() => {
			setCountdown((prev) => {
				if (prev <= 1) {
					clearInterval(interval);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(interval);
	}, [retryCount, autoRetry, isOnline, maxRetries, retryDelay]);

	const handleRetry = async () => {
		setIsRetrying(true);
		setRetryCount((prev) => prev + 1);

		try {
			await onRetry();
		} catch (err) {
			logger.error('NetworkError', 'Retry failed:', err);
		} finally {
			setIsRetrying(false);
		}
	};

	const getErrorMessage = () => {
		if (!isOnline) {
			return "You're currently offline. Please check your internet connection.";
		}

		if (error?.message?.includes('Failed to fetch')) {
			return 'Unable to connect to the server. This might be a temporary issue.';
		}

		if (error?.message?.includes('timeout')) {
			return 'The request timed out. The server might be busy or your connection is slow.';
		}

		return error?.message || 'An unexpected network error occurred.';
	};

	const getRetryMessage = () => {
		if (!isOnline) {
			return 'Waiting for internet connection...';
		}

		if (retryCount >= maxRetries) {
			return `Maximum retry attempts (${maxRetries}) reached.`;
		}

		if (autoRetry && countdown > 0) {
			return `Retrying automatically in ${countdown} seconds...`;
		}

		return null;
	};

	return (
		<div className="min-h-[40vh] flex items-center justify-center p-4">
			<Card className="w-full max-w-md bg-zinc-900/80 border-zinc-800">
				<CardHeader className="text-center">
					<div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
						{isOnline ? (
							<AlertCircle className="h-8 w-8 text-red-500" />
						) : (
							<WifiOff className="h-8 w-8 text-red-500" />
						)}
					</div>
					<CardTitle className="text-xl text-white">
						{isOnline ? 'Connection Problem' : "You're Offline"}
					</CardTitle>
				</CardHeader>

				<CardContent className="space-y-4">
					{/* Connection Status */}
					<div className="flex items-center justify-center gap-2 text-sm">
						{isOnline ? (
							<>
								<Wifi className="h-4 w-4 text-green-500" />
								<span className="text-green-500">Internet Connected</span>
							</>
						) : (
							<>
								<WifiOff className="h-4 w-4 text-red-500" />
								<span className="text-red-500">No Internet Connection</span>
							</>
						)}
					</div>

					{/* Error Message */}
					<Alert>
						<AlertCircle className="h-4 w-4" />
						<AlertDescription className="text-sm">{getErrorMessage()}</AlertDescription>
					</Alert>

					{/* Retry Information */}
					{getRetryMessage() && (
						<div className="text-center text-sm text-zinc-400">{getRetryMessage()}</div>
					)}

					{/* Progress indicator for auto-retry */}
					{autoRetry && isOnline && retryCount < maxRetries && countdown > 0 && (
						<div className="w-full bg-zinc-800 rounded-full h-2">
							<div
								className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
								style={{
									width: `${((retryDelay / 1000 - countdown) / (retryDelay / 1000)) * 100}%`
								}}
							/>
						</div>
					)}

					{/* Retry Button */}
					<div className="flex flex-col gap-2">
						<Button
							onClick={handleRetry}
							disabled={isRetrying || (!isOnline && retryCount < maxRetries)}
							className="w-full gap-2"
							variant={isOnline ? 'default' : 'outline'}
						>
							<RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
							{isRetrying ? 'Retrying...' : 'Try Again'}
						</Button>

						{retryCount > 0 && (
							<div className="text-center text-xs text-zinc-500">
								Attempt {retryCount} of {maxRetries}
							</div>
						)}
					</div>

					{/* Helpful Tips */}
					{!isOnline && (
						<div className="bg-zinc-800/30 rounded-lg p-3 border border-zinc-700/50">
							<h4 className="text-sm font-medium text-white mb-2">Troubleshooting Tips:</h4>
							<ul className="text-xs text-zinc-400 space-y-1">
								<li>• Check your WiFi or mobile data connection</li>
								<li>• Try moving to an area with better signal</li>
								<li>• Restart your router or toggle airplane mode</li>
								<li>• Contact your internet service provider if issues persist</li>
							</ul>
						</div>
					)}

					{isOnline && retryCount >= maxRetries && (
						<div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
							<h4 className="text-sm font-medium text-amber-400 mb-2">Still having trouble?</h4>
							<p className="text-xs text-amber-300/80">
								The issue might be on our end. Please try again in a few minutes or contact support
								if the problem persists.
							</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
