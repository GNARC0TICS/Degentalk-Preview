import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';
import { ThreadCard } from '@/components/forum/thread-card';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import type { ThreadWithUser } from '@db_types/forum.types';

/**
 * Skeleton loader for thread list
 */
function ThreadListSkeleton({ count = 5 }: { count?: number }) {
	return (
		<div className="space-y-4">
			{Array.from({ length: count }).map((_, i) => (
				<Skeleton key={i} className="h-20 w-full" />
			))}
		</div>
	);
}

/**
 * Placeholder for error/empty/loading states
 */
function ThreadListPlaceholder({
	icon,
	title,
	message,
	children
}: {
	icon?: React.ReactNode;
	title: string;
	message?: string;
	children?: React.ReactNode;
}) {
	return (
		<Card className="bg-zinc-900/60 border-zinc-800">
			<CardContent className="p-6 text-center">
				{icon && <div className="mb-2 mx-auto text-red-500">{icon}</div>}
				<p className="text-zinc-300">{title}</p>
				{message && <p className="text-zinc-500 text-sm mt-1">{message}</p>}
				{children}
			</CardContent>
		</Card>
	);
}

/**
 * ThreadList component for displaying forum threads
 * @param categoryId - The forum or category ID to fetch threads for
 * @param isPrimaryZone - Whether this is a primary zone (for styling)
 * @param canHaveThreads - If false, disables thread fetching and shows message
 * @param className - Additional className for container
 * @param skeletonCount - Number of skeletons to show while loading
 * @param onErrorRetry - Optional retry handler for error state
 */
export function ThreadList({
	categoryId,
	isPrimaryZone = false,
	canHaveThreads = true,
	className = '',
	skeletonCount = 5,
	onErrorRetry
}: {
	categoryId: string | number;
	isPrimaryZone?: boolean;
	canHaveThreads?: boolean;
	className?: string;
	skeletonCount?: number;
	onErrorRetry?: () => void;
}) {
	const listClassName = useMemo(
		() => `${isPrimaryZone ? 'primary-zone-thread-list' : ''} ${className}`,
		[isPrimaryZone, className]
	);

	// Only fetch and display threads if canHaveThreads is true
	if (!canHaveThreads) {
		return (
			<ThreadListPlaceholder
				icon={<AlertCircle className="h-8 w-8" />}
				title="Threads are not allowed in this forum."
			/>
		);
	}

	// Future-proof: add page param if needed
	const {
		data: threads,
		isLoading,
		isError,
		error,
		refetch
	} = useQuery<any>({
		queryKey: ['forum-threads', categoryId],
		queryFn: async () => {
			const response = await fetch(`/api/forum/threads?categoryId=${categoryId}`);
			if (!response.ok) {
				throw new Error('Failed to fetch threads');
			}
			const data = await response.json();
			// Handle both response formats - object with threads array or direct array
			return data && data.threads ? data.threads : data;
		},
		enabled: !!categoryId
	});

	if (isLoading) {
		return <ThreadListSkeleton count={skeletonCount} />;
	}

	if (isError) {
		return (
			<ThreadListPlaceholder
				icon={<AlertCircle className="h-8 w-8" />}
				title="Failed to load threads."
				message="Please try again later."
			>
				{onErrorRetry && (
					<button onClick={onErrorRetry} className="mt-3 text-emerald-400 underline">
						Retry
					</button>
				)}
			</ThreadListPlaceholder>
		);
	}

	if (!threads || threads.length === 0) {
		return (
			<ThreadListPlaceholder
				title="No threads found in this forum."
				message="Be the first to create a thread!"
			/>
		);
	}

	return (
		<div className={`space-y-4 ${listClassName}`}>
			{threads.map((thread) => (
				<ThreadCard key={thread.id} thread={thread} />
			))}
		</div>
	);
}

// TODO: Add Storybook/demo variant with MockProvider and mock data for ThreadList

export default ThreadList;
