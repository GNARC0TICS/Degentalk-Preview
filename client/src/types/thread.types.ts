/**
 * Thread Types for Frontend
 * 
 * Re-exports the consolidated Thread type from shared types.
 * All thread data now uses the single Thread type.
 */

// Re-export everything from the shared thread types
export type {
  Thread,
  ThreadUser,
  ThreadZone,
  ThreadPrefix,
  ThreadTag,
  ThreadPermissions,
  ThreadListItem,
  CreateThreadInput,
  UpdateThreadInput,
  ThreadSearchParams,
  ThreadResponse,
  ThreadsListResponse
} from '@shared/types/thread.types';

// Re-export type guards
export {
  isThread,
  hasThreadPermissions,
  isThreadListItem
} from '@shared/types/thread.types';

// All legacy type aliases have been removed
// Use Thread from @shared/types/thread.types

// Additional frontend-specific types that extend the base Thread

/**
 * Thread List Props for components
 */
export interface ThreadListProps {
  threads: Thread[];
  isLoading?: boolean;
  error?: Error | null;
  onTip?: (threadId: string, amount: number) => void;
  onBookmark?: (threadId: string) => void;
  layout?: 'list' | 'grid' | 'compact';
}

/**
 * Thread Card Props for components
 */
export interface ThreadCardProps {
  thread: Thread;
  variant?: 'default' | 'compact' | 'featured';
  showZone?: boolean;
  showExcerpt?: boolean;
  onQuickAction?: (action: string) => void;
}