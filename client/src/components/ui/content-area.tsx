import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { TabSwitcher } from '@/components/ui/tab-switcher';
import { ContentFeed } from '@/components/ui/content-feed';
import { useAuth } from '@/hooks/use-auth';
import { useContentFeed } from '@/contexts/content-feed-context';
import { RefreshCw, Wifi, WifiOff, AlertCircle, RotateCcw } from 'lucide-react';
import type { ContentTab, UseContentParams } from '@/hooks/use-content';
import { useContent, useHomeContent, useForumContent } from '@/hooks/use-content';
import type { ForumId } from '@/db/types';

export interface ContentAreaProps {
	className?: string;
	forumId?: ForumId;
	initialTab?: ContentTab;
	showCategory?: boolean;
	variant?: 'default' | 'compact';
	title?: string;
	description?: string;
}

/**
 * Unified content area with tab switching and feed display
 * Automatically handles home vs forum content based on forumId prop
 */
export function ContentArea({
	className,
	forumId,
	initialTab = 'trending',
	showCategory = true,
	variant = 'default',
	title,
	description
}: ContentAreaProps) {
	const { isAuthenticated } = useAuth();
	const [isOnline, setIsOnline] = useState(navigator.onLine);
	const [lastRefresh, setLastRefresh] = useState(Date.now());
	const [isManualRefreshing, setIsManualRefreshing] = useState(false);
	const [pullDistance, setPullDistance] = useState(0);
	const [isPulling, setIsPulling] = useState(false);

	// Use ContentFeedContext if available for state synchronization
	let feedContext;
	try {
		feedContext = useContentFeed();
	} catch {
		feedContext = null; // Graceful fallback when not in provider
	}

	// Use appropriate hook based on whether forumId is provided
	const contentHook = forumId ? useForumContent(forumId, initialTab) : useHomeContent(initialTab);
	const { items, meta, activeTab, isLoading, error, isFetching, switchTab, refetch } = contentHook;

	// Sync with ContentFeedContext when available
	useEffect(() => {
		if (feedContext && !forumId && feedContext.activeTab !== activeTab) {
			// Only sync for home content, not forum-specific
			feedContext.setActiveTab(activeTab);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeTab, forumId]);

	// Update feed meta in context
	useEffect(() => {
		if (feedContext && !forumId) {
			feedContext.setFeedMeta({
				totalItems: meta.total,
				hasNewContent: false, // Will be set by pull-to-refresh
				lastRefresh: new Date()
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [meta.total, forumId]);

	// Update badge counts based on current content
	useEffect(() => {
		if (feedContext && !forumId && items.length > 0) {
			const recentCount = items.filter((item) => {
				const createdAt = new Date(item.createdAt);
				const hoursSinceCreated = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
				return hoursSinceCreated < 24; // Content from last 24 hours
			}).length;

			feedContext.setBadges({
				hotCount: activeTab === 'trending' ? items.length : 0,
				newCount: recentCount,
				followingActiveCount: activeTab === 'following' ? items.length : 0
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [items, activeTab, forumId]);

	// Network status monitoring
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

	// Smart auto-refresh when coming back online
	useEffect(() => {
		if (isOnline && Date.now() - lastRefresh > 60000) {
			// 1 minute threshold
			refetch();
			setLastRefresh(Date.now());
		}
	}, [isOnline, lastRefresh, refetch]);

	// Manual refresh handler
	const handleManualRefresh = async () => {
		setIsManualRefreshing(true);
		try {
			await refetch();
			setLastRefresh(Date.now());
		} finally {
			setTimeout(() => setIsManualRefreshing(false), 500); // Min animation time
		}
	};

	// Pull-to-refresh for mobile
	const handleTouchStart = (e: React.TouchEvent) => {
		if (e.touches.length === 1 && window.scrollY === 0) {
			setIsPulling(true);
		}
	};

	const handleTouchMove = (e: React.TouchEvent) => {
		if (isPulling && e.touches.length === 1) {
			const touch = e.touches[0];
			const distance = Math.max(0, touch.clientY - 100); // Start from 100px down
			setPullDistance(Math.min(distance, 80)); // Max 80px pull
		}
	};

	const handleTouchEnd = () => {
		if (isPulling) {
			if (pullDistance > 50) {
				handleManualRefresh();
			}
			setIsPulling(false);
			setPullDistance(0);
		}
	};

	const isCompact = variant === 'compact';
	const cardBackground = isCompact
		? 'bg-zinc-900/70'
		: 'bg-gradient-to-br from-zinc-900/90 to-zinc-900/60';

	// Enhanced error handling component
	const ErrorState = ({ error, onRetry }: { error: Error; onRetry: () => void }) => (
		<div className="text-center py-12 px-6">
			<div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
				<AlertCircle className="h-8 w-8 text-red-400" />
			</div>
			<h3 className="text-lg font-semibold text-red-300 mb-2">Something went wrong</h3>
			<p className="text-sm text-zinc-400 mb-6 max-w-md mx-auto">
				{error.message.includes('Failed to fetch')
					? 'Unable to connect to the server. Check your connection and try again.'
					: error.message || 'An unexpected error occurred'}
			</p>
			<div className="flex items-center justify-center gap-3">
				<button
					onClick={onRetry}
					className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors"
				>
					<RotateCcw className="h-4 w-4" />
					Try Again
				</button>
				{!isOnline && (
					<div className="flex items-center gap-2 text-sm text-zinc-500">
						<WifiOff className="h-4 w-4" />
						Offline
					</div>
				)}
			</div>
		</div>
	);

	return (
		<Card
			className={cn(
				'w-full overflow-hidden border border-zinc-800/60 shadow-xl backdrop-blur-sm relative',
				cardBackground,
				className
			)}
			onTouchStart={handleTouchStart}
			onTouchMove={handleTouchMove}
			onTouchEnd={handleTouchEnd}
		>
			{/* Pull-to-refresh indicator */}
			{isPulling && (
				<div
					className="absolute top-0 left-0 right-0 flex items-center justify-center py-2 bg-orange-500/10 backdrop-blur-sm border-b border-orange-500/20 transition-all duration-200"
					style={{
						opacity: pullDistance / 50,
						transform: `translateY(${pullDistance - 50}px)`
					}}
				>
					<RefreshCw
						className={cn(
							'h-5 w-5 text-orange-400 transition-transform',
							pullDistance > 50 && 'animate-spin'
						)}
					/>
					<span className="ml-2 text-sm text-orange-300">
						{pullDistance > 50 ? 'Release to refresh' : 'Pull to refresh'}
					</span>
				</div>
			)}

			{/* Network status indicator */}
			{!isOnline && (
				<div className="absolute top-2 right-2 flex items-center gap-1 bg-yellow-600/20 text-yellow-300 px-2 py-1 rounded-lg text-xs backdrop-blur-sm">
					<WifiOff className="h-3 w-3" />
					Offline
				</div>
			)}

			{/* Header with title and tabs */}
			<CardHeader className={cn('pb-0', isCompact ? 'px-4 pt-4' : 'px-6 pt-6')}>
				{(title || description) && (
					<div className="mb-4 flex items-start justify-between">
						<div>
							{title && (
								<h2 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-400 text-transparent bg-clip-text">
									{title}
								</h2>
							)}
							{description && <p className="text-xs text-zinc-400 mt-0.5">{description}</p>}
						</div>

						{/* Smart refresh button */}
						<button
							onClick={handleManualRefresh}
							disabled={isManualRefreshing || isLoading}
							className={cn(
								'p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 transition-all duration-200',
								'text-zinc-400 hover:text-orange-300 disabled:opacity-50 disabled:cursor-not-allowed',
								isManualRefreshing && 'animate-pulse'
							)}
							title="Refresh content"
						>
							<RefreshCw
								className={cn(
									'h-4 w-4 transition-transform duration-300',
									(isManualRefreshing || isFetching) && 'animate-spin'
								)}
							/>
						</button>
					</div>
				)}

				<TabSwitcher
					activeTab={activeTab}
					onTabChange={switchTab}
					variant={isCompact ? 'compact' : 'default'}
					isAuthenticated={isAuthenticated}
				/>
			</CardHeader>

			{/* Content feed */}
			<CardContent className={cn('p-0', isCompact ? 'mt-2' : 'mt-4')}>
				{error ? (
					<ErrorState error={error} onRetry={handleManualRefresh} />
				) : (
					<>
						<ContentFeed
							items={items}
							isLoading={!items.length && (isLoading || isFetching)}
							error={error}
							variant={variant}
							showCategory={showCategory && !forumId} // Hide category if in forum context
						/>

						{/* Enhanced load more with smart loading */}
						{meta.hasMore && !isLoading && items.length > 0 && (
							<div className="text-center py-6 border-t border-zinc-800/50 bg-gradient-to-b from-transparent to-zinc-900/20">
								<button
									onClick={() => refetch()}
									disabled={isFetching}
									className={cn(
										'inline-flex items-center gap-2 px-6 py-3 bg-zinc-800/50 hover:bg-zinc-700/50',
										'text-zinc-300 hover:text-orange-300 rounded-lg transition-all duration-200',
										'border border-zinc-700/50 hover:border-orange-500/30 disabled:opacity-50',
										isFetching && 'animate-pulse'
									)}
								>
									{isFetching ? (
										<>
											<RefreshCw className="h-4 w-4 animate-spin" />
											Loading...
										</>
									) : (
										<>
											<span>Load more</span>
											<span className="text-xs text-zinc-500">
												({meta.total - items.length} remaining)
											</span>
										</>
									)}
								</button>
							</div>
						)}

						{/* Connection status footer */}
						{isOnline && (
							<div className="flex items-center justify-center py-2 text-xs text-zinc-500">
								<Wifi className="h-3 w-3 mr-1" />
								Last updated {new Date(lastRefresh).toLocaleTimeString()}
							</div>
						)}
					</>
				)}
			</CardContent>
		</Card>
	);
}

/**
 * Pre-configured content area for home page
 */
export function HomeContentArea(props: Omit<ContentAreaProps, 'forumId'>) {
	return (
		<ContentArea
			{...props}
			title={props.title || 'Latest Discussions'}
			description={props.description || 'Trending conversations across all forums'}
			initialTab="trending"
		/>
	);
}

/**
 * Pre-configured content area for forum pages
 */
export function ForumContentArea({ forumId, ...props }: ContentAreaProps & { forumId: ForumId }) {
	return (
		<ContentArea
			{...props}
			forumId={forumId}
			showCategory={false} // Don't show category in forum context
			initialTab="recent"
		/>
	);
}

export default ContentArea;
