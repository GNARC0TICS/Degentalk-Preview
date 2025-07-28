import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import type { Thread } from '@shared/types/thread.types';
import type { ContentTab } from '@/hooks/use-content';
import { apiRequest } from '@/utils/api-request';

interface UseInfiniteContentParams {
  tab: ContentTab;
  forumId?: string;
  pageSize?: number;
  enabled?: boolean;
}

interface ContentPage {
  items: Thread[];
  nextCursor?: number | null;
  hasMore: boolean;
  total: number;
}

export function useInfiniteContent({
  tab,
  forumId,
  pageSize = 20,
  enabled = true
}: UseInfiniteContentParams) {
  const fetchContent = async ({ pageParam = 1 }: { pageParam?: number }) => {
    const params = new URLSearchParams({
      page: pageParam.toString(),
      limit: pageSize.toString(),
      ...(forumId && { forumId })
    });

    const response = await apiRequest<{ threads: Thread[], pagination: any }>({
      url: `/api/forum/threads?${params}`,
      method: 'GET'
    });
    
    // Transform the response to match expected ContentPage format
    return {
      items: response.threads || [],
      nextCursor: response.pagination?.page < response.pagination?.totalPages ? 
        response.pagination.page + 1 : null,
      hasMore: response.pagination?.page < response.pagination?.totalPages,
      total: response.pagination?.totalThreads || 0
    } as ContentPage;
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch
  } = useInfiniteQuery({
    queryKey: ['infinite-content', tab, forumId, pageSize],
    queryFn: fetchContent,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (previously cacheTime)
    refetchOnWindowFocus: false
  });

  // Flatten all pages into single items array
  const items = data?.pages.flatMap((page) => page.items) ?? [];
  const totalItems = data?.pages[0]?.total ?? 0;

  // Set up intersection observer for auto-loading
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: '100px'
  });

  // Auto-fetch when scrolled near bottom
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return {
    items,
    totalItems,
    loadMoreRef,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch
  };
}