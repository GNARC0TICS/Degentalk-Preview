import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { forumApi } from '@app/features/forum/services/forumApi';
import { useForumStructure } from '@app/features/forum/contexts/ForumStructureContext';
import type { MergedFeaturedForum } from '@app/features/forum/contexts/ForumStructureContext'; // Use MergedFeaturedForum as type-only import
import type { Thread } from '@shared/types/thread.types';
import type { CanonicalPost } from '@app/types/canonical.types';

interface UseThreadFeaturedForumParams {
	page?: number;
	limit?: number;
}

// Thread response shape expected from forumApi.getThread
export interface ThreadWithPosts {
	thread: Thread;
	posts: CanonicalPost[];
}

interface UseThreadFeaturedForumReturn {
	threadWithPosts: ThreadWithPosts | null | undefined;
	featuredForum: MergedFeaturedForum | undefined;
	isLoading: boolean;
	error: Error | null;
	threadParentForumSlug?: string | null;
}

export function useThreadFeaturedForum(
	threadSlug: string | null,
	params?: UseThreadFeaturedForumParams
): UseThreadFeaturedForumReturn {
	const { page = 1, limit = 20 } = params || {}; // Default pagination if not provided

	const {
		data: threadData,
		isLoading: isThreadLoading,
		error: threadError
	} = useQuery<ThreadWithPosts | null>({
		// Added | null for consistency
		queryKey: ['thread', threadSlug, { page, limit }], // Changed queryKey to match [thread_slug].tsx
		queryFn: () => {
			if (!threadSlug) {
				return Promise.resolve(null);
			}
			return forumApi.getThread(threadSlug, { page, limit });
		},
		enabled: !!threadSlug
	});

	const { getFeaturedForumByForumSlug, isLoading: isStructureLoading } = useForumStructure();
	const [featuredForum, setFeaturedForum] = useState<MergedFeaturedForum | undefined>(undefined);

	const parentForumSlug = threadData?.thread?.parentForumSlug;

	useEffect(() => {
		if (parentForumSlug && !isStructureLoading) {
			const foundFeaturedForum = getFeaturedForumByForumSlug(parentForumSlug);
			setFeaturedForum(foundFeaturedForum);
		} else if (!parentForumSlug && threadData === null && !!threadSlug && !isThreadLoading) {
			setFeaturedForum(undefined);
		} else if (!parentForumSlug && threadData && !isThreadLoading) {
			setFeaturedForum(undefined);
		}
		// Ensure featuredForum is reset if threadData becomes undefined (e.g. slug changes to undefined)
		if (!threadData && !isThreadLoading) {
			setFeaturedForum(undefined);
		}
	}, [
		parentForumSlug,
		getFeaturedForumByForumSlug,
		isStructureLoading,
		isThreadLoading,
		threadData,
		threadSlug
	]);

	// isLoading should reflect that both thread data and potentially structure data are loading
	const isLoading = isThreadLoading || (isStructureLoading && !!parentForumSlug && !featuredForum);

	return {
		threadWithPosts: threadData,
		featuredForum,
		isLoading,
		error: threadError as Error | null, // Cast error
		threadParentForumSlug: parentForumSlug
	};
}
