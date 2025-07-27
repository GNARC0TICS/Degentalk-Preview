import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import type { Thread } from '@shared/types/thread.types';
import type { ContentTab } from '@/hooks/use-content';
import { api } from "@/core/api";

interface UseInfiniteContentParams {
  tab: ContentTab;
  forumId?: string;
  pageSize?: number;
  enabled?: boolean;
}

interface ContentPage {
  items: Thread[];
  nextCursor?: string | null;
  hasMore: boolean;
  total: number;
}

export function useInfiniteContent({
  tab,
  forumId,
  pageSize = 20,
  enabled = true
}: UseInfiniteContentParams) {
  const fetchContent = async ({ pageParam }: { pageParam?: string }) => {
    const params = new URLSearchParams({
      tab,
      limit: pageSize.toString(),
      ...(pageParam && { cursor: pageParam }),
      ...(forumId && { forumId })
    });

    const response = await api.get<ContentPage>(`/api/threads?${params}`);
    return response.data;
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