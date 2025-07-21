import { useCallback, useEffect, useRef } from 'react';

interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
  onLoadMore?: () => void | Promise<void>;
  enabled?: boolean;
}

interface UseInfiniteScrollReturn {
  isAtBottom: boolean;
  observe: (element: HTMLElement | null) => void;
  disconnect: () => void;
}

export function useInfiniteScroll(options: UseInfiniteScrollOptions = {}): UseInfiniteScrollReturn {
  const {
    threshold = 0.1,
    rootMargin = '100px',
    onLoadMore,
    enabled = true
  } = options;

  const observerRef = useRef<IntersectionObserver | null>(null);
  const isLoadingRef = useRef(false);
  const isAtBottomRef = useRef(false);

  const observe = useCallback((element: HTMLElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (!element || !enabled) return;

    observerRef.current = new IntersectionObserver(
      async (entries) => {
        const target = entries[0];
        isAtBottomRef.current = target.isIntersecting;
        
        if (target.isIntersecting && !isLoadingRef.current && onLoadMore) {
          isLoadingRef.current = true;
          try {
            await onLoadMore();
          } finally {
            isLoadingRef.current = false;
          }
        }
      },
      { threshold, rootMargin }
    );

    observerRef.current.observe(element);
  }, [enabled, onLoadMore, threshold, rootMargin]);

  const disconnect = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => disconnect();
  }, [disconnect]);

  // TODO: Implement actual isAtBottom detection
  return {
    isAtBottom: false,
    observe,
    disconnect
  };
}