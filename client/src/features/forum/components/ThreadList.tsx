import React, { useState, memo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import ThreadCard from '@/components/forum/ThreadCard'; // Corrected import path
import { getQueryFn } from '@/lib/queryClient';
import { Pagination } from '@/components/ui/pagination';
import { ThreadListSkeleton } from '@/components/ui/thread-skeleton';
import type { ThreadFiltersState } from '@/components/forum/ThreadFilters';

// Type for individual tag object
export type ApiTag = {
	id: number;
	name: string;
	slug: string;
};

// Type for user object nested in thread
export type ApiThreadUser = {
	id: number;
	username: string;
	avatarUrl?: string | null;
	activeAvatarUrl?: string | null;
	role?: 'user' | 'mod' | 'admin' | null;
};

// Type for category object nested in thread
export type ApiThreadCategory = {
	id: number;
	name: string;
	slug: string;
};

// Define the structure of a thread object based on backend API response
export type ApiThread = {
	id: number;
	title: string;
	slug: string;
	userId: number;
	prefixId?: number | null;
	isSticky: boolean;
	isLocked: boolean;
	isHidden: boolean;
	viewCount: number;
	postCount: number;
	firstPostLikeCount?: number;
	dgtStaked?: number;
	hotScore?: number;
	lastPostAt?: string | null;
	createdAt: string;
	updatedAt?: string | null;
	isSolved?: boolean;
	solvingPostId?: number | null;
	user: ApiThreadUser;
	category: ApiThreadCategory;
	tags: ApiTag[];
	canEdit?: boolean;
	canDelete?: boolean;
};

// Define the structure of the pagination object from the API
export type ApiPagination = {
	page: number;
	limit: number;
	totalThreads: number;
	totalPages: number;
};

// Define the structure of the API response for threads
export type ThreadsApiResponse = {
	threads: ApiThread[];
	pagination: ApiPagination;
};

interface ThreadListProps {
	forumId: number;
	forumSlug: string;
	availableTags?: ApiTag[];
	filters: ThreadFiltersState;
}

const THREADS_API_BASE_PATH = '/api/forum/threads';

const ThreadListComponent: React.FC<ThreadListProps> = ({ forumId, forumSlug, availableTags = [], filters }) => {
	const [page, setPage] = useState(1);
	const threadsPerPage = 10;
	
	const queryKey = [
		`${THREADS_API_BASE_PATH}?categoryId=${forumId}`,
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
				console.log(`[ThreadList] Invalid forumId (${forumId}), skipping API call.`);
				return null; // Return null if forumId is invalid
			}
			// Construct the URL for fetching threads with filters
			const params = new URLSearchParams({
				categoryId: forumId.toString(),
				page: page.toString(),
				limit: threadsPerPage.toString(),
				sort: filters.sortBy
			});
			
			if (filters.tags?.length) filters.tags.forEach((id) => params.append('tags[]', id.toString()));
			if (filters.prefixId) params.append('prefixId', filters.prefixId.toString());
			if (filters.solved) params.append('solved', filters.solved === 'solved' ? 'true' : 'false');
			if (filters.bookmarked) params.append('bookmarked', 'true');
			if (filters.mine) params.append('mine', 'true');
			if (filters.replied) params.append('replied', 'true');
			if (filters.q) params.append('q', filters.q);
			
			const url = `${THREADS_API_BASE_PATH}?${params.toString()}`;

			// Use getQueryFn for the API call
			// getQueryFn returns a function that expects a QueryFunctionContext
			const fetcher = getQueryFn<ThreadsApiResponse>({ on401: 'returnNull' });
			// The queryKey passed to the fetcher should ideally be just the URL or a specific identifier if getQueryFn uses it.
			// For now, we pass a minimal context.
			try {
				const response = await fetcher({ queryKey: [url], meta: undefined } as any);
				return response;
			} catch (e) {
				console.error('[ThreadList] Error fetching threads:', e);
				throw e; // Re-throw to be caught by useQuery's error state
			}
		},
		enabled: forumId !== -1 && forumId > 0,
		staleTime: 1 * 60 * 1000
	});

	console.log(
		`[ThreadList] forumId: ${forumId}, isLoading: ${isLoading}, error:`,
		error,
		'apiResponse:',
		apiResponse
	);

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

	// whenever filters prop changes reset to page 1
	useEffect(() => {
		setPage(1);
	}, [filters]);

	return (
		<div>
			{/* Thread List */}
			{threads.map((thread: ApiThread) => (
				<ThreadCard key={thread.id} thread={thread} forumSlug={forumSlug} />
			))}

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
