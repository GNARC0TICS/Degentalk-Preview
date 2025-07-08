/**
 * Transformer utility helpers to reduce boilerplate
 */

// Transform a list of items using a transformer function
export function toPublicList<T, R>(items: T[], transformer: (item: T) => R): R[] {
  return items.map(transformer);
}

// Transform a list with error handling
export function safeTransformList<T, R>(
  items: T[], 
  transformer: (item: T) => R,
  fallback: R
): R[] {
  return items.map(item => {
    try {
      return transformer(item);
    } catch (error) {
      console.error('Transform error:', error);
      return fallback;
    }
  });
}

// Create a paginated response with transformed items
export function toPaginatedResponse<T, R>(
  items: T[],
  total: number,
  page: number,
  limit: number,
  transformer: (item: T) => R
): PaginatedResponse<R> {
  return {
    items: items.map(transformer),
    total,
    page,
    limit,
    hasMore: page * limit < total,
    pages: Math.ceil(total / limit)
  };
}

// Type for paginated responses
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  pages: number;
}

// Transform with viewer context (for authenticated transformations)
export function transformWithViewer<T, R>(
  item: T,
  viewerId: string | null,
  publicTransform: (item: T) => R,
  authenticatedTransform: (item: T, viewerId: string) => R
): R {
  return viewerId 
    ? authenticatedTransform(item, viewerId)
    : publicTransform(item);
}

// Batch transform with different methods based on viewer
export function batchTransformWithViewer<T, R>(
  items: T[],
  viewerId: string | null,
  publicTransform: (item: T) => R,
  authenticatedTransform: (item: T, viewerId: string) => R
): R[] {
  const transformer = viewerId 
    ? (item: T) => authenticatedTransform(item, viewerId)
    : publicTransform;
  
  return items.map(transformer);
}

// Helper to create a standard API response
export function createApiResponse<T>(
  data: T,
  message?: string
): ApiResponse<T> {
  return {
    success: true,
    data,
    message
  };
}

// Type for API responses
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Re-export common response helpers
export { toPublicList as transformList }; // Alias for backward compatibility