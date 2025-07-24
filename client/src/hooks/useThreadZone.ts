import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { forumApi } from '@app/features/forum/services/forumApi';
import { useForumStructure } from '@app/features/forum/contexts/ForumStructureContext';
import type { MergedZone } from '@app/features/forum/contexts/ForumStructureContext'; // Use MergedZone as type-only import
import type { CanonicalThread, CanonicalPost } from '@app/types/canonical.types';

interface UseThreadZoneParams {
	page?: number;
	limit?: number;
}

// Thread response shape expected from forumApi.getThread
export interface ThreadWithPosts {
	thread: CanonicalThread;
	posts: CanonicalPost[];
}

interface UseThreadZoneReturn {
	threadWithPosts: ThreadWithPosts | null | undefined;
	zone: MergedZone | undefined;
	isLoading: boolean;
	error: Error | null;
	threadParentForumSlug?: string | null;
}

export function useThreadZone(
	threadSlug: string | null,
	params?: UseThreadZoneParams
): UseThreadZoneReturn {
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

	const { getZoneByForumSlug, isLoading: isStructureLoading } = useForumStructure();
	const [zone, setZone] = useState<MergedZone | undefined>(undefined);

	const parentForumSlug = threadData?.thread?.parentForumSlug;

	useEffect(() => {
		if (parentForumSlug && !isStructureLoading) {
			const foundZone = getZoneByForumSlug(parentForumSlug);
			setZone(foundZone);
		} else if (!parentForumSlug && threadData === null && !!threadSlug && !isThreadLoading) {
			setZone(undefined);
		} else if (!parentForumSlug && threadData && !isThreadLoading) {
			setZone(undefined);
		}
		// Ensure zone is reset if threadData becomes undefined (e.g. slug changes to undefined)
		if (!threadData && !isThreadLoading) {
			setZone(undefined);
		}
	}, [
		parentForumSlug,
		getZoneByForumSlug,
		isStructureLoading,
		isThreadLoading,
		threadData,
		threadSlug
	]);

	// isLoading should reflect that both thread data and potentially structure data are loading
	const isLoading = isThreadLoading || (isStructureLoading && !!parentForumSlug && !zone);

	return {
		threadWithPosts: threadData,
		zone,
		isLoading,
		error: threadError as Error | null, // Cast error
		threadParentForumSlug: parentForumSlug
	};
}
