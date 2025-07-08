import { QueryClient } from '@tanstack/react-query';

/**
 * Helper to invalidate queries with the new React Query v5 API
 */
export function invalidateQueries(
  client: QueryClient, 
  keys: readonly unknown[]
): Promise<void> {
  return client.invalidateQueries({ queryKey: keys });
}

/**
 * Helper to get mutation state in a v5-compatible way
 */
export function getMutationState(mutation: any) {
  return {
    isPending: mutation.status === 'pending',
    isLoading: mutation.status === 'pending', // Backward compatibility
    isError: mutation.status === 'error',
    isSuccess: mutation.status === 'success',
    isIdle: mutation.status === 'idle'
  };
}

/**
 * Helper to check if a query is loading (v5 compatible)
 */
export function isQueryLoading(query: any): boolean {
  return query.status === 'pending' && query.fetchStatus === 'fetching';
}

/**
 * Helper to check if a query is refetching
 */
export function isQueryRefetching(query: any): boolean {
  return query.status === 'success' && query.fetchStatus === 'fetching';
}

/**
 * Batch invalidate multiple query keys
 */
export async function batchInvalidateQueries(
  client: QueryClient,
  keysList: readonly (readonly unknown[])[]
): Promise<void> {
  await Promise.all(
    keysList.map(keys => client.invalidateQueries({ queryKey: keys }))
  );
}