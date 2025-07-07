import React, { useState, memo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import ThreadCard from '@/components/forum/ThreadCard';
import { getQueryFn } from '@/lib/queryClient';
import { Pagination } from '@/components/ui/pagination';
import { ThreadListSkeleton } from '@/components/ui/thread-skeleton';
import type { ThreadFiltersState } from '@/components/forum/ThreadFilters';
import type { ThreadDisplay, ThreadsApiResponse } from '@/types/thread.types';
import { PAGINATION_CONFIG } from '@/config/pagination.config';
import { ThreadActionsProvider } from '@/features/forum/contexts/ThreadActionsContext';
import type { ThreadId, type ForumId } from '@shared/types/ids';
import ThreadRow from '@/components/forum/ThreadRow';
import type { ForumId } from '@shared/types/ids';

type DisplayMode = 'card' | 'table';

interface ThreadListProps {
	forumId: ForumId;
	forumSlug: string;
	availableTags?: Array<{ id: ThreadId; name: string; slug: string }>;
	filters: ThreadFiltersState;
	displayMode?: DisplayMode;
}

const THREADS_API_BASE_PATH = '/api/forum/threads';

const ThreadListComponent: React.FC<ThreadListProps> = ({
	forumId,
	forumSlug,
	availableTags = [],
	filters,
	displayMode = 'card'
}) => {
	const [page, setPage] = useState(1);
	const threadsPerPage = PAGINATION_CONFIG.threadsPerPage;

	// Component initialization

	// whenever filters prop changes reset to page 1
	useEffect(() => {
		setPage(1);
	}, [filters]);

	const queryKey = [
		`${THREADS_API_BASE_PATH}?structureId=${forumId}`,
		page,
		threadsPerPage,
		filters
	];

	const {
		data: apiResponse,
		isLoading,
		error,
		isPlaceholderData
	} = useQuery<ThreadsApiResponse | null, Error>({
		// Allow null for apiResponse
		queryKey,
		queryFn: async () => {
			if (!forumId || forumId === -1) {
				return null; // Return null if forumId is invalid
			}
			// Construct the URL for fetching threads with filters
			const params = new URLSearchParams({
				structureId: forumId.toString(),
				page: page.toString(),
				limit: threadsPerPage.toString(),
				sort: filters.sortBy
			});

			if (filters.tags?.length)
				filters.tags.forEach((id) => params.append('tags[]', id.toString()));
			if (filters.prefixId) params.append('prefixId', filters.prefixId.toString());
			if (filters.solved) params.append('solved', filters.solved === 'solved' ? 'true' : 'false');
			if (filters.bookmarked) params.append('bookmarked', 'true');
			if (filters.mine) params.append('mine', 'true');
			if (filters.replied) params.append('replied', 'true');
			if (filters.q) params.append('q', filters.q);

			const url = `${THREADS_API_BASE_PATH}?${params.toString()}`;

			// Fetching threads for forum ID: ${forumId}

			// Use getQueryFn for the API call
			// getQueryFn returns a function that expects a QueryFunctionContext
			const fetcher = getQueryFn<ThreadsApiResponse>({ on401: 'returnNull' });
			// The queryKey passed to the fetcher should ideally be just the URL or a specific identifier if getQueryFn uses it.
			// For now, we pass a minimal context.
			try {
				const response = await fetcher({ queryKey: [url], meta: undefined } as any);
				// Processing API response

				// Handle wrapped API response
				if (response && response.success && response.data) {
					return response.data as ThreadsApiResponse;
				}

				return response;
			} catch (e) {
				// Error will be handled by useQuery's error state
				throw e;
			}
		},
		enabled: forumId !== -1 && forumId > 0,
		staleTime: 1 * 60 * 1000
	});

	if (isLoading && forumId > 0) {
		return <ThreadListSkeleton count={5} />;
	}

	if (error) {
		return (
			<div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
				Error loading threads: {error.message}
			</div>
		);
	}

	if (apiResponse === null && forumId > 0) {
		return (
			<div style={{ textAlign: 'center', padding: '20px', color: 'orange' }}>
				Could not load threads (API issue or unauthorized).
			</div>
		);
	}

	const threads = apiResponse?.threads || [];
	const pagination = apiResponse?.pagination || {
		page: 1,
		limit: threadsPerPage,
		totalThreads: 0,
		totalPages: 0
	};

	if (forumId === -1 && !isLoading) {
		return (
			<div style={{ textAlign: 'center', padding: '20px' }}>
				Forum data still loading or not found.
			</div>
		);
	}

	if (threads.length === 0 && forumId > 0 && !isLoading && !error && apiResponse !== null) {
		return (
			<div style={{ textAlign: 'center', padding: '20px' }}>
				No threads found in this forum yet.
			</div>
		);
	}

	return (
		<div>
			{displayMode === 'table' ? (
				<table className="w-full text-sm text-left border-collapse">
					<thead>
						<tr className="bg-zinc-800/70 text-zinc-300">
							<th className="w-8" />
							<th className="py-2 px-3">Topic</th>
							<th className="py-2 px-3 text-center w-20">Replies</th>
							<th className="py-2 px-3 text-center w-20">Views</th>
							<th className="py-2 px-3 w-56">Last Post</th>
						</tr>
					</thead>
					<tbody>
						{threads.map((thread: ThreadDisplay, idx) => (
							<ThreadActionsProvider key={thread.id} thread={thread}>
								<ThreadRow thread={thread} index={idx} />
							</ThreadActionsProvider>
						))}
					</tbody>
				</table>
			) : (
				threads.map((thread: ThreadDisplay) => (
					<ThreadActionsProvider key={thread.id} thread={thread}>
						<ThreadCard thread={thread} />
					</ThreadActionsProvider>
				))
			)}

			{pagination.totalThreads > 0 && pagination.totalPages > 1 && (
				<div className="mt-5 flex justify-center">
					<Pagination
						currentPage={pagination.page}
						totalPages={pagination.totalPages}
						onPageChange={(newPage) => {
							if (!isPlaceholderData) {
								setPage(newPage);
							}
						}}
						showSummary={false} // Can be true if we want to show "Showing X-Y of Z"
						// totalItems={pagination.totalThreads} // Uncomment if showSummary is true
						// pageSize={threadsPerPage} // Uncomment if showSummary is true
					/>
				</div>
			)}
		</div>
	);
};

// Memoize to prevent unnecessary re-renders when forumId and forumSlug haven't changed
const ThreadList = memo(ThreadListComponent);
export default ThreadList;
