import React, { useRef, useCallback, useEffect, useState } from 'react';
import { VariableSizeList as List } from 'react-window';
import { cn } from '@app/utils/utils';
import { ChevronUp } from 'lucide-react';
import type { Thread } from '@shared/types/thread.types';
import { ContentFeedProps, ContentFeed } from './content-feed';
import theme from '@app/config/theme.config';

interface VirtualizedContentFeedProps extends Omit<ContentFeedProps, 'items'> {
  items: Thread[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  loadMoreRef?: React.RefObject<HTMLDivElement>;
}

const ITEM_SIZE_CACHE = new Map<string, number>();
const DEFAULT_ITEM_HEIGHT = 120;
const OVERSCAN_COUNT = 5;

export function VirtualizedContentFeed({
  items,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
  loadMoreRef,
  isLoading = false,
  error = null,
  className,
  variant = 'default',
  showCategory = true
}: VirtualizedContentFeedProps) {
  const listRef = useRef<List>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [containerHeight, setContainerHeight] = useState(window.innerHeight - 200);

  // Track item heights for variable sizing
  const getItemSize = useCallback((index: number) => {
    const item = items[index];
    if (!item) return DEFAULT_ITEM_HEIGHT;
    
    const cacheKey = `${item.id}-${variant}`;
    return ITEM_SIZE_CACHE.get(cacheKey) || DEFAULT_ITEM_HEIGHT;
  }, [items, variant]);

  const setItemSize = useCallback((index: number, size: number) => {
    const item = items[index];
    if (!item) return;
    
    const cacheKey = `${item.id}-${variant}`;
    ITEM_SIZE_CACHE.set(cacheKey, size);
    
    // Reset list cache when size changes
    if (listRef.current) {
      listRef.current.resetAfterIndex(index);
    }
  }, [items, variant]);

  // Update container height on resize
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerHeight(window.innerHeight - rect.top - 100);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Handle scroll for back-to-top button
  const handleScroll = useCallback(({ scrollOffset }: { scrollOffset: number }) => {
    setShowBackToTop(scrollOffset > 500);
  }, []);

  // Scroll to top
  const scrollToTop = useCallback(() => {
    if (listRef.current) {
      listRef.current.scrollToItem(0, 'start');
    }
  }, []);

  // Row renderer
  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = items[index];
    
    if (!item) {
      // Render load more trigger at the end
      if (index === items.length && hasMore) {
        return (
          <div
            ref={loadMoreRef}
            style={style}
            className="flex items-center justify-center py-8"
          >
            {isLoadingMore ? (
              <div className="flex items-center gap-2 text-zinc-400">
                <div className="h-4 w-4 border-2 border-zinc-600 border-t-orange-400 rounded-full animate-spin" />
                <span>Loading more...</span>
              </div>
            ) : (
              <button
                onClick={onLoadMore}
                className="text-zinc-400 hover:text-orange-300 transition-colors"
              >
                Load more
              </button>
            )}
          </div>
        );
      }
      return null;
    }

    return (
      <div
        style={style}
        className="virtualized-item"
        onLoad={(e) => {
          const element = e.currentTarget;
          const height = element.offsetHeight;
          if (height !== getItemSize(index)) {
            setItemSize(index, height);
          }
        }}
      >
        <ContentFeed
          items={[item]}
          variant={variant}
          showCategory={showCategory}
          className="!space-y-0"
        />
      </div>
    );
  }, [items, hasMore, isLoadingMore, loadMoreRef, onLoadMore, variant, showCategory, getItemSize, setItemSize]);

  if (error) {
    return (
      <div className={cn('text-center py-8', className)} role="alert" aria-live="polite">
        <div className="text-red-400 flex items-center justify-center gap-2">
          <span>Failed to load content</span>
        </div>
        <p className="text-xs text-zinc-500 mt-2">{error.message || 'Unknown error occurred'}</p>
      </div>
    );
  }

  if (isLoading && !items.length) {
    return (
      <div className={cn('w-full animate-pulse', className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border-b border-zinc-800/60 p-4">
            <div className="space-y-3">
              <div className="h-4 bg-zinc-800 rounded w-3/4" />
              <div className="h-3 bg-zinc-800 rounded w-1/2" />
              <div className="h-3 bg-zinc-800 rounded w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className={cn('text-center py-8 text-zinc-400', className)} role="status">
        <p>No content available</p>
        <p className="text-xs text-zinc-500">Check back later for new discussions</p>
      </div>
    );
  }

  const itemCount = hasMore ? items.length + 1 : items.length;

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <List
        ref={listRef}
        height={containerHeight}
        itemCount={itemCount}
        itemSize={getItemSize}
        onScroll={handleScroll}
        overscanCount={OVERSCAN_COUNT}
        className="scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent"
      >
        {Row}
      </List>

      {/* Back to top button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className={cn(
            'fixed bottom-6 right-6 p-3 rounded-full',
            'bg-zinc-900/90 backdrop-blur-sm border border-zinc-800',
            'text-zinc-400 hover:text-orange-300 hover:bg-zinc-800/90',
            'shadow-lg hover:shadow-orange-500/20',
            'transition-all duration-300 transform hover:scale-110',
            'focus:outline-none focus:ring-2 focus:ring-orange-500/50'
          )}
          style={{
            animation: 'fade-in 0.3s ease-out'
          }}
          aria-label="Back to top"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default VirtualizedContentFeed;